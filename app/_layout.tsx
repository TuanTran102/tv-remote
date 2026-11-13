import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LocaleProvider, useLocale } from '../src/i18n/translations';

function RootNavigator() {
  const { t } = useLocale();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#0B0F17' },
        headerTintColor: '#F8FAFC',
        contentStyle: { backgroundColor: '#0B0F17' },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="wizard"
        options={{
          title: t('wizardHeaderTitle'),
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <LocaleProvider>
      <StatusBar style="light" />
      <RootNavigator />
    </LocaleProvider>
  );
}
