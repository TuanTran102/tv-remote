import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Compass,
  CornerUpLeft,
  Hash,
  Home,
  LogIn,
  Menu,
  Power,
  VolumeX,
} from 'lucide-react-native';
import { TranslationKey, useLocale } from '../i18n/translations';
import { DigitRemoteKey, RemoteKey, RemotePadMode } from '../types/ir';

export interface RemotePadProps {
  onPressKey: (key: RemoteKey) => void | Promise<void>;
  disabled?: boolean;
  initialMode?: RemotePadMode;
}

const KEY_DEBOUNCE_MS = 120;

export type NumpadGridKey = DigitRemoteKey | 'OK';

export const NUMPAD_GRID_ROWS: readonly (readonly (NumpadGridKey | null)[])[] = [
  ['DIGIT_1', 'DIGIT_2', 'DIGIT_3'],
  ['DIGIT_4', 'DIGIT_5', 'DIGIT_6'],
  ['DIGIT_7', 'DIGIT_8', 'DIGIT_9'],
  [null, 'DIGIT_0', 'OK'],
] as const;

export const DIGIT_KEY_META: Record<DigitRemoteKey, { digit: string; labelKey: TranslationKey }> = {
  DIGIT_0: { digit: '0', labelKey: 'keyDigit0' },
  DIGIT_1: { digit: '1', labelKey: 'keyDigit1' },
  DIGIT_2: { digit: '2', labelKey: 'keyDigit2' },
  DIGIT_3: { digit: '3', labelKey: 'keyDigit3' },
  DIGIT_4: { digit: '4', labelKey: 'keyDigit4' },
  DIGIT_5: { digit: '5', labelKey: 'keyDigit5' },
  DIGIT_6: { digit: '6', labelKey: 'keyDigit6' },
  DIGIT_7: { digit: '7', labelKey: 'keyDigit7' },
  DIGIT_8: { digit: '8', labelKey: 'keyDigit8' },
  DIGIT_9: { digit: '9', labelKey: 'keyDigit9' },
};

export function toggleRemotePadMode(current: RemotePadMode): RemotePadMode {
  return current === 'dpad' ? 'numpad' : 'dpad';
}

export async function triggerKeyHaptic(): Promise<void> {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // Ignore on platforms where haptics is unavailable
  }
}

export async function dispatchDebouncedKeyPress(options: {
  key: RemoteKey;
  disabled?: boolean;
  now: number;
  lastPressMs: number;
  onPressKey: (key: RemoteKey) => void | Promise<void>;
}): Promise<{ dispatched: boolean; nextLastPressMs: number }> {
  const { key, disabled = false, now, lastPressMs, onPressKey } = options;
  if (disabled || now - lastPressMs < KEY_DEBOUNCE_MS) {
    return { dispatched: false, nextLastPressMs: lastPressMs };
  }
  await triggerKeyHaptic();
  await onPressKey(key);
  return { dispatched: true, nextLastPressMs: now };
}

