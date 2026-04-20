import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image, TouchableOpacity,
  ActivityIndicator, Dimensions, Platform, StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getProductsByCategory } from '../../src/services/api';

const { width } = Dimensions.get('window');

const C = {
  bg: '#f5f5f5',
  white: '#ffffff',
  text: '#111111',
  sub: '#666666',
  muted: '#999999',
  card: '#f0f0f0',
  border: '#ebebeb',
  accent: '#000000',
};

const CARD = (width - 20 * 2 - 12 * 2) / 3;

export default function CategoryScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const title = name ? decodeURIComponent(name) : 'Productos';

  useEffect(() => {
    getProductsByCategory(id)
      .then((r) => setProducts(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={C.text} /></View>;
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />

      {/* Header con back */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={styles.list}
        columnWrapperStyle={{ gap: 12 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 52 }}>🍾</Text>
            <Text style={styles.emptyTitle}>Sin productos</Text>
            <Text style={styles.emptyDesc}>Esta categoría aún no tiene productos.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.75}
            onPress={() => router.push(`/product/${item._id}`)}
          >
            <View style={styles.cardImgWrap}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.cardImg} resizeMode="cover" />
              ) : (
                <View style={styles.cardImgFallback}>
                  <Text style={{ fontSize: 36 }}>🍶</Text>
                </View>
              )}
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
              {item.capacity ? (
                <Text style={styles.cardCapacity}>{item.capacity}</Text>
              ) : null}
              {item.price != null ? (
                <View style={styles.priceRow}>
                  <Text style={styles.cardPrice}>${item.price}</Text>
                </View>
              ) : null}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'android' ? 46 : 54,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: { fontSize: 26, color: C.text, fontWeight: '700', marginTop: -2 },
  headerTitle: {
    flex: 1,
    fontSize: 19,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
    letterSpacing: -0.3,
  },

  list: { padding: 20, gap: 12, paddingBottom: 32 },

  card: {
    width: CARD,
    backgroundColor: C.white,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: C.border,
  },
  cardImgWrap: { width: '100%', aspectRatio: 1 },
  cardImg: { width: '100%', height: '100%' },
  cardImgFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: C.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: { padding: 8 },
  cardName: { fontSize: 11, fontWeight: '700', color: C.text, lineHeight: 15 },
  cardCapacity: { fontSize: 10, color: C.sub, marginTop: 2, fontWeight: '500' },
  priceRow: { marginTop: 5 },
  cardPrice: { fontSize: 13, fontWeight: '800', color: C.text },

  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: C.text, marginTop: 14 },
  emptyDesc: { fontSize: 14, color: C.sub, marginTop: 6, textAlign: 'center' },
});
