import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
 
const MESSAGES = {
  not_registered:
    'Your @parkar.in account is not registered in Parker LMS. Please contact your admin to sync your account.',
  deactivated:
    'Your account has been deactivated. Please contact your admin.',
  insufficient_access:
    'You are signed in, but your current role/permissions do not allow this page.',
};
 
export default function Unauthorized() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
 
  const reason = searchParams.get('reason');
  const from = searchParams.get('from');
  const message =
    MESSAGES[reason] ?? "You don't have permission to access this page.";
 
  function goToDashboard() {
    const effectiveRole = user?.systemRole || user?.role;
    if (effectiveRole === 'admin') {
      navigate('/admin/analytics');
      return;
    }
    if (effectiveRole === 'manager') {
      navigate('/manager/dashboard');
      return;
    }
    navigate('/employee/dashboard');
  }
 
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg max-w-lg w-full p-8 md:p-10 flex flex-col items-center gap-6 text-center">
        <div className="h-16 w-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-3xl font-bold">
          !
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Unauthorized</h1>
        <p className="text-gray-500 text-sm leading-relaxed">{message}</p>
        {from && (
          <p className="text-xs text-gray-400">Requested page: {decodeURIComponent(from)}</p>
        )}
 
        <div className="w-full mt-1">
          <button
            onClick={isAuthenticated ? goToDashboard : () => navigate('/login')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-colors"
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Go to Login'}
          </button>
        </div>
 
        <p className="text-xs text-gray-500">
          If this access is required, contact your administrator to update your permissions.
        </p>
      </div>
    </div>
  );
}
 
 