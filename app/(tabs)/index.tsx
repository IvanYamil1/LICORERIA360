import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  Dimensions, Platform, StatusBar, RefreshControl,
  TextInput,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { getPromotions, getProducts } from '../../src/services/api';
import { useCachedFetch } from '../../src/hooks/useCachedFetch';
import { ErrorState, EmptyState, PromoListSkeleton } from '../../src/components/StateView';

const { width } = Dimensions.get('window');
const GRID_PAD = 14;
const GRID_GAP = 16;
const HALF_W = (width - GRID_PAD * 2 - GRID_GAP) / 2;
const FULL_W = width - GRID_PAD * 2;

const C = {
  bg: '#ffffff',
  text: '#111111',
  sub: '#555555',
  muted: '#888888',
  border: '#e0e0e0',
  olive: '#6B6B1E',
};

type PromoType = 'normal' | 'featured' | 'hero' | 'footer';

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

type Row =
  | { type: 'full';   items: [Promotion] }
  | { type: 'pair';   items: [Promotion, Promotion] }
  | { type: 'center'; items: [Promotion] };

function buildRows(promos: Promotion[]): Row[] {
  const rows: Row[] = [];
  let pending: Promotion | null = null;

  const flush = () => {
    if (pending) {
      rows.push({ type: 'center', items: [pending] });
      pending = null;
    }
  };

  for (const p of promos) {
    if (p.type === 'featured') {
      flush();
      rows.push({ type: 'full', items: [p] });
    } else {
      if (pending) {
        rows.push({ type: 'pair', items: [pending, p] });
        pending = null;
      } else {
        pending = p;
      }
    }
  }
  flush();
  return rows;
}

function PromoCard({ p, w, full, onPress }: { p: Promotion; w: number; full?: boolean; onPress?: () => void }) {
  const imgH = full ? w * 0.55 : w * 1.1;
  const [aspect, setAspect] = useState<number | null>(null);

  let fitW = w;
  let fitH = imgH;
  if (aspect) {
    fitH = Math.min(imgH, w / aspect);
    fitW = fitH * aspect;
  }

  const textBlock = (
    <>
      {p.title ? (
        <View style={s.titleWrap}>
          <Text style={[s.cardName, !full && { textAlign: 'center' }]}>
            {p.title}
            {p.subtitle ? <Text style={s.nameRegular}>{'\n' + p.subtitle}</Text> : null}
          </Text>
        </View>
      ) : null}
      {p.price ? (
        <View style={[
          s.priceRow,
          full && s.priceRowFull,
          !full && { justifyContent: 'center' },
        ]}>
          <Text style={s.cardPrice}>{p.price}</Text>
          {p.priceSuffix ? <Text style={s.priceSuffix}>{p.priceSuffix}</Text> : null}
        </View>
      ) : null}
    </>
  );

  const imgBlock = (
    <View style={[s.imgBox, { width: w, height: imgH, marginTop: full ? 0 : 6 }]}>
      {p.image ? (
        <Image
          source={{ uri: p.image }}
          style={{ width: fitW, height: fitH }}
          resizeMode="contain"
          onLoad={(e: any) => {
            if (aspect) return;
            const src = e?.nativeEvent?.source;
            if (src?.width && src?.height) setAspect(src.width / src.height);
          }}
        />
      ) : (
        <View style={s.imgPlaceholder}><Text style={{ fontSize: 40 }}>🍶</Text></View>
      )}
    </View>
  );

  return (
    <TouchableOpacity style={{ width: w }} activeOpacity={0.85} onPress={onPress}>
      {full ? (
        <>
          {imgBlock}
          {textBlock}
        </>
      ) : (
        <>
          {textBlock}
          {imgBlock}
        </>
      )}
    </TouchableOpacity>
  );
}

function SearchIcon() {
  return (
    <View style={{ width: 18, height: 18, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: '#888', position: 'absolute', top: 0, left: 0 }} />
      <View style={{ width: 2, height: 6, backgroundColor: '#888', borderRadius: 1, position: 'absolute', bottom: 0, right: 1, transform: [{ rotate: '-45deg' }] }} />
    </View>
  );
}

type SearchProduct = {
  _id: string;
  name: string;
  capacity?: string;
  price?: number;
  image?: string;
  category?: { _id: string; name: string } | string;
};

function normalize(s: string) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

const SECRET_TAPS = 5;
const SECRET_WINDOW_MS = 2500;

type HomePayload = {
  promotions: Promotion[];
  products: SearchProduct[];
};

