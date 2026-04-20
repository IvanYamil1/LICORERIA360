import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Image, ActivityIndicator,
  ScrollView, Dimensions, TouchableOpacity, Platform, StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getProducts } from '../../src/services/api';

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

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getProducts()
      .then((r) => {
        const found = r.data.find((p: any) => p._id === id);
        setProduct(found ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={C.text} /></View>;
  }

  if (!product) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 48 }}>🍾</Text>
        <Text style={styles.notFoundText}>Producto no encontrado</Text>
        <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
          <Text style={styles.backLinkText}>Volver atrás</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} bounces>
        {/* Imagen hero */}
        <View style={styles.imgWrap}>
          {product.image ? (
            <Image source={{ uri: product.image }} style={styles.img} resizeMode="cover" />
          ) : (
            <View style={styles.imgFallback}>
              <Text style={{ fontSize: 80 }}>🍾</Text>
            </View>
          )}
          {/* Back flotante */}
          <TouchableOpacity style={styles.backFloat} onPress={() => router.back()}>
            <Text style={styles.backFloatIcon}>‹</Text>
          </TouchableOpacity>
        </View>

        {/* Contenido */}
        <View style={styles.body}>
          {/* Categoría chip */}
          {product.category?.name && (
            <View style={styles.chip}>
              <Text style={styles.chipText}>{product.category.name}</Text>
            </View>
          )}

          <Text style={styles.name}>{product.name}</Text>

          {/* Info cards */}
          <View style={styles.infoRow}>
            {product.capacity ? (
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Capacidad</Text>
                <Text style={styles.infoValue}>{product.capacity}</Text>
              </View>
            ) : null}
            {product.price != null ? (
              <View style={[styles.infoCard, styles.infoCardDark]}>
                <Text style={[styles.infoLabel, { color: 'rgba(255,255,255,0.7)' }]}>Precio</Text>
                <Text style={[styles.infoValue, { color: '#fff' }]}>${product.price}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const IMG_H = width * 1.0;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.white },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.bg,
    gap: 12,
  },
  scroll: { flex: 1 },

  imgWrap: { width, height: IMG_H, position: 'relative' },
  img: { width: '100%', height: '100%' },
  imgFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: C.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backFloat: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 48 : 56,
    left: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
  },
  backFloatIcon: { fontSize: 28, color: C.text, fontWeight: '700', marginTop: -2 },

  body: {
    backgroundColor: C.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -28,
    padding: 24,
    paddingBottom: 48,
  },
  chip: {
    alignSelf: 'flex-start',
    backgroundColor: C.card,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 12,
  },
  chipText: { fontSize: 12, fontWeight: '700', color: C.sub },
  name: {
    fontSize: 28,
    fontWeight: '800',
    color: C.text,
    letterSpacing: -0.5,
    lineHeight: 36,
    marginBottom: 20,
  },

  infoRow: { flexDirection: 'row', gap: 12 },
  infoCard: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  infoCardDark: {
    backgroundColor: C.accent,
    borderColor: C.accent,
  },
  infoLabel: { fontSize: 11, color: C.muted, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase' },
  infoValue: { fontSize: 22, fontWeight: '800', color: C.text, marginTop: 4 },

  notFoundText: { fontSize: 16, color: C.sub, fontWeight: '600' },
  backLink: {
    marginTop: 4,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: C.card,
  },
  backLinkText: { fontSize: 14, fontWeight: '700', color: C.text },
});
