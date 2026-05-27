import { NavLink } from 'react-router-dom';
import { useAuth } from '@auth';
import { getExtraNavItems } from '../../utils/navUtils';
import {
  LayoutDashboard,
  Route,
  BookOpen,
  Award,
  Users,
  GraduationCap,
  BarChart2,
  UserCog,
  KeyRound,
  FileDown,
} from 'lucide-react';

const linkClass = ({ isActive, isOpen, isMobile }) =>
  `flex items-center gap-3 px-1 py-2.5 rounded-lg text-sm text-white/100 font-medium transition-all duration-200 ${
    isActive
      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
      : 'text-white/75 hover:bg-white/10 hover:text-white'
  } ${!isOpen && !isMobile ? 'justify-center px-0' : ''}`;

function SectionLabel({ label, isOpen, isMobile }) {
  if (isOpen || isMobile) {
    return (
      <p className="pt-4 pb-1 px-3 text-[10px] font-semibold text-white/80 uppercase tracking-widest">
        {label}
      </p>
    );
  }
  return (
    <div className="pt-4 pb-1 flex justify-center">
      <div className="w-4 h-px bg-white/15" />
    </div>
  );
}

function NavItem({ to, icon, label, isOpen, isMobile }) {
  return (
    <NavLink
      to={to}
      title={!isOpen && !isMobile ? label : undefined}
      className={({ isActive }) => linkClass({ isActive, isOpen, isMobile })}
    >
      <span className={`text-base flex-shrink-0 ${!isOpen && !isMobile ? 'text-lg' : ''}`}>{icon}</span>
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
      className={`fixed h-screen bg-[#1e2d42] border-r border-white/10
        flex flex-col flex-shrink-0 transition-all duration-300 z-30 ${
          isMobile
            ? isOpen
              ? 'w-52 shadow-2xl'
              : 'w-0 overflow-hidden'
            : isOpen
            ? 'w-52'
            : 'w-16'
        }`}
    >
      {/* ── Logo + Hamburger header (full height, takes the TopBar row) ── */}
      <div
        className={`h-14 flex items-center flex-shrink-0 border-b border-white/50 ${
          isOpen || isMobile ? 'px-4 justify-between' : 'px-0 justify-center'
        }`}
      >
        {/* Expanded state: full logo + hamburger close button */}
        {(isOpen || isMobile) ? (
          <>
            <img
              src="/src/assets/Parkar_logo.svg"
              alt="Parkar LMS"
              className="h-7 w-auto cursor-pointer hover:opacity-80 transition-opacity"
              onClick={toggleSidebar}
              title="Collapse sidebar"
            />
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition-colors flex-shrink-0"
              title="Collapse sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </>
        ) : (
          /* Collapsed state: small Parkar icon acts as hamburger */
          <button
            onClick={toggleSidebar}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/10 transition-colors"
            title="Expand sidebar"
          >
            <img
              src="/src/assets/Parkar_Logo.png"
              alt="Expand"
              className="object-contain"
              onError={(e) => {
                /* Fallback to hamburger if icon variant doesn't exist */
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement.innerHTML = `
                  <svg class="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>`;
              }}
            />
          </button>
        )}
      </div>

      {/* ── Nav links ───────────────────────────────────────────────────── */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">

        {isRole('employee') && !isRole('manager') && !isRole('admin') && (
          <>
            <NavItem to="/employee/dashboard"    icon={<LayoutDashboard size={18} />} label="Dashboard"        isOpen={isOpen} isMobile={isMobile} />
            <NavItem to="/employee/career-path"  icon={<Route size={18} />}           label="Career Path"      isOpen={isOpen} isMobile={isMobile} />
            <NavItem to="/employee/courses"      icon={<BookOpen size={18} />}        label="My Courses"       isOpen={isOpen} isMobile={isMobile} />
            <NavItem to="/employee/certificates" icon={<Award size={18} />}           label="My Certificates"  isOpen={isOpen} isMobile={isMobile} />
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
            <NavItem to="/manager/dashboard"    icon={<LayoutDashboard size={18} />} label="Dashboard"          isOpen={isOpen} isMobile={isMobile} />
            <NavItem to="/employee/career-path" icon={<Route size={18} />}           label="Career Path"        isOpen={isOpen} isMobile={isMobile} />
            <NavItem to="/manager/my-courses"   icon={<BookOpen size={18} />}        label="My Courses"          isOpen={isOpen} isMobile={isMobile} />
            <NavItem to="/manager/team"         icon={<Users size={18} />}           label="My Team"            isOpen={isOpen} isMobile={isMobile} />
            {(can('course_view') || can('course_assign') || can('course_edit')) && (
              <NavItem to="/manager/courses"    icon={<GraduationCap size={18} />}   label="Course Management"  isOpen={isOpen} isMobile={isMobile} />
            )}
            <NavItem to="/manager/certificates" icon={<Award size={18} />}           label="My Certificates"   isOpen={isOpen} isMobile={isMobile} />
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
            <NavItem to="/admin/analytics" icon={<BarChart2 size={18} />}      label="Dashboard"           isOpen={isOpen} isMobile={isMobile} />
            <NavItem to="/admin/users"     icon={<UserCog size={18} />}        label="User Management"     isOpen={isOpen} isMobile={isMobile} />
            <NavItem to="/admin/courses"   icon={<GraduationCap size={18} />}  label="Course Management"   isOpen={isOpen} isMobile={isMobile} />
            <NavItem to="/admin/roles"     icon={<KeyRound size={18} />}       label="Roles & Permissions" isOpen={isOpen} isMobile={isMobile} />
            <NavItem to="/admin/import"    icon={<FileDown size={18} />}       label="Import Employees"    isOpen={isOpen} isMobile={isMobile} />
          </>
        )}
      </nav>
    </aside>
  );
}