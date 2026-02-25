import { useNavigate, useSearchParams } from 'react-router-dom';

const MESSAGES = {
  not_registered:
    'Your @parkar.in account is not registered in Parker LMS. Please contact your admin to sync your account.',
  deactivated:
    'Your account has been deactivated. Please contact your admin.',
};

export default function Unauthorized() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const reason = searchParams.get('reason');
  const message =
    MESSAGES[reason] ?? "You don't have permission to access this page.";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-10 flex flex-col items-center gap-6 text-center">
        <span className="text-6xl">🚫</span>
        <h1 className="text-2xl font-bold text-gray-800">Access Denied</h1>
        <p className="text-gray-500 text-sm leading-relaxed">{message}</p>
        <button
          onClick={() => navigate('/login')}
          className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-xl text-sm transition-colors"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}
