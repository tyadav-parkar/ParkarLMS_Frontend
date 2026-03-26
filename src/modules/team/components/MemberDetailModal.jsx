import { X, Mail, Briefcase, Building2, Hash, UserCircle } from 'lucide-react';

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ firstName, lastName }) {
  const initials = `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();
  return (
    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-xl font-bold flex-shrink-0 shadow-md">
      {initials}
    </div>
  );
}

// ── Detail row ────────────────────────────────────────────────────────────────
function DetailRow({ icon, label, value }) {
  const Icon = icon;
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors">
      <div className="w-8 h-8 bg-white rounded-lg border border-gray-200 flex items-center justify-center flex-shrink-0 shadow-sm">
        <Icon className="w-4 h-4 text-blue-600" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-semibold text-gray-800 truncate mt-0.5">{value ?? '—'}</p>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function MemberDetailModal({ member, onClose }) {
  if (!member) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">

        {/* ── Header band ──────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 pt-6 pb-10 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
          <p className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-3">Team Member</p>
          <div className="flex items-center gap-4">
            <Avatar firstName={member.first_name} lastName={member.last_name} />
            <div>
              <h2 className="text-xl font-bold text-white leading-snug">
                {member.first_name} {member.last_name}
              </h2>
              <p className="text-sm text-blue-100 mt-0.5">{member.job_title ?? 'No title assigned'}</p>
              {member.band_identifier && (
                <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-widest bg-white/20 text-white px-2.5 py-0.5 rounded-full">
                  {member.band_identifier}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Details ──────────────────────────────────────────────── */}
        <div className="px-6 pt-5 pb-6 -mt-5 relative z-10">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-2.5">
            <DetailRow icon={Mail}      label="Email"      value={member.email}            />
            <DetailRow icon={Building2} label="Department" value={member.department?.name} />
            <DetailRow icon={Briefcase} label="Job Title"  value={member.job_title}        />
            <DetailRow icon={Hash}      label="Band"       value={member.band_identifier}  />
          </div>

          <button
            onClick={onClose}
            className="mt-4 w-full py-2.5 border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}