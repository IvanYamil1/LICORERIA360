import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity, ScrollView,
  Dimensions, Platform, StatusBar, RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getProductsByCategory, getCategory, getCategories } from '../../src/services/api';
import { useCachedFetch } from '../../src/hooks/useCachedFetch';
import { ErrorState, EmptyState, ProductGridSkeleton } from '../../src/components/StateView';

const { width } = Dimensions.get('window');
const H_PAD = 16;
const COL_GAP = 10;

const C = {
  bg: '#ffffff',
  white: '#ffffff',
  text: '#111111',
  sub: '#666666',
  muted: '#999999',
  card: '#f0f0f0',
  border: '#ebebeb',
};

type Product = {
  _id: string;
  name: string;
  capacity?: string;
  price?: number;
  image?: string;
  colsInRow?: number;
  order?: number;
};

type Category = {
  _id: string;
  name: string;
  image?: string;
  headerImage?: string;
  footerImage?: string;
};

type Row = { cols: number; items: Product[] };

function buildRows(products: Product[]): Row[] {
  const rows: Row[] = [];
  let buffer: Product[] = [];
  let currentCols = 0;

  const flush = () => {
    if (buffer.length) {
      rows.push({ cols: currentCols, items: buffer });
      buffer = [];
    }
  };

  for (const p of products) {
    const cols = Math.max(1, Math.min(6, p.colsInRow || 3));
    if (cols !== currentCols) {
      flush();
      currentCols = cols;
    }
    buffer.push(p);
    if (buffer.length === currentCols) flush();
  }
  flush();
  return rows;
}

type CategoryPayload = {
  category: Category | null;
  products: Product[];
  allCategories: { _id: string; name: string }[];
};

