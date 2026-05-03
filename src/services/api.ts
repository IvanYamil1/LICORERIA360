import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cambia esta IP por la IP local de tu computadora cuando corras el servidor
export const API_URL = 'http://localhost:3001/api';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const loginAdmin = (username: string, password: string) =>
  api.post('/auth/login', { username, password });

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

// Promotions
export const getPromotions = () => api.get('/promotions');
export const createPromotion = (data: FormData) =>
  api.post('/promotions', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updatePromotion = (id: string, data: FormData) =>
  api.put(`/promotions/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deletePromotion = (id: string) => api.delete(`/promotions/${id}`);
