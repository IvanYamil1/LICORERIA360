import React, { useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image, TouchableOpacity,
  StatusBar, Alert, Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFavorites } from '../../src/context/FavoritesContext';
import { orderMultipleProducts } from '../../src/utils/whatsapp';
import { EmptyState } from '../../src/components/StateView';

const C = {
  bg: '#ffffff',
  card: '#f7f7f7',
  text: '#111',
  sub: '#666',
  muted: '#999',
  border: '#eee',
  primary: '#666429',
  whatsapp: '#25D366',
  error: '#b3261e',
};

export default function FavoritesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { favorites, removeFavorite, clearAll } = useFavorites();

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('dark-content');
      if (Platform.OS === 'android') StatusBar.setBackgroundColor('#ffffff');
    }, []),
  );

  const handleOrderAll = async () => {
    if (favorites.length === 0) return;
    Alert.alert(
      'Pedir lista por WhatsApp',
      `Se enviará un mensaje con ${favorites.length} producto${favorites.length === 1 ? '' : 's'} a Licorería 369.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar', onPress: async () => {
            await orderMultipleProducts(favorites.map((f) => ({
              name: f.name, capacity: f.capacity, price: f.price,
            })));
          },
        },
      ],
    );
  };

  const handleRemove = (id: string, name: string) => {
    Alert.alert(
      'Quitar de favoritos',
      `¿Quitar "${name}" de tus favoritos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Quitar', style: 'destructive', onPress: () => removeFavorite(id) },
      ],
    );
  };

  const handleClear = () => {
    Alert.alert(
      'Vaciar favoritos',
      '¿Quitar todos los favoritos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Vaciar', style: 'destructive', onPress: () => clearAll() },
      ],
    );
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <View style={[s.header, { paddingTop: insets.top + 16 }]}>
        <Text style={s.headerTitle}>Favoritos</Text>
        <Text style={s.headerSub}>
          {favorites.length === 0
            ? 'Aún no tienes productos guardados'
            : `${favorites.length} producto${favorites.length === 1 ? '' : 's'}`}
        </Text>
      </View>

      {favorites.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <EmptyState
            icon="♡"
            title="Sin favoritos"
            description="Toca el corazón en cualquier producto para agregarlo aquí y pedir varios juntos por WhatsApp."
          />
        </View>
      ) : (
        <>
          <FlatList
            data={favorites}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{ padding: 16, paddingBottom: 160 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={s.item}
                activeOpacity={0.8}
                onPress={() => router.push(`/product/${item._id}`)}
              >
                <View style={s.thumb}>
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={s.thumbImg} resizeMode="contain" />
                  ) : (
                    <Text style={{ fontSize: 28 }}>🍶</Text>
                  )}
                </View>
                <View style={s.info}>
                  {item.categoryName ? (
                    <Text style={s.cat}>{item.categoryName.toUpperCase()}</Text>
                  ) : null}
                  <Text style={s.name} numberOfLines={2}>{item.name}</Text>
                  {item.capacity ? <Text style={s.capacity}>{item.capacity}</Text> : null}
                  {item.price != null ? (
                    <Text style={s.price}>${item.price.toLocaleString('es-MX')}</Text>
                  ) : null}
                </View>
                <TouchableOpacity
                  style={s.removeBtn}
                  onPress={() => handleRemove(item._id, item.name)}
                  hitSlop={10}
                >
                  <Text style={s.removeText}>✕</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )}
            ListFooterComponent={
              <TouchableOpacity style={s.clearBtn} onPress={handleClear}>
                <Text style={s.clearText}>Vaciar lista</Text>
              </TouchableOpacity>
            }
          />

          <View style={[s.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
            <TouchableOpacity style={s.orderBtn} onPress={handleOrderAll} activeOpacity={0.85}>
              <Text style={s.orderBtnText}>
                Pedir {favorites.length} producto{favorites.length === 1 ? '' : 's'} por WhatsApp
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: {
    paddingHorizontal: 20, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: C.border,
    backgroundColor: C.bg,
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: C.text, letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: C.sub, marginTop: 2, fontWeight: '500' },

  item: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.card, borderRadius: 14, padding: 12,
    marginBottom: 10, gap: 12,
  },
  thumb: {
    width: 72, height: 72, borderRadius: 10,
    backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    overflow: 'hidden',
  },
  thumbImg: { width: '100%', height: '100%' },
  info: { flex: 1 },
  cat: { fontSize: 9, color: C.primary, fontWeight: '800', letterSpacing: 1.2, marginBottom: 2 },
  name: { fontSize: 14, fontWeight: '700', color: C.text, lineHeight: 18 },
  capacity: { fontSize: 12, color: C.sub, marginTop: 2 },
  price: { fontSize: 15, fontWeight: '900', color: C.text, marginTop: 4 },

  removeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#ffe9e7',
    justifyContent: 'center', alignItems: 'center',
  },
  removeText: { color: C.error, fontWeight: '800', fontSize: 14 },

  clearBtn: { paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  clearText: { fontSize: 13, color: C.muted, fontWeight: '700' },

  bottomBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    paddingHorizontal: 14, paddingTop: 12,
    backgroundColor: C.bg,
    borderTopWidth: 1, borderTopColor: C.border,
  },
  orderBtn: {
    paddingVertical: 16,
    backgroundColor: C.whatsapp, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  orderBtnText: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 0.3 },
});
