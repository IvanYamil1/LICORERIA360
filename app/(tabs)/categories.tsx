import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image, TouchableOpacity,
  Dimensions, ActivityIndicator, RefreshControl, Platform, StatusBar,
} from 'react-native';
import { getCategories } from '../../src/services/api';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const C = {
  bg: '#f5f5f5',
  white: '#ffffff',
  text: '#111111',
  sub: '#666666',
  muted: '#999999',
  card: '#f0f0f0',
  border: '#ebebeb',
};

const CARD = (width - 20 * 2 - 12 * 2) / 3;

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const load = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);
  const onRefresh = useCallback(() => { setRefreshing(true); load(); }, []);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={C.text} /></View>;
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Productos</Text>
        <Text style={styles.headerSub}>{categories.length} categorías</Text>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item._id}
        numColumns={3}
        contentContainerStyle={styles.list}
        columnWrapperStyle={{ gap: 12 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.text} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 52 }}>🍶</Text>
            <Text style={styles.emptyTitle}>Sin categorías aún</Text>
            <Text style={styles.emptyDesc}>El admin aún no ha agregado categorías.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.75}
            onPress={() => router.push(`/category/${item._id}?name=${encodeURIComponent(item.name)}`)}
          >
            <View style={styles.cardImgWrap}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.cardImg} resizeMode="cover" />
              ) : (
                <View style={styles.cardImgFallback}>
                  <Text style={{ fontSize: 38 }}>🍾</Text>
                </View>
              )}
            </View>
            <View style={styles.cardFooter}>
              <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
              <View style={styles.cardArrow}>
                <Text style={styles.cardArrowText}>›</Text>
              </View>
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
    backgroundColor: C.white,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 46 : 54,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: C.text, letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: C.sub, marginTop: 2, fontWeight: '500' },

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
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 4,
  },
  cardName: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: C.text,
    lineHeight: 15,
  },
  cardArrow: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardArrowText: { fontSize: 14, color: C.text, fontWeight: '700', marginTop: -1 },

  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: C.text, marginTop: 14 },
  emptyDesc: { fontSize: 14, color: C.sub, marginTop: 6, textAlign: 'center' },
});
