import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity,
  Alert, ActivityIndicator, Platform, StatusBar, ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  getPromotions, createPromotion, updatePromotion, deletePromotion,
} from '../../src/services/api';
import { A } from '../../src/theme/admin';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const C = {
  bg:     A.bg,
  white:  A.surface,
  text:   A.text,
  sub:    A.sub,
  muted:  A.muted,
  card:   A.surfaceAlt,
  border: A.border,
  accent: A.primary,
  error:  A.error,
};

type BannerSlot = {
  type: 'hero' | 'footer' | 'categories-banner' | 'offer-badge';
  label: string;
  description: string;
  aspect: 'wide' | 'circle';
};

const SLOTS: BannerSlot[] = [
  { type: 'hero',              label: 'Banner superior (Home)',  description: 'Aparece arriba en la pantalla principal', aspect: 'wide' },
  { type: 'footer',            label: 'Banner inferior (Home)',  description: 'Aparece abajo en la pantalla principal',  aspect: 'wide' },
  { type: 'categories-banner', label: 'Banner Productos',        description: 'Aparece arriba en la pantalla de productos', aspect: 'wide' },
  { type: 'offer-badge',       label: 'Badge OFERTA',             description: 'Botón circular en la pantalla de productos', aspect: 'circle' },
];

type Promotion = {
  _id: string;
  type: string;
  image?: string;
};

export default function AdminBanners() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [promos, setPromos] = useState<Record<string, Promotion | null>>({});
  const [loading, setLoading] = useState(true);
  const [savingType, setSavingType] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await getPromotions();
      const map: Record<string, Promotion | null> = {};
      SLOTS.forEach((s) => {
        map[s.type] = (res.data || []).find((p: Promotion) => p.type === s.type) || null;
      });
      setPromos(map);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const pickAndUpload = async (slot: BannerSlot) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });
    if (result.canceled) return;
    const asset = result.assets[0];

    setSavingType(slot.type);
    try {
      const form = new FormData();
      form.append('type', slot.type);
      form.append('order', '0');

      if (Platform.OS === 'web') {
        const resp = await fetch(asset.uri);
        const blob = await resp.blob();
        const ext = (blob.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
        const file = new File([blob], `${slot.type}.${ext}`, { type: blob.type || 'image/jpeg' });
        form.append('image', file);
      } else {
        form.append('image', {
          uri: asset.uri,
          type: asset.mimeType || 'image/jpeg',
          name: asset.fileName || `${slot.type}.jpg`,
        } as any);
      }

      const existing = promos[slot.type];
      if (existing) {
        await updatePromotion(existing._id, form);
      } else {
        await createPromotion(form);
      }
      await load();
    } catch (e) {
      console.error('save banner error:', e);
      Alert.alert('Error', 'No se pudo guardar el banner');
    } finally {
      setSavingType(null);
    }
  };

  const handleRemove = (slot: BannerSlot) => {
    const existing = promos[slot.type];
    if (!existing) return;
    const msg = `¿Quitar "${slot.label}"?`;
    const doDelete = async () => {
      try { await deletePromotion(existing._id); load(); }
      catch { Alert.alert('Error', 'No se pudo eliminar'); }
    };
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(msg)) doDelete();
      return;
    }
    Alert.alert('Quitar', msg, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Quitar', style: 'destructive', onPress: doDelete },
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
        <Text style={styles.pageTitle}>Banners</Text>
        <Text style={styles.pageSub}>Imágenes fijas de la app</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {SLOTS.map((slot) => {
          const promo = promos[slot.type];
          const isSaving = savingType === slot.type;
          return (
            <View key={slot.type} style={styles.slot}>
              <View style={styles.slotHead}>
                <Text style={styles.slotLabel}>{slot.label}</Text>
                <Text style={styles.slotDesc}>{slot.description}</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.preview,
                  slot.aspect === 'circle' && styles.previewCircle,
                ]}
                activeOpacity={0.85}
                onPress={() => !isSaving && pickAndUpload(slot)}
                disabled={isSaving}
              >
                {promo?.image ? (
                  <Image
                    source={{ uri: promo.image }}
                    style={styles.previewImg}
                    resizeMode={slot.aspect === 'circle' ? 'cover' : 'cover'}
                  />
                ) : (
                  <View style={styles.previewEmpty}>
                    <Text style={styles.previewEmptyText}>Toca para subir</Text>
                  </View>
                )}
                {isSaving && (
                  <View style={styles.savingOverlay}>
                    <ActivityIndicator color="#fff" size="large" />
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.slotBtns}>
                <TouchableOpacity
                  style={styles.changeBtn}
                  onPress={() => !isSaving && pickAndUpload(slot)}
                  disabled={isSaving}
                >
                  <Text style={styles.changeBtnText}>
                    {promo ? 'Cambiar imagen' : 'Subir imagen'}
                  </Text>
                </TouchableOpacity>
                {promo && (
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => handleRemove(slot)}
                    disabled={isSaving}
                  >
                    <Text style={styles.removeBtnText}>Quitar</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
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

  scroll: { padding: 20, gap: 18, paddingBottom: 40 },

  slot: {
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 14,
  },
  slotHead: { marginBottom: 12 },
  slotLabel: { fontSize: 16, fontWeight: '800', color: C.text },
  slotDesc: { fontSize: 12, color: C.sub, marginTop: 2 },

  preview: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: C.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
  },
  previewImg: { width: '100%', height: '100%' },
  previewEmpty: { alignItems: 'center', gap: 6 },
  previewEmptyText: { fontSize: 13, color: C.sub, fontWeight: '600' },

  savingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  slotBtns: { flexDirection: 'row', gap: 10, marginTop: 12 },
  changeBtn: {
    flex: 1,
    backgroundColor: C.accent,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  changeBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  removeBtn: {
    backgroundColor: '#ffeaea',
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  removeBtnText: { color: C.error, fontWeight: '700', fontSize: 14 },
});
