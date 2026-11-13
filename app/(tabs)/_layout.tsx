import { Pressable, StyleSheet, Text } from 'react-native';
import { Tabs } from 'expo-router';
import { Tv, Radio } from 'lucide-react-native';
import { useLocale } from '../../src/i18n/translations';

function LanguageToggleButton() {
  const { locale, toggleLocale } = useLocale();
  return (
    <Pressable
      onPress={toggleLocale}
      accessibilityLabel="Switch Language"
      style={styles.langBtn}
    >
      <Text style={styles.langText}>
        {locale === 'vi' ? 'VI | EN' : 'EN | VI'}
      </Text>
    </Pressable>
  );
}

export default function TabsLayout() {
  const { t } = useLocale();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#0B0F17' },
        headerTintColor: '#F8FAFC',
        headerRight: () => <LanguageToggleButton />,
        tabBarStyle: {
          backgroundColor: '#0F172A',
          borderTopColor: '#1E293B',
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#94A3B8',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabRemote'),
          tabBarIcon: ({ color, size }) => <Radio color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="devices"
        options={{
          title: t('tabDevices'),
          tabBarIcon: ({ color, size }) => <Tv color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  langBtn: {
    marginRight: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  langText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '700',
  },
});
