import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';

// Ajusta estos valores con los datos reales del negocio
const CONTACT = {
  whatsapp: '525555555555', // sin + ni espacios, formato internacional
  phone:    '+52 55 5555 5555',
  email:    'contacto@licoreria369.com',
  address:  'Dirección de la licorería, Ciudad, Estado',
  hours:    'Lun-Dom 10:00 - 22:00',
};

export default function AboutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const version = Constants.expoConfig?.version || '1.0.0';

  const openWhatsApp = () => {
    Linking.openURL(`https://wa.me/${CONTACT.whatsapp}`).catch(() => {});
  };
  const callPhone = () => {
    Linking.openURL(`tel:${CONTACT.phone.replace(/\s/g, '')}`).catch(() => {});
  };
  const sendEmail = () => {
    Linking.openURL(`mailto:${CONTACT.email}`).catch(() => {});
  };
  const openMaps = () => {
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT.address)}`).catch(() => {});
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={[s.brandBar, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={s.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={s.brandTitle}>Acerca de</Text>
      </View>
      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={s.section}>CONTACTO</Text>

        <TouchableOpacity style={s.row} onPress={openWhatsApp} activeOpacity={0.75}>
          <Text style={s.rowLabel}>WhatsApp</Text>
          <Text style={s.rowValue}>{CONTACT.phone} ›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.row} onPress={callPhone} activeOpacity={0.75}>
          <Text style={s.rowLabel}>Teléfono</Text>
          <Text style={s.rowValue}>{CONTACT.phone} ›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.row} onPress={sendEmail} activeOpacity={0.75}>
          <Text style={s.rowLabel}>Correo</Text>
          <Text style={s.rowValue}>{CONTACT.email} ›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.row} onPress={openMaps} activeOpacity={0.75}>
          <Text style={s.rowLabel}>Dirección</Text>
          <Text style={s.rowValue}>Ver en mapa ›</Text>
        </TouchableOpacity>
        <View style={s.row}>
          <Text style={s.rowLabel}>Horario</Text>
          <Text style={s.rowValue}>{CONTACT.hours}</Text>
        </View>

        <Text style={s.section}>LEGAL</Text>
        <TouchableOpacity style={s.row} onPress={() => router.push('/legal/privacy')} activeOpacity={0.75}>
          <Text style={s.rowLabel}>Política de Privacidad</Text>
          <Text style={s.rowValue}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.row} onPress={() => router.push('/legal/terms')} activeOpacity={0.75}>
          <Text style={s.rowLabel}>Términos y Condiciones</Text>
          <Text style={s.rowValue}>›</Text>
        </TouchableOpacity>

        <Text style={s.section}>VERSIÓN</Text>
        <View style={s.row}>
          <Text style={s.rowLabel}>App</Text>
          <Text style={s.rowValue}>{version}</Text>
        </View>

        <Text style={s.disclaimer}>
          Promovemos el consumo responsable de bebidas alcohólicas. Solo para mayores
          de 18 años.
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fbf8ee' },
  brandBar: {
    backgroundColor: '#fff', paddingBottom: 16,
    alignItems: 'center', justifyContent: 'center',
    borderBottomWidth: 1, borderBottomColor: '#e6dfc4',
  },
  brandTitle: { fontSize: 22, fontWeight: '800', color: '#1a1a14' },
  backBtn: {
    position: 'absolute', left: 14, bottom: 12,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#111', justifyContent: 'center', alignItems: 'center',
  },
  backArrow: { fontSize: 22, color: '#fff', fontWeight: '700', lineHeight: 24, marginTop: -2 },
  scroll: { padding: 18 },
  section: {
    fontSize: 11, fontWeight: '800', letterSpacing: 1.5, color: '#9a9079',
    marginTop: 24, marginBottom: 8, marginLeft: 4,
  },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', padding: 16, borderRadius: 10, marginBottom: 6,
    borderWidth: 1, borderColor: '#e6dfc4',
  },
  rowLabel: { fontSize: 14, fontWeight: '600', color: '#1a1a14' },
  rowValue: { fontSize: 13, color: '#5b5240' },
  disclaimer: {
    marginTop: 28, fontSize: 12, color: '#9a9079',
    textAlign: 'center', fontStyle: 'italic', paddingHorizontal: 14,
  },
});
