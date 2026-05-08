import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TermsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={[s.brandBar, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={s.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={s.brandTitle}>Términos y Condiciones</Text>
      </View>
      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={s.update}>Última actualización: 7 de mayo de 2026</Text>

        <Text style={s.h1}>1. Aceptación</Text>
        <Text style={s.p}>
          Al usar esta aplicación aceptas estos términos. Si no estás de acuerdo, no
          utilices la app.
        </Text>

        <Text style={s.h1}>2. Naturaleza del servicio</Text>
        <Text style={s.p}>
          Licorería 369 ofrece un catálogo informativo de productos. La aplicación no
          procesa ventas dentro de sí misma; los pedidos se realizan por canales externos
          (WhatsApp, teléfono, presencialmente).
        </Text>

        <Text style={s.h1}>3. Edad mínima</Text>
        <Text style={s.p}>
          Solo personas mayores de 18 años pueden utilizar esta aplicación. Está
          prohibido el acceso a menores de edad. La verificación de edad al ingresar es
          una declaración bajo tu responsabilidad.
        </Text>

        <Text style={s.h1}>4. Consumo responsable</Text>
        <Text style={s.p}>
          Promovemos el consumo moderado y responsable de bebidas alcohólicas. El
          consumo excesivo es nocivo para la salud. No conduzcas si has bebido. No
          compartas alcohol con menores de edad.
        </Text>

        <Text style={s.h1}>5. Precios y disponibilidad</Text>
        <Text style={s.p}>
          Los precios y la disponibilidad mostrados son referenciales y pueden cambiar
          sin previo aviso. La información definitiva se confirma al momento de la
          compra en nuestro establecimiento.
        </Text>

        <Text style={s.h1}>6. Propiedad intelectual</Text>
        <Text style={s.p}>
          Las marcas, imágenes y nombres de productos pertenecen a sus respectivos
          dueños. Su uso en este catálogo es únicamente con fines informativos.
        </Text>

        <Text style={s.h1}>7. Limitación de responsabilidad</Text>
        <Text style={s.p}>
          La aplicación se ofrece "tal cual". No garantizamos disponibilidad ininterrumpida
          ni la exactitud absoluta de toda la información. No somos responsables por
          decisiones tomadas en base al contenido aquí publicado.
        </Text>

        <Text style={s.h1}>8. Cambios a los términos</Text>
        <Text style={s.p}>
          Podemos modificar estos términos en cualquier momento. La versión vigente
          siempre estará disponible dentro de la aplicación.
        </Text>

        <Text style={s.h1}>9. Contacto</Text>
        <Text style={s.p}>
          Para dudas sobre estos términos, acércate al establecimiento.
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fbf8ee' },
  brandBar: {
    backgroundColor: '#fff', paddingBottom: 16,
    alignItems: 'center', justifyContent: 'center',
    borderBottomWidth: 1, borderBottomColor: '#e6dfc4',
  },
  brandTitle: { fontSize: 18, fontWeight: '800', color: '#1a1a14', textAlign: 'center', paddingHorizontal: 60 },
  backBtn: {
    position: 'absolute', left: 14, bottom: 12,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#111', justifyContent: 'center', alignItems: 'center',
  },
  backArrow: { fontSize: 22, color: '#fff', fontWeight: '700', lineHeight: 24, marginTop: -2 },
  scroll: { padding: 22 },
  update: { fontSize: 12, color: '#9a9079', marginBottom: 18, fontStyle: 'italic' },
  h1: { fontSize: 16, fontWeight: '800', color: '#1a1a14', marginTop: 18, marginBottom: 6 },
  p: { fontSize: 14, lineHeight: 21, color: '#3a3a30' },
  bold: { fontWeight: '700' },
});
