import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, Dimensions, Platform, Image,
} from 'react-native';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <Image
        source={require('../assets/logo-licoreria.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Image
        source={require('../assets/licoreria-1.png')}
        style={styles.img}
        resizeMode="cover"
      />

      <TouchableOpacity
        style={styles.startBtn}
        onPress={() => router.replace('/register')}
        activeOpacity={0.75}
      >
        <Text style={styles.startText}>Comenzar</Text>
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

  logo: {
    width: width * 0.75,
    height: height * 0.28,
    marginBottom: 20,
  },

  img: {
    width: width * 0.82,
    height: height * 0.32,
    marginBottom: 24,
  },

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
