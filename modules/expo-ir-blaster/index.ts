import { requireOptionalNativeModule } from 'expo-modules-core';

export interface CarrierFrequencyRange {
  min: number;
  max: number;
}

export interface NativeIrBlasterModule {
  hasIrEmitter(): boolean;
  getCarrierFrequencies(): CarrierFrequencyRange[];
  transmit(carrierFrequency: number, pattern: number[]): Promise<void>;
}

const nativeModule = requireOptionalNativeModule<NativeIrBlasterModule>('ExpoIrBlaster');

export function isNativeModuleAvailable(): boolean {
  return nativeModule !== null;
}

export function hasIrEmitter(): boolean {
  if (!nativeModule) {
    return false;
  }
  try {
    return Boolean(nativeModule.hasIrEmitter());
  } catch {
    return false;
  }
}

export function getCarrierFrequencies(): CarrierFrequencyRange[] {
  if (!nativeModule) {
    return [];
  }
  try {
    return nativeModule.getCarrierFrequencies();
  } catch {
    return [];
  }
}

export async function transmit(carrierFrequency: number, pattern: number[]): Promise<void> {
  if (!nativeModule) {
    throw new Error('ExpoIrBlaster native module is unavailable in this runtime.');
  }
  await nativeModule.transmit(carrierFrequency, pattern);
}
