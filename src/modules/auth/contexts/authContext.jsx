/* eslint-disable react-refresh/only-export-components */

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '@shared/services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,            setUser]            = useState(null);
  const [permissions,     setPermissions]     = useState([]);
  const [roles,           setRoles]           = useState([]);
  const [systemRole,      setSystemRole]      = useState(null);
  const [isLoading,       setIsLoading]       = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const clearSession = useCallback(() => {
    setUser(null);
    setPermissions([]);
    setRoles([]);
    setSystemRole(null);
    setIsAuthenticated(false);
  }, []);

  const loadUser = useCallback(async (force = false) => {
    // AuthCallback handles its own auth flow — don't interfere
    if (!force && window.location.pathname === '/auth/callback') {
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await api.get('/auth/session');
      if (data.authenticated) {
        setUser(data.user);
        setPermissions(data.permissions || []);
        setRoles(data.user?.roles || [data.user?.role].filter(Boolean));
        setSystemRole(data.user?.systemRole || null);
        setIsAuthenticated(true);
      } else {
        clearSession();
      }
    } catch {
      clearSession();
    } finally {
      setIsLoading(false);
    }
  }, [clearSession]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const logout = useCallback(async () => {
    // Backend clears both lms_access and lms_refresh cookies
    await api.post('/auth/logout').catch(() => {});
    clearSession();
  }, [clearSession]);

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
    return loadUser(true);
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
