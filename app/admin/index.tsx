import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, Platform, StatusBar, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import { A } from '../../src/theme/admin';

const MENU = [
  { label: 'Categorías',     desc: 'Administra las categorías de productos',         route: '/admin/categories' },
  { label: 'Productos',      desc: 'Agrega, edita o elimina productos',              route: '/admin/products' },
  { label: 'Promociones',    desc: 'Gestiona ofertas (normal y principal)',           route: '/admin/promotions' },
  { label: 'Banners',        desc: 'Imágenes fijas: hero, footer, badge OFERTA',      route: '/admin/banners' },
  { label: 'Notificaciones', desc: 'Envía push notifications a tus usuarios',         route: '/admin/notifications' },
  { label: 'Usuarios',       desc: 'Crear admins y cambiar tu contraseña',            route: '/admin/users' },
];

export default function AdminDashboard() {
  const { logout } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    const doLogout = async () => {
      await logout();
      router.replace('/admin/login');
    };
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('¿Cerrar sesión?')) doLogout();
      return;
    }
    Alert.alert('Cerrar sesión', '¿Seguro que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: doLogout },
    ]);
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={A.surface} />

      <View style={[s.brandBar, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.replace('/(tabs)')} activeOpacity={0.7}>
          <Text style={s.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={s.brandTitle}>LICORERIA 369</Text>
      </View>
      <View style={s.subHeader}>
        <Text style={s.subHeaderText}>Panel de control</Text>
        <TouchableOpacity style={s.logoutPill} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={s.logoutPillText}>Salir</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        <Text style={s.sectionLabel}>Gestión</Text>

        <View style={s.menuList}>
          {MENU.map((item) => (
            <TouchableOpacity
              key={item.route}
              style={s.row}
              activeOpacity={0.75}
              onPress={() => router.push(item.route as any)}
            >
              <View style={s.rowText}>
                <Text style={s.rowLabel}>{item.label}</Text>
                <Text style={s.rowDesc}>{item.desc}</Text>
              </View>
              <Text style={s.rowChevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={s.logoutBlock} onPress={handleLogout} activeOpacity={0.7}>
          <Text style={s.logoutBlockText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: A.bg },

  brandBar: {
    backgroundColor: A.surface,
    paddingBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: A.border,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: A.text,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  backBtn: {
    position: 'absolute',
    left: 14,
    bottom: 12,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: { fontSize: 22, color: '#fff', fontWeight: '700', lineHeight: 24, marginTop: -2 },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: A.surface,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: A.border,
  },
  subHeaderText: { fontSize: 17, fontWeight: '700', color: A.text },
  logoutPill: {
    borderWidth: 1,
    borderColor: A.error,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  logoutPillText: { fontSize: 12, fontWeight: '700', color: A.error },

  scroll: { padding: 20, paddingTop: 22, paddingBottom: 40 },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: A.muted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginLeft: 2,
  },

  menuList: {
    backgroundColor: A.card,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: A.border,
    marginBottom: 28,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 18,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: A.divider,
  },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 16, fontWeight: '700', color: A.text },
  rowDesc: { fontSize: 12, color: A.sub, marginTop: 2 },
  rowChevron: { fontSize: 22, color: A.muted, fontWeight: '400' },

  logoutBlock: {
    backgroundColor: A.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: A.border,
    paddingVertical: 16,
    alignItems: 'center',
  },
  logoutBlockText: { fontSize: 15, fontWeight: '700', color: A.error },
});
