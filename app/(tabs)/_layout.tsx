import { Tabs, router } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeIcon, GridIcon, HeartIcon, PersonIcon } from '../../src/components/TabIcons';
import { useAuth } from '../../src/context/AuthContext';
import { usePushRegistration } from '../../src/hooks/usePushRegistration';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { isAdmin } = useAuth();
  usePushRegistration(); // se registra solo al entrar a las tabs (después del age gate)
  const baseHeight = 64;
  const extraBottom = 12;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e8e8e8',
          borderTopWidth: 1,
          height: baseHeight + extraBottom + insets.bottom,
          paddingBottom: extraBottom + insets.bottom,
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: '#111111',
        tabBarInactiveTintColor: '#bbbbbb',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.1,
          marginTop: 3,
        },
        tabBarItemStyle: { paddingTop: 2 },
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
        name="favorites"
        options={{
          tabBarLabel: 'Favoritos',
          tabBarIcon: ({ focused }) => <HeartIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="admin-tab"
        options={{
          tabBarLabel: 'Admin',
          tabBarIcon: ({ focused }) => <PersonIcon focused={focused} />,
          href: isAdmin ? undefined : null,
        }}
        listeners={{
          tabPress: (e) => {
            // Evitar que entre a la pantalla del tab y empuje al usuario fuera de las tabs.
            // En lugar de navegar al tab, abrimos /admin como un push normal.
            e.preventDefault();
            router.push('/admin');
          },
        }}
      />
    </Tabs>
  );
}
