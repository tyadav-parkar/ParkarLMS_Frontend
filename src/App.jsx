import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, ProtectedRoute } from '@auth';
import { Layout } from '@shared';

// Pages
import { Login, AuthCallback, Unauthorized } from '@auth';
import { Profile }                           from '@profile';
import { EmployeeDashboard, ManagerDashboard, AdminDashboard } from '@dashboard';
import { RolesManagement }                   from '@roles';
import { UserManagement }                    from '@users';
import { MyTeam as TeamPage }                from '@team';
import { ImportPage }                        from '@import';
import EmployeeCertificates from '../src/modules/certificates/pages/EmployeeCertificates';
import ManagerCertificates  from '../src/modules/certificates/pages/ManagerCertificates';
import  EmployeeCourses  from '../src/modules/courses/pages/EmployeeCourses';
import ManagerCourses  from '../src/modules/courses/pages/ManagerCourses';
import  AdminCourses from '../src/modules/courses/pages/AdminCourses';
import EmployeeCareerPath from '../src/modules/carrerPath/pages/EmployeeCareerPath';
import ManagerCareerPath from '../src/modules/carrerPath/pages/ManagerCareerPath';




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
        <Route path="/login"         element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/unauthorized"  element={<Unauthorized />} />

        {/* Protected — all under Layout (sidebar + topbar rendered here) */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>

          <Route path="/" element={<RoleBasedRedirect />} />
          <Route path="/profile" element={<Profile />} />

          {/* ── Employee ───────────────────────────────────────────────── */}
          <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
          <Route path="/employee/certificates" element={<EmployeeCertificates />} />
          <Route path="/employee/courses" element={<EmployeeCourses />} />
          <Route path="/employee/career-path" element={<EmployeeCareerPath />} />


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
          <Route path="/manager/certificates" element={<ProtectedRoute allowedRoles={['manager']}><ManagerCertificates /></ProtectedRoute>} />
          <Route path="/manager/courses" element={<ProtectedRoute allowedRoles={['manager']}><ManagerCourses /></ProtectedRoute>} />
          <Route path="/manager/career-path" element={<ProtectedRoute allowedRoles={['manager']}><ManagerCareerPath /></ProtectedRoute>} /> 



          {/* ── Admin — role-exclusive ──────────────────────────────────── */}
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* ── Admin — permission-gated ────────────────────────────────── */}
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
          <Route path="/admin/courses" element={<ProtectedRoute allowedRoles={['admin']}><AdminCourses /></ProtectedRoute>} />


          {/* ── Admin — Import Employees ──────────────────────────────────
              MUST be inside this Layout wrapper so sidebar + topbar render.
              Was previously placed outside this block which caused it to
              open as a blank full-page with no sidebar.                    */}
          <Route
            path="/admin/import"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ImportPage />
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