import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Share,
  StatusBar, ActivityIndicator, Dimensions, Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getProduct } from '../../src/services/api';
import { useFavorites } from '../../src/context/FavoritesContext';
import { orderSingleProduct } from '../../src/utils/whatsapp';
import { ErrorState } from '../../src/components/StateView';

const { width } = Dimensions.get('window');

type Product = {
  _id: string;
  name: string;
  capacity?: string;
  price?: number;
  image?: string;
  category?: { _id: string; name: string } | string;
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
  accent: '#7a7820',
  heart: '#e63946',
};

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isFavorite, toggleFavorite, removeFavorite } = useFavorites();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notAvailable, setNotAvailable] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    setNotAvailable(false);
    getProduct(id)
      .then((r) => setProduct(r.data))
      .catch((e: any) => {
        const status = e?.response?.status;
        if (status === 404) {
          setNotAvailable(true);
          // Si lo tenía en favoritos, quitarlo automáticamente
          if (isFavorite(id)) removeFavorite(id);
        } else {
          setError('No se pudo cargar el producto');
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const fav = product ? isFavorite(product._id) : false;

  const handleOrder = async () => {
    if (!product) return;
    await orderSingleProduct({
      name: product.name,
      capacity: product.capacity,
      price: product.price,
    });
  };

  const handleShare = async () => {
    if (!product) return;
    const msg = `Mira este producto en Licorería 369:\n\n🍷 ${product.name}${
      product.capacity ? ` (${product.capacity})` : ''
    }${product.price != null ? `\nPrecio: $${product.price} MXN` : ''}`;
    try {
      await Share.share({ message: msg });
    } catch { /* user cancelled */ }
  };

  const handleFav = async () => {
    if (!product) return;
    await toggleFavorite({
      _id: product._id,
      name: product.name,
      capacity: product.capacity,
      price: product.price,
      image: product.image,
      categoryId: typeof product.category === 'object' ? product.category?._id : product.category,
      categoryName: typeof product.category === 'object' ? product.category?.name : undefined,
    });
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={s.headerBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={s.headerArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>Detalle del producto</Text>
        <TouchableOpacity style={s.headerBtn} onPress={handleFav} activeOpacity={0.7}>
          <Text style={[s.heartIcon, fav && { color: C.heart }]}>{fav ? '♥' : '♡'}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={s.center}><ActivityIndicator size="large" color={C.primary} /></View>
      ) : notAvailable ? (
        <View style={s.unavailable}>
          <Text style={s.unavailIcon}>📦</Text>
          <Text style={s.unavailTitle}>Producto ya no disponible</Text>
          <Text style={s.unavailDesc}>
            Este producto fue retirado del catálogo. Si lo tenías en favoritos, ya lo
            quitamos.
          </Text>
          <TouchableOpacity style={s.unavailBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <Text style={s.unavailBtnText}>Volver al catálogo</Text>
          </TouchableOpacity>
        </View>
      ) : error || !product ? (
        <ErrorState message={error || 'Producto no disponible'} onRetry={load} />
      ) : (
        <>
          <ScrollView contentContainerStyle={{ paddingBottom: 200 }} showsVerticalScrollIndicator={false}>
            <View style={s.imgWrap}>
              {product.image ? (
                <Image source={{ uri: product.image }} style={s.img} resizeMode="contain" />
              ) : (
                <View style={s.imgFallback}><Text style={{ fontSize: 80 }}>🍶</Text></View>
              )}
            </View>

            <View style={s.info}>
              {typeof product.category === 'object' && product.category?.name ? (
                <Text style={s.category}>{product.category.name.toUpperCase()}</Text>
              ) : null}

              <Text style={s.name}>{product.name}</Text>

              {product.capacity ? (
                <Text style={s.capacity}>{product.capacity}</Text>
              ) : null}

              {product.price != null ? (
                <Text style={s.price}>${product.price.toLocaleString('es-MX')} MXN</Text>
              ) : (
                <Text style={s.priceTbd}>Consulta precio en tienda</Text>
              )}

              <View style={s.divider} />

              <Text style={s.sectionTitle}>Sobre este producto</Text>
              <Text style={s.desc}>
                Disponible en Licorería 369. Para realizar tu pedido, presiona el botón
                "Pedir por WhatsApp" y nos comunicaremos contigo para confirmar
                disponibilidad y entrega.
              </Text>

              <View style={s.noteBox}>
                <Text style={s.noteText}>
                  ⓘ Esta aplicación es un catálogo informativo. Los pedidos se realizan
                  a través de WhatsApp, presencialmente o por teléfono. Solo para mayores
                  de 18 años.
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
  heartIcon: { fontSize: 22, color: C.sub, fontWeight: '700' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: C.text },

  imgWrap: {
    width,
    height: width * 0.95,
    backgroundColor: C.card,
    justifyContent: 'center', alignItems: 'center',
  },
  img: { width: '85%', height: '85%' },
  imgFallback: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  info: { padding: 20 },
  category: { fontSize: 11, color: C.primary, fontWeight: '800', letterSpacing: 1.5, marginBottom: 6 },
  name: { fontSize: 24, fontWeight: '800', color: C.text, lineHeight: 30 },
  capacity: { fontSize: 14, color: C.sub, marginTop: 4 },
  price: { fontSize: 28, fontWeight: '900', color: C.text, marginTop: 12 },
  priceTbd: { fontSize: 14, color: C.muted, marginTop: 12, fontStyle: 'italic' },

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
