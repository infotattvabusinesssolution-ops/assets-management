import axios from 'axios';

// Dynamic URL configuration to support both Local Development and Live Server environments:
// 1. Uses VITE_API_BASE_URL if set in .env
// 2. Uses relative '/api/v1' in local dev mode (via Vite proxy)
// 3. Defaults to live server URL: https://apiasset.milkmen.online/api/v1

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return `${window.location.origin}/api/v1`;
  }
  return '/api/v1';
};

export const API_BASE_URL = getApiBaseUrl();
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ||
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000');

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
  async (error) => {
    const originalRequest = error.config;

    // Resilient fallback: if deployed/remote server encounters an error (500, 502, 503, 504, 404 or network failure),
    // automatically fall back to local backend so developer workflows and dynamic actions never fail.
    if (
      originalRequest &&
      !originalRequest._retriedLocal &&
      (!error.response || error.response.status >= 500 || error.response.status === 404)
    ) {
      originalRequest._retriedLocal = true;
      try {
        const cleanPath = (originalRequest.url || '')
          .replace(/^https?:\/\/[^\/]+\/api\/v1/, '')
          .replace(/^\/api\/v1/, '');
        const localUrl = `http://localhost:5000/api/v1${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;
        const localResponse = await axios({
          ...originalRequest,
          url: localUrl,
          baseURL: ''
        });
        return localResponse.data;
      } catch (localErr) {
        // If local is also unavailable, continue to reject with original error
      }
    }

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
