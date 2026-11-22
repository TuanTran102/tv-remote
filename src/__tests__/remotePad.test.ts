import * as Haptics from 'expo-haptics';
import { DIGIT_REMOTE_KEYS } from '../types/ir';
import {
  DIGIT_KEY_META,
  NUMPAD_GRID_ROWS,
  dispatchDebouncedKeyPress,
  toggleRemotePadMode,
  triggerKeyHaptic,
} from '../components/RemotePad';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('expo-haptics', () => ({
  __esModule: true,
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' },
  impactAsync: jest.fn(async () => undefined),
}));

describe('RemotePad helpers & 3x4 Number Pad', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('triggers Haptics.impactAsync on key press without throwing', async () => {
    await triggerKeyHaptic();
    expect(Haptics.impactAsync).toHaveBeenCalledTimes(1);
    expect(Haptics.impactAsync).toHaveBeenCalledWith('light');
  });

  it('defines a 3x4 grid with digits 1-9, 0 centered, and OK to the right of 0 on the bottom row', () => {
    expect(NUMPAD_GRID_ROWS).toEqual([
      ['DIGIT_1', 'DIGIT_2', 'DIGIT_3'],
      ['DIGIT_4', 'DIGIT_5', 'DIGIT_6'],
      ['DIGIT_7', 'DIGIT_8', 'DIGIT_9'],
      [null, 'DIGIT_0', 'OK'],
    ]);

    for (const digitKey of DIGIT_REMOTE_KEYS) {
      const meta = DIGIT_KEY_META[digitKey];
      expect(meta).toBeDefined();
      expect(meta.digit).toBe(digitKey.replace('DIGIT_', ''));
    }
  });

  it('toggles cleanly between dpad and numpad modes', () => {
    expect(toggleRemotePadMode('dpad')).toBe('numpad');
    expect(toggleRemotePadMode('numpad')).toBe('dpad');
  });

  it('dispatches digit and standard keys with haptics while enforcing 120ms debounce and disabled guard', async () => {
    const onPressKey = jest.fn(async () => undefined);

    const first = await dispatchDebouncedKeyPress({
      key: 'DIGIT_5',
      now: 1000,
      lastPressMs: 0,
      onPressKey,
    });
    expect(first).toEqual({ dispatched: true, nextLastPressMs: 1000 });
    expect(Haptics.impactAsync).toHaveBeenCalledTimes(1);
    expect(onPressKey).toHaveBeenCalledWith('DIGIT_5');

    const debounced = await dispatchDebouncedKeyPress({
      key: 'DIGIT_6',
      now: 1050,
      lastPressMs: first.nextLastPressMs,
      onPressKey,
    });
    expect(debounced).toEqual({ dispatched: false, nextLastPressMs: 1000 });
    expect(Haptics.impactAsync).toHaveBeenCalledTimes(1);
    expect(onPressKey).toHaveBeenCalledTimes(1);

    const second = await dispatchDebouncedKeyPress({
      key: 'VOL_UP',
      now: 1120,
      lastPressMs: debounced.nextLastPressMs,
      onPressKey,
    });
    expect(second).toEqual({ dispatched: true, nextLastPressMs: 1120 });
    expect(Haptics.impactAsync).toHaveBeenCalledTimes(2);
    expect(onPressKey).toHaveBeenLastCalledWith('VOL_UP');

    const blocked = await dispatchDebouncedKeyPress({
      key: 'DIGIT_0',
      disabled: true,
      now: 2000,
      lastPressMs: second.nextLastPressMs,
      onPressKey,
    });
    expect(blocked).toEqual({ dispatched: false, nextLastPressMs: 1120 });
    expect(onPressKey).toHaveBeenCalledTimes(2);
  });
});
