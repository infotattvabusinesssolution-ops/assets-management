import axios from 'axios';

// Dynamic URL configuration to support both Local Development and Live Server environments:
// 1. Uses VITE_API_BASE_URL if set in .env
// 2. Uses relative '/api/v1' in local dev mode (via Vite proxy)
// 3. Defaults to live server URL: https://apiasset.milkmen.online/api/v1

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (import.meta.env.DEV) {
    return '/api/v1';
  }
  return 'https://apiasset.milkmen.online/api/v1';
};

export const API_BASE_URL = getApiBaseUrl();
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ||
  (import.meta.env.DEV ? 'http://localhost:5000' : 'https://apiasset.milkmen.online');

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fams_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('fams_token');
      localStorage.removeItem('fams_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error.response ? error.response.data : error);
  }
);
