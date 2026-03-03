import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/authContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import Unauthorized from './pages/Unauthorized';
import Profile from './pages/Profile';
import EmployeeDashboard from './pages/employee/Dashboard';
import ManagerDashboard from './pages/manager/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import RolesManagement from './pages/admin/RolesManagement';
import UserManagement from './pages/admin/UserManagement';

function RoleBasedRedirect() {
  const { user } = useAuth();
  const effectiveRole = user?.systemRole || user?.role;
  if (effectiveRole === 'admin')   return <Navigate to="/admin/analytics"   replace />;
  if (effectiveRole === 'manager') return <Navigate to="/manager/dashboard" replace />;
  return <Navigate to="/employee/dashboard" replace />;
}

function AppRoutes() {
  return (
    <AuthProvider>
      <Routes>

        {/* Public */}
        <Route path="/login"        element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected — all under Layout */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>

          <Route path="/" element={<RoleBasedRedirect />} />
          <Route path="/profile" element={<Profile />} />

          {/* ── Employee ───────────────────────────────────────────────── */}
          <Route path="/employee/dashboard" element={<EmployeeDashboard />} />

          {/* ── Manager ────────────────────────────────────────────────── */}
          <Route
            path="/manager/dashboard"
            element={
              <ProtectedRoute allowedRoles={['manager', 'admin']}>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />

          {/* ── Admin — role-exclusive ──────────────────────────────────── */}
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* ── Admin — permission-gated ────────────────────────────────────
              CHANGE: removed allowedRoles={['admin']} from these two routes.

              Problem: allowedRoles ran FIRST and blocked custom-role users
              even when they had the required permission. Sidebar showed the
              link via can() but clicking it hit allowedRoles → /unauthorized.

              Fix: permission-gated pages use ONLY requiredPermissions.
              allowedRoles is reserved for strictly role-exclusive pages
              (analytics, manager dashboard) that no custom role should reach. */}
          <Route
            path="/admin/roles"
            element={
              <ProtectedRoute requiredPermissions={['role_view', 'role_edit']}>
                <RolesManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredPermissions={['user_view', 'user_edit']}>
                <UserManagement />
              </ProtectedRoute>
            }
          />

        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </AuthProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/*" element={<AppRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}