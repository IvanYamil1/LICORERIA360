import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, Dimensions, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Título LICORERIA */}
      <Text style={styles.title}>LICORERIA</Text>

      {/* Números 3 6 9 */}
      <View style={styles.numbersRow}>
        <Text style={styles.number}>3</Text>
        <Text style={styles.number}>6</Text>
        <Text style={styles.number}>9</Text>
      </View>

      {/* Imagen de bebidas — reemplazar con: source={require('../assets/splash-drinks.png')} */}
      <View style={styles.img} />

      {/* Botón Start */}
      <TouchableOpacity
        style={styles.startBtn}
        onPress={() => router.replace('/register')}
        activeOpacity={0.75}
      >
        <Text style={styles.startText}>Start</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'android' ? 40 : 50,
    paddingBottom: 50,
  },

  /* LICORERIA */
  title: {
    fontSize: 46,
    fontWeight: '900',
    color: '#CC2200',
    letterSpacing: 6,
    textShadowColor: '#FF6633',
    textShadowOffset: { width: 2, height: 3 },
    textShadowRadius: 6,
    marginBottom: 0,
  },

  /* 3 6 9 */
  numbersRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  number: {
    fontSize: 110,
    fontWeight: '900',
    color: '#55DD00',
    lineHeight: 120,
    textShadowColor: '#8B0000',
    textShadowOffset: { width: -3, height: 4 },
    textShadowRadius: 2,
  },

  /* Imagen */
  img: {
    width: width * 0.78,
    height: height * 0.32,
    marginBottom: 24,
    backgroundColor: '#111',
    borderRadius: 12,
  },

  /* Start */
  startBtn: {
    paddingVertical: 6,
    paddingHorizontal: 20,
  },
  startText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 1,
  },
});
