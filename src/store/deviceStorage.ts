import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceStorageState, SavedTvDevice, TvBrand } from '../types/ir';

export const DEVICE_STORAGE_KEY = '@tv_remote/devices_state_v1';

const DEFAULT_STATE: DeviceStorageState = {
  activeDeviceId: null,
  devices: [],
};

async function saveDeviceState(state: DeviceStorageState): Promise<DeviceStorageState> {
  await AsyncStorage.setItem(DEVICE_STORAGE_KEY, JSON.stringify(state));
  return state;
}

export async function loadDeviceState(): Promise<DeviceStorageState> {
  const raw = await AsyncStorage.getItem(DEVICE_STORAGE_KEY);
  if (!raw) {
    return { ...DEFAULT_STATE, devices: [] };
  }
  try {
    const parsed = JSON.parse(raw) as Partial<DeviceStorageState>;
    const devices = Array.isArray(parsed.devices) ? parsed.devices : [];
    const activeExists = devices.some((d) => d.id === parsed.activeDeviceId);
    return {
      devices,
      activeDeviceId: activeExists ? (parsed.activeDeviceId ?? null) : (devices[0]?.id ?? null),
    };
  } catch {
    return { ...DEFAULT_STATE, devices: [] };
  }
}

export async function addSavedDevice(input: {
  roomName: string;
  brand: TvBrand;
  codesetId: string;
}): Promise<{ state: DeviceStorageState; created: SavedTvDevice }> {
  const current = await loadDeviceState();
  const trimmedRoom = input.roomName.trim() || `TV ${input.brand}`;
  const created: SavedTvDevice = {
    id: `tv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    roomName: trimmedRoom,
    brand: input.brand,
    codesetId: input.codesetId,
    createdAt: new Date().toISOString(),
  };

  const nextState: DeviceStorageState = {
    activeDeviceId: created.id,
    devices: [...current.devices, created],
  };

  await saveDeviceState(nextState);
  return { state: nextState, created };
}

export async function setActiveDevice(deviceId: string): Promise<DeviceStorageState> {
  const current = await loadDeviceState();
  const exists = current.devices.some((d) => d.id === deviceId);
  if (!exists) {
    return current;
  }
  return saveDeviceState({
    ...current,
    activeDeviceId: deviceId,
  });
}

export async function renameSavedDevice(
  deviceId: string,
  roomName: string
): Promise<DeviceStorageState> {
  const current = await loadDeviceState();
  const trimmed = roomName.trim();
  if (!trimmed) {
    return current;
  }
  const devices = current.devices.map((device) =>
    device.id === deviceId ? { ...device, roomName: trimmed } : device
  );
  return saveDeviceState({
    ...current,
    devices,
  });
}

export async function deleteSavedDevice(deviceId: string): Promise<DeviceStorageState> {
  const current = await loadDeviceState();
  const remaining = current.devices.filter((d) => d.id !== deviceId);
  const nextActiveId =
    current.activeDeviceId === deviceId
      ? (remaining[0]?.id ?? null)
      : current.activeDeviceId;

  return saveDeviceState({
    activeDeviceId: nextActiveId,
    devices: remaining,
  });
}
