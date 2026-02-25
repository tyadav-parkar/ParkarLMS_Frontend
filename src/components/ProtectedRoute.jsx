import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';

/**
 * Wraps protected pages.
 *
 * Props:
 *   allowedRoles       - string[] — if non-empty, user.role must be in this list
 *   requiredPermission - string   — if provided, can(permission) must be true
 */
export default function ProtectedRoute({
  children,
  allowedRoles = [],
  requiredPermission = null,
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

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiredPermission && !can(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
