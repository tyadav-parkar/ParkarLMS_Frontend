import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import NotificationBell from './NotificationBell';

function getInitials(user) {
  if (!user) return '??';
  const first = user.first_name?.[0] ?? '';
  const last = user.last_name?.[0] ?? '';
  return (first + last).toUpperCase();
}

export default function TopBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
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

  const fullName = user
    ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim()
    : '';

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-6 z-40">
      {/* Brand */}
      <span className="text-xl font-bold text-blue-600">Parkar LMS</span>

      {/* Right section */}
      <div className="flex items-center gap-4">
        <NotificationBell notifications={[]} unreadCount={0} markAllRead={() => {}} />

        {/* Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {/* Initials avatar */}
            <span className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-semibold flex items-center justify-center">
              {getInitials(user)}
            </span>
            <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
              {fullName}
            </span>
            <span className="text-gray-400 text-xs">▾</span>
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <button
                onClick={handleProfile}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                👤 My Profile
              </button>
              <hr className="my-1 border-gray-100" />
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