const fetchHomePayload = async (): Promise<HomePayload> => {
  const [promRes, prodRes] = await Promise.all([getPromotions(), getProducts()]);
  return {
    promotions: (promRes.data || []) as Promotion[],
    products: (prodRes.data || []) as SearchProduct[],
  };
};

export default function HomeScreen() {
  const router = useRouter();
  const { data, loading, refreshing, error, reload } =
    useCachedFetch<HomePayload>('home-screen', fetchHomePayload);
  const [query, setQuery] = useState('');
  const tapCountRef = useRef(0);
  const lastTapRef = useRef(0);

  const handleSecretTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current > SECRET_WINDOW_MS) {
      tapCountRef.current = 1;
    } else {
      tapCountRef.current += 1;
    }
    lastTapRef.current = now;
    if (tapCountRef.current >= SECRET_TAPS) {
      tapCountRef.current = 0;
      router.push('/admin/login');
    }
  };

  const promotions = data?.promotions || [];
  const products = data?.products || [];

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('dark-content');
      if (Platform.OS === 'android') StatusBar.setBackgroundColor('#ffffff');
    }, []),
  );

  const results = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return [];
    return products
      .filter((p) => normalize(p.name).includes(q))
      .slice(0, 25);
  }, [query, products]);
  const searching = query.trim().length > 0;

  const heroPromos    = promotions.filter((p) => p.type === 'hero');
  const footerPromos  = promotions.filter((p) => p.type === 'footer');
  const contentPromos = promotions.filter((p) => p.type === 'normal' || p.type === 'featured');
  const rows = buildRows(contentPromos);

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={s.header}>
        <Text style={s.headerTitle}>
          LICORERIA{' '}
          <Text suppressHighlighting onPress={handleSecretTap}>369</Text>
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={reload} tintColor={C.olive} />}
      >
        {heroPromos.map((p) => (
          p.image ? (
            <View key={p._id} style={s.hero}>
              <Image source={{ uri: p.image }} style={s.heroImg} resizeMode="cover" />
            </View>
          ) : null
        ))}

        <View style={s.searchRow}>
          <TextInput
            style={s.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Que bebida quieres ?"
            placeholderTextColor={C.muted}
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 ? (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={10}>
              <Text style={s.searchClear}>✕</Text>
            </TouchableOpacity>
          ) : (
            <SearchIcon />
          )}
        </View>

        {searching ? (
          <View style={s.resultsWrap}>
            {results.length === 0 ? (
              <Text style={s.noResults}>Sin resultados para "{query}"</Text>
            ) : (
              results.map((p) => {
                const catName = typeof p.category === 'object' ? p.category?.name : '';
                return (
                  <TouchableOpacity
                    key={p._id}
                    style={s.resultItem}
                    activeOpacity={0.75}
                    onPress={() => router.push(`/product/${p._id}`)}
                  >
                    <View style={s.resultImgWrap}>
                      {p.image ? (
                        <Image source={{ uri: p.image }} style={s.resultImg} resizeMode="contain" />
                      ) : null}
                    </View>
                    <View style={s.resultInfo}>
                      <Text style={s.resultName} numberOfLines={2}>{p.name}</Text>
                      {p.capacity ? <Text style={s.resultMeta}>{p.capacity}</Text> : null}
                      {catName ? <Text style={s.resultCat}>{catName}</Text> : null}
                    </View>
                    {p.price != null ? <Text style={s.resultPrice}>${p.price}</Text> : null}
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        ) : null}

        {!searching && (
          <View style={s.offerBanner}>
            <Text style={s.offerBannerText}>OFERTA EN ESTAS{'\n'}BEBIDAS!!</Text>
          </View>
        )}

        {!searching && <Text style={s.secTitle}>Explora nuestras opciones</Text>}

        {!searching && (loading ? (
          <PromoListSkeleton />
        ) : error && !data ? (
          <ErrorState
            message="No se pudieron cargar las promociones. Revisa tu conexión."
            onRetry={reload}
          />
        ) : contentPromos.length === 0 && heroPromos.length === 0 && footerPromos.length === 0 ? (
          <EmptyState
            icon="🍾"
            title="Sin promociones todavía"
            description="Agrega promociones desde el panel de admin"
          />
        ) : (
          <View style={s.grid}>
            {rows.map((row, i) => {
              const goTo = (id: string) => router.push(`/promotion/${id}`);
              if (row.type === 'full') {
                return (
                  <View key={i} style={s.rowFull}>
                    <PromoCard p={row.items[0]} w={FULL_W} full onPress={() => goTo(row.items[0]._id)} />
                  </View>
                );
              }
              if (row.type === 'pair') {
                return (
                  <View key={i} style={s.rowPair}>
                    <PromoCard p={row.items[0]} w={HALF_W} onPress={() => goTo(row.items[0]._id)} />
                    <PromoCard p={row.items[1]} w={HALF_W} onPress={() => goTo(row.items[1]._id)} />
                  </View>
                );
              }
              return (
                <View key={i} style={s.rowCenter}>
                  <PromoCard p={row.items[0]} w={HALF_W} onPress={() => goTo(row.items[0]._id)} />
                </View>
              );
            })}
          </View>
        ))}

        {!searching && footerPromos.map((p, i) => (
          p.image ? (
            <View
              key={p._id}
              style={[s.footerImg, i === footerPromos.length - 1 && { marginBottom: 0 }]}
            >
              <Image source={{ uri: p.image }} style={s.footerImgFile} resizeMode="cover" />
            </View>
          ) : null
        ))}

        {!searching && (
          <TouchableOpacity
            style={s.aboutLink}
            onPress={() => router.push('/about')}
            activeOpacity={0.7}
          >
            <Text style={s.aboutLinkText}>Política · Términos · Versión</Text>
          </TouchableOpacity>
        )}

        {footerPromos.length === 0 && <View style={{ height: 32 }} />}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  header: {
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 46 : 54,
    paddingBottom: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: C.text, letterSpacing: 1.2 },

  hero: {
    width,
    height: 210,
    backgroundColor: '#e8e0d0',
    marginTop: 22,
    borderRadius: 16,
    overflow: 'hidden',
  },
  heroImg: { width: '100%', height: '100%' },

  footerImg: { width, height: 210, marginTop: 8 },
  footerImgFile: { width: '100%', height: '100%' },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 14,
    marginTop: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 13 : 6,
  },
  searchText: { fontSize: 16, color: C.muted },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: C.text,
    padding: 0,
    margin: 0,
  },
  searchClear: { fontSize: 16, color: C.muted, fontWeight: '700', paddingHorizontal: 4 },

  resultsWrap: { paddingHorizontal: 14, marginBottom: 24 },
  noResults: { fontSize: 14, color: C.muted, paddingVertical: 24, textAlign: 'center' },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  resultImgWrap: {
    width: 56, height: 56, borderRadius: 8,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center', alignItems: 'center',
    overflow: 'hidden',
  },
  resultImg: { width: '100%', height: '100%' },
  resultInfo: { flex: 1 },
  resultName: { fontSize: 14, fontWeight: '700', color: C.text, lineHeight: 18 },
  resultMeta: { fontSize: 12, color: C.sub, marginTop: 2 },
  resultCat: { fontSize: 11, color: C.muted, marginTop: 2 },
  resultPrice: { fontSize: 16, fontWeight: '900', color: C.text },

  offerBanner: {
    backgroundColor: C.olive,
    marginHorizontal: 14,
    marginBottom: 22,
    borderRadius: 8,
    paddingVertical: 28,
    paddingHorizontal: 16,
  },
  offerBannerText: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 34,
    letterSpacing: 0.5,
  },

  secTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: C.text,
    marginHorizontal: 14,
    marginBottom: 18,
    textAlign: 'center',
  },

  loadingWrap: { paddingVertical: 80, alignItems: 'center' },
  empty: { alignItems: 'center', paddingTop: 40, paddingHorizontal: 30 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: C.text, marginTop: 14 },
  emptySub: { fontSize: 14, color: C.muted, marginTop: 6, textAlign: 'center' },

  aboutLink: { paddingVertical: 14, alignItems: 'center' },
  aboutLinkText: { fontSize: 12, color: C.muted, fontWeight: '600' },

  grid: { paddingHorizontal: GRID_PAD },
  rowFull:   { marginBottom: 28 },
  rowPair:   { flexDirection: 'row', gap: GRID_GAP, marginBottom: 28, alignItems: 'flex-start' },
  rowCenter: { marginBottom: 28, alignItems: 'center' },

  imgBox: {
    backgroundColor: '#fff',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  imgPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  titleWrap: {
    minHeight: 40,
    justifyContent: 'center',
  },
  cardName: {
    fontSize: 15,
    fontWeight: '700',
    color: C.text,
    lineHeight: 20,
  },
  nameRegular: {
    fontWeight: '400',
    color: C.sub,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 4,
  },
  priceRowFull: {
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  cardPrice: {
    fontSize: 26,
    fontWeight: '900',
    color: C.text,
    letterSpacing: -0.3,
  },
  priceSuffix: {
    fontSize: 13,
    fontWeight: '700',
    color: C.sub,
    marginLeft: 3,
    marginBottom: 5,
  },
});
