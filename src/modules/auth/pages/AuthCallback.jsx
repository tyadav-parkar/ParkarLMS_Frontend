import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@shared/services/api';
import { useAuth } from '../contexts/authContext';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const processCallback = async () => {
      // Clean URL — remove any accidental query params
      window.history.replaceState({}, document.title, window.location.pathname);

      try {
        // lms_access cookie was already set by microsoftCallback on the backend.
        // We call /auth/refresh here only to rotate the refresh token and ensure
        // a fresh lms_access cookie is in place before hitting /auth/me.
        await api.post('/auth/refresh');

        // Read session state and hydrate context before route navigation.
        const { data } = await api.get('/auth/session');
        if (!data?.authenticated) {
          throw new Error('Session not established after callback');
        }

        await refreshUser();
        const effectiveRole = data.user?.systemRole || data.user?.role;

        if (effectiveRole === 'admin') {
          navigate('/admin/analytics', { replace: true });
        } else if (effectiveRole === 'manager') {
          navigate('/manager/dashboard', { replace: true });
        } else {
          navigate('/employee/dashboard', { replace: true });
        }
      } catch (err) {
        const status = err?.response?.status;
        if (status !== 401 && status !== 403) {
          console.error('[AuthCallback] SSO failed:', status);
        }
        navigate('/login?error=auth_failed', { replace: true });
      }
    };

    processCallback();
  }, [navigate, refreshUser]);

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
