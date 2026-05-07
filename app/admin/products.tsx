import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image, TouchableOpacity,
  TextInput, Modal, Alert, ActivityIndicator, ScrollView, Platform, StatusBar,
  KeyboardAvoidingView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  getProducts, getCategories, createProduct, updateProduct, deleteProduct,
} from '../../src/services/api';
import { A } from '../../src/theme/admin';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const C = {
  bg:      A.bg,
  white:   A.surface,
  text:    A.text,
  sub:     A.sub,
  muted:   A.muted,
  card:    A.surfaceAlt,
  border:  A.border,
  accent:  A.primary,
  error:   A.error,
  overlay: A.overlay,
};

const COL_OPTIONS = [1, 2, 3, 4];

type Product = {
  _id: string;
  name: string;
  capacity?: string;
  price?: number;
  category?: { _id: string; name: string } | string;
  image?: string;
  colsInRow?: number;
  order?: number;
};

export default function AdminProducts() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [filterCategoryId, setFilterCategoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [colsInRow, setColsInRow] = useState<number>(3);
  const [order, setOrder] = useState('');
  const [image, setImage] = useState<any>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

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
    setName(''); setCapacity(''); setPrice(''); setCategoryId('');
    setColsInRow(3); setOrder(''); setImage(null);
    setExistingImageUrl(null); setEditingId(null);
  };

  const openCreate = () => { resetForm(); setModalVisible(true); };
  const openEdit = (p: Product) => {
    setEditingId(p._id);
    setName(p.name || '');
    setCapacity(p.capacity || '');
    setPrice(p.price != null ? String(p.price) : '');
    setCategoryId(typeof p.category === 'object' ? p.category?._id || '' : (p.category as any) || '');
    setColsInRow(p.colsInRow || 3);
    setOrder(p.order != null ? String(p.order) : '');
    setImage(null);
    setExistingImageUrl(p.image || null);
    setModalVisible(true);
  };
  const closeModal = () => { setModalVisible(false); resetForm(); };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) setImage(result.assets[0]);
  };

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Error', 'Ingresa el nombre del producto'); return; }
    if (!categoryId) { Alert.alert('Error', 'Selecciona una categoría'); return; }
    setSaving(true);
    try {
      const form = new FormData();
      form.append('name', name.trim());
      form.append('capacity', capacity.trim());
      form.append('category', categoryId);
      form.append('colsInRow', String(colsInRow));
      form.append('order', order.trim() || '0');
      if (price.trim()) form.append('price', price.trim());

      if (image) {
        if (Platform.OS === 'web') {
          const resp = await fetch(image.uri);
          const blob = await resp.blob();
          const ext = (blob.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
          const file = new File([blob], `product.${ext}`, { type: blob.type || 'image/jpeg' });
          form.append('image', file);
        } else {
          form.append('image', {
            uri: image.uri,
            type: image.mimeType || 'image/jpeg',
            name: image.fileName || 'product.jpg',
          } as any);
        }
      }

      if (editingId) {
        await updateProduct(editingId, form);
      } else {
        await createProduct(form);
      }
      closeModal();
      load();
    } catch (e) {
      console.error('save product error:', e);
      Alert.alert('Error', 'No se pudo guardar el producto');
    } finally { setSaving(false); }
  };

  const handleDelete = (id: string, pName: string) => {
    const msg = `¿Eliminar "${pName}"?`;
    const doDelete = async () => {
      try { await deleteProduct(id); load(); }
      catch { Alert.alert('Error', 'No se pudo eliminar'); }
    };
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(msg)) doDelete();
      return;
    }
    Alert.alert('Eliminar', msg, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: doDelete },
    ]);
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={C.text} /></View>;
  }

  const filteredProducts = filterCategoryId
    ? products.filter(
        (p) => (typeof p.category === 'object' ? p.category?._id : p.category) === filterCategoryId,
      )
    : products;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />

      <View style={[styles.brandBar, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.brandTitle}>LICORERIA 369</Text>
      </View>
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Productos</Text>
        <Text style={styles.pageSub}>
          {filteredProducts.length} {filterCategoryId ? 'en categoría' : 'registrados'}
        </Text>
      </View>

      <View style={styles.filterBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          <TouchableOpacity
            style={[styles.chip, filterCategoryId === null && styles.chipActive]}
            onPress={() => setFilterCategoryId(null)}
            activeOpacity={0.75}
          >
            <Text style={[styles.chipText, filterCategoryId === null && styles.chipTextActive]}>
              Todas ({products.length})
            </Text>
          </TouchableOpacity>
          {categories.map((c) => {
            const count = products.filter(
              (p) => (typeof p.category === 'object' ? p.category?._id : p.category) === c._id,
            ).length;
            const active = filterCategoryId === c._id;
            return (
              <TouchableOpacity
                key={c._id}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setFilterCategoryId(c._id)}
                activeOpacity={0.75}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {c.name} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Sin productos</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.item}>
            <TouchableOpacity
              style={styles.itemBody}
              activeOpacity={0.8}
              onPress={() => openEdit(item)}
            >
              <View style={styles.thumb}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.thumbImg} />
                ) : (
                  <Text style={styles.thumbPlaceholder}>{(item.name || '?').slice(0, 1).toUpperCase()}</Text>
                )}
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemSub}>
                  {[item.capacity, item.price != null ? `$${item.price}` : null]
                    .filter(Boolean).join('  ·  ')}
                </Text>
                <View style={styles.tagsRow}>
                  {typeof item.category === 'object' && item.category?.name && (
                    <View style={styles.catPill}>
                      <Text style={styles.catPillText}>{item.category.name}</Text>
                    </View>
                  )}
                  <View style={styles.colsPill}>
                    <Text style={styles.colsPillText}>{item.colsInRow ?? 3}/fila</Text>
                  </View>
                  <Text style={styles.orderText}>#{item.order ?? 0}</Text>
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => handleDelete(item._id, item.name)}
              activeOpacity={0.7}
            >
              <Text style={styles.deleteBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity style={[styles.fab, { bottom: insets.bottom + 16 }]} onPress={openCreate} activeOpacity={0.85}>
        <Text style={styles.fabText}>+ Nuevo producto</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={closeModal}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>
              {editingId ? 'Editar producto' : 'Nuevo producto'}
            </Text>

            <ScrollView
              contentContainerStyle={{ paddingBottom: 8 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
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
                placeholder="Ej: 150"
                placeholderTextColor={C.muted}
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
              />

              <Text style={styles.inputLabel}>Categoría *</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 14 }}
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

              <Text style={styles.inputLabel}>Productos por fila</Text>
              <View style={styles.colsRow}>
                {COL_OPTIONS.map((n) => (
                  <TouchableOpacity
                    key={n}
                    style={[styles.colsOpt, colsInRow === n && styles.colsOptActive]}
                    onPress={() => setColsInRow(n)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.colsPreview}>
                      {Array.from({ length: n }).map((_, i) => (
                        <View key={i} style={[styles.colsBox, { flex: 1 }]} />
                      ))}
                    </View>
                    <Text style={[styles.colsLabel, colsInRow === n && { color: C.accent }]}>{n}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.helpInline}>
                Productos consecutivos con el mismo número se agrupan en filas de ese tamaño.
              </Text>

              <Text style={styles.inputLabel}>Orden (menor aparece antes)</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={C.muted}
                value={order}
                onChangeText={setOrder}
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Imagen</Text>
              <TouchableOpacity style={styles.imgPicker} onPress={pickImage} activeOpacity={0.8}>
                {image ? (
                  <Image source={{ uri: image.uri }} style={styles.imgPreview} resizeMode="cover" />
                ) : existingImageUrl ? (
                  <Image source={{ uri: existingImageUrl }} style={styles.imgPreview} resizeMode="cover" />
                ) : (
                  <View style={styles.imgPickerInner}>
                    <Text style={styles.imgPickerText}>Toca para seleccionar</Text>
                  </View>
                )}
              </TouchableOpacity>
              {(image || existingImageUrl) && (
                <TouchableOpacity onPress={pickImage} style={styles.changeImgBtn}>
                  <Text style={styles.changeImgText}>Cambiar imagen</Text>
                </TouchableOpacity>
              )}
            </ScrollView>

            <View style={styles.sheetBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Guardar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg },

  brandBar: {
    backgroundColor: C.white,
    paddingBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  brandTitle: { fontSize: 22, fontWeight: '800', color: C.text, letterSpacing: 0.2, textAlign: 'center' },
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
  pageHeader: {
    backgroundColor: C.white,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  pageTitle: { fontSize: 26, fontWeight: '800', color: C.text, letterSpacing: -0.5 },
  pageSub: { fontSize: 13, color: C.sub, marginTop: 2, fontWeight: '500' },

  filterBar: {
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  filterRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
  },
  chipActive: { backgroundColor: C.accent, borderColor: C.accent },
  chipText: { fontSize: 13, fontWeight: '700', color: C.sub },
  chipTextActive: { color: '#fff' },

  list: { padding: 20, gap: 10, paddingBottom: 100 },

  item: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: C.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  itemBody: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    padding: 14, gap: 12,
  },
  thumb: {
    width: 56, height: 56, borderRadius: 12,
    backgroundColor: C.card, overflow: 'hidden',
    justifyContent: 'center', alignItems: 'center',
  },
  thumbImg: { width: '100%', height: '100%' },
  thumbPlaceholder: { fontSize: 18, fontWeight: '800', color: C.sub },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '700', color: C.text },
  itemSub: { fontSize: 12, color: C.sub, marginTop: 2 },

  tagsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, flexWrap: 'wrap' },
  catPill: {
    backgroundColor: C.card, borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  catPillText: { fontSize: 10, fontWeight: '700', color: C.sub },
  colsPill: {
    backgroundColor: '#e8efff', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  colsPillText: { fontSize: 10, fontWeight: '700', color: '#3258c4' },
  orderText: { fontSize: 11, color: C.muted, fontWeight: '600' },

  deleteBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#ffeaea', justifyContent: 'center', alignItems: 'center',
    alignSelf: 'center', marginRight: 12,
  },
  deleteBtnText: { fontSize: 13, color: C.error, fontWeight: '700' },

  fab: {
    position: 'absolute', right: 20, left: 20,
    backgroundColor: C.accent, borderRadius: 16, paddingVertical: 17,
    alignItems: 'center', elevation: 6,
    shadowColor: '#000', shadowOpacity: 0.18, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10,
  },
  fabText: { color: '#fff', fontWeight: '800', fontSize: 16 },

  modalOverlay: { flex: 1, backgroundColor: C.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 28,
    maxHeight: '92%',
  },
  sheetHandle: {
    width: 40, height: 4, backgroundColor: C.border,
    borderRadius: 2, alignSelf: 'center', marginBottom: 16,
  },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: C.text, marginBottom: 16, letterSpacing: -0.3 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: C.text, marginBottom: 6, marginTop: 4 },
  input: {
    backgroundColor: C.card, borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: C.text, marginBottom: 12,
  },

  catChip: {
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20,
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
  },
  catChipActive: { backgroundColor: C.accent, borderColor: C.accent },
  catChipText: { fontSize: 13, fontWeight: '600', color: C.sub },
  catChipTextActive: { color: '#fff' },

  colsRow: { flexDirection: 'row', gap: 10, marginBottom: 6 },
  colsOpt: {
    flex: 1, backgroundColor: C.card, borderRadius: 14,
    padding: 12, alignItems: 'center',
    borderWidth: 2, borderColor: 'transparent',
  },
  colsOptActive: { borderColor: C.accent, backgroundColor: '#fff' },
  colsPreview: { flexDirection: 'row', gap: 3, height: 22, width: '100%' },
  colsBox: { backgroundColor: '#111', borderRadius: 3 },
  colsLabel: { fontSize: 13, fontWeight: '800', color: C.text, marginTop: 8 },
  helpInline: { fontSize: 11, color: C.muted, marginBottom: 12, lineHeight: 16 },

  imgPicker: {
    backgroundColor: C.card, borderRadius: 14,
    height: 130, overflow: 'hidden', marginBottom: 8,
  },
  imgPickerInner: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 6 },
  imgPickerText: { fontSize: 13, color: C.sub, fontWeight: '600' },
  imgPreview: { width: '100%', height: '100%' },
  changeImgBtn: { alignSelf: 'center', paddingVertical: 6, marginBottom: 12 },
  changeImgText: { fontSize: 13, color: C.accent, fontWeight: '700' },

  sheetBtns: { flexDirection: 'row', gap: 10, marginTop: 12 },
  cancelBtn: { flex: 1, backgroundColor: C.card, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  cancelText: { fontSize: 15, fontWeight: '700', color: C.sub },
  saveBtn: { flex: 1, backgroundColor: C.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  saveText: { fontSize: 15, fontWeight: '800', color: '#fff' },

  empty: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: C.sub, marginTop: 12 },
});
