import { CheckCircle2, ChevronDown, ChevronUp, CircleUserRound, Star } from 'lucide-react';

const STATUS_CONFIG = {
  completed: {
    label: 'Completed',
    badgeClass: 'bg-emerald-100 text-emerald-700',
    nodeClass: 'bg-emerald-500 border-emerald-500',
    textClass: 'text-emerald-600',
    icon: CheckCircle2,
  },
  current: {
    label: 'Current',
    badgeClass: 'bg-sky-100 text-sky-700',
    nodeClass: 'bg-sky-500 border-sky-500',
    textClass: 'text-sky-600',
    icon: CircleUserRound,
  },
  upcoming: {
    label: 'Upcoming',
    badgeClass: 'bg-slate-100 text-slate-500',
    nodeClass: 'bg-red-500 border-red-500',
    textClass: 'text-slate-500',
    icon: Star,
  },
};

function getStageConfig(stage) {
  return STATUS_CONFIG[stage.status] || STATUS_CONFIG.upcoming;
}

export default function TimelineNode({ stage, isLast, expanded, onToggle, className = '' }) {
  const config = getStageConfig(stage);
  const Icon = stage.icon || config.icon;

  return (
    <div className={`flex min-w-45 flex-1 flex-col items-center text-center ${className}`}>
      <div className="relative flex w-full items-center justify-center">
        <div className={`z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 shadow-sm ${config.nodeClass}`}>
          <Icon className="h-4 w-4 text-white" strokeWidth={2.25} />
        </div>
        {!isLast ? (
          <div className="absolute left-1/2 top-1/2 h-0.5 w-full bg-dashed bg-[linear-gradient(to_right,#d1d5db_0,#d1d5db_60%,transparent_60%,transparent_100%)] bg-size-[12px_2px]" />
        ) : null}
      </div>

      <div className="mt-4 w-full px-2">
        <div className="flex items-center justify-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${config.badgeClass}`}>
            {config.label}
          </span>
        </div>
        <h3 className="mt-2 text-sm font-semibold text-slate-900">{stage.title}</h3>
        {stage.subtitle ? <p className={`mt-1 text-xs ${config.textClass}`}>{stage.subtitle}</p> : null}
        {stage.description ? <p className="mt-2 text-xs leading-5 text-slate-500">{stage.description}</p> : null}

        {stage.description ? (
          <button
            type="button"
            onClick={onToggle}
            className="mt-3 inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-[11px] font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
          >
            {expanded ? 'Hide details' : 'Show details'}
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        ) : null}
      </div>
    </div>
  );
}