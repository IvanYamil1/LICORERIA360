import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PrivacyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={[s.brandBar, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={s.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={s.brandTitle}>Política de Privacidad</Text>
      </View>
      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={s.update}>Última actualización: 7 de mayo de 2026</Text>

        <Text style={s.h1}>1. Información que recopilamos</Text>
        <Text style={s.p}>
          Esta aplicación es un catálogo informativo de Licorería 369. No recopilamos
          datos personales identificables como nombre, correo o teléfono de los usuarios
          que solo navegan el catálogo.
        </Text>

        <Text style={s.h1}>2. Datos técnicos</Text>
        <Text style={s.p}>
          Para el correcto funcionamiento podemos almacenar localmente en tu dispositivo:
          confirmación de mayoría de edad, sesión de administrador (si aplica) y caché
          de búsqueda. Estos datos no salen de tu dispositivo.
        </Text>

        <Text style={s.h1}>3. Imágenes y contenido</Text>
        <Text style={s.p}>
          Las imágenes de productos se sirven desde Cloudinary. La aplicación no rastrea
          tu comportamiento de navegación dentro del catálogo.
        </Text>

        <Text style={s.h1}>4. Permisos del dispositivo</Text>
        <Text style={s.p}>
          Solo el panel de administración solicita acceso a la galería de fotos para
          subir imágenes de productos. Los usuarios comunes no necesitan otorgar permisos.
        </Text>

        <Text style={s.h1}>5. Mayores de edad</Text>
        <Text style={s.p}>
          La aplicación está dirigida exclusivamente a personas mayores de 18 años. Al
          ingresar confirmaste tu mayoría de edad. No recopilamos información de
          personas menores de edad.
        </Text>

        <Text style={s.h1}>6. Compartir datos con terceros</Text>
        <Text style={s.p}>
          No compartimos datos con terceros con fines publicitarios. Los servicios
          técnicos utilizados (Cloudinary, MongoDB Atlas, hosting del backend) almacenan
          únicamente los datos del catálogo y registros operativos.
        </Text>

        <Text style={s.h1}>7. Cambios a esta política</Text>
        <Text style={s.p}>
          Podemos actualizar esta política. Si lo hacemos, la versión vigente estará
          siempre disponible dentro de la aplicación.
        </Text>

        <Text style={s.h1}>8. Contacto</Text>
        <Text style={s.p}>
          Para preguntas sobre privacidad, escríbenos a:{'\n'}
          <Text style={s.bold}>contacto@licoreria369.com</Text>
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fbf8ee' },
  brandBar: {
    backgroundColor: '#fff',
    paddingBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1, borderBottomColor: '#e6dfc4',
  },
  brandTitle: { fontSize: 18, fontWeight: '800', color: '#1a1a14', textAlign: 'center', paddingHorizontal: 60 },
  backBtn: {
    position: 'absolute', left: 14, bottom: 12,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#111',
    justifyContent: 'center', alignItems: 'center',
  },
  backArrow: { fontSize: 22, color: '#fff', fontWeight: '700', lineHeight: 24, marginTop: -2 },
  scroll: { padding: 22 },
  update: { fontSize: 12, color: '#9a9079', marginBottom: 18, fontStyle: 'italic' },
  h1: { fontSize: 16, fontWeight: '800', color: '#1a1a14', marginTop: 18, marginBottom: 6 },
  p: { fontSize: 14, lineHeight: 21, color: '#3a3a30' },
  bold: { fontWeight: '700' },
});
