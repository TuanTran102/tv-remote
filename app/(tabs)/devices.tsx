import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { CheckCircle2, Edit3, Plus, Trash2 } from 'lucide-react-native';
import { useLocale } from '../../src/i18n/translations';
import {
  deleteSavedDevice,
  loadDeviceState,
  renameSavedDevice,
  setActiveDevice,
} from '../../src/store/deviceStorage';
import { DeviceStorageState, SavedTvDevice } from '../../src/types/ir';

export default function DevicesScreen() {
  const router = useRouter();
  const { t } = useLocale();
  const [state, setState] = useState<DeviceStorageState>({
    activeDeviceId: null,
    devices: [],
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState<string>('');

  const refresh = useCallback(async () => {
    const next = await loadDeviceState();
    setState(next);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleSelectActive = async (id: string) => {
    const next = await setActiveDevice(id);
    setState(next);
    router.replace('/(tabs)');
  };

  const handleStartRename = (device: SavedTvDevice) => {
    setEditingId(device.id);
    setDraftName(device.roomName);
  };

  const handleCommitRename = async (id: string) => {
    const next = await renameSavedDevice(id, draftName);
    setState(next);
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    const next = await deleteSavedDevice(id);
    setState(next);
  };

  return (
    <View style={styles.screen}>
      <Pressable onPress={() => router.push('/wizard')} style={styles.addBtn}>
        <Plus color="#FFFFFF" size={18} />
        <Text style={styles.addBtnText}>{t('addNewTvBtn')}</Text>
      </Pressable>

      <FlatList
        data={state.devices}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>{t('devicesEmptyList')}</Text>
        }
        renderItem={({ item }) => {
          const isActive = item.id === state.activeDeviceId;
          const isEditing = editingId === item.id;

          return (
            <View style={[styles.card, isActive && styles.cardActive]}>
              {isEditing ? (
                <View style={styles.renameRow}>
                  <TextInput
                    value={draftName}
                    onChangeText={setDraftName}
                    style={styles.renameInput}
                    autoFocus
                  />
                  <Pressable
                    onPress={() => handleCommitRename(item.id)}
                    style={styles.saveRenameBtn}
                  >
                    <Text style={styles.saveRenameText}>{t('saveBtn')}</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPress={() => handleSelectActive(item.id)}
                  style={styles.cardMain}
                >
                  <View style={styles.cardInfo}>
                    <Text style={styles.roomName}>{item.roomName}</Text>
                    <Text style={styles.metaText}>
                      {item.brand} • {item.codesetId}
                    </Text>
                  </View>
                  {isActive && <CheckCircle2 color="#10B981" size={20} />}
                </Pressable>
              )}

              <View style={styles.cardActions}>
                <Pressable
                  onPress={() => handleStartRename(item)}
                  style={styles.iconBtn}
                >
                  <Edit3 color="#94A3B8" size={18} />
                </Pressable>
                <Pressable
                  onPress={() => handleDelete(item.id)}
                  style={styles.iconBtn}
                >
                  <Trash2 color="#F87171" size={18} />
                </Pressable>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0B0F17',
    padding: 16,
    gap: 14,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 14,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  listContent: {
    gap: 10,
  },
  emptyText: {
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 40,
  },
  card: {
    backgroundColor: '#162032',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#273549',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardActive: {
    borderColor: '#10B981',
  },
  cardMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardInfo: {
    flex: 1,
  },
  roomName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  metaText: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    padding: 6,
  },
  renameRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  renameInput: {
    flex: 1,
    backgroundColor: '#0B0F17',
    color: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  saveRenameBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveRenameText: {
    color: '#062E22',
    fontWeight: '700',
  },
});