export default function CategoryScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const router = useRouter();
  const [aspects, setAspects] = useState<Record<string, number>>({});

  const fetchCategoryData = useMemo(
    () => async (): Promise<CategoryPayload> => {
      const [catRes, prodRes, catsRes] = await Promise.all([
        getCategory(id),
        getProductsByCategory(id),
        getCategories(),
      ]);
      return {
        category: catRes.data,
        products: prodRes.data || [],
        allCategories: catsRes.data || [],
      };
    },
    [id],
  );

  const { data, loading, refreshing, error, reload } =
    useCachedFetch<CategoryPayload>(`category-${id}`, fetchCategoryData);

  const category = data?.category || null;
  const products = data?.products || [];
  const allCategories = data?.allCategories || [];

  // Measure aspect ratios for featured (cols=1) products via Image.getSize
  useEffect(() => {
    products
      .filter((p) => p.colsInRow === 1 && p.image && !aspects[p._id])
      .forEach((p) => {
        Image.getSize(
          p.image as string,
          (w, h) => {
            if (w && h) setAspects((prev) => ({ ...prev, [p._id]: w / h }));
          },
          () => {},
        );
      });
  }, [products]);

  const title = name ? decodeURIComponent(name) : (category?.name || 'Productos');

  const goSibling = (delta: number) => {
    const idx = allCategories.findIndex((c) => c._id === id);
    if (idx === -1 || allCategories.length === 0) return;
    const nextIdx = (idx + delta + allCategories.length) % allCategories.length;
    const next = allCategories[nextIdx];
    router.replace(`/category/${next._id}?name=${encodeURIComponent(next.name)}`);
  };

  const rows = buildRows(products);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />

      <View style={styles.brandBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.brandTitle}>Licoreria 369</Text>
      </View>
      <View style={styles.header}>
        <TouchableOpacity style={styles.navCircle} onPress={() => goSibling(-1)} activeOpacity={0.8}>
          <Text style={styles.navArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
        <TouchableOpacity style={styles.navCircle} onPress={() => goSibling(1)} activeOpacity={0.8}>
          <Text style={styles.navArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={reload} tintColor={C.text} />}
      >
        {category?.headerImage ? (
          <View style={styles.bannerWrap}>
            <Image source={{ uri: category.headerImage }} style={styles.banner} resizeMode="cover" />
          </View>
        ) : null}

        {loading ? (
          <ProductGridSkeleton rows={4} cols={3} />
        ) : error && !data ? (
          <ErrorState
            message="No se pudo cargar la categoría. Revisa tu conexión."
            onRetry={reload}
          />
        ) : products.length === 0 ? (
          <EmptyState
            icon="🍾"
            title="Sin productos"
            description="Esta categoría aún no tiene productos."
          />
        ) : (
          <View style={styles.grid}>
            {rows.map((row, i) => {
              // For 2-col rows use 3-col sizing so items match 3-col rows visually.
              const sizingCols = row.cols === 2 ? 3 : row.cols;
              const isFeatured = row.cols === 1;
              const totalGap = COL_GAP * (sizingCols - 1);
              const cardW = isFeatured ? width : (width - H_PAD * 2 - totalGap) / sizingCols;
              // For featured rows, use natural image aspect ratio (once measured) so the
              // box is exactly as tall as the image — no whitespace below.
              const featuredId = isFeatured && row.items[0] ? row.items[0]._id : null;
              const featuredAspect = featuredId ? aspects[featuredId] : undefined;
              const imgH =
                isFeatured         ? (featuredAspect ? cardW / featuredAspect : cardW * 0.85) :
                sizingCols >= 4    ? cardW * 2.2  :   // 4 cols — bottles altas
                                     cardW * 1.4;     // 2 y 3 cols
              const centerRow = row.cols === 2 || row.items.length < row.cols;
              return (
                <View
                  key={i}
                  style={[
                    styles.row,
                    { gap: COL_GAP },
                    centerRow && { justifyContent: 'center' },
                    isFeatured && { marginHorizontal: -H_PAD },
                  ]}
                >
                  {row.items.map((p) => (
                    <TouchableOpacity
                      key={p._id}
                      style={[styles.card, { width: cardW }]}
                      activeOpacity={0.75}
                      onPress={() => router.push(`/product/${p._id}`)}
                    >
                      {isFeatured ? (
                        p.image ? (
                          <Image
                            source={{ uri: p.image }}
                            style={{
                              width: '100%',
                              height: aspects[p._id]
                                ? Math.min(cardW / aspects[p._id], 420)
                                : cardW * 0.6,
                            }}
                            resizeMode="contain"
                          />
                        ) : (
                          <View style={[styles.cardImgFallback, { height: imgH }]}><Text style={{ fontSize: 30 }}>🍶</Text></View>
                        )
                      ) : (
                        <View style={[styles.cardImgWrap, { height: imgH, width: '100%' }]}>
                          {p.image ? (
                            <Image source={{ uri: p.image }} style={styles.cardImg} resizeMode="contain" />
                          ) : (
                            <View style={styles.cardImgFallback}><Text style={{ fontSize: 30 }}>🍶</Text></View>
                          )}
                        </View>
                      )}
                      <View style={isFeatured && { paddingHorizontal: H_PAD }}>
                        <Text style={styles.cardName}>{p.name}</Text>
                        {p.capacity ? (
                          <Text style={styles.cardCapacity}>{p.capacity}</Text>
                        ) : null}
                        {p.price != null ? (
                          <Text style={styles.cardPrice}>${p.price}</Text>
                        ) : null}
                      </View>
                    </TouchableOpacity>
                  ))}
                  {/* fill remaining slots so cards don't stretch (skip when centered) */}
                  {!centerRow && Array.from({ length: sizingCols - row.items.length }).map((_, idx) => (
                    <View key={`empty-${idx}`} style={{ width: cardW }} />
                  ))}
                </View>
              );
            })}
          </View>
        )}

        {category?.footerImage ? (
          <View style={[styles.bannerWrap, { marginTop: 16 }]}>
            <Image source={{ uri: category.footerImage }} style={styles.banner} resizeMode="cover" />
          </View>
        ) : null}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg },

  brandBar: {
    backgroundColor: C.white,
    paddingTop: Platform.OS === 'android' ? 38 : 48,
    paddingBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    minHeight: Platform.OS === 'android' ? 90 : 100,
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

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.white,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  navCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#111',
    justifyContent: 'center', alignItems: 'center',
  },
  navArrow: { fontSize: 24, color: '#fff', fontWeight: '700', lineHeight: 26, marginTop: -2 },
  headerTitle: {
    flex: 1, fontSize: 19, fontWeight: '800',
    color: C.text, textAlign: 'center', letterSpacing: -0.3,
  },

  scroll: { paddingBottom: 20 },

  bannerWrap: { width, height: 250, backgroundColor: '#0a1033' },
  banner: { width: '100%', height: '100%' },

  grid: { paddingHorizontal: H_PAD, paddingTop: 16, gap: 18 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },

  card: { backgroundColor: 'transparent' },
  cardImgWrap: {
    width: '100%',
    backgroundColor: '#fff',
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cardImg: { width: '100%', height: '100%' },
  cardImgFallback: {
    width: '100%', height: '100%',
    backgroundColor: C.card,
    justifyContent: 'center', alignItems: 'center',
  },
  cardName: { fontSize: 12, fontWeight: '700', color: C.text, lineHeight: 16, marginTop: 6 },
  cardCapacity: { fontSize: 11, color: C.sub, marginTop: 1, fontWeight: '500' },
  cardPrice: { fontSize: 14, fontWeight: '900', color: C.text, marginTop: 4 },

  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: C.text, marginTop: 14 },
  emptyDesc: { fontSize: 14, color: C.sub, marginTop: 6, textAlign: 'center' },
});
