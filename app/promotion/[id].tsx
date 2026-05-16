import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Share,
  StatusBar, ActivityIndicator, Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getPromotion } from '../../src/services/api';
import { orderSingleProduct } from '../../src/utils/whatsapp';
import { ErrorState } from '../../src/components/StateView';

const { width } = Dimensions.get('window');

type Promotion = {
  _id: string;
  type?: string;
  image?: string;
  title?: string;
  subtitle?: string;
  price?: string;
  priceSuffix?: string;
};

const C = {
  bg: '#ffffff',
  card: '#f7f7f7',
  text: '#111',
  sub: '#666',
  muted: '#999',
  border: '#eee',
  primary: '#666429',
  whatsapp: '#25D366',
  badge: '#666429',
};

export default function PromotionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notAvailable, setNotAvailable] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    setNotAvailable(false);
    getPromotion(id)
      .then((r) => setPromotion(r.data))
      .catch((e: any) => {
        if (e?.response?.status === 404) setNotAvailable(true);
        else setError('No se pudo cargar la promoción');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const priceText = promotion?.price
    ? `${promotion.price}${promotion.priceSuffix ? ` ${promotion.priceSuffix}` : ''}`
    : '';

  const handleOrder = async () => {
    if (!promotion) return;
    const priceNum = promotion.price
      ? Number(String(promotion.price).replace(/[^\d.]/g, ''))
      : undefined;
    await orderSingleProduct({
      name: [promotion.title, promotion.subtitle].filter(Boolean).join(' — '),
      price: Number.isFinite(priceNum) ? priceNum : undefined,
    });
  };

  const handleShare = async () => {
    if (!promotion) return;
    const msg = `Mira esta promoción en Licorería 369:\n\n🎉 ${promotion.title || ''}${
      promotion.subtitle ? `\n${promotion.subtitle}` : ''
    }${priceText ? `\nPrecio: ${priceText}` : ''}`;
    try {
      await Share.share({ message: msg });
    } catch { /* user cancelled */ }
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={s.headerBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={s.headerArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>Detalle de la promoción</Text>
        <View style={s.headerBtn} />
      </View>

      {loading ? (
        <View style={s.center}><ActivityIndicator size="large" color={C.primary} /></View>
      ) : notAvailable ? (
        <View style={s.unavailable}>
          <Text style={s.unavailIcon}>🏷️</Text>
          <Text style={s.unavailTitle}>Promoción terminada</Text>
          <Text style={s.unavailDesc}>
            Esta promoción ya no está vigente.
          </Text>
          <TouchableOpacity style={s.unavailBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <Text style={s.unavailBtnText}>Volver</Text>
          </TouchableOpacity>
        </View>
      ) : error || !promotion ? (
        <ErrorState message={error || 'Promoción no disponible'} onRetry={load} />
      ) : (
        <>
          <ScrollView contentContainerStyle={{ paddingBottom: 200 }} showsVerticalScrollIndicator={false}>
            <View style={s.imgWrap}>
              {promotion.image ? (
                <Image source={{ uri: promotion.image }} style={s.img} resizeMode="contain" />
              ) : (
                <View style={s.imgFallback}><Text style={{ fontSize: 80 }}>🎉</Text></View>
              )}
            </View>

            <View style={s.info}>
              <View style={s.badge}>
                <Text style={s.badgeText}>OFERTA</Text>
              </View>

              {promotion.title ? (
                <Text style={s.title}>{promotion.title}</Text>
              ) : null}

              {promotion.subtitle ? (
                <Text style={s.subtitle}>{promotion.subtitle}</Text>
              ) : null}

              {priceText ? (
                <Text style={s.price}>{priceText}</Text>
              ) : null}

              <View style={s.divider} />

              <Text style={s.sectionTitle}>Sobre esta promoción</Text>
              <Text style={s.desc}>
                Promoción disponible en Licorería 369. Para aprovecharla, presiona
                "Pedir por WhatsApp" y nos comunicaremos contigo para confirmar
                disponibilidad y entrega.
              </Text>

              <View style={s.noteBox}>
                <Text style={s.noteText}>
                  ⓘ Esta aplicación es un catálogo informativo. Los pedidos se realizan
                  a través de WhatsApp, presencialmente o por teléfono. Promoción
                  sujeta a disponibilidad. Solo para mayores de 18 años.
                </Text>
              </View>
            </View>
          </ScrollView>

          <View style={[s.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
            <TouchableOpacity style={s.shareBtn} onPress={handleShare} activeOpacity={0.85}>
              <Text style={s.shareBtnText}>Compartir</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.orderBtn} onPress={handleOrder} activeOpacity={0.85}>
              <Text style={s.orderBtnText}>Pedir por WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: C.border,
    backgroundColor: C.bg,
  },
  headerBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: C.card, justifyContent: 'center', alignItems: 'center',
  },
  headerArrow: { fontSize: 22, color: C.text, fontWeight: '700', marginTop: -2 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: C.text },

  imgWrap: {
    width,
    height: width * 0.85,
    backgroundColor: C.card,
    justifyContent: 'center', alignItems: 'center',
  },
  img: { width: '90%', height: '90%' },
  imgFallback: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  info: { padding: 20 },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: C.badge,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 6, marginBottom: 12,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  title: { fontSize: 26, fontWeight: '800', color: C.text, lineHeight: 32 },
  subtitle: { fontSize: 15, color: C.sub, marginTop: 6, lineHeight: 22 },
  price: { fontSize: 32, fontWeight: '900', color: C.text, marginTop: 16 },

  divider: { height: 1, backgroundColor: C.border, marginVertical: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: C.text, marginBottom: 8 },
  desc: { fontSize: 14, color: C.sub, lineHeight: 21 },

  noteBox: {
    marginTop: 18, padding: 14,
    backgroundColor: '#fffbe8', borderRadius: 10,
    borderLeftWidth: 3, borderLeftColor: '#d8a800',
  },
  noteText: { fontSize: 12, color: '#6a5a00', lineHeight: 17 },

  bottomBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    flexDirection: 'row',
    paddingHorizontal: 14, paddingTop: 12, gap: 10,
    backgroundColor: C.bg,
    borderTopWidth: 1, borderTopColor: C.border,
  },
  shareBtn: {
    paddingHorizontal: 22, paddingVertical: 16,
    backgroundColor: C.card, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  shareBtnText: { fontSize: 14, fontWeight: '700', color: C.text },
  orderBtn: {
    flex: 1, paddingVertical: 16,
    backgroundColor: C.whatsapp, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  orderBtnText: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 0.3 },

  unavailable: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  unavailIcon: { fontSize: 60, marginBottom: 12 },
  unavailTitle: { fontSize: 20, fontWeight: '800', color: C.text, textAlign: 'center', marginBottom: 8 },
  unavailDesc: { fontSize: 14, color: C.sub, textAlign: 'center', lineHeight: 21, marginBottom: 24 },
  unavailBtn: { backgroundColor: C.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },
  unavailBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
});
