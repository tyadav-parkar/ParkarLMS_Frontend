import { useAuth } from '../../contexts/authContext';
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
    <div className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-blue-50 transition-colors">
      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
        <IconComponent size={16} strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 block mb-0.5">
          {label}
        </span>
        <span className="text-sm font-semibold text-slate-800 block truncate" title={value || undefined}>
          {value || '—'}
        </span>
      </div>
    </div>
  );
};

const Card = ({ title, children }) => (
  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
    {title && (
      <div className="px-5 py-2.5 border-b border-slate-100 bg-slate-50">
        <span className="text-[10.5px] font-bold tracking-wider uppercase text-slate-500">
          {title}
        </span>
      </div>
    )}
    <div className="flex flex-col">{children}</div>
  </div>
);

const StatBadge = ({ label, value, color = '#2563eb' }) => (
  <div
    className="border rounded-xl p-3"
    style={{ borderColor: color, backgroundColor: `${color}10` }}
  >
    <span className="block text-[10px] font-bold tracking-wider uppercase mb-1 opacity-70" style={{ color }}>
      {label}
    </span>
    <span className="block text-sm font-bold truncate" style={{ color }} title={value || undefined}>
      {value || '—'}
    </span>
  </div>
);

export default function Profile() {
  const { user } = useAuth();
  if (!user) return null;

  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown User';
  const manager = user.manager ? `${user.manager.first_name} ${user.manager.last_name}` : null;

  const statItems = [
    { label: 'Employee No.', value: user.employee_number, color: '#2563eb' },
    { label: 'Band / Level', value: user.band_identifier,  color: '#7c3aed' },
    { label: 'Department',   value: user.department?.name, color: '#0369a1' },
    { label: 'Manager',      value: manager,               color: '#059669' },
  ];

  return (
    <div className="w-full font-['DM_Sans',system-ui,sans-serif]">
      <h1 className="text-2xl font-extrabold text-slate-900 mb-4 tracking-tight">
        My Profile
      </h1>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm mb-4">
        <div className="h-24 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 relative">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }} />
        </div>

        <div className="px-5 pb-5">
          <div className="flex items-end gap-5 -mt-5 mb-5">
            <div className="relative shrink-0">
              <div className="w-[76px] h-[76px] rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center">
                <span className="text-2xl font-extrabold text-blue-600 tracking-tight">
                  {getInitials(user)}
                </span>
              </div>
              <div
                className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white"
                title="Active"
              />
            </div>
            <div className="pb-1">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {fullName}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{user.job_title || '—'}</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap mb-5">
            <span className="text-[11px] font-bold tracking-wider uppercase text-blue-600 bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-lg">
              {user.role}
            </span>
            {user.department?.name && (
              <span className="text-[11px] font-semibold tracking-wider text-slate-600 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-lg">
                {user.department.name}
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {statItems.map(item => <StatBadge key={item.label} {...item} />)}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <Card title="Contact Information">
            <FieldRow icon={Mail}       label="Email Address"   value={user.email} />
            <hr className="border-t border-slate-100 mx-5" />
            <FieldRow icon={BadgeCheck} label="Employee Number" value={user.employee_number} />
          </Card>

          <Card title="Role & Structure">
            <FieldRow icon={Briefcase}  label="Job Title"    value={user.job_title} />
            <hr className="border-t border-slate-100 mx-5" />
            <FieldRow icon={BarChart2}  label="Band / Level" value={user.band_identifier} />
            <hr className="border-t border-slate-100 mx-5" />
            <FieldRow icon={ShieldCheck} label="System Role" value={user.role} />
          </Card>
        </div>
        <div className="space-y-4">
          <Card title="Organisation">
            <FieldRow icon={Building2}  label="Department"        value={user.department?.name} />
            <hr className="border-t border-slate-100 mx-5" />
            <FieldRow icon={UserRound}  label="Reporting Manager" value={manager} />
          </Card>

          <Card title="Account Activity">
            <FieldRow icon={Clock} label="Last Login" value={formatDate(user.last_login)} />
          </Card>
          <div className="flex gap-3.5 items-start bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
              <Info size={15} strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-800 m-0">Read-only Profile</p>
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