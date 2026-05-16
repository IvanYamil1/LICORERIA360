import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ACT = '#111111';
const INACT = '#bbbbbb';

type P = { focused: boolean };

/** Ícono de casa */
export function HomeIcon({ focused }: P) {
  const c = focused ? ACT : INACT;
  return (
    <View style={s.wrap}>
      {/* techo — triángulo con border trick */}
      <View style={[s.roof, { borderBottomColor: c }]} />
      {/* cuerpo */}
      <View style={[s.houseBody, { backgroundColor: c }]}>
        {/* puerta */}
        <View style={[s.door, { backgroundColor: focused ? '#fff' : '#e8e8e8' }]} />
      </View>
    </View>
  );
}

/** Ícono de cuadrícula 2×2 */
export function GridIcon({ focused }: P) {
  const c = focused ? ACT : INACT;
  return (
    <View style={s.grid}>
      <View style={s.gridRow}>
        <View style={[s.gridCell, { backgroundColor: c }]} />
        <View style={[s.gridCell, { backgroundColor: c }]} />
      </View>
      <View style={s.gridRow}>
        <View style={[s.gridCell, { backgroundColor: c }]} />
        <View style={[s.gridCell, { backgroundColor: c }]} />
      </View>
    </View>
  );
}

/** Ícono de corazón (favoritos) */
export function HeartIcon({ focused }: P) {
  return (
    <View style={s.heartWrap}>
      <Text allowFontScaling={false} style={s.heart}>
        {focused ? '❤️' : '🤍'}
      </Text>
    </View>
  );
}

/** Ícono de persona (admin) */
export function PersonIcon({ focused }: P) {
  const c = focused ? ACT : INACT;
  return (
    <View style={s.wrap}>
      {/* cabeza */}
      <View style={[s.head, { backgroundColor: c }]} />
      {/* cuerpo/hombros */}
      <View style={[s.shoulders, { backgroundColor: c }]} />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { width: 24, height: 24, alignItems: 'center', justifyContent: 'flex-end' },

  // Casa
  roof: {
    width: 0, height: 0,
    borderLeftWidth: 11,
    borderRightWidth: 11,
    borderBottomWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: ACT,
    marginBottom: 0,
  },
  houseBody: {
    width: 16, height: 11,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 0,
  },
  door: { width: 5, height: 7, borderTopLeftRadius: 2, borderTopRightRadius: 2 },

  // Cuadrícula
  grid: { width: 20, height: 20, gap: 3 },
  gridRow: { flexDirection: 'row', gap: 3, flex: 1 },
  gridCell: { flex: 1, borderRadius: 3 },

  // Corazón
  heartWrap: { width: 32, height: 28, alignItems: 'center', justifyContent: 'center', overflow: 'visible' },
  heart: { fontSize: 22, lineHeight: 26, includeFontPadding: false, textAlign: 'center' },

  // Persona
  head: {
    width: 11, height: 11,
    borderRadius: 6,
    marginBottom: 2,
  },
  shoulders: {
    width: 20, height: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
});
