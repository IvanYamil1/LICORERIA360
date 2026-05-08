import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/context/AuthContext';

// Sentry: solo carga el SDK si hay DSN. Sin DSN no se importa el módulo
// para que el build no requiera el plugin nativo ni token de upload.
const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;
let Sentry: any = null;
if (SENTRY_DSN) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    Sentry = require('@sentry/react-native');
    Sentry.init({
      dsn: SENTRY_DSN,
      enabled: !__DEV__,
      debug: false,
      tracesSampleRate: 0.1,
    });
  } catch {
    Sentry = null;
  }
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
export default Sentry ? Sentry.wrap(RootLayout) : RootLayout;
