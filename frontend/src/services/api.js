import axios from 'axios';

// Dynamic URL configuration:
// 1. If running on asset.milkmen.online (or any milkmen.online subdomain), always route to https://apiasset.milkmen.online/api/v1
// 2. If running locally on localhost/127.0.0.1, connect to http://localhost:5000/api/v1
// 3. Otherwise use VITE_API_BASE_URL or origin fallback
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location.hostname.includes('milkmen.online')) {
    return 'https://apiasset.milkmen.online/api/v1';
  }
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000/api/v1';
  }
  if (import.meta.env.VITE_API_BASE_URL) {
    if (typeof window !== 'undefined' && window.location.protocol === 'https:' && import.meta.env.VITE_API_BASE_URL.startsWith('http://localhost')) {
      return 'https://apiasset.milkmen.online/api/v1';
    }
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return `${window.location.origin}/api/v1`;
  }
  return '/api/v1';
};

export const API_BASE_URL = getApiBaseUrl();
export const BACKEND_URL =
  typeof window !== 'undefined' && window.location.hostname.includes('milkmen.online')
    ? 'https://apiasset.milkmen.online'
    : (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:5000'
        : (import.meta.env.VITE_BACKEND_URL || 'https://apiasset.milkmen.online'));

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
  console.log(`📡 [API Request] ${config.method?.toUpperCase()} ${config.baseURL || ''}${config.url}`, config.data || '');
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => {
    console.log(`✅ [API Success] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Resilient fallback only for local development (do not attempt insecure localhost calls from production HTTPS)
    const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    if (
      isLocalhost &&
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
        // Continue to reject with original error
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
