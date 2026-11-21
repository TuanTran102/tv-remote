describe('ExpoIrBlaster TypeScript wrapper', () => {
  afterEach(() => {
    jest.dontMock('expo-modules-core');
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('falls back safely when native module is absent (Expo Go / Jest)', async () => {
    jest.doMock('expo-modules-core', () => ({
      ...jest.requireActual('expo-modules-core'),
      requireOptionalNativeModule: jest.fn(() => null),
    }));

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const blaster = require('../../modules/expo-ir-blaster');
    expect(blaster.isNativeModuleAvailable()).toBe(false);
    expect(blaster.hasIrEmitter()).toBe(false);
    expect(blaster.getCarrierFrequencies()).toEqual([]);
    await expect(blaster.transmit(38000, [9000, 4500, 560])).rejects.toThrow(
      /unavailable/i
    );
  });

  it('delegates to native ConsumerIrManager module when available', async () => {
    const mockNative = {
      hasIrEmitter: jest.fn(() => true),
      getCarrierFrequencies: jest.fn(() => [{ min: 30000, max: 60000 }]),
      transmit: jest.fn(async () => undefined),
    };

    jest.doMock('expo-modules-core', () => ({
      ...jest.requireActual('expo-modules-core'),
      requireOptionalNativeModule: jest.fn(() => mockNative),
    }));

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const blaster = require('../../modules/expo-ir-blaster');
    expect(blaster.isNativeModuleAvailable()).toBe(true);
    expect(blaster.hasIrEmitter()).toBe(true);
    expect(blaster.getCarrierFrequencies()).toEqual([{ min: 30000, max: 60000 }]);

    await blaster.transmit(38000, [9000, 4500, 560]);
    expect(mockNative.transmit).toHaveBeenCalledWith(38000, [9000, 4500, 560]);
  });
});
