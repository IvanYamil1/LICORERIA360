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
          nombre, correo, teléfono ni dirección de los usuarios que navegan el catálogo.
        </Text>

        <Text style={s.h1}>2. Datos almacenados localmente</Text>
        <Text style={s.p}>
          En tu dispositivo guardamos: confirmación de mayoría de edad, caché del
          catálogo para que la app funcione más rápido y, solo si eres administrador,
          tu sesión. Esta información no sale de tu dispositivo.
        </Text>

        <Text style={s.h1}>3. Notificaciones push</Text>
        <Text style={s.p}>
          Si aceptas recibir notificaciones, almacenamos un identificador anónimo
          (token de Expo) en nuestro servidor para enviarte avisos sobre nuevas ofertas.
          Este token no contiene datos personales y puedes revocarlo desde los ajustes
          de tu sistema operativo.
        </Text>

        <Text style={s.h1}>4. Reportes de errores</Text>
        <Text style={s.p}>
          Para mantener la aplicación estable utilizamos un servicio de reporte de
          errores (Sentry). Cuando ocurre una falla técnica se envía información
          anónima del incidente: tipo de error, modelo del dispositivo y versión del
          sistema operativo. Sin nombre ni datos personales.
        </Text>

        <Text style={s.h1}>5. Imágenes</Text>
        <Text style={s.p}>
          Las imágenes de productos se sirven desde Cloudinary. La aplicación no
          rastrea qué productos ves ni cuánto tiempo permaneces en cada pantalla.
        </Text>

        <Text style={s.h1}>6. Permisos del dispositivo</Text>
        <Text style={s.p}>
          - Notificaciones: opcional, solo si aceptas el aviso del sistema.{'\n'}
          - Galería de fotos: solo el panel de administración la usa para subir
          imágenes de productos. Los usuarios comunes no requieren ningún permiso.
        </Text>

        <Text style={s.h1}>7. Mayores de edad</Text>
        <Text style={s.p}>
          La aplicación está dirigida exclusivamente a personas mayores de 18 años. Al
          ingresar confirmaste tu mayoría de edad. No recopilamos información de
          personas menores de edad.
        </Text>

        <Text style={s.h1}>8. Compartir datos con terceros</Text>
        <Text style={s.p}>
          No vendemos ni compartimos datos con anunciantes. Los servicios técnicos que
          utilizamos son: Cloudinary (imágenes), MongoDB Atlas (catálogo), Render
          (hosting), Expo Push Notifications (avisos) y Sentry (reportes de errores).
          Cada uno recibe únicamente los datos mínimos necesarios para su función.
        </Text>

        <Text style={s.h1}>9. Eliminación de datos</Text>
        <Text style={s.p}>
          Como usuario común no creamos cuenta, por lo que no hay datos personales que
          eliminar. Para borrar la caché local, desinstala la aplicación. Si eres
          administrador y deseas eliminar tu cuenta, solicítalo en el establecimiento.
        </Text>

        <Text style={s.h1}>10. Cambios a esta política</Text>
        <Text style={s.p}>
          Podemos actualizar esta política. Si lo hacemos, la versión vigente estará
          siempre disponible dentro de la aplicación.
        </Text>

        <Text style={s.h1}>11. Contacto</Text>
        <Text style={s.p}>
          Para preguntas sobre privacidad, acércate al establecimiento.
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
