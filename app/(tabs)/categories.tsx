import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image, TouchableOpacity,
  Dimensions, ActivityIndicator, RefreshControl, Platform, StatusBar, ScrollView,
} from 'react-native';
import { getCategories, getPromotions } from '../../src/services/api';
import { useRouter, useFocusEffect } from 'expo-router';

const { width } = Dimensions.get('window');

const C = {
  bg: '#0a1faa',
  label: '#666429',
  labelText: '#ffffff',
  white: '#ffffff',
  yellow: '#ffd400',
  red: '#c62424',
  redDark: '#7a0f0f',
};

const H_PAD = 22;
const COL_GAP = 16;
const CELL = (width - H_PAD * 2 - COL_GAP * 3) / 4;

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<any[]>([]);
  const [banner, setBanner] = useState<string | null>(null);
  const [offerBadge, setOfferBadge] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const load = async () => {
    try {
      const [catsRes, promosRes] = await Promise.all([getCategories(), getPromotions()]);
      setCategories(catsRes.data || []);
      const promos = promosRes.data || [];
      setBanner(promos.find((p: any) => p.type === 'categories-banner')?.image || null);
      setOfferBadge(promos.find((p: any) => p.type === 'offer-badge')?.image || null);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);
  const onRefresh = useCallback(() => { setRefreshing(true); load(); }, []);

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('light-content');
      if (Platform.OS === 'android') StatusBar.setBackgroundColor('#0a1033');
    }, []),
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0a1033" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
      >
        {/* Banner superior */}
        <View style={styles.hero}>
          {banner ? (
            <Image source={{ uri: banner }} style={styles.heroImg} resizeMode="cover" />
          ) : null}
        </View>

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        ) : categories.length === 0 ? (
          <View style={styles.empty}>
            <Text style={{ fontSize: 52 }}>🍶</Text>
            <Text style={styles.emptyTitle}>Sin categorías aún</Text>
            <Text style={styles.emptySub}>Agrégalas desde el panel de admin</Text>
          </View>
        ) : (
          <>
            {/* Grid */}
            <View style={styles.grid}>
              {categories.map((item) => (
                <TouchableOpacity
                  key={item._id}
                  style={styles.cell}
                  activeOpacity={0.8}
                  onPress={() => router.push(`/category/${item._id}?name=${encodeURIComponent(item.name)}`)}
                >
                  <View style={styles.circle}>
                    {item.image ? (
                      <Image source={{ uri: item.image }} style={styles.circleImg} resizeMode="cover" />
                    ) : (
                      <View style={styles.circleFallback}>
                        <Text style={{ fontSize: 26 }}>🍾</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.labelPill}>
                    <Text style={styles.labelText} numberOfLines={1}>{item.name}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* OFERTA badge */}
            {offerBadge ? (
              <View style={styles.ofertaWrap}>
                <TouchableOpacity style={styles.ofertaCircle} activeOpacity={0.85}>
                  <Image
                    source={{ uri: offerBadge }}
                    style={styles.ofertaImg}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              </View>
            ) : null}
          </>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },


  hero: { width, height: 220, backgroundColor: '#0a1033' },
  heroImg: { width: '100%', height: '100%' },
  heroFallback: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#0a1033',
  },

  loading: { paddingVertical: 80, alignItems: 'center' },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginTop: 14 },
  emptySub: { fontSize: 14, color: '#cfd8ff', marginTop: 6, textAlign: 'center' },

  grid: {
    paddingHorizontal: H_PAD,
    paddingTop: 22,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: COL_GAP,
    rowGap: 20,
  },
  cell: {
    width: CELL,
    alignItems: 'center',
  },
  circle: {
    width: CELL,
    height: CELL,
    borderRadius: CELL / 2,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  circleImg: { width: '100%', height: '100%' },
  circleFallback: {
    width: '100%', height: '100%',
    backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center',
  },
  labelPill: {
    backgroundColor: C.label,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 0,
    marginTop: 6,
    minWidth: CELL - 6,
    alignItems: 'center',
  },
  labelText: {
    color: C.labelText,
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0,
    fontFamily: Platform.select({
      ios: 'System',
      android: 'sans-serif',
      default: 'system-ui',
    }),
  },

  ofertaWrap: {
    alignItems: 'center',
    marginTop: 28,
  },
  ofertaCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  ofertaImg: {
    width: '100%',
    height: '100%',
  },
});
