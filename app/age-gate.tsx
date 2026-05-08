import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar, Image,
  Dimensions, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export const AGE_GATE_KEY = 'ageConfirmed';

export default function AgeGateScreen() {
  const router = useRouter();
  const [denied, setDenied] = useState(false);

  // Si previamente dijo "no", muestra la pantalla de bloqueo de inmediato.
  useEffect(() => {
    AsyncStorage.getItem(AGE_GATE_KEY).then((v) => {
      if (v === 'denied') setDenied(true);
    });
  }, []);

  const handleYes = async () => {
    await AsyncStorage.setItem(AGE_GATE_KEY, 'true');
    router.replace('/splash');
  };

  const handleNo = async () => {
    await AsyncStorage.setItem(AGE_GATE_KEY, 'denied');
    setDenied(true);
  };

  if (denied) {
    return (
      <View style={s.root}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <View style={s.deniedBox}>
          <Text style={s.deniedTitle}>Acceso restringido</Text>
          <Text style={s.deniedText}>
            Esta aplicación es exclusiva para mayores de 18 años. Cierra la app si no
            cumples con la edad mínima requerida.
          </Text>
          <Text style={s.deniedNote}>
            El consumo excesivo de alcohol es nocivo para la salud.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <Image
        source={require('../assets/logo-licoreria.png')}
        style={s.logo}
        resizeMode="contain"
      />

      <Text style={s.title}>VERIFICACIÓN DE EDAD</Text>

      <Text style={s.question}>¿Tienes 18 años o más?</Text>

      <Text style={s.legal}>
        Esta aplicación contiene productos relacionados con bebidas alcohólicas. Para
        continuar debes confirmar que eres mayor de edad según las leyes de tu país.
      </Text>

      <View style={s.btnRow}>
        <TouchableOpacity style={[s.btn, s.btnNo]} onPress={handleNo} activeOpacity={0.8}>
          <Text style={s.btnNoText}>NO</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.btn, s.btnYes]} onPress={handleYes} activeOpacity={0.8}>
          <Text style={s.btnYesText}>SÍ, SOY MAYOR</Text>
        </TouchableOpacity>
      </View>

      <View style={s.legalRow}>
        <TouchableOpacity onPress={() => router.push('/legal/privacy')} activeOpacity={0.7}>
          <Text style={s.legalLink}>Política de Privacidad</Text>
        </TouchableOpacity>
        <Text style={s.legalSep}>·</Text>
        <TouchableOpacity onPress={() => router.push('/legal/terms')} activeOpacity={0.7}>
          <Text style={s.legalLink}>Términos</Text>
        </TouchableOpacity>
      </View>

      <Text style={s.disclaimer}>
        El consumo excesivo de alcohol es nocivo para la salud.
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: width * 0.55,
    height: 140,
    marginBottom: 24,
  },
  title: {
    color: '#7a7820',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 16,
  },
  question: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 18,
  },
  legal: {
    color: '#bbb',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 36,
    paddingHorizontal: 8,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 14,
    width: '100%',
    marginBottom: 32,
  },
  btn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 4,
    alignItems: 'center',
  },
  btnNo: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#555' },
  btnNoText: { color: '#aaa', fontSize: 14, fontWeight: '700', letterSpacing: 2 },
  btnYes: { backgroundColor: '#7a7820' },
  btnYesText: { color: '#fff', fontSize: 14, fontWeight: '800', letterSpacing: 2 },
  legalRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18, gap: 10 },
  legalLink: { color: '#7a7820', fontSize: 12, fontWeight: '600', textDecorationLine: 'underline' },
  legalSep: { color: '#555', fontSize: 12 },
  disclaimer: {
    color: '#888',
    fontSize: 11,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: 20,
  },

  deniedBox: { paddingHorizontal: 32, alignItems: 'center' },
  deniedTitle: { color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 16 },
  deniedText: {
    color: '#ccc', fontSize: 15, lineHeight: 22, textAlign: 'center', marginBottom: 24,
  },
  deniedNote: { color: '#888', fontSize: 12, fontStyle: 'italic', textAlign: 'center' },
});
