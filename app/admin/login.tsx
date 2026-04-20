import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, Alert, StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { loginAdmin } from '../../src/services/api';
import { useAuth } from '../../src/context/AuthContext';

const C = {
  bg: '#f5f5f5',
  white: '#ffffff',
  text: '#111111',
  sub: '#666666',
  muted: '#999999',
  card: '#f0f0f0',
  border: '#ebebeb',
  accent: '#111111',
  error: '#c40000',
};

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login('dev-bypass-token');
      router.replace('/admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <View style={styles.top}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>369</Text>
        </View>
        <Text style={styles.title}>Panel de Admin</Text>
        <Text style={styles.subtitle}>Acceso exclusivo para administradores</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Usuario</Text>
        <TextInput
          style={styles.input}
          placeholder="Ingresa tu usuario"
          placeholderTextColor={C.muted}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor={C.muted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.btn, loading && { opacity: 0.6 }]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.btnText}>Ingresar</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  top: { alignItems: 'center', marginBottom: 40 },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: { fontSize: 22, fontWeight: '900', color: '#ffffff', letterSpacing: -1 },
  title: { fontSize: 26, fontWeight: '800', color: C.text, letterSpacing: -0.4 },
  subtitle: { fontSize: 14, color: C.sub, marginTop: 6, textAlign: 'center' },

  form: { gap: 6 },
  label: { fontSize: 13, fontWeight: '700', color: C.text, marginBottom: 4, marginTop: 8 },
  input: {
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    color: C.text,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 15,
    marginBottom: 4,
  },
  btn: {
    backgroundColor: C.accent,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 16,
  },
  btnText: { color: '#ffffff', fontWeight: '800', fontSize: 16 },
});
