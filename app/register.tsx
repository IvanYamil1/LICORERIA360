import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform,
  StatusBar, Dimensions, Image,
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
        <View style={styles.topImgWrap}>
          <Image
            source={require('../assets/licoreria-2.png')}
            style={styles.topImg}
            resizeMode="cover"
          />
        </View>

        <Text style={styles.tagline}>
          Regístrate para ver <Text style={styles.taglineBold}>nuestras ofertas</Text>
        </Text>

        <Image
          source={require('../assets/licoreria-3.png')}
          style={styles.mainImg}
          resizeMode="cover"
        />

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

  topImgWrap: {
    width: 160,
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  topImg: { width: '100%', height: '100%' },

  tagline: {
    fontSize: 19,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 24,
    lineHeight: 26,
  },
  taglineBold: { fontWeight: '700', color: '#ffffff' },

  mainImg: {
    width: width,
    height: 220,
    marginBottom: 28,
  },

  form: { width: '100%', paddingHorizontal: 24, gap: 12 },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 2,
    paddingHorizontal: 16,
    paddingVertical: 18,
    fontSize: 13,
    color: '#000000',
    letterSpacing: 1.5,
  },
  btn: {
    backgroundColor: '#7a7820',
    borderRadius: 2,
    paddingVertical: 18,
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
