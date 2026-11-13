const memoryStore: Record<string, string> = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async (key: string) => memoryStore[key] ?? null),
    setItem: jest.fn(async (key: string, value: string) => {
      memoryStore[key] = value;
    }),
    removeItem: jest.fn(async (key: string) => {
      delete memoryStore[key];
    }),
  },
}));

import {
  addSavedDevice,
  deleteSavedDevice,
  loadDeviceState,
  renameSavedDevice,
  setActiveDevice,
} from '../store/deviceStorage';

describe('deviceStorage', () => {
  beforeEach(() => {
    Object.keys(memoryStore).forEach((k) => delete memoryStore[k]);
  });

  it('adds devices, sets newest device active, and switches active TV across rooms', async () => {
    const empty = await loadDeviceState();
    expect(empty).toEqual({ activeDeviceId: null, devices: [] });

    const { created: livingRoom } = await addSavedDevice({
      roomName: 'TV Phòng khách',
      brand: 'Samsung',
      codesetId: 'samsung-1',
    });
    const { created: bedroom, state: afterSecond } = await addSavedDevice({
      roomName: 'TV Phòng ngủ',
      brand: 'LG',
      codesetId: 'lg-1',
    });

    expect(afterSecond.devices).toHaveLength(2);
    expect(afterSecond.activeDeviceId).toBe(bedroom.id);

    await setActiveDevice(livingRoom.id);
    const reloaded = await loadDeviceState();
    expect(reloaded.activeDeviceId).toBe(livingRoom.id);
  });

  it('renames a saved device and falls back activeDeviceId when deleting the active device', async () => {
    const { created: first } = await addSavedDevice({
      roomName: 'Phòng khách',
      brand: 'Sony',
      codesetId: 'sony-1',
    });
    const { created: second } = await addSavedDevice({
      roomName: 'Phòng ngủ',
      brand: 'TCL',
      codesetId: 'tcl-1',
    });

    const renamed = await renameSavedDevice(first.id, 'TV Phòng khách tầng 1');
    expect(renamed.devices.find((d) => d.id === first.id)?.roomName).toBe(
      'TV Phòng khách tầng 1'
    );

    const afterDeleteSecond = await deleteSavedDevice(second.id);
    expect(afterDeleteSecond.devices).toHaveLength(1);
    expect(afterDeleteSecond.activeDeviceId).toBe(first.id);

    const afterDeleteFirst = await deleteSavedDevice(first.id);
    expect(afterDeleteFirst.devices).toHaveLength(0);
    expect(afterDeleteFirst.activeDeviceId).toBeNull();
  });
});
