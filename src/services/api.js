import axios from 'axios';
 
const api = axios.create({
  baseURL:         import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout:         30000,
  withCredentials: true, // sends lms_access + lms_refresh cookies automatically
});
 
// No request interceptor needed — browser attaches httpOnly cookies automatically.
// The lms_access cookie is scoped to /api so it goes on every API request.
// The lms_refresh cookie is scoped to /api/auth so it only goes to auth endpoints.
 
let isRefreshing = false;
let failedQueue  = [];
 
function processQueue(error) {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else       p.resolve();
  });
  failedQueue = [];
}
 
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isSessionCheck = originalRequest?.url?.includes('/auth/session');
 
    const AUTH_ROUTES = ['/auth/callback', '/login', '/unauthorized'];
    const onAuthRoute  = AUTH_ROUTES.some((p) => window.location.pathname.startsWith(p));
 
    if (error.response?.status === 401 && !originalRequest._retry && !onAuthRoute && !isSessionCheck) {
 
      if (isRefreshing) {
        // Queue this request — resolve it once refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }
 
      originalRequest._retry = true;
      isRefreshing            = true;
 
      try {
        // Browser sends lms_refresh cookie automatically.
        // Backend sets a new lms_access cookie in the response.
        // No token in body — nothing to read or store.
        await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
          {},
          { withCredentials: true }
        );
 
        processQueue(null);
        return api(originalRequest); // browser now has new lms_access cookie
 
      } catch (refreshError) {
        processQueue(refreshError);
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
 