import * as Haptics from 'expo-haptics';
import { triggerKeyHaptic } from '../components/RemotePad';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('expo-haptics', () => ({
  __esModule: true,
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' },
  impactAsync: jest.fn(async () => undefined),
}));

describe('RemotePad haptics helper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('triggers Haptics.impactAsync on key press without throwing', async () => {
    await triggerKeyHaptic();
    expect(Haptics.impactAsync).toHaveBeenCalledTimes(1);
    expect(Haptics.impactAsync).toHaveBeenCalledWith('light');
  });
});
