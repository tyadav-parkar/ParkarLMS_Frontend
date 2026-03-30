export const PERMISSION_NAV_MAP = {
  role_view: { to: '/admin/roles', icon: '🔑', label: 'Roles & Permissions' },
  role_edit: { to: '/admin/roles', icon: '🔑', label: 'Roles & Permissions' },
  user_view: { to: '/admin/users', icon: '👤', label: 'User Management' },
  user_edit: { to: '/admin/users', icon: '👤', label: 'User Management' },
  course_view: { to: '/admin/courses', icon: '🎓', label: 'Course Management' },
  course_edit: { to: '/admin/courses', icon: '🎓', label: 'Course Management' },
  course_assign: { to: '/manager/courses', icon: '🎓', label: 'Course Management' },
};

const MANAGER_COURSE_PERMS = ['course_assign', 'course_view', 'course_edit'];

export function getExtraNavItems({ permissions, systemRole }) {
  // Prevent surfacing links that are guaranteed to be blocked by role-gated routes.
  if (systemRole === 'employee') {
    const hasCourseAccess = ['course_assign', 'course_view', 'course_edit'].some((perm) => permissions.includes(perm));
    return hasCourseAccess
      ? [{ to: '/employee/courses', icon: '📚', label: 'My Courses' }]
      : [];
  }

  const seen = new Set();
  const items = [];

  for (const [permKey, navItem] of Object.entries(PERMISSION_NAV_MAP)) {
    if (!permissions.includes(permKey)) continue;
    if (systemRole === 'manager' && MANAGER_COURSE_PERMS.includes(permKey)) continue;
    if (seen.has(navItem.to)) continue;
    seen.add(navItem.to);
    items.push(navItem);
  }

  return items;
}