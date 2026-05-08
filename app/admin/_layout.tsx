import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="index" />
      <Stack.Screen name="products" />
      <Stack.Screen name="categories" />
      <Stack.Screen name="promotions" />
      <Stack.Screen name="banners" />
      <Stack.Screen name="users" />
      <Stack.Screen name="notifications" />
    </Stack>
  );
}
