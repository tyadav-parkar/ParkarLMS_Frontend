import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [systemRole, setSystemRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loadUser = useCallback(async () => {
    if (window.location.pathname === '/auth/callback') {
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem('token');

    // No token at all — nothing to restore, skip the API call
    if (!token) {
      setIsLoading(false);
      return;
    }

    // Token exists (even if expired) — always attempt /auth/me.
    // If the access token is expired the Axios 401 interceptor in api.js
    // will call /auth/refresh using the httpOnly cookie, save the new
    // access token, and retry this request transparently.
    // Only if refresh also fails does the interceptor redirect to /login.
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      setPermissions(data.permissions || []);
      setRoles(data.user?.roles || [data.user?.role].filter(Boolean));
      setSystemRole(data.user?.systemRole || null);
      setIsAuthenticated(true);
    } catch {
      // Refresh also failed — clear everything and let ProtectedRoute redirect
      localStorage.removeItem('token');
      setUser(null);
      setPermissions([]);
      setRoles([]);
      setSystemRole(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(
    (token) => {
      localStorage.setItem('token', token);
      loadUser();
    },
    [loadUser]
  );

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    setPermissions([]);
    setRoles([]);
    setSystemRole(null);
    setIsAuthenticated(false);
    api.post('/auth/logout').catch(() => {});
  }, []);

  const can = useCallback(
    (permission) => {
      if (!user) return false;
      const userRoles = user.roles || [user.role];
      if (userRoles.includes('admin') || systemRole === 'admin') return true;
      return Array.isArray(permissions) && permissions.includes(permission);
    },
    [user, permissions, systemRole]
  );

  const isRole = useCallback(
    (...rolesToCheck) => {
      if (!user) return false;
      const userRoles = user.roles || [user.role];
      if (rolesToCheck.some((r) => userRoles.includes(r))) return true;
      if (systemRole && rolesToCheck.includes(systemRole)) return true;
      return false;
    },
    [user, systemRole]
  );

  const refreshUser = useCallback(() => {
    loadUser();
  }, [loadUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        permissions,
        roles,
        systemRole,
        isLoading,
        isAuthenticated,
        login,
        logout,
        can,
        isRole,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}