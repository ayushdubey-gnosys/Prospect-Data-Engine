import axios from 'axios';

const api = axios.create({
  // Default to a relative `/api` path in development so Vite can proxy requests
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Use the same `api` instance so the request goes through the dev proxy
        // and includes cookies (withCredentials is already enabled on `api`).
        await api.post('/auth/refresh-token', {}, { withCredentials: true });
        return api(originalRequest);
      } catch (refreshError) {
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;