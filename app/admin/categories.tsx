import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image, TouchableOpacity,
  TextInput, Modal, Alert, ActivityIndicator, Platform, StatusBar,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getCategories, createCategory, deleteCategory } from '../../src/services/api';

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
  overlay: 'rgba(0,0,0,0.5)',
};

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [image, setImage] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) setImage(result.assets[0]);
  };

  const handleCreate = async () => {
    if (!name.trim()) { Alert.alert('Error', 'Ingresa el nombre'); return; }
    setSaving(true);
    try {
      const form = new FormData();
      form.append('name', name.trim());
      if (image) {
        form.append('image', { uri: image.uri, type: 'image/jpeg', name: 'category.jpg' } as any);
      }
      await createCategory(form);
      setModalVisible(false);
      setName(''); setImage(null);
      load();
    } catch {
      Alert.alert('Error', 'No se pudo crear la categoría');
    } finally { setSaving(false); }
  };

  const handleDelete = (id: string, catName: string) => {
    Alert.alert('Eliminar', `¿Eliminar "${catName}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          try { await deleteCategory(id); load(); }
          catch { Alert.alert('Error', 'No se pudo eliminar'); }
        },
      },
    ]);
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={C.text} /></View>;
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />

      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Categorías</Text>
        <Text style={styles.pageSub}>{categories.length} registradas</Text>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 52 }}>📂</Text>
            <Text style={styles.emptyTitle}>Sin categorías</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.thumb}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.thumbImg} />
              ) : (
                <Text style={{ fontSize: 22 }}>📂</Text>
              )}
            </View>
            <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => handleDelete(item._id, item.name)}
            >
              <Text style={styles.deleteBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)} activeOpacity={0.85}>
        <Text style={styles.fabText}>+ Nueva categoría</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Nueva categoría</Text>

            <Text style={styles.inputLabel}>Nombre</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Whisky, Vinos..."
              placeholderTextColor={C.muted}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.inputLabel}>Imagen (opcional)</Text>
            <TouchableOpacity style={styles.imgPicker} onPress={pickImage} activeOpacity={0.8}>
              {image ? (
                <Image source={{ uri: image.uri }} style={styles.imgPreview} resizeMode="cover" />
              ) : (
                <View style={styles.imgPickerInner}>
                  <Text style={{ fontSize: 28 }}>📷</Text>
                  <Text style={styles.imgPickerText}>Toca para seleccionar</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.sheetBtns}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => { setModalVisible(false); setName(''); setImage(null); }}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                onPress={handleCreate}
                disabled={saving}
              >
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Guardar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg },

  pageHeader: {
    backgroundColor: C.white,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 46 : 54,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  pageTitle: { fontSize: 26, fontWeight: '800', color: C.text, letterSpacing: -0.5 },
  pageSub: { fontSize: 13, color: C.sub, marginTop: 2, fontWeight: '500' },

  list: { padding: 20, gap: 10, paddingBottom: 100 },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
    gap: 12,
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: C.card,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbImg: { width: '100%', height: '100%' },
  itemName: { flex: 1, fontSize: 15, fontWeight: '700', color: C.text },
  deleteBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#ffeaea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtnText: { fontSize: 13, color: C.error, fontWeight: '700' },

  fab: {
    position: 'absolute',
    bottom: 28,
    right: 20,
    left: 20,
    backgroundColor: C.accent,
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
  fabText: { color: '#fff', fontWeight: '800', fontSize: 16 },

  modalOverlay: { flex: 1, backgroundColor: C.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
  },
  sheetHandle: {
    width: 40, height: 4, backgroundColor: C.border,
    borderRadius: 2, alignSelf: 'center', marginBottom: 20,
  },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: C.text, marginBottom: 20, letterSpacing: -0.3 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: C.text, marginBottom: 6 },
  input: {
    backgroundColor: C.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: C.text,
    marginBottom: 16,
  },
  imgPicker: {
    backgroundColor: C.card,
    borderRadius: 14,
    height: 130,
    overflow: 'hidden',
    marginBottom: 24,
  },
  imgPickerInner: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 6 },
  imgPickerText: { fontSize: 13, color: C.sub, fontWeight: '600' },
  imgPreview: { width: '100%', height: '100%' },
  sheetBtns: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1, backgroundColor: C.card, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
  },
  cancelText: { fontSize: 15, fontWeight: '700', color: C.sub },
  saveBtn: {
    flex: 1, backgroundColor: C.accent, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
  },
  saveText: { fontSize: 15, fontWeight: '800', color: '#fff' },

  empty: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: C.sub, marginTop: 12 },
});
