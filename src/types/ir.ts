export type AppLocale = 'vi' | 'en';

export type IrProtocol = 'NEC' | 'SAMSUNG32' | 'SONY_SIRC12' | 'RAW';

export type RemotePadMode = 'dpad' | 'numpad';

export type DigitRemoteKey =
  | 'DIGIT_0'
  | 'DIGIT_1'
  | 'DIGIT_2'
  | 'DIGIT_3'
  | 'DIGIT_4'
  | 'DIGIT_5'
  | 'DIGIT_6'
  | 'DIGIT_7'
  | 'DIGIT_8'
  | 'DIGIT_9';

export const DIGIT_REMOTE_KEYS: readonly DigitRemoteKey[] = [
  'DIGIT_0',
  'DIGIT_1',
  'DIGIT_2',
  'DIGIT_3',
  'DIGIT_4',
  'DIGIT_5',
  'DIGIT_6',
  'DIGIT_7',
  'DIGIT_8',
  'DIGIT_9',
] as const;

export type RemoteKey =
  | 'POWER'
  | 'SOURCE'
  | 'MUTE'
  | 'UP'
  | 'DOWN'
  | 'LEFT'
  | 'RIGHT'
  | 'OK'
  | 'BACK'
  | 'HOME'
  | 'MENU'
  | 'VOL_UP'
  | 'VOL_DOWN'
  | 'CH_UP'
  | 'CH_DOWN'
  | DigitRemoteKey;

export const ALL_REMOTE_KEYS: readonly RemoteKey[] = [
  'POWER',
  'SOURCE',
  'MUTE',
  'UP',
  'DOWN',
  'LEFT',
  'RIGHT',
  'OK',
  'BACK',
  'HOME',
  'MENU',
  'VOL_UP',
  'VOL_DOWN',
  'CH_UP',
  'CH_DOWN',
  ...DIGIT_REMOTE_KEYS,
] as const;

export type TvBrand = 'Samsung' | 'LG' | 'Sony' | 'TCL' | 'Casper' | 'Panasonic';

export const ALL_TV_BRANDS: readonly TvBrand[] = [
  'Samsung',
  'LG',
  'Sony',
  'TCL',
  'Casper',
  'Panasonic',
] as const;

export interface IrCommandDef {
  protocol: IrProtocol;
  /** Hex 32-bit (NEC/SAMSUNG32) or 12-bit (SONY_SIRC12) */
  code?: number;
  /** Used for RAW protocol */
  carrierFrequency?: number;
  rawPattern?: number[];
}

export interface BrandCodeset {
  id: string;
  brand: TvBrand;
  label: string;
  priority: number;
  commands: Record<RemoteKey, IrCommandDef>;
}

export interface SavedTvDevice {
  id: string;
  roomName: string;
  brand: TvBrand;
  codesetId: string;
  createdAt: string;
}

export interface DeviceStorageState {
  activeDeviceId: string | null;
  devices: SavedTvDevice[];
}

export interface IrTransmitPayload {
  carrierFrequency: number;
  pattern: number[];
}

export interface IrTransmitResult {
  mode: 'hardware' | 'simulation';
  transmitted: boolean;
  key: RemoteKey;
  payload: IrTransmitPayload;
}
