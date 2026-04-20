import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '../src/context/AuthContext';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <StatusBar style="light" backgroundColor="#000000" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="splash" />
          <Stack.Screen name="register" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="category/[id]" options={{
            headerShown: true,
            headerStyle: { backgroundColor: '#ffffff' },
            headerTintColor: '#111111',
            headerTitleStyle: { fontWeight: '800', fontSize: 17 },
            headerShadowVisible: false,
            headerBackTitle: 'Atrás',
          }} />
          <Stack.Screen name="product/[id]" />
          <Stack.Screen name="admin" />
        </Stack>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
