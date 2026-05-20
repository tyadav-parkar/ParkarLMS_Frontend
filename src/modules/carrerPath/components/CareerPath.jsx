import { useEffect, useMemo, useState } from 'react';
import TimelineNode from './TimelineNode';
import { getCareerPath } from '../services/careerPathService';

function normalizeStatus(value) {
  const status = String(value || 'upcoming').toLowerCase();
  if (status === 'active') return 'current';
  if (status === 'current' || status === 'completed' || status === 'upcoming') return status;
  return 'upcoming';
}

function normalizeStage(stage, index) {
  const title = stage?.title || stage?.role_title || stage?.role || stage?.name || `Stage ${index + 1}`;
  const subtitle = stage?.subtitle || stage?.period || stage?.date || (stage?.step_order ? `Step ${stage.step_order}` : '');
  const status = normalizeStatus(stage?.status);

  return {
    id: stage?.id ?? stage?.step_order ?? `${title}-${index}`,
    title,
    subtitle,
    status,
    icon: stage?.icon,
    iconLabel: stage?.iconLabel,
    description: stage?.description || stage?.detail || '',
  };
}

function mapApiResponse(result) {
  return {
    title: result.ideal_role.role_name,
    subtitle: 'Your learning journey and role progression',
    stages: result.steps.map((step) => ({
      id:          step.id ?? step.step_order,
      title:       step.role_title,
      subtitle:    `Step ${step.step_order}`,
      status:      step.status ?? 'upcoming',
      description: '',
    })),
  };
}

function LegendItem({ colorClass, label }) {
  return (
    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
      <span className={`h-2 w-2 rounded-full ${colorClass}`} />
      <span>{label}</span>
    </div>
  );
}

const DEFAULT_LEGEND = [
  { label: 'Completed', colorClass: 'bg-emerald-500' },
  { label: 'Current',   colorClass: 'bg-sky-500' },
  { label: 'Upcoming',  colorClass: 'bg-slate-300' },
];

/**
 * Props:
 *   idealRoleId    — when set, fetches internally (simple timeline, no course data)
 *   progressData   — pre-fetched full progress from getMyCareerProgress (overrides internal fetch)
 *   progressLoading — loading state from parent (used alongside progressData)
 *   progressError   — error state from parent (used alongside progressData)
 *   data           — static data prop (backward compat for ManagerCareerPath)
 */
export default function CareerPath({
  idealRoleId,
  progressData,
  progressLoading,
  progressError,
  data: externalData,
  className = '',
}) {
  const [fetchedData, setFetchedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // If parent already provides progressData, skip internal fetch
  const usesParentData = progressData !== undefined || progressLoading !== undefined;

  useEffect(() => {
    if (usesParentData || !idealRoleId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setFetchedData(null);

    getCareerPath(idealRoleId)
      .then((result) => { if (!cancelled) setFetchedData(mapApiResponse(result)); })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load career path data.');
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [idealRoleId, usesParentData]);

  // Resolve which data / loading / error to display
  const activeLoading = usesParentData ? (progressLoading ?? false) : loading;
  const activeError   = usesParentData ? (progressError ?? null)   : error;
  const sourceData    = useMemo(() => {
    if (usesParentData) return progressData ? mapApiResponse(progressData) : null;
    return idealRoleId ? fetchedData : externalData;
  }, [usesParentData, progressData, idealRoleId, fetchedData, externalData]);

  const normalizedData = useMemo(() => {
    const stages = Array.isArray(sourceData?.stages) ? sourceData.stages.map(normalizeStage) : [];
    return {
      title:    sourceData?.title    || 'Career Path',
      subtitle: sourceData?.subtitle || 'Your learning journey and role progression',
      stages,
      legend:   Array.isArray(sourceData?.legend) && sourceData.legend.length > 0
        ? sourceData.legend
        : DEFAULT_LEGEND,
    };
  }, [sourceData]);

  const initialExpandedState = useMemo(
    () => Object.fromEntries(
      normalizedData.stages.map((s) => [s.id, s.status === 'current' || s.status === 'completed'])
    ),
    [normalizedData.stages]
  );

  const [expanded, setExpanded] = useState(initialExpandedState);

  useEffect(() => { setExpanded(initialExpandedState); }, [initialExpandedState]);

  function toggleStage(stageId) {
    setExpanded((prev) => ({ ...prev, [stageId]: !prev[stageId] }));
  }

  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6 ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">{normalizedData.title}</h2>
          <p className="mt-1 text-sm text-slate-500">{normalizedData.subtitle}</p>
        </div>
      </div>

      {activeLoading && (
        <div className="mt-6 flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
          <span className="ml-3 text-sm text-slate-500">Loading career path…</span>
        </div>
      )}

      {!activeLoading && activeError && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-600">
          {activeError}
        </div>
      )}

      {!activeLoading && !activeError && normalizedData.stages.length > 0 && (
        <div className="mt-6 overflow-x-auto pb-2">
          <div className="min-w-180">
            <div className="relative flex items-start justify-between gap-4 px-2 pt-2">
              {normalizedData.stages.map((stage, index) => {
                const isExpanded = !!expanded[stage.id];
                const isLast = index === normalizedData.stages.length - 1;
                return (
                  <div key={stage.id} className="flex-1">
                    <TimelineNode
                      stage={stage}
                      isLast={isLast}
                      expanded={isExpanded}
                      onToggle={() => toggleStage(stage.id)}
                    />
                    {stage.description && isExpanded && (
                      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Details</p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{stage.description}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {!activeLoading && !activeError && normalizedData.stages.length === 0 && (
        <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          No career path data available.
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 border-t border-slate-100 pt-4">
        {normalizedData.legend.map((item) => (
          <LegendItem key={item.label} colorClass={item.colorClass} label={item.label} />
        ))}
      </div>
    </section>
  );
}
