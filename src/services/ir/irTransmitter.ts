import { hasIrEmitter, transmit } from '../../../modules/expo-ir-blaster';
import { AppLocale, BrandCodeset, IrTransmitResult, RemoteKey } from '../../types/ir';
import { encodeIrCommand } from './protocolEncoder';

export interface IrHardwareStatus {
  available: boolean;
  label: string;
}

export function getIrHardwareStatus(locale: AppLocale = 'vi'): IrHardwareStatus {
  const available = hasIrEmitter();
  if (locale === 'en') {
    return {
      available,
      label: available ? 'IR Ready' : 'Simulation Mode',
    };
  }
  return {
    available,
    label: available ? 'IR Sẵn sàng' : 'Chế độ giả lập',
  };
}

export async function sendRemoteKey(
  codeset: BrandCodeset,
  key: RemoteKey
): Promise<IrTransmitResult> {
  const command = codeset.commands[key];
  if (!command) {
    throw new Error(`Codeset "${codeset.id}" does not define key "${key}".`);
  }

  const payload = encodeIrCommand(command);

  if (hasIrEmitter()) {
    await transmit(payload.carrierFrequency, payload.pattern);
    return {
      mode: 'hardware',
      transmitted: true,
      key,
      payload,
    };
  }

  return {
    mode: 'simulation',
    transmitted: false,
    key,
    payload,
  };
}
