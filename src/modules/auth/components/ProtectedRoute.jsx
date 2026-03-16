import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';

export default function ProtectedRoute({
  children,
  allowedRoles = [],
  requiredPermission = null,
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

  if (allowedRoles.length > 0) {
    const userRoles = user.roles || [user.role];

    const hasRole =
      allowedRoles.some((r) => userRoles.includes(r)) ||
      (systemRole && allowedRoles.includes(systemRole)) ||
      (requiredPermissions?.length > 0 && requiredPermissions.some((p) => can(p))) ||
      (requiredPermission && can(requiredPermission));

    if (!hasRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  if (requiredPermissions && requiredPermissions.length > 0) {
    if (!requiredPermissions.some((p) => can(p))) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  if (requiredPermission && !can(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
