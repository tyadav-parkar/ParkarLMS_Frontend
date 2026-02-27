import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';

const linkClass = ({ isActive, isOpen, isMobile }) =>
  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
    isActive
      ? 'bg-blue-100 text-blue-700'
      : 'text-gray-600 hover:bg-gray-100'
  } ${!isOpen && !isMobile ? 'justify-center' : ''}`;

const SectionLabel = ({ label, isOpen, isMobile }) => (
  <p className={`pt-4 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider transition-opacity duration-300 ${isOpen || isMobile ? 'px-4' : 'px-2 text-center'}`}>
    {isOpen || isMobile ? label : '•'}
  </p>
);

export default function Sidebar({ isOpen = true, toggleSidebar, isMobile = false }) {
  const { user, can, isRole } = useAuth();

  // Role-specific dashboard path
  const dashboardPath =
    user?.role === 'admin'
      ? '/admin/analytics'
      : user?.role === 'manager'
      ? '/manager/dashboard'
      : '/employee/dashboard';

  // On mobile, hide sidebar completely when closed
  if (isMobile && !isOpen) {
    return null;
  }

  return (
    <aside
      className={`fixed left-0 top-14 h-[calc(100vh-3.5rem)] bg-white border-r border-gray-200 flex flex-col flex-shrink-0 transition-all duration-300 z-30 ${
        isMobile
          ? isOpen ? 'w-56 shadow-xl' : 'w-0 overflow-hidden'
          : isOpen ? 'w-56' : 'w-16'
      }`}
    >
      {/* Toggle button - hide on mobile since it overlays */}
      {!isMobile && (
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-4 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:bg-gray-50 transition-colors z-40"
          title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <svg
            className={`w-4 h-4 text-gray-600 transition-transform duration-300 ${isOpen ? '' : 'rotate-180'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Role badge */}
      <div className={`px-4 py-3 border-b border-gray-100 transition-opacity duration-300 ${isOpen || isMobile ? '' : 'px-2'}`}>
        {isOpen || isMobile ? (
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
            {user?.role ?? '—'}
          </span>
        ) : (
          <span className="block text-center text-lg">👤</span>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden">

        {/* ── Shared: visible to ALL roles ─────────────────── */}
        <NavLink to={dashboardPath} className={({ isActive }) => linkClass({ isActive, isOpen, isMobile })}>
          <span className="text-lg">📊</span>
          {(isOpen || isMobile) && <span>Dashboard</span>}
        </NavLink>

        {/* ── Personal learning — all roles ────────────────── */}
        <SectionLabel label="My Learning" isOpen={isOpen} isMobile={isMobile} />
        <NavLink to="/employee/courses" className={({ isActive }) => linkClass({ isActive, isOpen, isMobile })}>
          <span className="text-lg">📚</span>
          {(isOpen || isMobile) && <span>My Courses</span>}
        </NavLink>
        <NavLink to="/employee/certificates" className={({ isActive }) => linkClass({ isActive, isOpen, isMobile })}>
          <span className="text-lg">🏆</span>
          {(isOpen || isMobile) && <span>Certificates</span>}
        </NavLink>
        <NavLink to="/employee/career-path" className={({ isActive }) => linkClass({ isActive, isOpen, isMobile })}>
          <span className="text-lg">🛤️</span>
          {(isOpen || isMobile) && <span>Career Path</span>}
        </NavLink>

        {/* ── Manager section — manager ONLY (not admin) ────── */}
        {isRole('manager') && (
          <>
            <SectionLabel label="Manager" isOpen={isOpen} isMobile={isMobile} />
            {/* Team Management — role-gated, no permission needed */}
            <NavLink to="/manager/team" className={({ isActive }) => linkClass({ isActive, isOpen, isMobile })}>
              <span className="text-lg">👥</span>
              {(isOpen || isMobile) && <span>My Team</span>}
            </NavLink>
            {/* Course Management — visible if course_view OR course_assign */}
            {(can('course_view') || can('course_assign')) && (
              <NavLink to="/manager/courses" className={({ isActive }) => linkClass({ isActive, isOpen, isMobile })}>
                <span className="text-lg">🎓</span>
                {(isOpen || isMobile) && <span>Course Management</span>}
              </NavLink>
            )}
            <NavLink to="/manager/certificates" className={({ isActive }) => linkClass({ isActive, isOpen, isMobile })}>
              <span className="text-lg">📜</span>
              {(isOpen || isMobile) && <span>Team Certs</span>}
            </NavLink>
          </>
        )}

        {/* ── Admin section — admin ONLY ────────────────────── */}
        {isRole('admin') && (
          <>
            <SectionLabel label="Admin" isOpen={isOpen} isMobile={isMobile} />
            {/* Analytics — always shown (admin superuser, no can() needed) */}
            <NavLink to="/admin/analytics" className={({ isActive }) => linkClass({ isActive, isOpen, isMobile })}>
              <span className="text-lg">📈</span>
              {(isOpen || isMobile) && <span>Analytics</span>}
            </NavLink>
            {/* Organization — always shown */}
            <NavLink to="/admin/organization" className={({ isActive }) => linkClass({ isActive, isOpen, isMobile })}>
              <span className="text-lg">🏢</span>
              {(isOpen || isMobile) && <span>Organization</span>}
            </NavLink>
            {/* Course Management — course_view OR course_edit OR course_assign */}
            {(can('course_view') || can('course_edit') || can('course_assign')) && (
              <NavLink to="/admin/courses" className={({ isActive }) => linkClass({ isActive, isOpen, isMobile })}>
                <span className="text-lg">🎓</span>
                {(isOpen || isMobile) && <span>Courses</span>}
              </NavLink>
            )}
            {/* Employee Management — always shown */}
            <NavLink to="/admin/employees" className={({ isActive }) => linkClass({ isActive, isOpen, isMobile })}>
              <span className="text-lg">🧑‍💼</span>
              {(isOpen || isMobile) && <span>Employees</span>}
            </NavLink>
            {/* Roles & Permissions — role_view OR role_edit */}
            {(can('role_view') || can('role_edit')) && (
              <NavLink to="/admin/roles" className={({ isActive }) => linkClass({ isActive, isOpen, isMobile })}>
                <span className="text-lg">🔑</span>
                {(isOpen || isMobile) && <span>Roles</span>}
              </NavLink>
            )}
            {/* User Management — user_view OR user_edit */}
            {(can('user_view') || can('user_edit')) && (
              <NavLink to="/admin/users" className={({ isActive }) => linkClass({ isActive, isOpen, isMobile })}>
                <span className="text-lg">👤</span>
                {(isOpen || isMobile) && <span>Users</span>}
              </NavLink>
            )}
            {/* Logger — always shown */}
            <NavLink to="/admin/logger" className={({ isActive }) => linkClass({ isActive, isOpen, isMobile })}>
              <span className="text-lg">📝</span>
              {(isOpen || isMobile) && <span>Logger</span>}
            </NavLink>
          </>
        )}

      </nav>
    </aside>
  );
}

