import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

/**
 * Landing page for the backend SSO redirect.
 * URL: /auth/callback?token=<JWT>
 *
 * Pattern: store token → call /auth/me directly → redirect by role.
 * We don't rely on AuthContext state settling asynchronously.
 */
export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    async function processCallback() {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');

      if (!token) {
        navigate('/login?error=no_token', { replace: true });
        return;
      }

      // Store token
      localStorage.setItem('token', token);

      // Remove token from URL bar (security hygiene)
      window.history.replaceState({}, document.title, window.location.pathname);

      try {
        // Fetch user directly — token is now in localStorage so interceptor picks it up
        const { data } = await api.get('/auth/me');
        const role = data.user?.role;

        if (role === 'admin') {
          navigate('/admin/analytics', { replace: true });
        } else if (role === 'manager') {
          navigate('/manager/dashboard', { replace: true });
        } else {
          navigate('/employee/dashboard', { replace: true });
        }
      } catch {
        // Token rejected by backend
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
