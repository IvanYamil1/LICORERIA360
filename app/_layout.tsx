import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Sentry from '@sentry/react-native';
import { AuthProvider } from '../src/context/AuthContext';

// Inicializa Sentry. Solo reporta errores si EXPO_PUBLIC_SENTRY_DSN está definido y no es dev.
const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    enabled: !__DEV__,
    debug: false,
    tracesSampleRate: 0.1,
  });
}

function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="light" backgroundColor="#000000" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="age-gate" />
            <Stack.Screen name="splash" />
            <Stack.Screen name="register" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="category/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="admin" />
            <Stack.Screen name="legal/privacy" />
            <Stack.Screen name="legal/terms" />
            <Stack.Screen name="about" />
          </Stack>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// Envolver con Sentry para auto-captura de crashes y trace de navegación
export default SENTRY_DSN ? Sentry.wrap(RootLayout) : RootLayout;
