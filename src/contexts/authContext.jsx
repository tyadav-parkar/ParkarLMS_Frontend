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
  const [user, setUser]                   = useState(null);
  const [permissions, setPermissions]     = useState([]);
  const [roles, setRoles]                 = useState([]);
  const [isLoading, setIsLoading]         = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ── CHANGE (v2) ─────────────────────────────────────────────────────────
  // Added systemRole state.
  // Problem: Sidebar used user.role for isRole() checks. When a manager was
  // assigned a custom role, user.role became the custom role name and isRole('manager')
  // returned false, hiding manager sidebar sections.
  // Fix: Store systemRole separately so it's always available for section visibility.
  const [systemRole, setSystemRole]       = useState(null); // ← NEW

  // ── Load user from /auth/me using stored token ────────────────────────
  const loadUser = useCallback(async () => {
    // ── FIX: Skip loadUser entirely on the callback route ─────────────────
    // AuthCallback handles its own /auth/me. If we fire here in parallel
    // we race against localStorage.setItem(), get a 401, and the interceptor
    // deletes the token a split-second after the callback stored it.
    if (window.location.pathname === '/auth/callback') {
      setIsLoading(false);
      return;
    }

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

      // ── NEW: store systemRole from API response ──────────────────────────
      // /auth/me now returns user.systemRole (set by buildRolePayload in authController)
      setSystemRole(data.user?.systemRole || null);

    } catch {
      localStorage.removeItem('token');
      setUser(null);
      setPermissions([]);
      setRoles([]);
      setSystemRole(null); // ← NEW: clear on error
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
    setSystemRole(null); // ← NEW: clear systemRole on logout
    setIsAuthenticated(false);
    api.post('/auth/logout').catch(() => {});
  }, []);

  // ── can(permission) ───────────────────────────────────────────────────
  // ── CHANGE (v2) ────────────────────────────────────────────────────────
  // Now also checks systemRole === 'admin' for the superuser bypass.
  // Before: only checked if 'admin' was in roles array.
  // After: checks both roles array AND systemRole for robustness.
  const can = useCallback(
    (permission) => {
      if (!user) return false;
      const userRoles = user.roles || [user.role];
      // Admin superuser: check both roles array and systemRole
      if (userRoles.includes('admin') || systemRole === 'admin') return true; // ← CHANGE: added systemRole check
      return Array.isArray(permissions) && permissions.includes(permission);
    },
    [user, permissions, systemRole] // ← CHANGE: added systemRole to deps
  );

  // ── isRole(...roles) ──────────────────────────────────────────────────
  // ── CHANGE (v2) ────────────────────────────────────────────────────────
  // Now ALSO checks systemRole so that a manager with a custom role still
  // passes isRole('manager') → their manager sidebar sections stay visible.
  //
  // Before: only checked user.roles array.
  // After:  checks user.roles array FIRST, then falls back to systemRole.
  //
  // Example: manager assigned custom role "Senior Trainer":
  //   user.roles = ['Senior Trainer']
  //   systemRole = 'manager'
  //   isRole('manager') → false (roles check) → true (systemRole check) ✓
  const isRole = useCallback(
    (...rolesToCheck) => {
      if (!user) return false;
      const userRoles = user.roles || [user.role];

      // Check full M2M roles array first
      if (rolesToCheck.some((r) => userRoles.includes(r))) return true;

      // ── NEW: fallback to systemRole for custom-role users ────────────────
      if (systemRole && rolesToCheck.includes(systemRole)) return true;

      return false;
    },
    [user, systemRole] // ← CHANGE: added systemRole to deps
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
        systemRole,   // ← NEW: expose systemRole for components that need it
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