import axios from 'axios';

const api = axios.create({
  baseURL:         import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout:         30000,
  withCredentials: true,
});

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

let isRefreshing    = false;
let failedQueue     = [];

function processQueue(error, token = null) {
  failedQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve(token);
    }
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const AUTH_ROUTES = ['/auth/callback', '/login', '/unauthorized'];
    const onAuthRoute  = AUTH_ROUTES.some((p) => window.location.pathname.startsWith(p));

    if (error.response?.status === 401 && !originalRequest._retry && !onAuthRoute) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing            = true;

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newToken = data.token;
        localStorage.setItem('token', newToken);
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        originalRequest.headers.Authorization     = `Bearer ${newToken}`;

        processQueue(null, newToken);
        return api(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 403 && !onAuthRoute) {
      window.location.href = '/unauthorized';
    }

    return Promise.reject(error);
  }
);

export default api;