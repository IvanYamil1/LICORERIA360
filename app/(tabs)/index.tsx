import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  Dimensions, Platform, StatusBar,
} from 'react-native';

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

type Layout = 'full' | 'half' | 'half-alone-left' | 'half-alone-center';

type Promotion = {
  id: string;
  image: any;
  title?: string;
  subtitle?: string;
  price?: string;
  priceSuffix?: string;
  layout: Layout;
};

const PROMOTIONS: Promotion[] = [
  {
    id: 'caguamon-combo',
    image: require('../../assets/home-caguamones.png'),
    title: 'Tecate + Indio',
    subtitle: 'Caguamón 1.2L / 1.18L',
    price: '2 x $85',
    layout: 'full',
  },
  {
    id: 'xx-lager',
    image: require('../../assets/home-xx-lager.png'),
    title: 'XX Laguer',
    subtitle: 'Caguamon 1.18L',
    price: '2x $93',
    layout: 'half',
  },
  {
    id: 'sol-mezclas',
    image: require('../../assets/home-sol-mezclas.png'),
    title: 'SOL Mezclas',
    price: '2 x $48',
    layout: 'half',
  },
  {
    id: 'tecate-lata',
    image: require('../../assets/home-tecate-indio-lata.png'),
    title: 'Tecate Lata',
    subtitle: '473 ml',
    price: '2x $42',
    layout: 'half',
  },
  {
    id: 'jimador',
    image: require('../../assets/home-jimador.png'),
    title: 'Jimador New MIX',
    price: '$35',
    priceSuffix: 'C/U',
    layout: 'half',
  },
  {
    id: 'indio-lata',
    image: require('../../assets/home-tecate-indio-lata.png'),
    title: 'Indio Lata',
    subtitle: '473 ml',
    layout: 'half-alone-left',
  },
  {
    id: 'victoria',
    image: require('../../assets/home-victoria.png'),
    title: 'Victoria Lata',
    subtitle: '710 ml',
    price: '$36',
    layout: 'half-alone-center',
  },
];

type Row =
  | { type: 'full';  items: [Promotion] }
  | { type: 'pair';  items: [Promotion, Promotion] }
  | { type: 'left';  items: [Promotion] }
  | { type: 'center'; items: [Promotion] };

function buildRows(promos: Promotion[]): Row[] {
  const rows: Row[] = [];
  let pending: Promotion | null = null;

  const flushPending = () => {
    if (pending) {
      rows.push({ type: 'left', items: [pending] });
      pending = null;
    }
  };

  for (const p of promos) {
    if (p.layout === 'full') {
      flushPending();
      rows.push({ type: 'full', items: [p] });
    } else if (p.layout === 'half-alone-left') {
      flushPending();
      rows.push({ type: 'left', items: [p] });
    } else if (p.layout === 'half-alone-center') {
      flushPending();
      rows.push({ type: 'center', items: [p] });
    } else {
      if (pending) {
        rows.push({ type: 'pair', items: [pending, p] });
        pending = null;
      } else {
        pending = p;
      }
    }
  }
  flushPending();
  return rows;
}

function PromoCard({ p, w, full }: { p: Promotion; w: number; full?: boolean }) {
  const imgH = full ? w * 0.55 : w * 1.4;
  return (
    <TouchableOpacity style={{ width: w }} activeOpacity={0.85}>
      <View style={[s.imgBox, { width: w, height: imgH }]}>
        <Image source={p.image} style={s.img} resizeMode="contain" />
      </View>

      {p.title && (
        <Text style={s.cardName}>
          {p.title}
          {p.subtitle && <Text style={s.nameRegular}>{'\n' + p.subtitle}</Text>}
        </Text>
      )}

      {p.price && (
        <View style={[s.priceRow, full && s.priceRowFull]}>
          <Text style={s.cardPrice}>{p.price}</Text>
          {p.priceSuffix && <Text style={s.priceSuffix}>{p.priceSuffix}</Text>}
        </View>
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

function MenuIcon() {
  return (
    <View style={{ width: 22, height: 16, justifyContent: 'space-between' }}>
      <View style={{ height: 2, backgroundColor: '#111', borderRadius: 1 }} />
      <View style={{ height: 2, backgroundColor: '#111', borderRadius: 1 }} />
      <View style={{ height: 2, backgroundColor: '#111', borderRadius: 1 }} />
    </View>
  );
}

export default function HomeScreen() {
  const rows = buildRows(PROMOTIONS);

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={s.header}>
        <View style={s.menuBtn}><MenuIcon /></View>
        <Text style={s.headerTitle}>LICORERIA 369</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.hero}>
          <Image source={require('../../assets/home-hero-cuervo.png')} style={s.heroImg} resizeMode="cover" />
        </View>

        <View style={s.searchRow}>
          <Text style={s.searchText}>Que bebida quieres ?</Text>
          <SearchIcon />
        </View>

        <View style={s.banner}>
          <Text style={s.bannerText}>OFERTA EN ESTAS{'\n'}BEBIDAS!!</Text>
        </View>

        <Text style={s.secTitle}>Explora nuestras opciones</Text>

        <View style={s.grid}>
          {rows.map((row, i) => {
            if (row.type === 'full') {
              return (
                <View key={i} style={s.rowFull}>
                  <PromoCard p={row.items[0]} w={FULL_W} full />
                </View>
              );
            }
            if (row.type === 'pair') {
              return (
                <View key={i} style={s.rowPair}>
                  <PromoCard p={row.items[0]} w={HALF_W} />
                  <PromoCard p={row.items[1]} w={HALF_W} />
                </View>
              );
            }
            if (row.type === 'left') {
              return (
                <View key={i} style={s.rowLeft}>
                  <PromoCard p={row.items[0]} w={HALF_W} />
                </View>
              );
            }
            return (
              <View key={i} style={s.rowCenter}>
                <PromoCard p={row.items[0]} w={HALF_W} />
              </View>
            );
          })}
        </View>

        <View style={s.bottomImg}>
          <Image source={require('../../assets/home-cuervo-mezcal.png')} style={s.bottomImgFile} resizeMode="cover" />
        </View>

        <View style={{ height: 24 }} />
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
  menuBtn: {
    position: 'absolute',
    left: 16,
    top: Platform.OS === 'android' ? 46 : 54,
    padding: 4,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: C.text, letterSpacing: 1.2 },

  hero: { width, height: 210, backgroundColor: '#e8e0d0' },
  heroImg: { width: '100%', height: '100%' },

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
    paddingVertical: 13,
  },
  searchText: { fontSize: 16, color: C.muted },

  banner: {
    backgroundColor: C.olive,
    marginHorizontal: 14,
    marginBottom: 26,
    borderRadius: 6,
    paddingVertical: 30,
    paddingHorizontal: 16,
  },
  bannerText: {
    color: '#fff',
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

  /* Grid rows */
  grid: { paddingHorizontal: GRID_PAD },
  rowFull:   { marginBottom: 28 },
  rowPair:   { flexDirection: 'row', gap: GRID_GAP, marginBottom: 28, alignItems: 'flex-start' },
  rowLeft:   { marginBottom: 28, alignItems: 'flex-start' },
  rowCenter: { marginBottom: 28, alignItems: 'center' },

  /* Card internals */
  imgBox: {
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  img: { width: '100%', height: '100%' },

  cardName: {
    fontSize: 15,
    fontWeight: '700',
    color: C.text,
    marginTop: -12,
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

  bottomImg: { width, height: 210, marginTop: 14 },
  bottomImgFile: { width: '100%', height: '100%' },
});
