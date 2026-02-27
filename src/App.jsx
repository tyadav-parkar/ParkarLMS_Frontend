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

// Must be inside AuthProvider to access useAuth
function RoleBasedRedirect() {
  const { user } = useAuth();
  if (user?.role === 'admin') return <Navigate to="/admin/analytics" replace />;
  if (user?.role === 'manager') return <Navigate to="/manager/dashboard" replace />;
  return <Navigate to="/employee/dashboard" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* Public routes — no layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected routes — all under Layout */}
          <Route element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route path="/" element={<RoleBasedRedirect />} />
            <Route path="/profile" element={<Profile />} />

            {/* Employee routes */}
            <Route path="/employee/dashboard" element={<EmployeeDashboard />} />

            {/* Manager routes */}
            <Route
              path="/manager/dashboard"
              element={
                <ProtectedRoute allowedRoles={['manager', 'admin']}>
                  <ManagerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin routes */}
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/roles"
              element={
                // role_view OR role_edit — either grants access to the page
                <ProtectedRoute allowedRoles={['admin']} requiredPermissions={['role_view', 'role_edit']}>
                  <RolesManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                // user_view OR user_edit — either grants access to the page
                <ProtectedRoute allowedRoles={['admin']} requiredPermissions={['user_view', 'user_edit']}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
