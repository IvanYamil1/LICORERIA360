import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { registerDevice } from '../services/api';

// Cómo se muestran las notificaciones cuando la app está en foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  } as any),
});

export function usePushRegistration() {
  useEffect(() => {
    (async () => {
      try {
        if (!Device.isDevice) return; // simulador no soporta push reales

        // Android requiere un canal de notificación
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.DEFAULT,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#7a7820',
          });
        }

        // Pedir permisos si aún no se otorgaron
        const { status: existing } = await Notifications.getPermissionsAsync();
        let granted = existing === 'granted';
        if (!granted) {
          const { status: req } = await Notifications.requestPermissionsAsync();
          granted = req === 'granted';
        }
        if (!granted) return;

        // Obtener Expo push token
        const tokenRes = await Notifications.getExpoPushTokenAsync();
        const token = tokenRes.data;
        if (!token) return;

        await registerDevice(token, Platform.OS as 'ios' | 'android' | 'web');
      } catch {
        // silencioso — push es nice to have, no debe romper la app si falla
      }
    })();
  }, []);
}
