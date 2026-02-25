import { useAuth } from '../contexts/authContext';

function getInitials(user) {
  if (!user) return '??';
  const first = user.first_name?.[0] ?? '';
  const last = user.last_name?.[0] ?? '';
  return (first + last).toUpperCase();
}

function formatDate(dateStr) {
  if (!dateStr) return 'First session';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ProfileField({ label, value }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
      <span className="text-xs text-gray-400 font-medium uppercase tracking-wide w-36 flex-shrink-0">
        {label}
      </span>
      <span className="text-sm text-gray-800 text-right">{value || '—'}</span>
    </div>
  );
}

export default function Profile() {
  const { user } = useAuth();

  if (!user) return null;

  const fullName = `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim();
  const managerName = user.manager
    ? `${user.manager.first_name} ${user.manager.last_name}`
    : '—';

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-xl font-bold text-gray-800 mb-6">My Profile</h1>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        {/* Blue header band */}
        <div className="bg-blue-600 h-24 flex items-end justify-center pb-0 relative">
          <div className="absolute bottom-0 translate-y-1/2">
            <div className="w-20 h-20 rounded-full bg-white border-4 border-white shadow flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">{getInitials(user)}</span>
            </div>
          </div>
        </div>

        {/* Name + role */}
        <div className="flex flex-col items-center pt-14 pb-4 px-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">{fullName}</h2>
          <span className="mt-1 inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-0.5 rounded-full">
            {user.role}
          </span>
        </div>

        {/* Fields */}
        <div className="px-6 py-2">
          <ProfileField label="Email" value={user.email} />
          <ProfileField label="Employee Number" value={user.employee_number} />
          <ProfileField label="Job Title" value={user.job_title} />
          <ProfileField label="Band / Level" value={user.band_identifier} />
          <ProfileField label="Department" value={user.department?.name} />
          <ProfileField label="Manager" value={managerName} />
          <ProfileField label="Role" value={user.role} />
          <ProfileField label="Last Login" value={formatDate(user.last_login)} />
        </div>

        {/* Read-only notice */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">
            Profile information is synced from Keka. Contact HR to update personal details.
          </p>
        </div>
      </div>
    </div>
  );
}
