import React, { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CornerUpLeft,
  Home,
  LogIn,
  Menu,
  Power,
  VolumeX,
} from 'lucide-react-native';
import { useLocale } from '../i18n/translations';
import { RemoteKey } from '../types/ir';

export interface RemotePadProps {
  onPressKey: (key: RemoteKey) => void | Promise<void>;
  disabled?: boolean;
}

const KEY_DEBOUNCE_MS = 120;

export async function triggerKeyHaptic(): Promise<void> {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // Ignore on platforms where haptics is unavailable
  }
}

export function RemotePad({ onPressKey, disabled = false }: RemotePadProps) {
  const { t } = useLocale();
  const lastPressRef = useRef<number>(0);

  const handleKeyPress = async (key: RemoteKey) => {
    if (disabled) return;
    const now = Date.now();
    if (now - lastPressRef.current < KEY_DEBOUNCE_MS) {
      return;
    }
    lastPressRef.current = now;
    await triggerKeyHaptic();
    await onPressKey(key);
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

      {/* Central D-Pad + OK */}
      <View style={styles.dpadOuter}>
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
    gap: 14,
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
