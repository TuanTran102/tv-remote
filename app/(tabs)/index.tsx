import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Plus, Tv } from 'lucide-react-native';
import { RemotePad } from '../../src/components/RemotePad';
import { useLocale } from '../../src/i18n/translations';
import { getCodesetById } from '../../src/services/ir/bundledCodesets';
import { getIrHardwareStatus, sendRemoteKey } from '../../src/services/ir/irTransmitter';
import { loadDeviceState } from '../../src/store/deviceStorage';
import { RemoteKey, SavedTvDevice } from '../../src/types/ir';

export default function RemoteScreen() {
  const router = useRouter();
  const { locale, t } = useLocale();
  const [activeDevice, setActiveDevice] = useState<SavedTvDevice | null>(null);
  const [lastSignalNote, setLastSignalNote] = useState<string>('');
  const hardwareStatus = getIrHardwareStatus(locale);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      loadDeviceState().then((state) => {
        if (!mounted) return;
        const found =
          state.devices.find((d) => d.id === state.activeDeviceId) ??
          state.devices[0] ??
          null;
        setActiveDevice(found);
      });
      return () => {
        mounted = false;
      };
    }, [])
  );

  const handlePressKey = async (key: RemoteKey) => {
    if (!activeDevice) return;
    const codeset = getCodesetById(activeDevice.codesetId);
    if (!codeset) return;
    try {
      const result = await sendRemoteKey(codeset, key);
      setLastSignalNote(
        t(result.mode === 'hardware' ? 'signalSentHardware' : 'signalSentSim', {
          key,
          freq: result.payload.carrierFrequency,
        })
      );
    } catch (err) {
      setLastSignalNote(err instanceof Error ? err.message : t('signalError'));
    }
  };

  return (
    <View style={styles.screen}>
      {/* Top Bar: Active TV & Hardware Status Pill */}
      <View style={styles.headerRow}>
        <View style={styles.deviceInfo}>
          <Text style={styles.roomTitle}>
            {activeDevice ? activeDevice.roomName : t('noDeviceTitle')}
          </Text>
          <Text style={styles.brandSubtitle}>
            {activeDevice
              ? `${activeDevice.brand} • ${activeDevice.codesetId}`
              : t('noDeviceSubtitle')}
          </Text>
        </View>

        <View
          style={[
            styles.statusPill,
            hardwareStatus.available ? styles.statusReady : styles.statusSim,
          ]}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: hardwareStatus.available ? '#10B981' : '#F59E0B' },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              { color: hardwareStatus.available ? '#10B981' : '#F59E0B' },
            ]}
          >
            {hardwareStatus.label}
          </Text>
        </View>
      </View>

      {!activeDevice ? (
        <View style={styles.emptyBox}>
          <Tv color="#64748B" size={48} />
          <Text style={styles.emptyTitle}>{t('emptyDevicesTitle')}</Text>
          <Text style={styles.emptyDesc}>{t('emptyDevicesDesc')}</Text>
          <Pressable
            onPress={() => router.push('/wizard')}
            style={styles.ctaBtn}
          >
            <Plus color="#FFFFFF" size={18} />
            <Text style={styles.ctaText}>{t('addFirstTvCta')}</Text>
          </Pressable>
        </View>
      ) : (
        <>
          {lastSignalNote ? (
            <Text style={styles.signalLog}>{lastSignalNote}</Text>
          ) : null}
          <RemotePad onPressKey={handlePressKey} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0B0F17',
    padding: 16,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  deviceInfo: {
    flex: 1,
  },
  roomTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  brandSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusReady: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  statusSim: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  signalLog: {
    color: '#60A5FA',
    fontSize: 12,
    textAlign: 'center',
  },
  emptyBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  emptyTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  emptyDesc: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  ctaBtn: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
