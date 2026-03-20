import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@auth';
import NotificationBell from './NotificationBell';

function getInitials(user) {
  if (!user) return '??';
  const first = user.first_name?.[0] ?? '';
  const last  = user.last_name?.[0]  ?? '';
  return (first + last).toUpperCase();
}

export default function TopBar({ toggleSidebar, isSidebarOpen }) {
  const { user, logout, isRole } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleMouseDown(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, []);

  function handleProfile() {
    setDropdownOpen(false);
    navigate('/profile');
  }

  function handleLogout() {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  }

  function handleLogger() {
    setDropdownOpen(false);
    navigate('/admin/logger');
  }

  const fullName = user ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() : '';

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-[#1e2d42] border-b border-white/10 shadow-md flex items-center justify-between px-5 z-40">

      {/* ── Left: hamburger + logo ──────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          title={isSidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}
        >
          {isSidebarOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        <button
          onClick={() => navigate('/')}
          className="flex items-center hover:opacity-80 transition-opacity"
          title="Go to Dashboard"
        >
          <img src="/src/assets/Parkar_logo.svg" alt="Parkar LMS" className="h-7 w-auto" />
        </button>
      </div>

      {/* ── Right: notification + user dropdown ────────────────────────── */}
      <div className="flex items-center gap-3">
        <NotificationBell notifications={[]} unreadCount={0} markAllRead={() => {}} />

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 transition-colors"
          >
            {/* Avatar */}
            <span className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 text-[#0f2236] text-xs font-bold flex items-center justify-center flex-shrink-0">
              {getInitials(user)}
            </span>
            <div className="flex flex-col items-start leading-none">
              <span className="text-sm font-semibold text-white max-w-[110px] truncate">{fullName}</span>
              <span className="text-[10px] text-white/40 mt-0.5">{user?.email ?? ''}</span>
            </div>
            <svg
              className={`w-3.5 h-3.5 text-white/40 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown panel */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[#253347] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">

              {/* User info header */}
              <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
                <span className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 text-[#0f2236] text-sm font-bold flex items-center justify-center flex-shrink-0">
                  {getInitials(user)}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{fullName}</p>
                  <p className="text-[11px] text-white/40 truncate">{user?.email ?? ''}</p>
                </div>
              </div>

              {/* Menu items */}
              <div className="py-1.5">
                <button
                  onClick={handleProfile}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  My Profile
                </button>
                {isRole('admin') && (
                  <button
                    onClick={handleLogger}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <span className="text-base flex-shrink-0">📝</span>
                    Logger
                  </button>
                )}
              </div>

              <div className="border-t border-white/10 py-1.5">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </header>
  );
}

