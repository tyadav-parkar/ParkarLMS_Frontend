import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';

/**
 * ProtectedRoute — wraps protected pages.
 *
 * Props:
 *   allowedRoles        - string[]  — user must have AT LEAST ONE of these roles
 *   requiredPermission  - string    — (legacy) single permission key
 *   requiredPermissions - string[]  — user must have AT LEAST ONE (OR logic)
 *
 * ── CHANGE (v2) ──────────────────────────────────────────────────────────────
 * Problem: allowedRoles check only looked at user.roles[].
 * When a manager had a custom role assigned, user.roles = ['Senior Trainer'].
 * allowedRoles = ['manager', 'admin'] → no match → /unauthorized.
 * Sidebar showed the link (via can()) but clicking it showed access denied.
 *
 * Fix: Three-layer role check (mirrors authContext.isRole() logic):
 *   1. Check user.roles[] array (all assigned role names including custom)
 *   2. Check systemRole (highest system role — always preserved)
 *   3. Check permissions[] — if user has the required permission for this
 *      route, they should be able to access it regardless of role name.
 *      This is the key fix for custom-role users: sidebar showed the link
 *      because can() returned true, so ProtectedRoute must also pass them.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export default function ProtectedRoute({
  children,
  allowedRoles = [],
  requiredPermission  = null,
  requiredPermissions = null,
}) {
  const { user, isLoading, isAuthenticated, can, systemRole } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ── Role check ─────────────────────────────────────────────────────────────
  if (allowedRoles.length > 0) {
    const userRoles = user.roles || [user.role];

    const hasRole =
      // 1. Direct roles[] match (includes custom role names)
      allowedRoles.some((r) => userRoles.includes(r)) ||
      // 2. systemRole match — handles managers/employees with custom roles
      //    e.g. manager assigned 'Senior Trainer': systemRole='manager' still passes
      (systemRole && allowedRoles.includes(systemRole)) ||
      // 3. Permission-based access — if the route requires permissions AND
      //    the user has them, let them through even if role name doesn't match.
      //    This is what makes custom-role sidebar links actually work:
      //    sidebar shows link via can() → ProtectedRoute must honour the same logic.
      (
        requiredPermissions?.length > 0 &&
        requiredPermissions.some((p) => can(p))
      ) ||
      (
        requiredPermission &&
        can(requiredPermission)
      );

    if (!hasRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // ── Permission check (runs after role check) ───────────────────────────────
  // Array form — OR logic: pass if user has ANY of the listed permissions
  if (requiredPermissions && requiredPermissions.length > 0) {
    if (!requiredPermissions.some((p) => can(p))) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Legacy single-permission form
  if (requiredPermission && !can(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}