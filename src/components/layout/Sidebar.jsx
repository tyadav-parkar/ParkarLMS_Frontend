import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';
import { getExtraNavItems } from '../../utils/navUtils';

const linkClass = ({ isActive, isOpen, isMobile }) =>
  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
    isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
  } ${!isOpen && !isMobile ? 'justify-center' : ''}`;

function SectionLabel({ label, isOpen, isMobile }) {
  if (isOpen || isMobile) {
    return (
      <p className="pt-4 pb-1 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
        {label}
      </p>
    );
  }
  return <p className="pt-4 pb-1 px-2 text-center text-xs text-gray-300">•</p>;
}

function NavItem({ to, icon, label, isOpen, isMobile }) {
  return (
    <NavLink to={to} className={({ isActive }) => linkClass({ isActive, isOpen, isMobile })}>
      <span className="text-lg flex-shrink-0">{icon}</span>
      {(isOpen || isMobile) && <span>{label}</span>}
    </NavLink>
  );
}

export default function Sidebar({ isOpen = true, toggleSidebar, isMobile = false }) {
  const { user, permissions, can, isRole, systemRole } = useAuth();

  const effectiveRole = systemRole || user?.role;

  const extraNavItems =
    effectiveRole !== 'admin'
      ? getExtraNavItems({ permissions, systemRole: effectiveRole })
      : [];

  if (isMobile && !isOpen) return null;

  return (
    <aside
      className={`fixed left-0 top-14 h-[calc(100vh-3.5rem)] bg-white border-r border-gray-200
        flex flex-col flex-shrink-0 transition-all duration-300 z-30 ${
          isMobile
            ? isOpen
              ? 'w-56 shadow-xl'
              : 'w-0 overflow-hidden'
            : isOpen
            ? 'w-56'
            : 'w-16'
        }`}
    >
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

      <div className={`px-4 py-3 border-b border-gray-100 ${!isOpen && !isMobile ? 'px-2' : ''}`}>
        {isOpen || isMobile ? (
          <div className="flex flex-col gap-1">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded w-fit">
              {effectiveRole ?? '—'}
            </span>
            {[
              ...new Set(
                (user?.roles || []).filter(
                  (r) =>
                    r !== effectiveRole && !['admin', 'manager', 'employee'].includes(r.toLowerCase())
                )
              ),
            ].map((r) => (
              <span
                key={r}
                className="inline-block text-xs font-medium uppercase tracking-widest text-purple-600 bg-purple-50 px-2 py-0.5 rounded w-fit"
              >
                {r}
              </span>
            ))}
          </div>
        ) : (
          <span className="block text-center text-lg">👤</span>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {isRole('employee') && !isRole('manager') && !isRole('admin') && (
          <>
            <NavItem to="/employee/dashboard"    icon="📊" label="Dashboard"    isOpen={isOpen} isMobile={isMobile} />
            <NavItem to="/employee/career-path"  icon="🛤️" label="Career Path"  isOpen={isOpen} isMobile={isMobile} />
            <NavItem to="/employee/courses"      icon="📚" label="My Courses"   isOpen={isOpen} isMobile={isMobile} />
            <NavItem to="/employee/certificates" icon="🏆" label="Certificates" isOpen={isOpen} isMobile={isMobile} />
            {extraNavItems.length > 0 && (
              <>
                <SectionLabel label="Extra Access" isOpen={isOpen} isMobile={isMobile} />
                {extraNavItems.map((item) => (
                  <NavItem key={item.to} to={item.to} icon={item.icon} label={item.label} isOpen={isOpen} isMobile={isMobile} />
                ))}
              </>
            )}
          </>
        )}

        {isRole('manager') && !isRole('admin') && (
          <>
            <NavItem to="/manager/dashboard"    icon="📊" label="Dashboard"         isOpen={isOpen} isMobile={isMobile} />
            <NavItem to="/employee/career-path" icon="🛤️" label="Career Path"       isOpen={isOpen} isMobile={isMobile} />
            <NavItem to="/manager/team"         icon="👥" label="My Team"            isOpen={isOpen} isMobile={isMobile} />
            {(can('course_view') || can('course_assign') || can('course_edit')) && (
              <NavItem to="/manager/courses"    icon="🎓" label="Course Management" isOpen={isOpen} isMobile={isMobile} />
            )}
            <NavItem to="/manager/certificates" icon="🏆" label="Certificates"      isOpen={isOpen} isMobile={isMobile} />
            {extraNavItems.length > 0 && (
              <>
                <SectionLabel label="Extra Access" isOpen={isOpen} isMobile={isMobile} />
                {extraNavItems.map((item) => (
                  <NavItem key={item.to} to={item.to} icon={item.icon} label={item.label} isOpen={isOpen} isMobile={isMobile} />
                ))}
              </>
            )}
          </>
        )}

        {isRole('admin') && (
          <>
            <NavItem to="/admin/analytics"    icon="📈"  label="Analytics"           isOpen={isOpen} isMobile={isMobile} />
            <NavItem to="/admin/organization" icon="🏢"  label="Organization"        isOpen={isOpen} isMobile={isMobile} />
            {/* <NavItem to="/admin/employees"    icon="🧑‍💼" label="Employees"           isOpen={isOpen} isMobile={isMobile} /> */}
            <NavItem to="/admin/users"        icon="👤"  label="User Management"     isOpen={isOpen} isMobile={isMobile} />
            <NavItem to="/admin/courses"      icon="🎓"  label="Course Management"   isOpen={isOpen} isMobile={isMobile} />
            <NavItem to="/admin/roles"        icon="🔑"  label="Roles & Permissions" isOpen={isOpen} isMobile={isMobile} />
            <NavItem to="/admin/logger"       icon="📝"  label="Logger"              isOpen={isOpen} isMobile={isMobile} />
          </>
        )}
      </nav>
    </aside>
  );
}