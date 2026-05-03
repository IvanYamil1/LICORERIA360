import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image, TouchableOpacity,
  TextInput, Modal, Alert, ActivityIndicator, Platform, StatusBar,
  ScrollView, KeyboardAvoidingView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  getPromotions, createPromotion, updatePromotion, deletePromotion,
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
  olive:   A.primary,
  overlay: A.overlay,
};

type PromoType = 'normal' | 'featured';

type Promotion = {
  _id: string;
  type: PromoType;
  image?: string;
  title?: string;
  subtitle?: string;
  price?: string;
  priceSuffix?: string;
  order?: number;
};

export default function AdminPromotions() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [type, setType] = useState<PromoType>('normal');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [price, setPrice] = useState('');
  const [priceSuffix, setPriceSuffix] = useState('');
  const [order, setOrder] = useState('');
  const [image, setImage] = useState<any>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await getPromotions();
      const onlyContent = (res.data || []).filter(
        (p: any) => p.type === 'normal' || p.type === 'featured'
      );
      setPromotions(onlyContent);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setType('normal');
    setTitle(''); setSubtitle(''); setPrice(''); setPriceSuffix('');
    setOrder(''); setImage(null);
    setExistingImageUrl(null); setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEdit = (promo: Promotion) => {
    setEditingId(promo._id);
    setType(promo.type || 'normal');
    setTitle(promo.title || '');
    setSubtitle(promo.subtitle || '');
    setPrice(promo.price || '');
    setPriceSuffix(promo.priceSuffix || '');
    setOrder(promo.order != null ? String(promo.order) : '');
    setImage(null);
    setExistingImageUrl(promo.image || null);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    resetForm();
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });
    if (!result.canceled) setImage(result.assets[0]);
  };

  const handleSave = async () => {
    if (!image && !existingImageUrl) {
      Alert.alert('Falta imagen', 'Agrega una imagen para la promoción');
      return;
    }
    setSaving(true);
    try {
      const form = new FormData();
      form.append('type', type);
      form.append('title', title.trim());
      form.append('subtitle', subtitle.trim());
      form.append('price', price.trim());
      form.append('priceSuffix', priceSuffix.trim());
      form.append('order', order.trim() || '0');

      if (image) {
        if (Platform.OS === 'web') {
          const resp = await fetch(image.uri);
          const blob = await resp.blob();
          const ext = (blob.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
          const file = new File([blob], `promo.${ext}`, { type: blob.type || 'image/jpeg' });
          form.append('image', file);
        } else {
          form.append('image', {
            uri: image.uri,
            type: image.mimeType || 'image/jpeg',
            name: image.fileName || 'promo.jpg',
          } as any);
        }
      }

      if (editingId) {
        await updatePromotion(editingId, form);
      } else {
        await createPromotion(form);
      }
      closeModal();
      load();
    } catch (e) {
      console.error('save promotion error:', e);
      Alert.alert('Error', 'No se pudo guardar la promoción');
    } finally { setSaving(false); }
  };

  const handleDelete = (id: string, promoTitle: string) => {
    const msg = `¿Eliminar "${promoTitle || 'promoción'}"?`;
    const doDelete = async () => {
      try { await deletePromotion(id); load(); }
      catch { Alert.alert('Error', 'No se pudo eliminar'); }
    };
    if (Platform.OS === 'web') {
      // eslint-disable-next-line no-alert
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
        <Text style={styles.pageTitle}>Promociones</Text>
        <Text style={styles.pageSub}>{promotions.length} activas</Text>
      </View>

      <FlatList
        data={promotions}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Sin promociones</Text>
            <Text style={styles.emptySub}>Toca "+ Nueva promoción" para crear una</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.cardBody}
              activeOpacity={0.8}
              onPress={() => openEdit(item)}
            >
              <View style={styles.cardImg}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.cardImgFile} resizeMode="cover" />
                ) : (
                  <View style={styles.cardImgFallback}>
                    <Text style={styles.thumbPlaceholder}>{(item.title || '?').slice(0, 1).toUpperCase()}</Text>
                  </View>
                )}
              </View>
              <View style={styles.cardInfo}>
                <View style={styles.cardTopRow}>
                  {item.type === 'featured' && (
                    <View style={styles.featuredBadge}>
                      <Text style={styles.featuredBadgeText}>PRINCIPAL</Text>
                    </View>
                  )}
                  <Text style={styles.orderText}>#{item.order ?? 0}</Text>
                </View>
                {item.title ? (
                  <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                ) : (
                  <Text style={[styles.cardTitle, { color: C.muted, fontStyle: 'italic' }]}>Sin título</Text>
                )}
                {item.subtitle ? (
                  <Text style={styles.cardDesc} numberOfLines={1}>{item.subtitle}</Text>
                ) : null}
                {item.price ? (
                  <Text style={styles.priceTag}>
                    {item.price}{item.priceSuffix ? ` ${item.priceSuffix}` : ''}
                  </Text>
                ) : null}
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => handleDelete(item._id, item.title || '')}
              activeOpacity={0.7}
            >
              <Text style={styles.deleteBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity style={[styles.fab, { bottom: insets.bottom + 16 }]} onPress={openCreate} activeOpacity={0.85}>
        <Text style={styles.fabText}>+ Nueva promoción</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={closeModal}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>
              {editingId ? 'Editar promoción' : 'Nueva promoción'}
            </Text>

            <ScrollView
              contentContainerStyle={styles.sheetScroll}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.inputLabel}>Tipo de promoción</Text>
              <View style={styles.typeRow}>
                <TouchableOpacity
                  style={[styles.typeOpt, type === 'normal' && styles.typeOptActive]}
                  onPress={() => setType('normal')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.typePreview, { flexDirection: 'row', gap: 3 }]}>
                    <View style={[styles.typePreviewBox, { flex: 1 }]} />
                    <View style={[styles.typePreviewBox, { flex: 1, opacity: 0.3 }]} />
                  </View>
                  <Text style={[styles.typeLabel, type === 'normal' && { color: C.accent }]}>
                    Normal
                  </Text>
                  <Text style={styles.typeHint}>Mitad de ancho</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.typeOpt, type === 'featured' && styles.typeOptActive]}
                  onPress={() => setType('featured')}
                  activeOpacity={0.8}
                >
                  <View style={styles.typePreview}>
                    <View style={[styles.typePreviewBox, { width: '100%' }]} />
                  </View>
                  <Text style={[styles.typeLabel, type === 'featured' && { color: C.accent }]}>
                    Principal
                  </Text>
                  <Text style={styles.typeHint}>Ancho completo</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Imagen *</Text>
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

              {(type === 'normal' || type === 'featured') && (
                <>
                  {/* eslint-disable-next-line */}
                  <Text style={styles.inputLabel}>Título (opcional)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: XX Laguer"
                    placeholderTextColor={C.muted}
                    value={title}
                    onChangeText={setTitle}
                  />

                  <Text style={styles.inputLabel}>Subtítulo (opcional)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: Caguamón 1.18L"
                    placeholderTextColor={C.muted}
                    value={subtitle}
                    onChangeText={setSubtitle}
                  />

                  <View style={styles.priceRow}>
                    <View style={{ flex: 2 }}>
                      <Text style={styles.inputLabel}>Precio (opcional)</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Ej: 2 x $85"
                        placeholderTextColor={C.muted}
                        value={price}
                        onChangeText={setPrice}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Sufijo</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="C/U"
                        placeholderTextColor={C.muted}
                        value={priceSuffix}
                        onChangeText={setPriceSuffix}
                      />
                    </View>
                  </View>
                </>
              )}

              {(type === 'normal' || type === 'featured') && (
                <>
                  <Text style={styles.inputLabel}>Orden (menor aparece primero)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor={C.muted}
                    value={order}
                    onChangeText={setOrder}
                    keyboardType="numeric"
                  />
                </>
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

  list: { padding: 20, gap: 12, paddingBottom: 100 },

  card: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: C.white,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: C.border,
  },
  cardBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  cardImg: { width: 90, height: 90 },
  cardImgFile: { width: '100%', height: '100%' },
  thumbPlaceholder: { fontSize: 22, fontWeight: '800', color: C.sub },
  cardImgFallback: {
    width: '100%', height: '100%',
    backgroundColor: C.card, justifyContent: 'center', alignItems: 'center',
  },
  cardInfo: { flex: 1, padding: 12 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  featuredBadge: {
    backgroundColor: C.olive, paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: 6,
  },
  featuredBadgeText: { fontSize: 9, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
  orderText: { fontSize: 11, color: C.muted, fontWeight: '700' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: C.text },
  cardDesc: { fontSize: 12, color: C.sub, marginTop: 2, lineHeight: 17 },
  priceTag: { fontSize: 13, fontWeight: '800', color: C.olive, marginTop: 4 },

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
  sheetScroll: { paddingBottom: 16 },
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
  priceRow: { flexDirection: 'row', gap: 10 },

  helperBox: {
    backgroundColor: '#fff8e6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0e0b0',
  },
  helperText: { fontSize: 12, color: '#806020', lineHeight: 17 },

  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  typeOpt: {
    flex: 1, backgroundColor: C.card, borderRadius: 14,
    padding: 12,
    borderWidth: 2, borderColor: 'transparent',
  },
  typeOptActive: {
    borderColor: C.accent,
    backgroundColor: '#fff',
  },
  typePreview: { height: 26, marginBottom: 10 },
  typePreviewBox: { height: 26, borderRadius: 4, backgroundColor: '#111' },
  typeLabel: { fontSize: 14, fontWeight: '800', color: C.text },
  typeHint: { fontSize: 11, color: C.sub, marginTop: 2 },

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

  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: C.sub, marginTop: 12 },
  emptySub: { fontSize: 13, color: C.muted, marginTop: 6, textAlign: 'center' },
});
