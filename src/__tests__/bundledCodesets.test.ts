import { ALL_REMOTE_KEYS, ALL_TV_BRANDS, DIGIT_REMOTE_KEYS } from '../types/ir';
import {
  BUNDLED_CODESETS,
  getCodesetById,
  getCodesetsByBrand,
} from '../services/ir/bundledCodesets';
import { encodeIrCommand } from '../services/ir/protocolEncoder';

describe('BUNDLED_CODESETS', () => {
  it('includes at least 2 codeset variants for each of the 6 supported brands', () => {
    for (const brand of ALL_TV_BRANDS) {
      const variants = getCodesetsByBrand(brand);
      expect(variants.length).toBeGreaterThanOrEqual(2);
      for (let i = 1; i < variants.length; i += 1) {
        expect(variants[i].priority).toBeGreaterThanOrEqual(variants[i - 1].priority);
      }
    }
  });

  it('defines all 25 standard remote keys (including digits 0-9) with encodable IR commands on every codeset', () => {
    expect(BUNDLED_CODESETS.length).toBeGreaterThanOrEqual(12);
    expect(ALL_REMOTE_KEYS).toHaveLength(25);
    expect(DIGIT_REMOTE_KEYS).toHaveLength(10);

    for (const codeset of BUNDLED_CODESETS) {
      expect(getCodesetById(codeset.id)).toEqual(codeset);
      const digitCodes = new Set<number | undefined>();

      for (const key of ALL_REMOTE_KEYS) {
        const command = codeset.commands[key];
        expect(command).toBeDefined();
        const encoded = encodeIrCommand(command);
        expect(encoded.carrierFrequency).toBeGreaterThan(0);
        expect(encoded.pattern.length).toBeGreaterThan(0);
      }

      for (const digitKey of DIGIT_REMOTE_KEYS) {
        digitCodes.add(codeset.commands[digitKey].code);
      }
      expect(digitCodes.size).toBe(10);
    }
  });
});
