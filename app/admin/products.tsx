import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image, TouchableOpacity,
  TextInput, Modal, Alert, ActivityIndicator, ScrollView, Platform, StatusBar,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getProducts, getCategories, createProduct, deleteProduct } from '../../src/services/api';

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

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [image, setImage] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const [pRes, cRes] = await Promise.all([getProducts(), getCategories()]);
      setProducts(pRes.data);
      setCategories(cRes.data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setName(''); setCapacity(''); setPrice(''); setCategoryId(''); setImage(null);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) setImage(result.assets[0]);
  };

  const handleCreate = async () => {
    if (!name.trim()) { Alert.alert('Error', 'Ingresa el nombre del producto'); return; }
    if (!categoryId) { Alert.alert('Error', 'Selecciona una categoría'); return; }
    setSaving(true);
    try {
      const form = new FormData();
      form.append('name', name.trim());
      form.append('capacity', capacity.trim());
      form.append('category', categoryId);
      if (price.trim()) form.append('price', price.trim());
      if (image) {
        form.append('image', { uri: image.uri, type: 'image/jpeg', name: 'product.jpg' } as any);
      }
      await createProduct(form);
      setModalVisible(false);
      resetForm();
      load();
    } catch {
      Alert.alert('Error', 'No se pudo crear el producto');
    } finally { setSaving(false); }
  };

  const handleDelete = (id: string, pName: string) => {
    Alert.alert('Eliminar', `¿Eliminar "${pName}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          try { await deleteProduct(id); load(); }
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
        <Text style={styles.pageTitle}>Productos</Text>
        <Text style={styles.pageSub}>{products.length} registrados</Text>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 52 }}>🍾</Text>
            <Text style={styles.emptyTitle}>Sin productos</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.thumb}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.thumbImg} />
              ) : (
                <Text style={{ fontSize: 22 }}>🍾</Text>
              )}
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.itemSub}>
                {[item.capacity, item.price != null ? `$${item.price}` : null]
                  .filter(Boolean).join('  ·  ')}
              </Text>
              {item.category?.name && (
                <View style={styles.catPill}>
                  <Text style={styles.catPillText}>{item.category.name}</Text>
                </View>
              )}
            </View>
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
        <Text style={styles.fabText}>+ Nuevo producto</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.sheet}>
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>Nuevo producto</Text>

              <Text style={styles.inputLabel}>Nombre *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre del producto"
                placeholderTextColor={C.muted}
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.inputLabel}>Capacidad</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 750ml, 1L"
                placeholderTextColor={C.muted}
                value={capacity}
                onChangeText={setCapacity}
              />

              <Text style={styles.inputLabel}>Precio</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 150.00"
                placeholderTextColor={C.muted}
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
              />

              <Text style={styles.inputLabel}>Categoría *</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 16 }}
                contentContainerStyle={{ gap: 8 }}
              >
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat._id}
                    style={[styles.catChip, categoryId === cat._id && styles.catChipActive]}
                    onPress={() => setCategoryId(cat._id)}
                  >
                    <Text style={[styles.catChipText, categoryId === cat._id && styles.catChipTextActive]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

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
                  onPress={() => { setModalVisible(false); resetForm(); }}
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
          </ScrollView>
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
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: C.card,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbImg: { width: '100%', height: '100%' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '700', color: C.text },
  itemSub: { fontSize: 12, color: C.sub, marginTop: 2 },
  catPill: {
    marginTop: 5,
    alignSelf: 'flex-start',
    backgroundColor: C.card,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  catPillText: { fontSize: 11, fontWeight: '600', color: C.sub },
  deleteBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#ffeaea', justifyContent: 'center', alignItems: 'center',
  },
  deleteBtnText: { fontSize: 13, color: C.error, fontWeight: '700' },

  fab: {
    position: 'absolute', bottom: 28, right: 20, left: 20,
    backgroundColor: C.accent, borderRadius: 16, paddingVertical: 17,
    alignItems: 'center', elevation: 6,
    shadowColor: '#000', shadowOpacity: 0.18, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10,
  },
  fabText: { color: '#fff', fontWeight: '800', fontSize: 16 },

  modalOverlay: { flex: 1, backgroundColor: C.overlay },
  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 28,
  },
  sheetHandle: {
    width: 40, height: 4, backgroundColor: C.border,
    borderRadius: 2, alignSelf: 'center', marginBottom: 20,
  },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: C.text, marginBottom: 20, letterSpacing: -0.3 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: C.text, marginBottom: 6 },
  input: {
    backgroundColor: C.card, borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: C.text, marginBottom: 16,
  },
  catChip: {
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20,
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
  },
  catChipActive: { backgroundColor: C.accent, borderColor: C.accent },
  catChipText: { fontSize: 13, fontWeight: '600', color: C.sub },
  catChipTextActive: { color: '#fff' },
  imgPicker: {
    backgroundColor: C.card, borderRadius: 14,
    height: 120, overflow: 'hidden', marginBottom: 24,
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
