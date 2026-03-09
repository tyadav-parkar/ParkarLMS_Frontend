import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

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

      localStorage.setItem('token', token);
      window.history.replaceState({}, document.title, window.location.pathname);

      try {
        const { data } = await api.get('/auth/me');
        const effectiveRole = data.user?.systemRole || data.user?.role;

        if (effectiveRole === 'admin') {
          navigate('/admin/analytics',    { replace: true });
        } else if (effectiveRole === 'manager') {
          navigate('/manager/dashboard',  { replace: true });
        } else {
          navigate('/employee/dashboard', { replace: true });
        }
      } catch (err) {
        console.error('[AuthCallback] /auth/me failed:', err?.response?.status);
        localStorage.removeItem('token');
        navigate('/login?error=auth_failed', { replace: true });
      }
    }

    processCallback();
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