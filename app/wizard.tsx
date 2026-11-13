import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Power } from 'lucide-react-native';
import { triggerKeyHaptic } from '../src/components/RemotePad';
import { useLocale } from '../src/i18n/translations';
import { getCodesetsByBrand } from '../src/services/ir/bundledCodesets';
import { sendRemoteKey } from '../src/services/ir/irTransmitter';
import { addSavedDevice } from '../src/store/deviceStorage';
import { ALL_TV_BRANDS, TvBrand } from '../src/types/ir';

export default function QuickMatchWizardScreen() {
  const router = useRouter();
  const { t } = useLocale();
  const [selectedBrand, setSelectedBrand] = useState<TvBrand | null>(null);
  const [variantIndex, setVariantIndex] = useState<number>(0);
  const [roomName, setRoomName] = useState<string>('');
  const [testFeedback, setTestFeedback] = useState<string>('');

  const variants = selectedBrand ? getCodesetsByBrand(selectedBrand) : [];
  const currentCodeset = variants[variantIndex];

  const handleSelectBrand = (brand: TvBrand) => {
    setSelectedBrand(brand);
    setVariantIndex(0);
    setRoomName(t('defaultRoomPrefix', { brand }));
    setTestFeedback('');
  };

  const handleTestPower = async () => {
    if (!currentCodeset) return;
    await triggerKeyHaptic();
    const res = await sendRemoteKey(currentCodeset, 'POWER');
    setTestFeedback(
      t(res.mode === 'hardware' ? 'wizardFeedbackHardware' : 'wizardFeedbackSim', {
        label: currentCodeset.label,
      })
    );
  };

  const handleNextVariant = () => {
    if (variants.length === 0) return;
    const nextIdx = (variantIndex + 1) % variants.length;
    setVariantIndex(nextIdx);
    setTestFeedback('');
  };

  const handleSaveDevice = async () => {
    if (!selectedBrand || !currentCodeset) return;
    await addSavedDevice({
      roomName,
      brand: selectedBrand,
      codesetId: currentCodeset.id,
    });
    router.replace('/(tabs)');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.sectionTitle}>{t('wizardStep1')}</Text>
      <View style={styles.brandGrid}>
        {ALL_TV_BRANDS.map((brand) => {
          const active = selectedBrand === brand;
          return (
            <Pressable
              key={brand}
              onPress={() => handleSelectBrand(brand)}
              style={[styles.brandChip, active && styles.brandChipActive]}
            >
              <Text style={[styles.brandText, active && styles.brandTextActive]}>
                {brand}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {currentCodeset && (
        <View style={styles.stepCard}>
          <Text style={styles.sectionTitle}>
            {t('wizardStep2', { index: variantIndex + 1, total: variants.length })}
          </Text>
          <Text style={styles.codesetLabel}>{currentCodeset.label}</Text>

          <Pressable onPress={handleTestPower} style={styles.testPowerBtn}>
            <Power color="#FFFFFF" size={24} />
            <Text style={styles.testPowerText}>{t('wizardTestPowerBtn')}</Text>
          </Pressable>

          {testFeedback ? <Text style={styles.feedbackText}>{testFeedback}</Text> : null}

          <Text style={styles.inputLabel}>{t('wizardRoomLabel')}</Text>
          <TextInput
            value={roomName}
            onChangeText={setRoomName}
            placeholder={t('wizardRoomPlaceholder')}
            placeholderTextColor="#64748B"
            style={styles.input}
          />

          <View style={styles.actionsRow}>
            <Pressable onPress={handleNextVariant} style={styles.secondaryBtn}>
              <Text style={styles.secondaryBtnText}>
                {t('wizardNextBtn', { index: variantIndex + 1, total: variants.length })}
              </Text>
            </Pressable>

            <Pressable onPress={handleSaveDevice} style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>{t('wizardSaveBtn')}</Text>
            </Pressable>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
    backgroundColor: '#0B0F17',
    flexGrow: 1,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  brandGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  brandChip: {
    width: '48%',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#162032',
    borderWidth: 1,
    borderColor: '#2B3A52',
    alignItems: 'center',
  },
  brandChipActive: {
    backgroundColor: '#1D4ED8',
    borderColor: '#3B82F6',
  },
  brandText: {
    color: '#CBD5E1',
    fontWeight: '600',
    fontSize: 15,
  },
  brandTextActive: {
    color: '#FFFFFF',
  },
  stepCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
    gap: 12,
  },
  codesetLabel: {
    color: '#94A3B8',
    fontSize: 13,
  },
  testPowerBtn: {
    backgroundColor: '#DC2626',
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  testPowerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  feedbackText: {
    color: '#60A5FA',
    fontSize: 13,
    textAlign: 'center',
  },
  inputLabel: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#0B0F17',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#F8FAFC',
    fontSize: 15,
  },
  actionsRow: {
    gap: 10,
    marginTop: 4,
  },
  secondaryBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    backgroundColor: '#1E293B',
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#E2E8F0',
    fontWeight: '600',
  },
  primaryBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    backgroundColor: '#10B981',
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#062E22',
    fontWeight: '800',
    fontSize: 15,
  },
});
