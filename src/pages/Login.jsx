import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import api from '../services/api';

export default function Login() {
  const { isAuthenticated, isLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // While auth state is being resolved, show nothing — prevents login page flash
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  // Already authenticated — redirect immediately, no flash
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleLogin() {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/auth/microsoft/login');
      const { authUrl } = response.data;
      window.location.href = authUrl;
    } catch {
      setError('Failed to start sign-in. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-10 flex flex-col items-center gap-6">
        {/* Logo / title */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-blue-600 tracking-tight">Parker LMS</h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">Internal Employee Portal</p>
        </div>

        {/* Divider */}
        <hr className="w-full border-gray-100" />

        {/* Description */}
        <p className="text-gray-600 text-sm text-center">
          Sign in with your Parkar account to access your learning dashboard, courses, and career path.
        </p>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm text-center bg-red-50 px-4 py-2 rounded-lg w-full">
            {error}
          </p>
        )}

        {/* Sign-in button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Redirecting to Microsoft...
            </>
          ) : (
            <>Sign in with Parkar Account 🏢</>
          )}
        </button>

        {/* Footer */}
        <p className="text-xs text-gray-400 text-center">
          @parkar.in accounts only &bull; Azure AD Authentication
        </p>
      </div>
    </div>
  );
}
