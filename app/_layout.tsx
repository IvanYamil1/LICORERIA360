import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/context/AuthContext';

export default function RootLayout() {
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
            <Stack.Screen name="product/[id]" />
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
