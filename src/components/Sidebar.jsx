import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? 'bg-blue-100 text-blue-700'
      : 'text-gray-600 hover:bg-gray-100'
  }`;

const SectionLabel = ({ label }) => (
  <p className="px-4 pt-4 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
    {label}
  </p>
);

export default function Sidebar() {
  const { user, can, isRole } = useAuth();

  // Role-specific dashboard path
  const dashboardPath =
    user?.role === 'admin'
      ? '/admin/analytics'
      : user?.role === 'manager'
      ? '/manager/dashboard'
      : '/employee/dashboard';

  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 h-full pt-14">
      {/* Role badge */}
      <div className="px-4 py-3 border-b border-gray-100">
        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
          {user?.role ?? '—'}
        </span>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">

        {/* ── Shared: visible to ALL roles ─────────────────── */}
        <NavLink to={dashboardPath} className={linkClass}>
          📊 Dashboard
        </NavLink>

        {/* ── Employee personal learning — all roles ────────── */}
        <SectionLabel label="My Learning" />
        {can('view_own_courses') && (
          <NavLink to="/employee/courses" className={linkClass}>
            📚 My Courses
          </NavLink>
        )}
        {can('view_own_certificates') && (
          <NavLink to="/employee/certificates" className={linkClass}>
            🏆 Certificates
          </NavLink>
        )}
        {can('view_own_career_path') && (
          <NavLink to="/employee/career-path" className={linkClass}>
            🛤️ Career Path
          </NavLink>
        )}

        {/* ── Manager section — manager + admin only ────────── */}
        {isRole('manager', 'admin') && (
          <>
            <SectionLabel label="Manager" />
            {can('view_team') && (
              <NavLink to="/manager/team" className={linkClass}>
                👥 My Team
              </NavLink>
            )}
            {can('assign_courses_team') && (
              <NavLink to="/manager/assignments" className={linkClass}>
                📋 Assign Courses
              </NavLink>
            )}
            {can('view_team_certificates') && (
              <NavLink to="/manager/certificates" className={linkClass}>
                📜 Team Certs
              </NavLink>
            )}
          </>
        )}

        {/* ── Admin section — admin only ────────────────────── */}
        {isRole('admin') && (
          <>
            <SectionLabel label="Admin" />
            {can('view_org_analytics') && (
              <NavLink to="/admin/analytics" className={linkClass}>
                📈 Analytics
              </NavLink>
            )}
            <NavLink to="/admin/organization" className={linkClass}>
              🏢 Organization
            </NavLink>
            {can('manage_courses') && (
              <NavLink to="/admin/courses" className={linkClass}>
                🎓 Courses
              </NavLink>
            )}
            {can('manage_employees') && (
              <NavLink to="/admin/employees" className={linkClass}>
                🧑‍💼 Employees
              </NavLink>
            )}
            {can('manage_roles') && (
              <NavLink to="/admin/roles" className={linkClass}>
                🔑 Roles
              </NavLink>
            )}
            {can('view_logs') && (
              <NavLink to="/admin/logger" className={linkClass}>
                📝 Logger
              </NavLink>
            )}
          </>
        )}

      </nav>
    </aside>
  );
}

