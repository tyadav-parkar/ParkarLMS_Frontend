import { NavLink } from 'react-router-dom';
import { useAuth } from '@auth';
import { getExtraNavItems } from '../../utils/navUtils';

const linkClass = ({ isActive, isOpen, isMobile }) =>
  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
    isActive
      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
      : 'text-white/60 hover:bg-white/10 hover:text-white'
  } ${!isOpen && !isMobile ? 'justify-center' : ''}`;

function SectionLabel({ label, isOpen, isMobile }) {
  if (isOpen || isMobile) {
    return (
      <p className="pt-4 pb-1 px-3 text-[10px] font-semibold text-white/30 uppercase tracking-widest">
        {label}
      </p>
    );
  }
  return <p className="pt-4 pb-1 px-2 text-center text-xs text-white/20">•</p>;
}

function NavItem({ to, icon, label, isOpen, isMobile }) {
  return (
    <NavLink to={to} className={({ isActive }) => linkClass({ isActive, isOpen, isMobile })}>
      <span className="text-base flex-shrink-0">{icon}</span>
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
      className={`fixed left-0 top-14 h-[calc(100vh-3.5rem)] bg-[#1e2d42] border-r border-white/10
        flex flex-col flex-shrink-0 transition-all duration-300 z-30 ${
          isMobile ? (isOpen ? 'w-56 shadow-xl' : 'w-0 overflow-hidden') : isOpen ? 'w-56' : 'w-16'
        }`}
    >
      {/* Collapse toggle */}
      {!isMobile && (
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-4 bg-[#253347] border border-white/15 rounded-full p-1 shadow-md hover:bg-[#2e3f57] transition-colors z-40"
          title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <svg
            className={`w-3.5 h-3.5 text-white/60 transition-transform duration-300 ${isOpen ? '' : 'rotate-180'}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Role badge */}
      <div className={`px-4 py-3 border-b border-white/10 ${!isOpen && !isMobile ? 'px-2' : ''}`}>
        {isOpen || isMobile ? (
          <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-cyan-300 bg-cyan-500/15 border border-cyan-500/25 px-2.5 py-1 rounded-md">
            {effectiveRole ?? '—'}
          </span>
        ) : (
          <span className="block text-center text-base">👤</span>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto overflow-x-hidden">

        {isRole('employee') && !isRole('manager') && !isRole('admin') && (
          <>
            <NavItem to="/employee/dashboard"  icon="📊" label="Dashboard"   isOpen={isOpen} isMobile={isMobile} />
            <NavItem to="/employee/career-path" icon="🛤️" label="Career Path" isOpen={isOpen} isMobile={isMobile} />
            <NavItem to="/employee/courses"    icon="📚" label="My Courses"  isOpen={isOpen} isMobile={isMobile} />
            <NavItem to="/employee/certificates" icon="🏆" label="My Certificates" isOpen={isOpen} isMobile={isMobile} />
            {extraNavItems.length > 0 && (
              <>
                <SectionLabel label="Extra Access" isOpen={isOpen} isMobile={isMobile} />
                {extraNavItems.map((item) => (
                  <NavItem key={item.to} {...item} isOpen={isOpen} isMobile={isMobile} />
                ))}
              </>
            )}
          </>
        )}

        {isRole('manager') && !isRole('admin') && (
          <>
            <NavItem to="/manager/dashboard"  icon="📊" label="Dashboard"         isOpen={isOpen} isMobile={isMobile} />
            <NavItem to="/employee/career-path" icon="🛤️" label="Career Path"     isOpen={isOpen} isMobile={isMobile} />
            <NavItem to="/manager/team"       icon="👥" label="My Team"           isOpen={isOpen} isMobile={isMobile} />
            {(can('course_view') || can('course_assign') || can('course_edit')) && (
              <NavItem to="/manager/courses"  icon="🎓" label="Course Management" isOpen={isOpen} isMobile={isMobile} />
            )}
            <NavItem to="/manager/certificates" icon="🏆" label="My Certificates"   isOpen={isOpen} isMobile={isMobile} />
            {extraNavItems.length > 0 && (
              <>
                <SectionLabel label="Extra Access" isOpen={isOpen} isMobile={isMobile} />
                {extraNavItems.map((item) => (
                  <NavItem key={item.to} {...item} isOpen={isOpen} isMobile={isMobile} />
                ))}
              </>
            )}
          </>
        )}

        {isRole('admin') && (
          <>
            <NavItem to="/admin/analytics"    icon="📈" label="Dashboard"          isOpen={isOpen} isMobile={isMobile} />
            <NavItem to="/admin/users"        icon="👤" label="User Management"    isOpen={isOpen} isMobile={isMobile} />
            <NavItem to="/admin/courses"      icon="🎓" label="Course Management"  isOpen={isOpen} isMobile={isMobile} />
            <NavItem to="/admin/roles"        icon="🔑" label="Roles & Permissions" isOpen={isOpen} isMobile={isMobile} />
            <NavItem to="/admin/import"       icon="📥" label="Import Employees"   isOpen={isOpen} isMobile={isMobile} />
          </>
        )}
      </nav>
    </aside>
  );
}