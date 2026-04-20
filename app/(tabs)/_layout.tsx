import { Tabs } from 'expo-router';
import { View, Text, Platform } from 'react-native';
import { HomeIcon, GridIcon, PersonIcon } from '../../src/components/TabIcons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e8e8e8',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 84 : 62,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
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
        name="admin-tab"
        options={{
          tabBarLabel: 'Admin',
          tabBarIcon: ({ focused }) => <PersonIcon focused={focused} />,
        }}
      />
    </Tabs>
  );
}
