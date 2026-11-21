const memoryStore: Record<string, string> = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async (key: string) => memoryStore[key] ?? null),
    setItem: jest.fn(async (key: string, value: string) => {
      memoryStore[key] = value;
    }),
  },
}));

import {
  LOCALE_STORAGE_KEY,
  TRANSLATIONS,
  loadSavedLocale,
  saveLocale,
  translate,
} from '../i18n/translations';

describe('bilingual translations (vi + en)', () => {
  beforeEach(() => {
    Object.keys(memoryStore).forEach((k) => delete memoryStore[k]);
  });

  it('maintains 1:1 non-empty translation key parity between Vietnamese and English', () => {
    const viKeys = Object.keys(TRANSLATIONS.vi).sort();
    const enKeys = Object.keys(TRANSLATIONS.en).sort();

    expect(viKeys).toEqual(enKeys);
    for (const key of viKeys) {
      const k = key as keyof typeof TRANSLATIONS.vi;
      expect(TRANSLATIONS.vi[k].trim().length).toBeGreaterThan(0);
      expect(TRANSLATIONS.en[k].trim().length).toBeGreaterThan(0);
    }
  });

  it('interpolates parameters cleanly in both vi and en', () => {
    expect(translate('vi', 'wizardStep2', { index: 1, total: 2 })).toBe('2. Thử bộ mã 1 / 2');
    expect(translate('en', 'wizardStep2', { index: 1, total: 2 })).toBe('2. Test codeset 1 / 2');
  });

  it('provides clean CTA labels without redundant icons/symbols', () => {
    expect(TRANSLATIONS.vi.addFirstTvCta).toBe('Thêm TV đầu tiên');
    expect(TRANSLATIONS.en.addFirstTvCta).toBe('Add First TV');
    expect(TRANSLATIONS.vi.addFirstTvCta.startsWith('+')).toBe(false);
    expect(TRANSLATIONS.en.addFirstTvCta.startsWith('+')).toBe(false);
  });

  it('defaults to vi and persists switching to en in AsyncStorage', async () => {
    expect(await loadSavedLocale()).toBe('vi');

    await saveLocale('en');
    expect(memoryStore[LOCALE_STORAGE_KEY]).toBe('en');
    expect(await loadSavedLocale()).toBe('en');

    await saveLocale('vi');
    expect(await loadSavedLocale()).toBe('vi');
  });
});
