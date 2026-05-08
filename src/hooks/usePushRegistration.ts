import { useEffect } from 'react';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { registerDevice } from '../services/api';

// Push notifications no funcionan en Expo Go desde SDK 53.
// Saltamos la importación entera de expo-notifications cuando estamos en Expo Go
// para evitar errores en desarrollo. En el build real (standalone) sí carga.
const isExpoGo = Constants.executionEnvironment === 'storeClient';

export function usePushRegistration() {
  useEffect(() => {
    if (isExpoGo) return;

    (async () => {
      try {
        if (!Device.isDevice) return; // simulador no soporta push reales

        // Carga dinámica para que Expo Go ni siquiera importe el módulo
        const Notifications = await import('expo-notifications');

        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
          } as any),
        });

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
