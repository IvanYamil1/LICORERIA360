import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, StatusBar, Platform, KeyboardAvoidingView, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getDeviceCount, sendPushNotification } from '../../src/services/api';
import { A } from '../../src/theme/admin';

export default function AdminNotifications() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [count, setCount] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    getDeviceCount()
      .then((r) => setCount(r.data?.count ?? 0))
      .catch(() => setCount(0));
  }, []);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('Faltan datos', 'Escribe título y mensaje');
      return;
    }
    Alert.alert(
      'Enviar push',
      `Se enviará a ${count ?? 0} dispositivo${count === 1 ? '' : 's'}. ¿Continuar?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar', onPress: async () => {
            setSending(true);
            try {
              const r = await sendPushNotification(title.trim(), body.trim());
              setTitle(''); setBody('');
              Alert.alert('Listo', `Enviada a ${r.data?.sent ?? 0} dispositivos`);
            } catch (e: any) {
              Alert.alert('Error', e?.response?.data?.error || 'No se pudo enviar');
            } finally {
              setSending(false);
            }
          },
        },
      ],
    );
  };

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={A.surface} />
      <View style={[s.brandBar, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={s.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={s.brandTitle}>LICORERIA 369</Text>
      </View>
      <View style={s.pageHeader}>
        <Text style={s.pageTitle}>Notificaciones</Text>
        <Text style={s.pageSub}>
          {count === null ? '...' : `${count} dispositivo${count === 1 ? '' : 's'} suscrito${count === 1 ? '' : 's'}`}
        </Text>
      </View>

      <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
        <Text style={s.label}>Título (máx 80)</Text>
        <TextInput
          style={s.input}
          placeholder="Ej. ¡Nueva oferta!"
          placeholderTextColor={A.muted}
          value={title}
          onChangeText={setTitle}
          maxLength={80}
        />

        <Text style={s.label}>Mensaje (máx 200)</Text>
        <TextInput
          style={[s.input, { height: 100, textAlignVertical: 'top' }]}
          placeholder="Tequila Cuervo 1L a $299 esta semana."
          placeholderTextColor={A.muted}
          value={body}
          onChangeText={setBody}
          multiline
          maxLength={200}
        />

        <View style={s.preview}>
          <Text style={s.previewLabel}>VISTA PREVIA</Text>
          <View style={s.previewCard}>
            <Text style={s.previewTitle}>{title || 'Título de la notificación'}</Text>
            <Text style={s.previewBody}>{body || 'Mensaje que verán los usuarios.'}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[s.sendBtn, sending && { opacity: 0.6 }]}
          onPress={handleSend}
          disabled={sending}
        >
          {sending ? <ActivityIndicator color="#fff" /> : <Text style={s.sendText}>Enviar a todos</Text>}
        </TouchableOpacity>

        <Text style={s.disclaimer}>
          La notificación se envía a través del servidor de Expo. Los dispositivos sin
          la app abierta también la reciben.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: A.bg },
  brandBar: {
    backgroundColor: A.surface, paddingBottom: 16,
    alignItems: 'center', justifyContent: 'center',
    borderBottomWidth: 1, borderBottomColor: A.border,
  },
  brandTitle: { fontSize: 22, fontWeight: '800', color: A.text, letterSpacing: 0.2 },
  backBtn: {
    position: 'absolute', left: 14, bottom: 12,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#111', justifyContent: 'center', alignItems: 'center',
  },
  backArrow: { fontSize: 22, color: '#fff', fontWeight: '700', lineHeight: 24, marginTop: -2 },
  pageHeader: {
    backgroundColor: A.surface, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: A.border,
  },
  pageTitle: { fontSize: 26, fontWeight: '800', color: A.text, letterSpacing: -0.5 },
  pageSub: { fontSize: 13, color: A.sub, marginTop: 2, fontWeight: '500' },

  body: { padding: 18, gap: 6 },
  label: { fontSize: 12, fontWeight: '700', color: A.sub, marginTop: 8 },
  input: {
    backgroundColor: A.card, borderWidth: 1, borderColor: A.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: A.text,
  },
  preview: { marginTop: 18 },
  previewLabel: { fontSize: 11, fontWeight: '800', color: A.muted, letterSpacing: 1.5, marginBottom: 8 },
  previewCard: {
    backgroundColor: '#fff', borderRadius: 14,
    padding: 14, borderLeftWidth: 4, borderLeftColor: A.primary,
    shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2,
  },
  previewTitle: { fontSize: 15, fontWeight: '800', color: A.text, marginBottom: 4 },
  previewBody: { fontSize: 13, color: A.sub, lineHeight: 18 },

  sendBtn: {
    marginTop: 26, backgroundColor: A.primary, borderRadius: 14, paddingVertical: 16,
    alignItems: 'center',
  },
  sendText: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },

  disclaimer: { marginTop: 16, fontSize: 11, color: A.muted, textAlign: 'center', fontStyle: 'italic' },
});
