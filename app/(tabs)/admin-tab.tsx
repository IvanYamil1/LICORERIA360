import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';

export default function AdminTab() {
  const { isAdmin, token } = useAuth();

  if (token === undefined) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <ActivityIndicator color="#111111" />
      </View>
    );
  }

  if (isAdmin) return <Redirect href="/admin" />;
  return <Redirect href="/admin/login" />;
}
