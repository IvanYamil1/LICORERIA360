import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeIcon, GridIcon, PersonIcon } from '../../src/components/TabIcons';
import { useAuth } from '../../src/context/AuthContext';
import { usePushRegistration } from '../../src/hooks/usePushRegistration';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { isAdmin } = useAuth();
  usePushRegistration(); // se registra solo al entrar a las tabs (después del age gate)
  const baseHeight = 56;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e8e8e8',
          borderTopWidth: 1,
          height: baseHeight + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 6,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: '#111111',
        tabBarInactiveTintColor: '#bbbbbb',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.1,
          marginTop: 2,
        },
        tabBarItemStyle: { paddingTop: 2, paddingBottom: 2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ focused }) => <HomeIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          tabBarLabel: 'Productos',
          tabBarIcon: ({ focused }) => <GridIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="admin-tab"
        options={{
          tabBarLabel: 'Admin',
          tabBarIcon: ({ focused }) => <PersonIcon focused={focused} />,
          href: isAdmin ? undefined : null,
        }}
      />
    </Tabs>
  );
}
