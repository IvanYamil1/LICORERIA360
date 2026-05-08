import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Easing,
} from 'react-native';

const C = {
  bg: '#fff',
  text: '#111111',
  sub: '#666666',
  muted: '#999999',
  card: '#f0f0f0',
  border: '#ebebeb',
  accent: '#666429',
  error: '#b3261e',
};

export function ErrorState({
  message = 'No se pudo cargar la información',
  onRetry,
}: { message?: string; onRetry?: () => void }) {
  return (
    <View style={s.center}>
      <Text style={s.errIcon}>⚠</Text>
      <Text style={s.errTitle}>Algo salió mal</Text>
      <Text style={s.errMsg}>{message}</Text>
      {onRetry ? (
        <TouchableOpacity style={s.retryBtn} onPress={onRetry} activeOpacity={0.8}>
          <Text style={s.retryText}>Reintentar</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function EmptyState({
  title = 'Sin contenido',
  description,
  icon = '📦',
}: { title?: string; description?: string; icon?: string }) {
  return (
    <View style={s.center}>
      <Text style={{ fontSize: 52 }}>{icon}</Text>
      <Text style={s.emptyTitle}>{title}</Text>
      {description ? <Text style={s.emptyDesc}>{description}</Text> : null}
    </View>
  );
}

// Skeleton block animado con shimmer suave
export function Skeleton({
  width = '100%',
  height = 16,
  radius = 8,
  style,
}: { width?: number | string; height?: number; radius?: number; style?: any }) {
  const opacity = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, easing: Easing.ease, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 800, easing: Easing.ease, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return (
    <Animated.View
      style={[
        { width, height, borderRadius: radius, backgroundColor: C.card, opacity },
        style,
      ]}
    />
  );
}

export function ProductGridSkeleton({ rows = 3, cols = 3 }: { rows?: number; cols?: number }) {
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
      {Array.from({ length: rows }).map((_, r) => (
        <View key={r} style={{ flexDirection: 'row', gap: 10, marginBottom: 18 }}>
          {Array.from({ length: cols }).map((_, c) => (
            <View key={c} style={{ flex: 1 }}>
              <Skeleton height={120} radius={8} />
              <Skeleton height={12} width="80%" style={{ marginTop: 8 }} />
              <Skeleton height={10} width="50%" style={{ marginTop: 4 }} />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

export function CategoryGridSkeleton() {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: 22, gap: 16 }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <View key={i} style={{ width: '22%', alignItems: 'center' }}>
          <Skeleton width="100%" height={70} radius={35} />
          <Skeleton width="90%" height={10} style={{ marginTop: 8 }} />
        </View>
      ))}
    </View>
  );
}

export function PromoListSkeleton() {
  return (
    <View style={{ paddingHorizontal: 14, paddingTop: 16 }}>
      <Skeleton height={210} radius={12} style={{ marginBottom: 24 }} />
      <View style={{ flexDirection: 'row', gap: 16 }}>
        <Skeleton height={180} radius={10} style={{ flex: 1 }} />
        <Skeleton height={180} radius={10} style={{ flex: 1 }} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', padding: 40, paddingTop: 60 },
  errIcon: { fontSize: 48, marginBottom: 8 },
  errTitle: { fontSize: 18, fontWeight: '800', color: C.text, marginTop: 6 },
  errMsg: { fontSize: 14, color: C.sub, textAlign: 'center', marginTop: 6, lineHeight: 20 },
  retryBtn: {
    marginTop: 18,
    backgroundColor: C.accent,
    paddingHorizontal: 26, paddingVertical: 12,
    borderRadius: 10,
  },
  retryText: { color: '#fff', fontWeight: '800', fontSize: 14, letterSpacing: 0.5 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: C.text, marginTop: 14 },
  emptyDesc: { fontSize: 13, color: C.muted, marginTop: 6, textAlign: 'center', maxWidth: 280 },
});
