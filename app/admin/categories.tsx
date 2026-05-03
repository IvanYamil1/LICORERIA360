import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image, TouchableOpacity,
  TextInput, Modal, Alert, ActivityIndicator, Platform, StatusBar,
  ScrollView, KeyboardAvoidingView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  getCategories, createCategory, updateCategory, deleteCategory,
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

type Category = {
  _id: string;
  name: string;
  image?: string;
  headerImage?: string;
  footerImage?: string;
  order?: number;
};

export default function AdminCategories() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [order, setOrder] = useState('');
  const [image, setImage] = useState<any>(null);
  const [headerImage, setHeaderImage] = useState<any>(null);
  const [footerImage, setFooterImage] = useState<any>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [existingHeaderUrl, setExistingHeaderUrl] = useState<string | null>(null);
  const [existingFooterUrl, setExistingFooterUrl] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setName(''); setOrder('');
    setImage(null); setHeaderImage(null); setFooterImage(null);
    setExistingImageUrl(null); setExistingHeaderUrl(null); setExistingFooterUrl(null);
    setEditingId(null);
  };

  const openCreate = () => { resetForm(); setModalVisible(true); };
  const openEdit = (cat: Category) => {
    setEditingId(cat._id);
    setName(cat.name || '');
    setOrder(cat.order != null ? String(cat.order) : '');
    setImage(null); setHeaderImage(null); setFooterImage(null);
    setExistingImageUrl(cat.image || null);
    setExistingHeaderUrl(cat.headerImage || null);
    setExistingFooterUrl(cat.footerImage || null);
    setModalVisible(true);
  };
  const closeModal = () => { setModalVisible(false); resetForm(); };

  const pickImage = async (setter: (a: any) => void) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) setter(result.assets[0]);
  };

  async function appendImage(form: FormData, field: string, asset: any) {
    if (!asset) return;
    if (Platform.OS === 'web') {
      const resp = await fetch(asset.uri);
      const blob = await resp.blob();
      const ext = (blob.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
      const file = new File([blob], `${field}.${ext}`, { type: blob.type || 'image/jpeg' });
      form.append(field, file);
    } else {
      form.append(field, {
        uri: asset.uri,
        type: asset.mimeType || 'image/jpeg',
        name: asset.fileName || `${field}.jpg`,
      } as any);
    }
  }

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Error', 'Ingresa el nombre'); return; }
    setSaving(true);
    try {
      const form = new FormData();
      form.append('name', name.trim());
      form.append('order', order.trim() || '0');

      await appendImage(form, 'image',       image);
      await appendImage(form, 'headerImage', headerImage);
      await appendImage(form, 'footerImage', footerImage);

      if (editingId) {
        await updateCategory(editingId, form);
      } else {
        await createCategory(form);
      }
      closeModal();
      load();
    } catch (e) {
      console.error('save category error:', e);
      Alert.alert('Error', 'No se pudo guardar la categoría');
    } finally { setSaving(false); }
  };

  const handleDelete = (id: string, catName: string) => {
    const msg = `¿Eliminar "${catName}"?`;
    const doDelete = async () => {
      try { await deleteCategory(id); load(); }
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
        <Text style={styles.pageTitle}>Categorías</Text>
        <Text style={styles.pageSub}>{categories.length} registradas</Text>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Sin categorías</Text>
            <Text style={styles.emptySub}>Toca "+ Nueva categoría" para crear una</Text>
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
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemMeta}>#{item.order ?? 0}</Text>
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
        <Text style={styles.fabText}>+ Nueva categoría</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={closeModal}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>
              {editingId ? 'Editar categoría' : 'Nueva categoría'}
            </Text>

            <ScrollView
              contentContainerStyle={{ paddingBottom: 8 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.inputLabel}>Nombre</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Whisky, Vinos..."
                placeholderTextColor={C.muted}
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.inputLabel}>Orden (menor aparece primero)</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={C.muted}
                value={order}
                onChangeText={setOrder}
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Ícono / círculo de la categoría</Text>
              <TouchableOpacity style={styles.imgPicker} onPress={() => pickImage(setImage)} activeOpacity={0.8}>
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
                <TouchableOpacity onPress={() => pickImage(setImage)} style={styles.changeImgBtn}>
                  <Text style={styles.changeImgText}>Cambiar imagen</Text>
                </TouchableOpacity>
              )}

              <Text style={styles.inputLabel}>Banner superior dentro de la categoría (opcional)</Text>
              <TouchableOpacity style={styles.imgPicker} onPress={() => pickImage(setHeaderImage)} activeOpacity={0.8}>
                {headerImage ? (
                  <Image source={{ uri: headerImage.uri }} style={styles.imgPreview} resizeMode="cover" />
                ) : existingHeaderUrl ? (
                  <Image source={{ uri: existingHeaderUrl }} style={styles.imgPreview} resizeMode="cover" />
                ) : (
                  <View style={styles.imgPickerInner}>
                    <Text style={styles.imgPickerText}>Banner superior</Text>
                  </View>
                )}
              </TouchableOpacity>
              {(headerImage || existingHeaderUrl) && (
                <TouchableOpacity onPress={() => pickImage(setHeaderImage)} style={styles.changeImgBtn}>
                  <Text style={styles.changeImgText}>Cambiar banner superior</Text>
                </TouchableOpacity>
              )}

              <Text style={styles.inputLabel}>Banner inferior dentro de la categoría (opcional)</Text>
              <TouchableOpacity style={styles.imgPicker} onPress={() => pickImage(setFooterImage)} activeOpacity={0.8}>
                {footerImage ? (
                  <Image source={{ uri: footerImage.uri }} style={styles.imgPreview} resizeMode="cover" />
                ) : existingFooterUrl ? (
                  <Image source={{ uri: existingFooterUrl }} style={styles.imgPreview} resizeMode="cover" />
                ) : (
                  <View style={styles.imgPickerInner}>
                    <Text style={styles.imgPickerText}>Banner inferior</Text>
                  </View>
                )}
              </TouchableOpacity>
              {(footerImage || existingFooterUrl) && (
                <TouchableOpacity onPress={() => pickImage(setFooterImage)} style={styles.changeImgBtn}>
                  <Text style={styles.changeImgText}>Cambiar banner inferior</Text>
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
    width: 52, height: 52, borderRadius: 12,
    backgroundColor: C.card, overflow: 'hidden',
    justifyContent: 'center', alignItems: 'center',
  },
  thumbImg: { width: '100%', height: '100%' },
  thumbPlaceholder: { fontSize: 18, fontWeight: '800', color: C.sub },
  itemName: { fontSize: 15, fontWeight: '700', color: C.text },
  itemMeta: { fontSize: 11, color: C.muted, marginTop: 2, fontWeight: '600' },

  deleteBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#ffeaea',
    justifyContent: 'center', alignItems: 'center',
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
  imgPicker: {
    backgroundColor: C.card, borderRadius: 14,
    height: 140, overflow: 'hidden', marginBottom: 8,
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

  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: C.sub, marginTop: 12 },
  emptySub: { fontSize: 13, color: C.muted, marginTop: 6, textAlign: 'center' },
});
