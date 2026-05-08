import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform,
  StatusBar, Dimensions, Image,
} from 'react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function RegisterScreen() {
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
          Descubre <Text style={styles.taglineBold}>nuestras ofertas</Text>
        </Text>

        <Image
          source={require('../assets/licoreria-3.png')}
          style={styles.mainImg}
          resizeMode="cover"
        />

        <View style={styles.form}>
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

  form: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 24,
    gap: 12,
    justifyContent: 'center',
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
