/**
 * UserDetailModal.jsx
 * src/modules/users/components/UserDetailModal.jsx
 *
 * Reusable modal that displays a user's full profile details.
 * Receives the full user object from the useUsers hook — no extra
 * API calls. All data comes from the parent page.
 *
 * Props:
 *   user          {object}   — user object from useUsers
 *   onClose       {function} — called when modal should close
 *   onAssignRole  {function} — opens the AssignRoleModal for this user
 *   canEdit       {boolean}  — whether the current user has user_edit permission
 */

import { X, Mail, Briefcase, Building2, Hash, Shield } from 'lucide-react';

// ── Role styling ──────────────────────────────────────────────────────────────
const ROLE_COLOURS = {
  admin:    'bg-red-100 text-red-700 border-red-200',
  manager:  'bg-blue-100 text-blue-700 border-blue-200',
  employee: 'bg-green-100 text-green-700 border-green-200',
};

const ROLE_ICON_BG = {
  admin:    'bg-red-100',
  manager:  'bg-blue-100',
  employee: 'bg-green-100',
};

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ firstName, lastName }) {
  const initials = `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();
  return (
    <div className="w-16 h-16 rounded-2xl border  text-white flex items-center justify-center text-xl font-bold shrink-0 shadow-md">
      {initials}
    </div>
  );
}

// ── Role badges ───────────────────────────────────────────────────────────────
function RoleBadges({ roles }) {
  if (!roles?.length) return <span className="text-xs text-gray-400 italic">No role assigned</span>;

  const sorted = [...roles].sort(
    (a, b) => (b.EmployeeRole?.is_primary ? 1 : 0) - (a.EmployeeRole?.is_primary ? 1 : 0)
  );

  return (
    <div className="flex flex-wrap gap-1.5">
      {sorted.map((r) => (
        <span
          key={r.id}
          className={`inline-flex items-center gap-1 text-xs font-semibold capitalize px-2.5 py-0.5 rounded-full border ${
            ROLE_COLOURS[r.name] ?? 'bg-gray-100 text-gray-700 border-gray-200'
          }`}
        >
          {r.EmployeeRole?.is_primary && <span className="text-amber-500">★</span>}
          {r.name}
        </span>
      ))}
    </div>
  );
}

// ── Detail row ────────────────────────────────────────────────────────────────
function DetailRow({ icon, label, value, iconBg = 'bg-blue-100' }) {
  const Icon = icon;
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors">
      <div className={`w-8 h-8 ${iconBg} rounded-lg border border-white flex items-center justify-center flex-shrink-0 shadow-sm`}>
        <Icon className="w-4 h-4 text-blue-600" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-semibold text-gray-800 truncate capitalize mt-0.5">{value ?? '—'}</p>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function UserDetailModal({ user, onClose, onAssignRole, canEdit }) {
  if (!user) return null;

  const roles       = user.roles ?? [];
  const primaryRole = roles.find((r) => r.EmployeeRole?.is_primary);
  const department  = user.department?.name ?? user.Department?.name;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">

        {/* ── Header band ──────────────────────────────────────────── */}
        <div className="main-background px-6 pt-6 pb-10 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          <p className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-3">Employee Profile</p>

          <div className="flex items-center gap-4">
            <Avatar firstName={user.first_name} lastName={user.last_name} />
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-white leading-snug truncate">
                {user.first_name} {user.last_name}
              </h2>
              <p className="text-sm text-blue-100 mt-0.5 truncate">{user.email}</p>
              <div className="mt-2">
                <RoleBadges roles={roles} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Details card overlapping header ──────────────────────── */}
        <div className="px-6 pt-5 pb-6 -mt-5 relative z-10">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-2.5">
            <DetailRow
              icon={Hash}
              label="Employee #"
              value={user.employee_number}
            />
            <DetailRow
              icon={Building2}
              label="Department"
              value={department}
            />
            <DetailRow
              icon={Briefcase}
              label="Job Title"
              value={user.job_title ?? primaryRole?.name}
            />
            <DetailRow
              icon={Shield}
              label="Primary Role"
              value={primaryRole?.name}
              iconBg={ROLE_ICON_BG[primaryRole?.name] ?? 'bg-blue-100'}
            />
          </div>

          {/* ── Actions ──────────────────────────────────────────── */}
          <div className="flex gap-3 mt-4">
            {canEdit && (
              <button
                onClick={() => { onClose(); onAssignRole(user); }}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
              >
                Assign Role
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}