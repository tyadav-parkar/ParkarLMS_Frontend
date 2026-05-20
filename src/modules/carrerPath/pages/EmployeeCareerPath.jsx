import { useEffect, useState } from 'react';
import { useAuth } from '@auth/contexts/authContext';
import CareerPath from '../components/CareerPath';
import CompletedCoursesTable from '../components/CompletedCoursesTable';
import PendingCoursesTable from '../components/PendingCoursesTable';
import { getMyCareerProgress } from '../services/careerPathService';

export default function EmployeeCareerPath() {
  const { user } = useAuth();
  const idealRoleId = user?.ideal_role_id;

  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!idealRoleId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    getMyCareerProgress(idealRoleId)
      .then((result) => { if (!cancelled) setProgressData(result); })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load career progress.');
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [idealRoleId]);

  const steps = progressData?.steps ?? [];
  const currentIdx = steps.findIndex((s) => s.status === 'current');
  const currentStage = steps[currentIdx] ?? null;
  const nextStage = steps[currentIdx + 1] ?? null;

  if (!idealRoleId) {
    return (
      <div className="space-y-6 p-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <h2 className="text-lg font-semibold text-slate-900">Career Path</h2>
          <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            No ideal role has been assigned to your profile yet.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <CareerPath idealRoleId={idealRoleId} progressData={progressData} progressLoading={loading} progressError={error} />

      {!loading && !error && steps.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CompletedCoursesTable stages={steps} />
          {currentStage && nextStage && (
            <PendingCoursesTable currentStage={currentStage} nextStage={nextStage} />
          )}
        </div>
      )}
    </div>
  );
}
