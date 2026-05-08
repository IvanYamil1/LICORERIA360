import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Resolución de API_URL en este orden:
// 1. EXPO_PUBLIC_API_URL — definido en .env del proyecto, se inyecta en build time.
//    Producción: EXPO_PUBLIC_API_URL=https://tu-backend.onrender.com/api
// 2. Web local: http://localhost:3001/api
// 3. Dev nativo (Expo Go): IP de tu PC vía Constants.expoConfig.hostUri
// 4. Fallback: LAN_IP hardcoded (cambia si tu IP cambia)
const LAN_IP = '192.168.100.6';
const PORT = 3001;

function resolveApiUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv;
  if (Platform.OS === 'web') return `http://localhost:${PORT}/api`;
  const hostUri =
    (Constants.expoConfig as any)?.hostUri ||
    (Constants as any).manifest?.debuggerHost ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;
  const devHost = typeof hostUri === 'string' ? hostUri.split(':')[0] : null;
  return `http://${devHost || LAN_IP}:${PORT}/api`;
}

export const API_URL = resolveApiUrl();

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const loginAdmin = (username: string, password: string) =>
  api.post('/auth/login', { username, password });
export const changePassword = (currentPassword: string, newPassword: string) =>
  api.post('/auth/change-password', { currentPassword, newPassword });
export const getAdmins = () => api.get('/auth/admins');
export const createAdmin = (username: string, password: string) =>
  api.post('/auth/admins', { username, password });
export const deleteAdmin = (id: string) => api.delete(`/auth/admins/${id}`);
export const deleteMyAccount = (password: string) =>
  api.post('/auth/me/delete', { password });

// Categories
export const getCategories = () => api.get('/categories');
export const getCategory = (id: string) => api.get(`/categories/${id}`);
export const createCategory = (data: FormData) =>
  api.post('/categories', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateCategory = (id: string, data: FormData) =>
  api.put(`/categories/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteCategory = (id: string) => api.delete(`/categories/${id}`);

// Products
export const getProducts = () => api.get('/products');
export const getProductsByCategory = (categoryId: string) =>
  api.get(`/products?category=${categoryId}`);
export const createProduct = (data: FormData) =>
  api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateProduct = (id: string, data: FormData) =>
  api.put(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteProduct = (id: string) => api.delete(`/products/${id}`);

// Notifications
export const registerDevice = (token: string, platform: 'ios' | 'android' | 'web') =>
  api.post('/notifications/register', { token, platform });
export const getDeviceCount = () => api.get('/notifications/devices');
export const sendPushNotification = (title: string, body: string) =>
  api.post('/notifications/send', { title, body });

// Promotions
export const getPromotions = () => api.get('/promotions');
export const createPromotion = (data: FormData) =>
  api.post('/promotions', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updatePromotion = (id: string, data: FormData) =>
  api.put(`/promotions/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deletePromotion = (id: string) => api.delete(`/promotions/${id}`);