export function RemotePad({
  onPressKey,
  disabled = false,
  initialMode = 'dpad',
}: RemotePadProps) {
  const { t } = useLocale();
  const lastPressRef = useRef<number>(0);
  const [padMode, setPadMode] = useState<RemotePadMode>(initialMode);

  const handleKeyPress = async (key: RemoteKey) => {
    const result = await dispatchDebouncedKeyPress({
      key,
      disabled,
      now: Date.now(),
      lastPressMs: lastPressRef.current,
      onPressKey,
    });
    lastPressRef.current = result.nextLastPressMs;
  };

  return (
    <View style={styles.container}>
      {/* Top Row: Power, Source, Mute */}
      <View style={styles.topRow}>
        <Pressable
          accessibilityLabel={t('keyPower')}
          disabled={disabled}
          onPress={() => handleKeyPress('POWER')}
          style={({ pressed }) => [styles.powerBtn, pressed && styles.pressed]}
        >
          <Power color="#FFFFFF" size={22} />
          <Text style={styles.powerLabel}>{t('keyPower')}</Text>
        </Pressable>

        <Pressable
          accessibilityLabel={t('keySource')}
          disabled={disabled}
          onPress={() => handleKeyPress('SOURCE')}
          style={({ pressed }) => [styles.pillBtn, pressed && styles.pressed]}
        >
          <LogIn color="#E2E8F0" size={20} />
          <Text style={styles.pillLabel}>{t('keySource')}</Text>
        </Pressable>

        <Pressable
          accessibilityLabel={t('keyMute')}
          disabled={disabled}
          onPress={() => handleKeyPress('MUTE')}
          style={({ pressed }) => [styles.pillBtn, pressed && styles.pressed]}
        >
          <VolumeX color="#E2E8F0" size={20} />
          <Text style={styles.pillLabel}>{t('keyMute')}</Text>
        </Pressable>
      </View>

      {/* Utility Row: Back, Home, Menu */}
      <View style={styles.utilityRow}>
        <Pressable
          accessibilityLabel={t('keyBack')}
          disabled={disabled}
          onPress={() => handleKeyPress('BACK')}
          style={({ pressed }) => [styles.utilityBtn, pressed && styles.pressed]}
        >
          <CornerUpLeft color="#CBD5E1" size={18} />
          <Text style={styles.utilityLabel}>{t('keyBack')}</Text>
        </Pressable>

        <Pressable
          accessibilityLabel={t('keyHome')}
          disabled={disabled}
          onPress={() => handleKeyPress('HOME')}
          style={({ pressed }) => [styles.utilityBtn, pressed && styles.pressed]}
        >
          <Home color="#CBD5E1" size={18} />
          <Text style={styles.utilityLabel}>{t('keyHome')}</Text>
        </Pressable>

        <Pressable
          accessibilityLabel={t('keyMenu')}
          disabled={disabled}
          onPress={() => handleKeyPress('MENU')}
          style={({ pressed }) => [styles.utilityBtn, pressed && styles.pressed]}
        >
          <Menu color="#CBD5E1" size={18} />
          <Text style={styles.utilityLabel}>{t('keyMenu')}</Text>
        </Pressable>
      </View>

      {/* Segmented Mode Toggle: D-Pad <-> 123 Keypad */}
      <View style={styles.modeSwitcher} testID="remote-mode-switcher">
        <Pressable
          accessibilityLabel={t('modeDpad')}
          accessibilityState={{ selected: padMode === 'dpad' }}
          disabled={disabled}
          onPress={() => setPadMode('dpad')}
          style={({ pressed }) => [
            styles.modeTab,
            padMode === 'dpad' && styles.modeTabActive,
            pressed && styles.pressed,
          ]}
          testID="mode-tab-dpad"
        >
          <Compass color={padMode === 'dpad' ? '#FFFFFF' : '#94A3B8'} size={15} />
          <Text style={[styles.modeLabel, padMode === 'dpad' && styles.modeLabelActive]}>
            {t('modeDpad')}
          </Text>
        </Pressable>

        <Pressable
          accessibilityLabel={t('modeNumpad')}
          accessibilityState={{ selected: padMode === 'numpad' }}
          disabled={disabled}
          onPress={() => setPadMode('numpad')}
          style={({ pressed }) => [
            styles.modeTab,
            padMode === 'numpad' && styles.modeTabActive,
            pressed && styles.pressed,
          ]}
          testID="mode-tab-numpad"
        >
          <Hash color={padMode === 'numpad' ? '#FFFFFF' : '#94A3B8'} size={15} />
          <Text style={[styles.modeLabel, padMode === 'numpad' && styles.modeLabelActive]}>
            {t('modeNumpad')}
          </Text>
        </Pressable>
      </View>

      {/* Central Zone (Fixed 224px height): D-Pad or 3x4 Number Pad */}
      {padMode === 'dpad' ? (
        <View style={styles.dpadOuter} testID="remote-dpad-zone">
          <Pressable
            accessibilityLabel={t('keyUp')}
            disabled={disabled}
            onPress={() => handleKeyPress('UP')}
            style={({ pressed }) => [styles.dpadTop, pressed && styles.pressed]}
          >
            <ChevronUp color="#F8FAFC" size={26} />
          </Pressable>

          <View style={styles.dpadMiddleRow}>
            <Pressable
              accessibilityLabel={t('keyLeft')}
              disabled={disabled}
              onPress={() => handleKeyPress('LEFT')}
              style={({ pressed }) => [styles.dpadSide, pressed && styles.pressed]}
            >
              <ChevronLeft color="#F8FAFC" size={26} />
            </Pressable>

            <Pressable
              accessibilityLabel={t('keyOk')}
              disabled={disabled}
              onPress={() => handleKeyPress('OK')}
              style={({ pressed }) => [styles.okBtn, pressed && styles.pressed]}
            >
              <Text style={styles.okLabel}>{t('keyOk')}</Text>
            </Pressable>

            <Pressable
              accessibilityLabel={t('keyRight')}
              disabled={disabled}
              onPress={() => handleKeyPress('RIGHT')}
              style={({ pressed }) => [styles.dpadSide, pressed && styles.pressed]}
            >
              <ChevronRight color="#F8FAFC" size={26} />
            </Pressable>
          </View>

          <Pressable
            accessibilityLabel={t('keyDown')}
            disabled={disabled}
            onPress={() => handleKeyPress('DOWN')}
            style={({ pressed }) => [styles.dpadBottom, pressed && styles.pressed]}
          >
            <ChevronDown color="#F8FAFC" size={26} />
          </Pressable>
        </View>
      ) : (
        <View style={styles.numpadGrid} testID="remote-numpad-zone">
          {NUMPAD_GRID_ROWS.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.numpadRow}>
              {row.map((cellKey, colIndex) => {
                if (!cellKey) {
                  return <View key={`spacer-${rowIndex}-${colIndex}`} style={styles.numpadSpacer} />;
                }
                if (cellKey === 'OK') {
                  return (
                    <Pressable
                      key="OK"
                      accessibilityLabel={t('keyOk')}
                      disabled={disabled}
                      onPress={() => handleKeyPress('OK')}
                      style={({ pressed }) => [
                        styles.numpadBtn,
                        styles.numpadOkBtn,
                        pressed && styles.pressed,
                      ]}
                      testID="numpad-key-OK"
                    >
                      <Text style={styles.numpadOkLabel}>{t('keyOk')}</Text>
                    </Pressable>
                  );
                }
                const meta = DIGIT_KEY_META[cellKey];
                return (
                  <Pressable
                    key={cellKey}
                    accessibilityLabel={t(meta.labelKey)}
                    disabled={disabled}
                    onPress={() => handleKeyPress(cellKey)}
                    style={({ pressed }) => [
                      styles.numpadBtn,
                      pressed && styles.numpadBtnPressed,
                    ]}
                    testID={`numpad-key-${meta.digit}`}
                  >
                    <Text style={styles.numpadDigit}>{meta.digit}</Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      )}

      {/* Bottom Rockers: VOL +/- and CH +/- */}
      <View style={styles.rockerRow}>
        <View style={styles.rockerCard}>
          <Pressable
            accessibilityLabel={t('keyVolUp')}
            disabled={disabled}
            onPress={() => handleKeyPress('VOL_UP')}
            style={({ pressed }) => [styles.rockerBtn, pressed && styles.pressed]}
          >
            <Text style={styles.rockerSymbol}>+</Text>
          </Pressable>
          <Text style={styles.rockerTitle}>VOL</Text>
          <Pressable
            accessibilityLabel={t('keyVolDown')}
            disabled={disabled}
            onPress={() => handleKeyPress('VOL_DOWN')}
            style={({ pressed }) => [styles.rockerBtn, pressed && styles.pressed]}
          >
            <Text style={styles.rockerSymbol}>−</Text>
          </Pressable>
        </View>

        <View style={styles.rockerCard}>
          <Pressable
            accessibilityLabel={t('keyChUp')}
            disabled={disabled}
            onPress={() => handleKeyPress('CH_UP')}
            style={({ pressed }) => [styles.rockerBtn, pressed && styles.pressed]}
          >
            <ChevronUp color="#F8FAFC" size={22} />
          </Pressable>
          <Text style={styles.rockerTitle}>CH</Text>
          <Pressable
            accessibilityLabel={t('keyChDown')}
            disabled={disabled}
            onPress={() => handleKeyPress('CH_DOWN')}
            style={({ pressed }) => [styles.rockerBtn, pressed && styles.pressed]}
          >
            <ChevronDown color="#F8FAFC" size={22} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    gap: 10,
  },
  powerBtn: {
    flex: 1,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  powerLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  pillBtn: {
    flex: 1,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  pillLabel: {
    color: '#E2E8F0',
    fontWeight: '600',
    fontSize: 13,
  },
  utilityRow: {
    flexDirection: 'row',
    gap: 10,
  },
  utilityBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#162032',
    borderWidth: 1,
    borderColor: '#273549',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  utilityLabel: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
  },
  modeSwitcher: {
    flexDirection: 'row',
    height: 40,
    padding: 4,
    gap: 4,
    borderRadius: 12,
    backgroundColor: '#162032',
    borderWidth: 1,
    borderColor: '#273549',
  },
  modeTab: {
    flex: 1,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  modeTabActive: {
    backgroundColor: '#2563EB',
  },
  modeLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  modeLabelActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  dpadOuter: {
    alignSelf: 'center',
    width: 224,
    height: 224,
    borderRadius: 112,
    backgroundColor: '#162032',
    borderWidth: 1,
    borderColor: '#2B3A52',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  dpadTop: {
    width: 64,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dpadBottom: {
    width: 64,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dpadMiddleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  dpadSide: {
    width: 54,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  okBtn: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  okLabel: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  numpadGrid: {
    height: 224,
    justifyContent: 'space-between',
    gap: 8,
  },
  numpadRow: {
    flexDirection: 'row',
    gap: 10,
    height: 50,
  },
  numpadBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#162032',
    borderWidth: 1,
    borderColor: '#2B3A52',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numpadBtnPressed: {
    backgroundColor: '#2563EB',
    borderColor: '#60A5FA',
    transform: [{ scale: 0.96 }],
  },
  numpadSpacer: {
    flex: 1,
    height: 50,
  },
  numpadDigit: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '700',
  },
  numpadOkBtn: {
    backgroundColor: '#2563EB',
    borderColor: '#3B82F6',
  },
  numpadOkLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  rockerRow: {
    flexDirection: 'row',
    gap: 16,
  },
  rockerCard: {
    flex: 1,
    height: 132,
    borderRadius: 24,
    backgroundColor: '#162032',
    borderWidth: 1,
    borderColor: '#2B3A52',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  rockerBtn: {
    width: '100%',
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rockerSymbol: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: '600',
  },
  rockerTitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
});
