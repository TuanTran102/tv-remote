import { encodeIrCommand } from '../services/ir/protocolEncoder';

describe('protocolEncoder', () => {
  it('encodes NEC 32-bit command (0x20DF10EF) with 38kHz carrier, [9000, 4500] leader, and odd mark-terminated pattern', () => {
    const payload = encodeIrCommand({ protocol: 'NEC', code: 0x20df10ef });

    expect(payload.carrierFrequency).toBe(38000);
    expect(payload.pattern.slice(0, 2)).toEqual([9000, 4500]);
    expect(payload.pattern).toHaveLength(67);
    expect(payload.pattern.length % 2).toBe(1);
    expect(payload.pattern.every((v) => Number.isInteger(v) && v > 0)).toBe(true);
    expect(payload.pattern[payload.pattern.length - 1]).toBe(560);
  });

  it('encodes SAMSUNG32 command (0xE0E040BF) with 38kHz carrier and [4500, 4500] leader', () => {
    const payload = encodeIrCommand({ protocol: 'SAMSUNG32', code: 0xe0e040bf });

    expect(payload.carrierFrequency).toBe(38000);
    expect(payload.pattern.slice(0, 2)).toEqual([4500, 4500]);
    expect(payload.pattern).toHaveLength(67);
    expect(payload.pattern.every((v) => Number.isInteger(v) && v > 0)).toBe(true);
  });

  it('encodes SONY_SIRC12 command (0xA90) with 40kHz carrier, [2400, 600] leader, and 3 frame repeats', () => {
    const payload = encodeIrCommand({ protocol: 'SONY_SIRC12', code: 0xa90 });

    expect(payload.carrierFrequency).toBe(40000);
    expect(payload.pattern.slice(0, 2)).toEqual([2400, 600]);
    expect(payload.pattern).toHaveLength(78);
    expect(payload.pattern.every((v) => Number.isInteger(v) && v > 0)).toBe(true);
  });

  it('accepts valid RAW timing pattern and rejects empty or non-positive RAW patterns', () => {
    const valid = encodeIrCommand({
      protocol: 'RAW',
      carrierFrequency: 38000,
      rawPattern: [3500, 1750, 450, 450, 450],
    });
    expect(valid).toEqual({
      carrierFrequency: 38000,
      pattern: [3500, 1750, 450, 450, 450],
    });

    expect(() =>
      encodeIrCommand({
        protocol: 'RAW',
        carrierFrequency: 38000,
        rawPattern: [],
      })
    ).toThrow(/non-empty/i);

    expect(() =>
      encodeIrCommand({
        protocol: 'RAW',
        carrierFrequency: 38000,
        rawPattern: [3500, 0, 450],
      })
    ).toThrow(/positive/i);

    expect(() =>
      encodeIrCommand({
        protocol: 'RAW',
        carrierFrequency: -1,
        rawPattern: [3500, 1750, 450],
      })
    ).toThrow(/frequency/i);
  });
});
