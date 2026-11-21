import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppLocale } from '../types/ir';

export const LOCALE_STORAGE_KEY = '@tv_remote/locale_v1';

export const TRANSLATIONS = {
  vi: {
    tabRemote: 'Điều khiển',
    tabDevices: 'Thiết bị',
    wizardHeaderTitle: 'Thêm TV (Dò mã nhanh)',
    noDeviceTitle: 'Chưa chọn TV',
    noDeviceSubtitle: 'Hãy thêm TV để bắt đầu',
    emptyDevicesTitle: 'Chưa có TV nào được lưu',
    emptyDevicesDesc:
      'Dùng Quick Match Wizard để dò mã hồng ngoại cho TV Samsung, LG, Sony, TCL, Casper hoặc Panasonic.',
    addFirstTvCta: 'Thêm TV đầu tiên',
    addNewTvBtn: 'Thêm TV mới',
    devicesEmptyList: 'Chưa có TV nào được lưu.',
    saveBtn: 'Lưu',
    signalSentHardware: 'Đã phát IR: {key} ({freq} Hz)',
    signalSentSim: 'Giả lập: {key} ({freq} Hz)',
    signalError: 'Lỗi phát tín hiệu IR',
    keyPower: 'Nguồn',
    keySource: 'Ngõ vào',
    keyMute: 'Tắt tiếng',
    keyBack: 'Quay lại',
    keyHome: 'Home',
    keyMenu: 'Menu',
    keyUp: 'Lên',
    keyDown: 'Xuống',
    keyLeft: 'Trái',
    keyRight: 'Phải',
    keyOk: 'OK',
    keyVolUp: 'Tăng âm lượng',
    keyVolDown: 'Giảm âm lượng',
    keyChUp: 'Kênh tiếp',
    keyChDown: 'Kênh trước',
    modeDpad: 'Điều hướng',
    modeNumpad: 'Phím số 123',
    keyDigit0: 'Số 0',
    keyDigit1: 'Số 1',
    keyDigit2: 'Số 2',
    keyDigit3: 'Số 3',
    keyDigit4: 'Số 4',
    keyDigit5: 'Số 5',
    keyDigit6: 'Số 6',
    keyDigit7: 'Số 7',
    keyDigit8: 'Số 8',
    keyDigit9: 'Số 9',
    wizardStep1: '1. Chọn hãng TV',
    wizardStep2: '2. Thử bộ mã {index} / {total}',
    wizardTestPowerBtn: 'Phát thử nút Nguồn',
    wizardFeedbackHardware: 'Đã phát thử Nguồn ({label}). TV có bật/tắt không?',
    wizardFeedbackSim: 'Đã giả lập phát Nguồn ({label}).',
    wizardRoomLabel: 'Tên phòng / Thiết bị',
    wizardRoomPlaceholder: 'Ví dụ: TV Phòng khách',
    wizardNextBtn: 'Không, thử mã tiếp ({index}/{total})',
    wizardSaveBtn: 'Có, lưu TV này',
    defaultRoomPrefix: 'TV {brand}',
  },
  en: {
    tabRemote: 'Remote',
    tabDevices: 'Devices',
    wizardHeaderTitle: 'Add TV (Quick Match)',
    noDeviceTitle: 'No TV Selected',
    noDeviceSubtitle: 'Add a TV to get started',
    emptyDevicesTitle: 'No saved TVs yet',
    emptyDevicesDesc:
      'Use the Quick Match Wizard to find IR codes for Samsung, LG, Sony, TCL, Casper, or Panasonic TVs.',
    addFirstTvCta: 'Add First TV',
    addNewTvBtn: 'Add New TV',
    devicesEmptyList: 'No saved TVs yet.',
    saveBtn: 'Save',
    signalSentHardware: 'IR Sent: {key} ({freq} Hz)',
    signalSentSim: 'Simulated: {key} ({freq} Hz)',
    signalError: 'Failed to transmit IR signal',
    keyPower: 'Power',
    keySource: 'Source',
    keyMute: 'Mute',
    keyBack: 'Back',
    keyHome: 'Home',
    keyMenu: 'Menu',
    keyUp: 'Up',
    keyDown: 'Down',
    keyLeft: 'Left',
    keyRight: 'Right',
    keyOk: 'OK',
    keyVolUp: 'Volume Up',
    keyVolDown: 'Volume Down',
    keyChUp: 'Channel Up',
    keyChDown: 'Channel Down',
    modeDpad: 'D-Pad',
    modeNumpad: '123 Keypad',
    keyDigit0: 'Number 0',
    keyDigit1: 'Number 1',
    keyDigit2: 'Number 2',
    keyDigit3: 'Number 3',
    keyDigit4: 'Number 4',
    keyDigit5: 'Number 5',
    keyDigit6: 'Number 6',
    keyDigit7: 'Number 7',
    keyDigit8: 'Number 8',
    keyDigit9: 'Number 9',
    wizardStep1: '1. Select TV Brand',
    wizardStep2: '2. Test codeset {index} / {total}',
    wizardTestPowerBtn: 'Test Power Button',
    wizardFeedbackHardware: 'Sent Power test ({label}). Did the TV respond?',
    wizardFeedbackSim: 'Simulated Power test ({label}).',
    wizardRoomLabel: 'Room / Device Name',
    wizardRoomPlaceholder: 'e.g. Living Room TV',
    wizardNextBtn: 'No, try next ({index}/{total})',
    wizardSaveBtn: 'Yes, save this TV',
    defaultRoomPrefix: '{brand} TV',
  },
} as const;

export type TranslationKey = keyof typeof TRANSLATIONS.vi;

export function translate(
  locale: AppLocale,
  key: TranslationKey,
  params?: Record<string, string | number>
): string {
  const dict = TRANSLATIONS[locale] ?? TRANSLATIONS.vi;
  let text: string = dict[key];
  if (params) {
    for (const [paramKey, value] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(value));
    }
  }
  return text;
}

export async function loadSavedLocale(): Promise<AppLocale> {
  try {
    const saved = await AsyncStorage.getItem(LOCALE_STORAGE_KEY);
    return saved === 'en' ? 'en' : 'vi';
  } catch {
    return 'vi';
  }
}

export async function saveLocale(locale: AppLocale): Promise<AppLocale> {
  await AsyncStorage.setItem(LOCALE_STORAGE_KEY, locale);
  return locale;
}

interface LocaleContextValue {
  locale: AppLocale;
  setLocale: (next: AppLocale) => Promise<void>;
  toggleLocale: () => Promise<void>;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: 'vi',
  setLocale: async () => undefined,
  toggleLocale: async () => undefined,
  t: (key, params) => translate('vi', key, params),
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>('vi');

  useEffect(() => {
    let mounted = true;
    loadSavedLocale().then((saved) => {
      if (mounted) {
        setLocaleState(saved);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const setLocale = useCallback(async (next: AppLocale) => {
    setLocaleState(next);
    await saveLocale(next);
  }, []);

  const toggleLocale = useCallback(async () => {
    const next: AppLocale = locale === 'vi' ? 'en' : 'vi';
    await setLocale(next);
  }, [locale, setLocale]);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) =>
      translate(locale, key, params),
    [locale]
  );

  return React.createElement(
    LocaleContext.Provider,
    { value: { locale, setLocale, toggleLocale, t } },
    children
  );
}

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}
