import { useEffect, useState } from 'react';
import { X, Mail, Briefcase, Building2, Hash, TrendingUp, ChevronRight, Loader2 } from 'lucide-react';
import { getCareerPath, promoteEmployeeStep } from '@modules/carrerPath/services/careerPathService';

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ firstName, lastName }) {
  const initials = `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();
  return (
    <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-xl font-bold shrink-0 shadow-md">
      {initials}
    </div>
  );
}

// ── Detail row ────────────────────────────────────────────────────────────────
function DetailRow({ icon, label, value }) {
  const Icon = icon;
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors">
      <div className="w-8 h-8 bg-white rounded-lg border border-gray-200 flex items-center justify-center shrink-0 shadow-sm">
        <Icon className="w-4 h-4 text-blue-600" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-semibold text-gray-800 truncate mt-0.5">{value ?? '—'}</p>
      </div>
    </div>
  );
}

// ── Career Step Section ───────────────────────────────────────────────────────
function CareerStepSection({ member, onStepAdvanced }) {
  const [steps, setSteps] = useState([]);
  const [loadingSteps, setLoadingSteps] = useState(false);
  const [promoting, setPromoting] = useState(null); // step id currently being set, or null
  const [promoteError, setPromoteError] = useState(null);
  const [promoteSuccess, setPromoteSuccess] = useState(null); // role_title of placed step

  const currentCareerPathId = member.current_career_path_id;

  useEffect(() => {
    if (!member.ideal_role_id) return;
    setLoadingSteps(true);
    getCareerPath(member.ideal_role_id)
      .then((result) => setSteps(result.steps ?? []))
      .catch(() => setSteps([]))
      .finally(() => setLoadingSteps(false));
  }, [member.ideal_role_id]);

  if (!member.ideal_role_id) {
    return (
      <div className="mt-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-4 text-center text-xs text-gray-400">
        No ideal role assigned — career path unavailable.
      </div>
    );
  }

  if (loadingSteps) {
    return (
      <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading career path…
      </div>
    );
  }

  const currentIdx = currentCareerPathId
    ? steps.findIndex((s) => s.id === currentCareerPathId)
    : -1;

  const currentStep = currentIdx >= 0 ? steps[currentIdx] : null;
  const nextStep    = steps[currentIdx + 1] ?? null;

  async function handlePlace(targetStep) {
    setPromoting(targetStep.id);
    setPromoteError(null);
    setPromoteSuccess(null);
    try {
      await promoteEmployeeStep(member.id, targetStep.id);
      setPromoteSuccess(targetStep.role_title);
      if (onStepAdvanced) onStepAdvanced(targetStep.id);
    } catch (err) {
      setPromoteError(err.response?.data?.message || 'Failed to update career step. Please try again.');
    } finally {
      setPromoting(null);
    }
  }

  // ── Not yet placed: show all steps so manager can set the correct starting point ──
  if (!currentCareerPathId) {
    return (
      <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50/50 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-600" />
          <p className="text-xs font-bold text-amber-700 uppercase tracking-widest">Set Current Position</p>
        </div>
        <p className="text-xs text-gray-500">
          Not yet placed on the career path. Select this employee's current role to initialise their progression.
        </p>

        <div className="space-y-1.5">
          {steps.map((step) => (
            <div
              key={step.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 bg-white px-3 py-2"
            >
              <div>
                <p className="text-xs font-semibold text-gray-800">{step.role_title}</p>
                <p className="text-[10px] text-gray-400">Step {step.step_order}</p>
              </div>
              <button
                onClick={() => handlePlace(step)}
                disabled={promoting !== null}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700
                  disabled:bg-blue-300 text-white text-[10px] font-bold rounded-md transition-colors shrink-0"
              >
                {promoting === step.id
                  ? <><Loader2 className="w-3 h-3 animate-spin" /> Placing…</>
                  : 'Place here'
                }
              </button>
            </div>
          ))}
        </div>

        {promoteSuccess && (
          <p className="text-xs font-semibold text-emerald-600">✓ Placed at {promoteSuccess}</p>
        )}
        {promoteError && (
          <p className="text-xs text-red-500">{promoteError}</p>
        )}
      </div>
    );
  }

  // ── Already placed: show progress pills + advance button ──────────────────────
  return (
    <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-blue-600" />
        <p className="text-xs font-bold text-blue-700 uppercase tracking-widest">Career Path</p>
      </div>

      <div className="flex items-center gap-2 text-sm flex-wrap">
        <span className="text-gray-500 text-xs">Current:</span>
        <span className="font-semibold text-gray-800">{currentStep?.role_title}</span>
        {nextStep && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="text-gray-500 text-xs">Next:</span>
            <span className="font-semibold text-blue-700">{nextStep.role_title}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {steps.map((step, idx) => {
          const isDone    = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          return (
            <span
              key={step.id}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isDone    ? 'bg-emerald-100 text-emerald-700' :
                isCurrent ? 'bg-sky-100 text-sky-700 ring-1 ring-sky-300' :
                            'bg-gray-100 text-gray-400'
              }`}
            >
              {step.role_title}
            </span>
          );
        })}
      </div>

      {promoteSuccess && (
        <p className="text-xs font-semibold text-emerald-600">✓ Advanced to {promoteSuccess}</p>
      )}
      {promoteError && (
        <p className="text-xs text-red-500">{promoteError}</p>
      )}

      {nextStep && !promoteSuccess && (
        <button
          onClick={() => handlePlace(nextStep)}
          disabled={promoting !== null}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300
            text-white text-xs font-bold rounded-lg transition-colors"
        >
          {promoting !== null
            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Advancing…</>
            : <><TrendingUp className="w-3.5 h-3.5" /> Advance to {nextStep.role_title}</>
          }
        </button>
      )}

      {!nextStep && (
        <p className="text-xs text-emerald-600 font-semibold">✓ Final step reached</p>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function MemberDetailModal({ member, onClose }) {
  const [localMember, setLocalMember] = useState(member);

  useEffect(() => { setLocalMember(member); }, [member]);

  if (!localMember) return null;

  function handleStepAdvanced(newCareerPathId) {
    setLocalMember((prev) => ({ ...prev, current_career_path_id: newCareerPathId }));
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">

        {/* ── Header band ──────────────────────────────────────────── */}
        <div className="bg-linear-to-r from-blue-600 to-blue-700 px-6 pt-6 pb-10 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
          <p className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-3">Team Member</p>
          <div className="flex items-center gap-4">
            <Avatar firstName={localMember.first_name} lastName={localMember.last_name} />
            <div>
              <h2 className="text-xl font-bold text-white leading-snug">
                {localMember.first_name} {localMember.last_name}
              </h2>
              <p className="text-sm text-blue-100 mt-0.5">{localMember.job_title ?? 'No title assigned'}</p>
              {localMember.band_identifier && (
                <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-widest bg-white/20 text-white px-2.5 py-0.5 rounded-full">
                  {localMember.band_identifier}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Details ──────────────────────────────────────────────── */}
        <div className="px-6 pt-5 pb-6 -mt-5 relative z-10">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-2.5">
            <DetailRow icon={Mail}      label="Email"      value={localMember.email}            />
            <DetailRow icon={Building2} label="Department" value={localMember.department?.name} />
            <DetailRow icon={Briefcase} label="Job Title"  value={localMember.job_title}        />
            <DetailRow icon={Hash}      label="Band"       value={localMember.band_identifier}  />
          </div>

          <CareerStepSection member={localMember} onStepAdvanced={handleStepAdvanced} />

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
