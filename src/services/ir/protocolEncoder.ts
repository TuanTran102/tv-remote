import { IrCommandDef, IrTransmitPayload } from '../../types/ir';

const NEC_CARRIER_HZ = 38000;
const SONY_CARRIER_HZ = 40000;

function encode32BitLsbFrame(
  code: number,
  leaderMark: number,
  leaderSpace: number
): number[] {
  const pattern: number[] = [leaderMark, leaderSpace];
  const normalized = code >>> 0;
  for (let bitIndex = 0; bitIndex < 32; bitIndex += 1) {
    const bit = (normalized >>> (31 - bitIndex)) & 1;
    pattern.push(560, bit === 1 ? 1690 : 560);
  }
  pattern.push(560);
  return pattern;
}

function encodeSonySirc12(code: number): number[] {
  const normalized = code & 0xfff;
  const pattern: number[] = [];
  const frameRepeats = 3;
  const frameTargetUs = 45000;

  for (let repeat = 0; repeat < frameRepeats; repeat += 1) {
    const frame: number[] = [2400, 600];
    for (let bitIndex = 0; bitIndex < 12; bitIndex += 1) {
      const bit = (normalized >>> bitIndex) & 1;
      frame.push(bit === 1 ? 1200 : 600, 600);
    }
    const frameDuration = frame.reduce((sum, v) => sum + v, 0);
    const trailingGap = Math.max(10000, frameTargetUs - frameDuration);
    frame[frame.length - 1] = trailingGap;
    pattern.push(...frame);
  }

  return pattern;
}

export function validateTransmitPayload(payload: IrTransmitPayload): void {
  if (!Number.isInteger(payload.carrierFrequency) || payload.carrierFrequency <= 0) {
    throw new Error('Carrier frequency must be a positive integer in Hz.');
  }
  if (!Array.isArray(payload.pattern) || payload.pattern.length === 0) {
    throw new Error('IR timing pattern must be a non-empty array.');
  }
  for (const duration of payload.pattern) {
    if (!Number.isInteger(duration) || duration <= 0) {
      throw new Error('All IR timing pattern durations must be positive integers.');
    }
  }
}

export function encodeIrCommand(command: IrCommandDef): IrTransmitPayload {
  let payload: IrTransmitPayload;

  switch (command.protocol) {
    case 'NEC': {
      if (typeof command.code !== 'number' || !Number.isFinite(command.code)) {
        throw new Error('NEC command requires a numeric 32-bit code.');
      }
      payload = {
        carrierFrequency: NEC_CARRIER_HZ,
        pattern: encode32BitLsbFrame(command.code, 9000, 4500),
      };
      break;
    }
    case 'SAMSUNG32': {
      if (typeof command.code !== 'number' || !Number.isFinite(command.code)) {
        throw new Error('SAMSUNG32 command requires a numeric 32-bit code.');
      }
      payload = {
        carrierFrequency: NEC_CARRIER_HZ,
        pattern: encode32BitLsbFrame(command.code, 4500, 4500),
      };
      break;
    }
    case 'SONY_SIRC12': {
      if (typeof command.code !== 'number' || !Number.isFinite(command.code)) {
        throw new Error('SONY_SIRC12 command requires a numeric 12-bit code.');
      }
      payload = {
        carrierFrequency: SONY_CARRIER_HZ,
        pattern: encodeSonySirc12(command.code),
      };
      break;
    }
    case 'RAW': {
      payload = {
        carrierFrequency: command.carrierFrequency ?? 0,
        pattern: [...(command.rawPattern ?? [])],
      };
      break;
    }
    default: {
      const exhaustiveCheck: never = command.protocol;
      throw new Error(`Unsupported IR protocol: ${exhaustiveCheck}`);
    }
  }

  validateTransmitPayload(payload);
  return payload;
}
