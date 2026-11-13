import { getCodesetById } from '../services/ir/bundledCodesets';

describe('irTransmitter', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('transmits via hardware ConsumerIrManager and returns localized ready labels (vi & en)', async () => {
    const mockTransmit = jest.fn(async () => undefined);
    jest.doMock('../../modules/expo-ir-blaster', () => ({
      hasIrEmitter: jest.fn(() => true),
      transmit: mockTransmit,
    }));

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getIrHardwareStatus, sendRemoteKey } = require('../services/ir/irTransmitter');
    const codeset = getCodesetById('samsung-1');
    expect(codeset).toBeDefined();

    expect(getIrHardwareStatus('vi')).toEqual({
      available: true,
      label: 'IR Sẵn sàng',
    });
    expect(getIrHardwareStatus('en')).toEqual({
      available: true,
      label: 'IR Ready',
    });

    const result = await sendRemoteKey(codeset!, 'POWER');
    expect(mockTransmit).toHaveBeenCalledTimes(1);
    expect(mockTransmit).toHaveBeenCalledWith(
      result.payload.carrierFrequency,
      result.payload.pattern
    );
    expect(result.mode).toBe('hardware');
    expect(result.transmitted).toBe(true);
    expect(result.key).toBe('POWER');
  });

  it('falls back to simulation mode without crashing when IR emitter is absent (vi & en)', async () => {
    const mockTransmit = jest.fn(async () => undefined);
    jest.doMock('../../modules/expo-ir-blaster', () => ({
      hasIrEmitter: jest.fn(() => false),
      transmit: mockTransmit,
    }));

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getIrHardwareStatus, sendRemoteKey } = require('../services/ir/irTransmitter');
    const codeset = getCodesetById('lg-1');
    expect(codeset).toBeDefined();

    expect(getIrHardwareStatus('vi')).toEqual({
      available: false,
      label: 'Chế độ giả lập',
    });
    expect(getIrHardwareStatus('en')).toEqual({
      available: false,
      label: 'Simulation Mode',
    });

    const result = await sendRemoteKey(codeset!, 'VOL_UP');
    expect(mockTransmit).not.toHaveBeenCalled();
    expect(result.mode).toBe('simulation');
    expect(result.transmitted).toBe(false);
    expect(result.key).toBe('VOL_UP');
    expect(result.payload.carrierFrequency).toBe(38000);
  });

  it('rejects invalid RAW command without invoking native transmit', async () => {
    const mockTransmit = jest.fn(async () => undefined);
    jest.doMock('../../modules/expo-ir-blaster', () => ({
      hasIrEmitter: jest.fn(() => true),
      transmit: mockTransmit,
    }));

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { sendRemoteKey } = require('../services/ir/irTransmitter');
    const base = getCodesetById('lg-1')!;
    const brokenCodeset = {
      ...base,
      commands: {
        ...base.commands,
        POWER: { protocol: 'RAW' as const, carrierFrequency: 38000, rawPattern: [] },
      },
    };

    await expect(sendRemoteKey(brokenCodeset, 'POWER')).rejects.toThrow(/non-empty/i);
    expect(mockTransmit).not.toHaveBeenCalled();
  });
});
