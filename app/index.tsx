import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AGE_GATE_KEY } from './age-gate';

export default function Root() {
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(AGE_GATE_KEY).then((v) => {
      setTarget(v === 'true' ? '/splash' : '/age-gate');
    });
  }, []);

  if (!target) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center' }}>
        <ActivityIndicator color="#7a7820" />
      </View>
    );
  }
  return <Redirect href={target as any} />;
}
