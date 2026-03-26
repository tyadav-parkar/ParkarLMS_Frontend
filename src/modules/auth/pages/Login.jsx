import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import api from '@shared/services/api';

import parkarBg from '../../../assets/Parkar_BackGround.png';

export default function Login() {
  const { isAuthenticated, isLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  if (isAuthenticated) return <Navigate to="/" replace />;

  async function handleLogin() {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/auth/microsoft/login');
      window.location.href = response.data.authUrl;
    } catch {
      setError('Failed to start sign-in. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-[#1e2d42]">

      {/* ── Left — 60% brand image ────────────────────────────────────── */}
      <div className="w-[50%] relative overflow-hidden">
        <img
          src={parkarBg}
          alt="Parkar"
          className="absolute inset-0 h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#1e2d42]/20" />
      </div>

      {/* ── Right — 40% login card ────────────────────────────────────── */}
      <div className="w-[50%] flex items-center justify-center p-5 bg-[#253347] relative">

        {/* Teal glow */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 bg-[#2a3a52] border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm p-10 flex flex-col items-center gap-6">

          <div className="text-center">
            <h1 className="text-2xl font-bold text-white tracking-tight">Parkar LMS</h1>
            <p className="text-white/40 text-sm mt-1">Internal Employee Portal</p>
          </div>

          <hr className="w-full border-white/10" />

          <p className="text-white/50 text-sm text-center">
            Sign in with your Parkar account to access your learning dashboard, courses, and career path.
          </p>

          {error && (
            <p className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-lg w-full">
              {error}
            </p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 disabled:opacity-60 disabled:cursor-not-allowed text-[#0f2236] font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm shadow-[0_4px_20px_rgba(0,210,200,0.25)]"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Redirecting to Microsoft...
              </>
            ) : (
              'Sign in with Parkar Account'
            )}
          </button>

          <p className="text-xs text-white/25 text-center">
            @parkar.in accounts only &bull; Azure AD Authentication
          </p>

        </div>
        
      </div>
    </div>
  );
}