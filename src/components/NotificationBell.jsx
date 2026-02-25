import { useState } from 'react';

/**
 * Phase 1 placeholder bell.
 * SSE-powered notifications will be wired in Phase 5.
 */
export default function NotificationBell({
  notifications = [],
  unreadCount = 0,
  markAllRead = () => {},
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors text-lg"
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-semibold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b">
            <span className="text-sm font-semibold text-gray-700">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={() => { markAllRead(); setOpen(false); }}
                className="text-xs text-blue-600 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Body */}
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-6">No notifications yet</p>
            ) : (
              notifications.map((n, i) => (
                <div key={i} className="px-4 py-3 border-b last:border-b-0 hover:bg-gray-50">
                  <p className="text-sm text-gray-700">{n.message || n.title}</p>
                  {n.time && (
                    <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
