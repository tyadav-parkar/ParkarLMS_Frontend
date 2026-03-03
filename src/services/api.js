import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
});

// ── Request interceptor — attach JWT token ────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — handle 401/403 globally ───────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {

        // ── FIX: Never redirect or clear token on auth-related routes ──────
        // When AuthContext fires loadUser() while /auth/callback is still
        // processing, it gets a 401 (token not stored yet). Without this
        // guard the interceptor deletes the token a split-second after
        // the callback stored it, causing the "token appears then vanishes" bug.
        const AUTH_ROUTES = ['/auth/callback', '/login', '/unauthorized'];
        const onAuthRoute = AUTH_ROUTES.some(
          (path) => window.location.pathname.startsWith(path)
        );

        if (!onAuthRoute) {
          // Only clear + redirect when we're on a real protected page
          localStorage.removeItem('token');
          window.location.href = '/login';
        }

        return Promise.reject(error);
      }

      if (error.response.status === 403) {
        // Same guard — don't redirect away from callback on 403 either
        const onAuthRoute = window.location.pathname.startsWith('/auth/callback');
        if (!onAuthRoute) {
          window.location.href = '/unauthorized';
        }
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default api;