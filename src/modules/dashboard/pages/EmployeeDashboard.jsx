import { BookOpen, Award, Clock, Target, Calendar, ChevronRight, Bell } from 'lucide-react';
import { useAuth } from '@auth';

// ── Dummy Data ────────────────────────────────────────────────────────────────

const STATS = [
  { label: 'Courses Assigned', value: '12', icon: BookOpen,  color: 'blue',   sub: '+3 this month' },
  { label: 'Completed',        value: '8',  icon: Award,     color: 'green',  sub: '67% completion rate' },
  { label: 'In Progress',      value: '3',  icon: Clock,     color: 'amber',  sub: '2 due this week' },
  { label: 'Certificates',     value: '8',  icon: Award,     color: 'purple', sub: '+2 this month' },
];

const RECENT_ACTIVITY = [
  { name: 'Advanced React Patterns',      action: 'completed',   time: '2 days ago'  },
  { name: 'Node.js Backend Development',  action: 'in-progress', time: '5 days ago'  },
  { name: 'TypeScript Fundamentals',      action: 'completed',   time: '1 week ago'  },
  { name: 'GraphQL API Development',      action: 'in-progress', time: '2 weeks ago' },
];

const DEADLINES = [
  { course: 'Advanced React Patterns',   dueDate: '15 Feb 2025', daysLeft: 5  },
  { course: 'GraphQL API Development',   dueDate: '20 Feb 2025', daysLeft: 10 },
  { course: 'System Design Essentials',  dueDate: '01 Mar 2025', daysLeft: 19 },
];

// ── Color maps (Tailwind purge-safe static classes) ───────────────────────────

const ICON_BG = {
  blue:   'bg-blue-100',
  green:  'bg-green-100',
  amber:  'bg-amber-100',
  purple: 'bg-purple-100',
};
const ICON_COLOR = {
  blue:   'text-blue-600',
  green:  'text-green-600',
  amber:  'text-amber-600',
  purple: 'text-purple-600',
};
const STAT_VALUE_COLOR = {
  blue:   'text-blue-700',
  green:  'text-green-700',
  amber:  'text-amber-700',
  purple: 'text-purple-700',
};

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, color }) {
  const Icon = icon;
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${ICON_BG[color]}`}>
        <Icon className={`w-6 h-6 ${ICON_COLOR[color]}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide truncate">{label}</p>
        <p className={`text-2xl font-bold mt-0.5 ${STAT_VALUE_COLOR[color]}`}>{value}</p>
        {/* <p className="text-xs text-gray-400 mt-0.5 truncate">{sub}</p> */}
      </div>
    </div>
  );
}
function StatusBadge({ action }) {
  const isCompleted = action === 'completed';
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${
        isCompleted
          ? 'bg-green-100 text-green-700'
          : 'bg-blue-100 text-blue-700'
      }`}
    >
      {isCompleted ? 'Completed' : 'In Progress'}
    </span>
  );
}

function DeadlineBadge({ daysLeft }) {
  const urgent = daysLeft <= 7;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
        urgent
          ? 'bg-red-100 text-red-600'
          : 'bg-blue-50 text-blue-600'
      }`}
    >
      <Bell className="w-3 h-3" />
      {daysLeft}d left
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const firstName = user?.first_name ?? 'there';

  return (
    <div className="space-y-6">

      {/* ── Hero banner ──────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-cyan-700 to-cyan-800 rounded-xl shadow-md p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold leading-snug">
              Welcome back, {firstName}!
            </h1>
            <p className="text-blue-100 text-sm mt-1">
              You're making great progress on your learning journey.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-4 text-blue-50 text-sm">
              <span className="flex items-center gap-1.5">
                <Target className="w-4 h-4" />
                3 courses in progress
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* ── Stat cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* ── Two-column section ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-800">Recent Activity</h2>
            <button className="text-xs text-blue-600 hover:underline flex items-center gap-0.5 font-medium">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <ul className="divide-y divide-gray-100">
            {RECENT_ACTIVITY.map((activity, i) => (
              <li key={i} className="flex items-center justify-between px-6 py-4 gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{activity.name}</p>
                  {/* <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p> */}
                </div>
                <StatusBadge action={activity.action} />
              </li>
            ))}
          </ul>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-800">Upcoming Deadlines</h2>
            <button className="text-xs text-blue-600 hover:underline flex items-center gap-0.5 font-medium">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <ul className="divide-y divide-gray-100">
            {DEADLINES.map((item, i) => (
              <li key={i} className="flex items-center justify-between px-6 py-4 gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{item.course}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Due: {item.dueDate}</p>
                </div>
                <DeadlineBadge daysLeft={item.daysLeft} />
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* ── Bottom CTA banner ────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 rounded-xl shadow-md p-6 text-white flex items-center justify-between gap-6">
        <div>
          <h2 className="text-lg font-bold">Great Progress!</h2>
          <p className="text-green-100 text-sm mt-1">
            You've completed 8 courses this quarter. Keep up the excellent work!
          </p>
        </div>
        <div className="flex-shrink-0 text-center">
          <p className="text-4xl font-extrabold leading-none">8</p>
          <p className="text-green-100 text-xs mt-1">Courses<br />Completed</p>
        </div>
      </div>

    </div>
  );
}