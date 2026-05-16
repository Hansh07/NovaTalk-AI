// api/index.js - Axios instance with auth interceptors
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexus_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('nexus_refresh');
        if (refreshToken) {
          const res = await axios.post('/api/auth/refresh', { refreshToken });
          localStorage.setItem('nexus_token', res.data.token);
          localStorage.setItem('nexus_refresh', res.data.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${res.data.token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('nexus_token');
        localStorage.removeItem('nexus_refresh');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
