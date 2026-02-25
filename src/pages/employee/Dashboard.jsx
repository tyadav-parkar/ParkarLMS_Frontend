import { useAuth } from '../../contexts/authContext';

export default function EmployeeDashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Employee Dashboard</h1>
      <p className="text-gray-600 mb-4">Welcome, {user?.first_name}!</p>
      <div className="bg-white rounded-xl shadow p-6 text-gray-400 text-sm">
        Development in progress...
      </div>
    </div>
  );
}
