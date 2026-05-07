import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { A } from '../../src/theme/admin';
import { loginAdmin } from '../../src/services/api';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      setError('Ingresa usuario y contraseña');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await loginAdmin(username.trim(), password);
      if (!res.data?.token) {
        setError('Respuesta inválida del servidor');
        return;
      }
      await login(res.data.token);
      router.replace('/admin');
    } catch (e: any) {
      const msg = e?.response?.data?.error || 'No se pudo iniciar sesión';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={A.bg} />

      <View style={s.top}>
        <View style={s.logoCircle}>
          <Text style={s.logoText}>369</Text>
        </View>
        <Text style={s.brandSub}>LICORERÍA</Text>
        <Text style={s.title}>Panel de Admin</Text>
        <Text style={s.subtitle}>Acceso exclusivo para administradores</Text>
      </View>

      <View style={s.form}>
        <Text style={s.label}>Usuario</Text>
        <TextInput
          style={s.input}
          placeholder="Ingresa tu usuario"
          placeholderTextColor={A.muted}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={s.label}>Contraseña</Text>
        <TextInput
          style={s.input}
          placeholder="••••••••"
          placeholderTextColor={A.muted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error ? <Text style={s.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[s.btn, loading && { opacity: 0.6 }]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={A.primaryText} />
          ) : (
            <Text style={s.btnText}>Ingresar</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: A.bg,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  top: { alignItems: 'center', marginBottom: 40 },
  logoCircle: {
    width: 88, height: 88, borderRadius: 22,
    backgroundColor: A.primary,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 14,
    shadowColor: A.shadow,
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  logoText: { fontSize: 26, fontWeight: '900', color: A.primaryText, letterSpacing: -1 },
  brandSub: { fontSize: 11, color: A.muted, fontWeight: '800', letterSpacing: 2, marginBottom: 4 },
  title: { fontSize: 26, fontWeight: '800', color: A.text, letterSpacing: -0.4 },
  subtitle: { fontSize: 13, color: A.sub, marginTop: 6, textAlign: 'center' },

  form: { gap: 4 },
  label: { fontSize: 13, fontWeight: '700', color: A.text, marginBottom: 6, marginTop: 8 },
  input: {
    backgroundColor: A.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: A.border,
    color: A.text,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 15,
    marginBottom: 4,
  },
  btn: {
    backgroundColor: A.primary,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 18,
  },
  btnText: { color: A.primaryText, fontWeight: '800', fontSize: 16, letterSpacing: 0.5 },
  errorText: {
    color: A.error,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 12,
  },
});
