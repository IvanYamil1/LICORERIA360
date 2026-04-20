import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  Dimensions, ActivityIndicator, RefreshControl, Platform, StatusBar,
} from 'react-native';
import { getPromotions, getProducts } from '../../src/services/api';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const CARD = (width - 14 * 2 - 16) / 2;   // dos columnas con padding lateral 14

const C = {
  bg: '#ffffff',
  text: '#111111',
  sub: '#555555',
  muted: '#888888',
  border: '#e0e0e0',
  card: '#f5f5f5',
  olive: '#6B6B1E',
};

function SearchIcon() {
  return (
    <View style={{ width: 18, height: 18, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: '#888', position: 'absolute', top: 0, left: 0 }} />
      <View style={{ width: 2, height: 6, backgroundColor: '#888', borderRadius: 1, position: 'absolute', bottom: 0, right: 1, transform: [{ rotate: '-45deg' }] }} />
    </View>
  );
}

export default function HomeScreen() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [products, setProducts]     = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const load = async () => {
    try {
      const [promoRes, prodRes] = await Promise.all([getPromotions(), getProducts()]);
      setPromotions(promoRes.data);
      setProducts(prodRes.data);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);
  const onRefresh = useCallback(() => { setRefreshing(true); load(); }, []);

  if (loading) {
    return <View style={s.center}><ActivityIndicator size="large" color={C.olive} /></View>;
  }

  /* agrupa en filas de 2 */
  const rows: any[][] = [];
  for (let i = 0; i < products.length; i += 2) rows.push(products.slice(i, i + 2));

  const lastPromo = promotions[promotions.length - 1];

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ── Header ── */}
      <View style={s.header}>
        <Text style={s.headerTitle}>LICORERÍA 369</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.olive} />}
      >
        {/* ── Hero image ── */}
        <View style={s.hero}>
          {promotions[0]?.image
            ? <Image source={{ uri: promotions[0].image }} style={s.heroImg} resizeMode="cover" />
            : <View style={s.heroFallback} />}
        </View>

        {/* ── Buscador ── */}
        <View style={s.searchRow}>
          <Text style={s.searchText}>Que bebida quieres?</Text>
          <SearchIcon />
        </View>

        {/* ── Banner oferta ── */}
        {promotions.length > 0 && (
          <View style={s.banner}>
            <Text style={s.bannerText}>
              {(promotions[0].title || 'OFERTA EN ESTAS BEBIDAS!!').toUpperCase()}
            </Text>
          </View>
        )}

        {/* ── Título sección ── */}
        {products.length > 0 && (
          <Text style={s.secTitle}>Explora nuestras opciones</Text>
        )}

        {/* ── Grid de productos ── */}
        <View style={s.grid}>
          {rows.map((pair, ri) => (
            <View key={ri} style={s.gridRow}>
              {pair.map((p) => (
                <TouchableOpacity
                  key={p._id}
                  style={s.card}
                  activeOpacity={0.75}
                  onPress={() => router.push(`/product/${p._id}`)}
                >
                  {/* Imagen portrait */}
                  <View style={s.imgBox}>
                    {p.image
                      ? <Image source={{ uri: p.image }} style={s.img} resizeMode="contain" />
                      : <View style={s.imgFallback}><Text style={{ fontSize: 40 }}>🍶</Text></View>}
                  </View>

                  {/* Nombre + capacidad */}
                  <Text style={s.cardName} numberOfLines={2}>
                    {p.name}{p.capacity ? `\n${p.capacity}` : ''}
                  </Text>

                  {/* Precio grande */}
                  {p.price != null && (
                    <Text style={s.cardPrice}>${p.price}</Text>
                  )}
                </TouchableOpacity>
              ))}

              {/* relleno si fila impar */}
              {pair.length === 1 && <View style={s.card} />}
            </View>
          ))}
        </View>

        {/* ── Imagen final full-width ── */}
        {lastPromo?.image && promotions.length > 1 && (
          <View style={s.bottomImg}>
            <Image source={{ uri: lastPromo.image }} style={s.bottomImgFile} resizeMode="cover" />
          </View>
        )}

        {products.length === 0 && promotions.length === 0 && (
          <View style={s.empty}>
            <Text style={{ fontSize: 52 }}>🍾</Text>
            <Text style={s.emptyTitle}>Próximamente</Text>
          </View>
        )}

        <View style={{ height: 48 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  /* Header */
  header: {
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 46 : 54,
    paddingBottom: 13,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: C.text, letterSpacing: 1.5 },

  /* Hero */
  hero: { width, height: 190, backgroundColor: '#e8e0d0' },
  heroImg: { width: '100%', height: '100%' },
  heroFallback: { flex: 1, backgroundColor: '#ddd' },

  /* Search */
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 14,
    marginTop: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  searchText: { fontSize: 14, color: C.muted },

  /* Banner */
  banner: {
    backgroundColor: C.olive,
    marginHorizontal: 14,
    marginBottom: 18,
    borderRadius: 8,
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  bannerText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 30,
  },

  /* Sección */
  secTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: C.text,
    marginHorizontal: 14,
    marginBottom: 14,
    letterSpacing: -0.2,
  },

  /* Grid */
  grid: { paddingHorizontal: 14 },
  gridRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },

  /* Card */
  card: { width: CARD },
  imgBox: {
    width: CARD,
    height: CARD * 1.5,
    backgroundColor: C.card,
    borderRadius: 6,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  img: { width: '100%', height: '100%' },
  imgFallback: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  cardName: {
    fontSize: 13,
    color: C.sub,
    marginTop: 7,
    lineHeight: 18,
  },
  cardPrice: {
    fontSize: 26,
    fontWeight: '900',
    color: C.text,
    marginTop: 3,
    letterSpacing: -0.5,
  },

  /* Imagen final */
  bottomImg: { width, height: 200, marginTop: 8 },
  bottomImgFile: { width: '100%', height: '100%' },

  /* Empty */
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: C.text, marginTop: 14 },
});
