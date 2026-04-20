import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, Platform, StatusBar, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';

const C = {
  bg: '#f5f5f5',
  white: '#ffffff',
  text: '#111111',
  sub: '#666666',
  muted: '#999999',
  card: '#f0f0f0',
  border: '#e8e8e8',
  accent: '#111111',
  error: '#d00000',
};

const MENU = [
  {
    label: 'Categorías',
    desc: 'Administra las categorías de productos',
    icon: '📂',
    route: '/admin/categories',
  },
  {
    label: 'Productos',
    desc: 'Agrega, edita o elimina productos',
    icon: '🍾',
    route: '/admin/products',
  },
  {
    label: 'Promociones',
    desc: 'Gestiona las ofertas y promociones',
    icon: '🏷️',
    route: '/admin/promotions',
  },
];

export default function AdminDashboard() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Seguro que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/admin/login');
        },
      },
    ]);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>Bienvenido</Text>
          <Text style={styles.headerTitle}>Panel Admin</Text>
        </View>
        <TouchableOpacity style={styles.logoutPill} onPress={handleLogout}>
          <Text style={styles.logoutPillText}>Salir</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Sección gestión */}
        <Text style={styles.sectionLabel}>Gestión</Text>

        <View style={styles.menuCard}>
          {MENU.map((item, i) => (
            <React.Fragment key={item.route}>
              <TouchableOpacity
                style={styles.row}
                activeOpacity={0.6}
                onPress={() => router.push(item.route as any)}
              >
                <View style={styles.rowIcon}>
                  <Text style={{ fontSize: 22 }}>{item.icon}</Text>
                </View>
                <View style={styles.rowText}>
                  <Text style={styles.rowLabel}>{item.label}</Text>
                  <Text style={styles.rowDesc}>{item.desc}</Text>
                </View>
                <Text style={styles.rowChevron}>›</Text>
              </TouchableOpacity>
              {i < MENU.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Cerrar sesión */}
        <TouchableOpacity style={styles.logoutRow} onPress={handleLogout} activeOpacity={0.7}>
          <Text style={styles.logoutRowText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 24, paddingBottom: 48 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: C.white,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 48 : 56,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerSub: { fontSize: 13, color: C.sub, fontWeight: '500', marginBottom: 2 },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: C.text,
    letterSpacing: -0.6,
  },
  logoutPill: {
    borderWidth: 1.5,
    borderColor: C.error,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  logoutPillText: { fontSize: 13, fontWeight: '700', color: C.error },

  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: C.muted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
  },

  menuCard: {
    backgroundColor: C.white,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 32,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 14,
  },
  rowIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: C.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 16, fontWeight: '700', color: C.text },
  rowDesc: { fontSize: 12, color: C.sub, marginTop: 2 },
  rowChevron: {
    fontSize: 22,
    color: C.muted,
    fontWeight: '400',
    lineHeight: 26,
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginLeft: 78,
  },

  logoutRow: {
    backgroundColor: C.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 17,
    alignItems: 'center',
  },
  logoutRowText: { fontSize: 15, fontWeight: '700', color: C.error },
});
