import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// For local dev: use your machine's LAN IP (not localhost) so the phone can reach it.
// e.g. API_URL=http://192.168.1.100:5000
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('role');
      await SecureStore.deleteItemAsync('isAdmin');
      await SecureStore.deleteItemAsync('displayName');
    }
    return Promise.reject(err);
  }
);

export { API_URL };
export default api;
