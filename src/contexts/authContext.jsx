import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import api from '../services/api';

// ── Token helpers (not exported) ─────────────────────────────────────────
function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    // Base64url → Base64 → JSON
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function isTokenExpired(token) {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  return decoded.exp * 1000 < Date.now();
}

// ── Context ───────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ── Load user from /auth/me using stored token ────────────────────────
  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');

    if (!token || isTokenExpired(token)) {
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      setPermissions(data.permissions || []);
      setRoles(data.user?.roles || [data.user?.role].filter(Boolean));
      setIsAuthenticated(true);
    } catch {
      localStorage.removeItem('token');
      setUser(null);
      setPermissions([]);
      setRoles([]);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // ── login — store token then load user ────────────────────────────────
  const login = useCallback(
    (token) => {
      localStorage.setItem('token', token);
      loadUser();
    },
    [loadUser]
  );

  // ── logout — clear state + fire-and-forget server logout ─────────────
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    setPermissions([]);
    setRoles([]);
    setIsAuthenticated(false);
    api.post('/auth/logout').catch(() => {});
  }, []);

  // ── can(permission) ───────────────────────────────────────────────────
  const can = useCallback(
    (permission) => {
      if (!user) return false;
      // Admin (any of user's roles includes 'admin') — implicit superuser
      const userRoles = user.roles || [user.role];
      if (userRoles.includes('admin')) return true;
      return Array.isArray(permissions) && permissions.includes(permission);
    },
    [user, permissions]
  );

  // ── isRole(...roles) ──────────────────────────────────────────────────
  const isRole = useCallback(
    (...rolesToCheck) => {
      if (!user) return false;
      // Check against the full roles array (M2M — user may have multiple roles)
      const userRoles = user.roles || [user.role];
      return rolesToCheck.some((r) => userRoles.includes(r));
    },
    [user]
  );

  // ── refreshUser — force a fresh /auth/me ──────────────────────────────
  const refreshUser = useCallback(() => {
    loadUser();
  }, [loadUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        permissions,
        roles,
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
