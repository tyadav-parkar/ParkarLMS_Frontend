import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

/**
 * AuthCallback — OUTSIDE <AuthProvider> (see App.jsx).
 *
 * ── CRITICAL: No useAuth() here ──────────────────────────────────────────────
 * This component is rendered outside <AuthProvider> in the router tree.
 * Calling useAuth() outside the provider throws:
 *   "useAuth must be used inside <AuthProvider>"
 * That error is silently caught by our try/catch → navigate('/login') → loop.
 *
 * Flow:
 *  1. Extract JWT from URL query param (?token=...)
 *  2. Store in localStorage
 *  3. Strip token from URL bar (security)
 *  4. Call /auth/me to verify token — api.js interceptor attaches it
 *  5. Navigate to role-based dashboard
 *  6. AuthProvider mounts on destination page → loadUser() fires naturally
 *     Token is already in localStorage by then — no race condition.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    async function processCallback() {
      const params = new URLSearchParams(window.location.search);
      const token  = params.get('token');

      if (!token) {
        navigate('/login?error=no_token', { replace: true });
        return;
      }

      // ── 1. Store token BEFORE any API call ────────────────────────────────
      localStorage.setItem('token', token);
      console.log('Token in storage:', token);
      console.log('Parts:', token?.split('.').length); // must be 3
      console.log('Length:', token?.length);

      // ── 2. Strip token from URL bar ───────────────────────────────────────
      window.history.replaceState({}, document.title, window.location.pathname);

      try {
        // ── 3. Verify token via /auth/me ──────────────────────────────────
        // api.js request interceptor reads token from localStorage and
        // attaches Authorization: Bearer <token> automatically.
        // AuthProvider is NOT mounted here so there is zero race condition.
        const { data } = await api.get('/auth/me');

        // ── 4. Navigate by systemRole (falls back to role) ────────────────
        // Token is in localStorage. AuthProvider on the destination page
        // will call loadUser() → /auth/me → populate context normally.
        const effectiveRole = data.user?.systemRole || data.user?.role;

        if (effectiveRole === 'admin') {
          navigate('/admin/analytics',    { replace: true });
        } else if (effectiveRole === 'manager') {
          navigate('/manager/dashboard',  { replace: true });
        } else {
          navigate('/employee/dashboard', { replace: true });
        }

      } catch (err) {
        // Token rejected by backend — clear and send back to login
        console.error('[AuthCallback] /auth/me failed:', err?.response?.status, err?.response?.data);
        localStorage.removeItem('token');
        navigate('/login?error=auth_failed', { replace: true });
      }
    }

    processCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50 gap-4">
      <svg className="animate-spin h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      <p className="text-blue-700 font-semibold text-lg">Signing you in...</p>
      <p className="text-gray-400 text-sm">Please wait while we set up your session.</p>
    </div>
  );
}