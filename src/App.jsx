import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, ProtectedRoute } from '@auth';
import { Layout } from '@shared';
 
// Pages
import { Login, AuthCallback, Unauthorized } from '@auth';
import { Profile } from '@profile';
import { EmployeeDashboard, ManagerDashboard, AdminDashboard } from '@dashboard';
import { RolesManagement } from '@roles';
import { UserManagement } from '@users';
import { MyTeam as TeamPage } from '@team';
 
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
        <Route path="/auth/callback" element={<AuthCallback />} />  
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
           <Route
            path="/manager/team"
            element={
              <ProtectedRoute allowedRoles={['manager']}>
                <TeamPage />
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
        <Route path="/*" element={<AppRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}
 