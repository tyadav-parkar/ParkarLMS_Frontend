import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';

/**
 * Wraps protected pages.
 *
 * Props:
 *   allowedRoles         - string[]  — if non-empty, user must have at least one of these roles
 *   requiredPermission   - string    — (legacy) single permission key; user must have it
 *   requiredPermissions  - string[]  — user must have AT LEAST ONE of these (OR logic)
 */
export default function ProtectedRoute({
  children,
  allowedRoles = [],
  requiredPermission = null,
  requiredPermissions = null,
}) {
  const { user, isLoading, isAuthenticated, can } = useAuth();

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

  if (allowedRoles.length > 0) {
    // M2M: user may have multiple roles — check the full roles array
    const userRoles = user.roles || [user.role];
    if (!allowedRoles.some((r) => userRoles.includes(r))) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

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
