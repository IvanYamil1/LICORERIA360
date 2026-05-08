import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList,
  Alert, ActivityIndicator, StatusBar, Platform, KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getAdmins, createAdmin, deleteAdmin, changePassword, deleteMyAccount } from '../../src/services/api';
import { useAuth } from '../../src/context/AuthContext';
import { A } from '../../src/theme/admin';

type Admin = { _id: string; username: string };

export default function AdminUsers() {
  const router = useRouter();
  const { logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'list' | 'password'>('list');
  const [deletePass, setDeletePass] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Crear nuevo admin
  const [newUser, setNewUser] = useState('');
  const [newPass, setNewPass] = useState('');
  const [creating, setCreating] = useState(false);

  // Cambiar contraseña propia
  const [currentPass, setCurrentPass] = useState('');
  const [nextPass, setNextPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [changing, setChanging] = useState(false);

  const load = async () => {
    try {
      const res = await getAdmins();
      setAdmins(res.data || []);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error || 'No se pudo cargar la lista');
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!newUser.trim() || !newPass) {
      Alert.alert('Faltan datos', 'Llena usuario y contraseña');
      return;
    }
    setCreating(true);
    try {
      await createAdmin(newUser.trim(), newPass);
      setNewUser(''); setNewPass('');
      await load();
      Alert.alert('Listo', 'Usuario creado correctamente');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error || 'No se pudo crear');
    } finally { setCreating(false); }
  };

  const handleDelete = (admin: Admin) => {
    const doDelete = async () => {
      try {
        await deleteAdmin(admin._id);
        await load();
      } catch (e: any) {
        Alert.alert('Error', e?.response?.data?.error || 'No se pudo eliminar');
      }
    };
    Alert.alert(
      'Eliminar admin',
      `¿Eliminar a "${admin.username}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: doDelete },
      ],
    );
  };

  const handleDeleteMyAccount = () => {
    if (!deletePass) {
      Alert.alert('Faltan datos', 'Ingresa tu contraseña actual para confirmar');
      return;
    }
    Alert.alert(
      'Eliminar mi cuenta',
      'Esta acción es permanente. Perderás acceso al panel y no se puede deshacer. ¿Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar', style: 'destructive', onPress: async () => {
            setDeleting(true);
            try {
              await deleteMyAccount(deletePass);
              await logout();
              router.replace('/(tabs)');
            } catch (e: any) {
              Alert.alert('Error', e?.response?.data?.error || 'No se pudo eliminar');
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  const handleChangePassword = async () => {
    if (!currentPass || !nextPass || !confirmPass) {
      Alert.alert('Faltan datos', 'Llena los tres campos');
      return;
    }
    if (nextPass !== confirmPass) {
      Alert.alert('Error', 'Las contraseñas nuevas no coinciden');
      return;
    }
    if (nextPass.length < 8) {
      Alert.alert('Error', 'La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }
    setChanging(true);
    try {
      await changePassword(currentPass, nextPass);
      setCurrentPass(''); setNextPass(''); setConfirmPass('');
      Alert.alert('Listo', 'Contraseña actualizada');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error || 'No se pudo cambiar');
    } finally { setChanging(false); }
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
        <Text style={s.pageTitle}>Usuarios</Text>
        <Text style={s.pageSub}>{admins.length} admin{admins.length !== 1 ? 's' : ''}</Text>
      </View>

      <View style={s.tabs}>
        <TouchableOpacity
          style={[s.tab, tab === 'list' && s.tabActive]}
          onPress={() => setTab('list')}
        >
          <Text style={[s.tabText, tab === 'list' && s.tabTextActive]}>Lista</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.tab, tab === 'password' && s.tabActive]}
          onPress={() => setTab('password')}
        >
          <Text style={[s.tabText, tab === 'password' && s.tabTextActive]}>Mi contraseña</Text>
        </TouchableOpacity>
      </View>

      {tab === 'list' ? (
        <View style={{ flex: 1 }}>
          <View style={s.createBox}>
            <Text style={s.sectionLabel}>Crear nuevo admin</Text>
            <TextInput
              style={s.input}
              placeholder="Usuario (3-30 caracteres)"
              placeholderTextColor={A.muted}
              value={newUser}
              onChangeText={setNewUser}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextInput
              style={s.input}
              placeholder="Contraseña (mín 8 caracteres)"
              placeholderTextColor={A.muted}
              value={newPass}
              onChangeText={setNewPass}
              secureTextEntry
            />
            <TouchableOpacity
              style={[s.btn, creating && { opacity: 0.6 }]}
              onPress={handleCreate}
              disabled={creating}
            >
              {creating ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Crear</Text>}
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={{ padding: 30, alignItems: 'center' }}>
              <ActivityIndicator color={A.primary} />
            </View>
          ) : (
            <FlatList
              data={admins}
              keyExtractor={(it) => it._id}
              contentContainerStyle={{ padding: 16 }}
              renderItem={({ item }) => (
                <View style={s.row}>
                  <Text style={s.rowName}>{item.username}</Text>
                  <TouchableOpacity onPress={() => handleDelete(item)} style={s.deleteBtn}>
                    <Text style={s.deleteText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
        </View>
      ) : (
        <View style={s.passBox}>
          <Text style={s.sectionLabel}>Cambiar mi contraseña</Text>
          <TextInput
            style={s.input}
            placeholder="Contraseña actual"
            placeholderTextColor={A.muted}
            value={currentPass}
            onChangeText={setCurrentPass}
            secureTextEntry
          />
          <TextInput
            style={s.input}
            placeholder="Nueva contraseña (mín 8)"
            placeholderTextColor={A.muted}
            value={nextPass}
            onChangeText={setNextPass}
            secureTextEntry
          />
          <TextInput
            style={s.input}
            placeholder="Confirmar nueva contraseña"
            placeholderTextColor={A.muted}
            value={confirmPass}
            onChangeText={setConfirmPass}
            secureTextEntry
          />
          <TouchableOpacity
            style={[s.btn, changing && { opacity: 0.6 }]}
            onPress={handleChangePassword}
            disabled={changing}
          >
            {changing ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Actualizar contraseña</Text>}
          </TouchableOpacity>

          <View style={s.dangerZone}>
            <Text style={s.dangerLabel}>ZONA DE RIESGO</Text>
            <Text style={s.dangerNote}>
              Elimina tu cuenta de admin permanentemente. Solo posible si hay otro admin en la app.
            </Text>
            <TextInput
              style={s.input}
              placeholder="Contraseña para confirmar"
              placeholderTextColor={A.muted}
              value={deletePass}
              onChangeText={setDeletePass}
              secureTextEntry
            />
            <TouchableOpacity
              style={[s.dangerBtn, deleting && { opacity: 0.6 }]}
              onPress={handleDeleteMyAccount}
              disabled={deleting}
            >
              {deleting ? <ActivityIndicator color="#fff" /> : <Text style={s.dangerBtnText}>Eliminar mi cuenta</Text>}
            </TouchableOpacity>
          </View>
        </View>
      )}
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

  tabs: { flexDirection: 'row', backgroundColor: A.surface, borderBottomWidth: 1, borderBottomColor: A.border },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: A.primary },
  tabText: { fontSize: 13, fontWeight: '700', color: A.muted },
  tabTextActive: { color: A.primary },

  createBox: { padding: 16, gap: 8, backgroundColor: A.surface, borderBottomWidth: 1, borderBottomColor: A.border },
  passBox: { padding: 16, gap: 8 },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: A.muted, letterSpacing: 1.5, marginBottom: 8 },
  input: {
    backgroundColor: A.card, borderRadius: 12, borderWidth: 1, borderColor: A.border,
    paddingHorizontal: 14, paddingVertical: 13, fontSize: 14, color: A.text,
  },
  btn: {
    backgroundColor: A.primary, borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', marginTop: 4,
  },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 14, letterSpacing: 0.5 },

  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: A.surface, padding: 14, borderRadius: 12,
    borderWidth: 1, borderColor: A.border, marginBottom: 8,
  },
  rowName: { fontSize: 15, fontWeight: '700', color: A.text },
  deleteBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: '#ffe9e7' },
  deleteText: { color: A.error, fontSize: 12, fontWeight: '700' },

  dangerZone: {
    marginTop: 32, padding: 16, borderRadius: 12,
    borderWidth: 1, borderColor: '#ffd0cc', backgroundColor: '#fff5f4',
    gap: 8,
  },
  dangerLabel: { fontSize: 11, fontWeight: '800', color: A.error, letterSpacing: 1.5 },
  dangerNote: { fontSize: 12, color: A.sub, marginBottom: 4, lineHeight: 17 },
  dangerBtn: {
    backgroundColor: A.error, borderRadius: 10, paddingVertical: 12,
    alignItems: 'center', marginTop: 4,
  },
  dangerBtnText: { color: '#fff', fontWeight: '800', fontSize: 13, letterSpacing: 0.5 },
});
