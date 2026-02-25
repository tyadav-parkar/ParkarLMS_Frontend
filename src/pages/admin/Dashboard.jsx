import { useAuth } from '../../contexts/authContext';

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Admin Analytics Dashboard</h1>
      <p className="text-gray-600 mb-4">
        Logged in as:{' '}
        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
          {user?.role}
        </span>
      </p>
      <div className="bg-white rounded-xl shadow p-6 text-gray-400 text-sm">
        Development in progress...
      </div>
    </div>
  );
}
