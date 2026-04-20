import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform,
  StatusBar, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function RegisterScreen() {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const router = useRouter();

  const handleUnirse = () => {
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Imagen superior pequeña — reemplazar con require('../assets/top-promo.png') */}
        <View style={styles.topImgWrap}>
          <View style={styles.topImgPlaceholder} />
        </View>

        {/* Texto central */}
        <Text style={styles.tagline}>
          Regístrate para ver <Text style={styles.taglineBold}>nuestras ofertas</Text>
        </Text>

        {/* Imagen principal — reemplazar con require('../assets/main-promo.png') */}
        <View style={styles.mainImgPlaceholder} />

        {/* Formulario */}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="NOMBRE"
            placeholderTextColor="#555555"
            value={nombre}
            onChangeText={setNombre}
            autoCapitalize="words"
          />
          <TextInput
            style={styles.input}
            placeholder="APELLIDO"
            placeholderTextColor="#555555"
            value={apellido}
            onChangeText={setApellido}
            autoCapitalize="words"
          />
          <TextInput
            style={styles.input}
            placeholder="TELÉFONO"
            placeholderTextColor="#555555"
            value={telefono}
            onChangeText={setTelefono}
            keyboardType="phone-pad"
          />

          <TouchableOpacity style={styles.btn} onPress={handleUnirse} activeOpacity={0.85}>
            <Text style={styles.btnText}>UNIRSE</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000000' },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 48 : 56,
    paddingBottom: 40,
  },

  /* Imagen pequeña superior */
  topImgWrap: {
    width: 130,
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  topImgPlaceholder: { width: '100%', height: '100%', backgroundColor: '#222' },

  /* Tagline */
  tagline: {
    fontSize: 15,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 30,
    lineHeight: 22,
  },
  taglineBold: { fontWeight: '700', color: '#ffffff' },

  mainImgPlaceholder: {
    width: width,
    height: 220,
    backgroundColor: '#1a1a1a',
    marginBottom: 28,
  },

  /* Formulario */
  form: { width: '100%', paddingHorizontal: 24, gap: 12 },
  input: {
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 13,
    color: '#ffffff',
    letterSpacing: 1.5,
  },
  btn: {
    backgroundColor: '#7a7820',
    borderRadius: 6,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 4,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2.5,
  },
});
