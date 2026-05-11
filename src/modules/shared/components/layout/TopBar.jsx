import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@auth';
import { UserRound, ScrollText, LogOut } from 'lucide-react';
import NotificationBell from './NotificationBell';

function getInitials(user) {
  if (!user) return '??';
  const first = user.first_name?.[0] ?? '';
  const last  = user.last_name?.[0]  ?? '';
  return (first + last).toUpperCase();
}

export default function TopBar({ isSidebarOpen, isMobile, toggleSidebar }) {
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

  function handleProfile() { setDropdownOpen(false); navigate('/profile'); }
  function handleLogout()  { setDropdownOpen(false); logout(); navigate('/login'); }
  function handleLogger()  { setDropdownOpen(false); navigate('/admin/logger'); }

  const fullName = user ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() : '';
  const leftOffset = isMobile ? 'left-0 right-0' : isSidebarOpen ? 'left-56 right-0' : 'left-16 right-0';

  return (
    <header
      className={`${leftOffset} h-14 bg-white border-b border-gray-200 z-20
        transition-all duration-300 flex items-center justify-between px-4`}
    >
      {/* ── Left: mobile logo/hamburger ────────────────────────────── */}
      {isMobile ? (
        <button onClick={toggleSidebar} className="flex items-center gap-2" title="Toggle sidebar">
          <img src="/src/assets/Parkar_Logo.png" alt="Menu" className="h-7 w-auto" />
        </button>
      ) : (
        <div />
      )}

      {/* ── Right: bell + user dropdown ────────────────────────────── */}
      <div className="flex items-center gap-3">
        <NotificationBell notifications={[]} unreadCount={0} markAllRead={() => {}} />
        <div className="h-6 w-px bg-gray-200" />

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((p) => !p)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-gray-100
              border border-transparent hover:border-gray-200 transition-all duration-200"
          >
            <span className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500
              text-white text-xs font-bold flex items-center justify-center shadow-sm">
              {getInitials(user)}
            </span>

            {!isMobile && (
              <div className="flex flex-col items-start leading-none">
                <span className="text-sm font-semibold text-gray-800 max-w-[130px] truncate">
                  {fullName}
                </span>
                <span className="text-[11px] text-gray-400 mt-0.5">
                  {user?.email ?? ''}
                </span>
              </div>
            )}

            <svg
              className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">

              {/* User header */}
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 bg-gray-50">
                <span className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500
                  text-white text-sm font-bold flex items-center justify-center">
                  {getInitials(user)}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{fullName}</p>
                  <p className="text-[11px] text-gray-400 truncate">{user?.email ?? ''}</p>
                </div>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <button
                  onClick={handleProfile}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600
                    hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <UserRound className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  My Profile
                </button>

                {isRole('admin') && (
                  <button
                    onClick={handleLogger}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600
                      hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    <ScrollText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    Activity
                  </button>
                )}
              </div>

              <div className="border-t border-gray-100 py-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500
                    hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4 flex-shrink-0" />
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