import { useAuth } from '@auth';
import {
  Mail,
  BadgeCheck,
  Briefcase,
  BarChart2,
  Building2,
  UserRound,
  ShieldCheck,
  Clock,
  Info,
} from 'lucide-react';

const getInitials = (user) =>
  user ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase() || '?' : '?';

const formatDate = (dateStr) => {
  if (!dateStr) return 'First session';
  try {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return 'Invalid date';
  }
};

const FieldRow = ({ icon, label, value }) => {
  const IconComponent = icon;
  return (
    <div className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-cyan-50/40 transition-colors">
      <div className="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600 shrink-0">
        <IconComponent size={15} strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <span className="text-[10px] font-bold tracking-wider uppercase text-gray-400 block mb-0.5">
          {label}
        </span>
        <span className="text-sm font-semibold text-gray-800 block truncate" title={value || undefined}>
          {value || '—'}
        </span>
      </div>
    </div>
  );
};

const Card = ({ title, children }) => (
  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
    {title && (
      <div className="bg-gradient-to-r from-cyan-700 to-cyan-800 px-5 py-2.5">
        <span className="text-[10px] font-semibold tracking-widest uppercase text-cyan-200">
          {title}
        </span>
      </div>
    )}
    <div className="flex flex-col divide-y divide-gray-100">{children}</div>
  </div>
);

const StatBadge = ({ label, value }) => (
  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 hover:border-cyan-200 hover:bg-cyan-50/30 transition-colors">
    <span className="block text-[10px] font-bold tracking-wider uppercase text-gray-400 mb-1">
      {label}
    </span>
    <span className="block text-sm font-bold text-gray-800 truncate" title={value || undefined}>
      {value || '—'}
    </span>
  </div>
);

export default function Profile() {
  const { user } = useAuth();
  if (!user) return null;

  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown User';
  const manager  = user.manager ? `${user.manager.first_name} ${user.manager.last_name}` : null;

  const statItems = [
    { label: 'Employee No.', value: user.employee_number },
    { label: 'Band / Level', value: user.band_identifier  },
    { label: 'Department',   value: user.department?.name },
    { label: 'Manager',      value: manager               },
  ];

  return (
    <div className="w-full space-y-6">

      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-700 to-cyan-800 px-7 py-6 shadow-lg shadow-cyan-900/20">
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full border border-cyan-600/30 pointer-events-none" />
        <div className="absolute -right-2 -top-2 w-24 h-24 rounded-full border border-cyan-500/20 pointer-events-none" />
        <div className="absolute right-16 -bottom-10 w-32 h-32 rounded-full border border-cyan-600/20 pointer-events-none" />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-cyan-600/40 flex items-center justify-center">
                <UserRound className="w-4 h-4 text-cyan-300" />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">My Profile</h1>
            </div>
            <p className="text-cyan-300/70 text-sm ml-11">
              Your account details synced from Keka.
            </p>
          </div>
        </div>
      </div>

      {/* ── Identity card ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-5 px-6 py-5">
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center shadow-md">
              <span className="text-xl font-extrabold text-white tracking-tight">
                {getInitials(user)}
              </span>
            </div>
            <div className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white" title="Active" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-extrabold text-gray-900 tracking-tight leading-tight truncate">
              {fullName}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5 mb-3">{user.job_title || '—'}</p>
            <div className="flex flex-wrap gap-2">
              <span className="text-[11px] font-bold tracking-widest uppercase text-cyan-700 bg-cyan-50 border border-cyan-200 px-3 py-1 rounded-lg">
                {user.role}
              </span>
              {user.department?.name && (
                <span className="text-[11px] font-semibold text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1 rounded-lg">
                  {user.department.name}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-6 pb-5">
          {statItems.map((item) => <StatBadge key={item.label} {...item} />)}
        </div>
      </div>

      {/* ── Detail cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <Card title="Contact Information">
            <FieldRow icon={Mail}       label="Email Address"   value={user.email} />
            <FieldRow icon={BadgeCheck} label="Employee Number" value={user.employee_number} />
          </Card>
          <Card title="Role & Structure">
            <FieldRow icon={Briefcase}   label="Job Title"    value={user.job_title} />
            <FieldRow icon={BarChart2}   label="Band / Level" value={user.band_identifier} />
            <FieldRow icon={ShieldCheck} label="System Role"  value={user.role} />
          </Card>
        </div>
        <div className="space-y-4">
          <Card title="Organisation">
            <FieldRow icon={Building2} label="Department"        value={user.department?.name} />
            <FieldRow icon={UserRound} label="Reporting Manager" value={manager} />
          </Card>
          <Card title="Account Activity">
            <FieldRow icon={Clock} label="Last Login" value={formatDate(user.last_login)} />
          </Card>
          <div className="flex gap-3.5 items-start bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <Info size={15} strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-800">Read-only Profile</p>
              <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                Your profile is synced from <strong>Keka</strong>. Contact HR to update details.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}