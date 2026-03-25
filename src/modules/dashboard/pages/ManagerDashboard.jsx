'use strict';

import { Users, BookOpen, CheckCircle, Award, ChevronRight, Download } from 'lucide-react';
import { useAuth } from '@auth';

// ── Dummy Data ────────────────────────────────────────────────────────────────

const STATS = [
  { label: 'Team Members',      value: '24',  icon: Users,        color: 'blue',   sub: 'Total Direct Reports' },
  { label: 'Courses Assigned',  value: '156', icon: BookOpen,     color: 'green',  sub: '+12 this month'       },
  { label: 'Completed Courses',   value: '87', icon: CheckCircle,  color: 'purple', sub: '136 courses completed'},
  { label: 'Certifications',    value: '148', icon: Award,        color: 'amber',  sub: '+15 this month'       },
];

const RECENT_ACTIVITY = [
  { name: 'John Doe',       action: 'completed', course: 'Advanced Java Programming', time: '2 hours ago' },
  { name: 'Sarah Williams', action: 'started',   course: 'Docker Fundamentals',       time: '5 hours ago' },
  { name: 'Mike Johnson',   action: 'completed', course: '.NET Core Basics',          time: '1 day ago'   },
  { name: 'Jane Smith',     action: 'completed', course: 'React Advanced Patterns',   time: '2 days ago'  },
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

function ActivityBadge({ action }) {
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

function Avatar({ name }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
  return (
    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
      {initials}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ManagerDashboard() {
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
              You're managing a team of{' '}
              <span className="font-semibold text-white">24 talented professionals.</span>
            </p>
            <p className="text-blue-50 text-sm mt-1">
              Here's a snapshot of your team's learning and development progress.
            </p>
          </div>
        </div>
      </div>

      {/* ── Stat cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* ── Section header ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-800">Team Overview</h2>
          <p className="text-xs text-gray-500 mt-0.5">Key metrics and team performance</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 transition-colors shadow-sm">
          <Download className="w-4 h-4" />
          Generate Report
        </button>
      </div>

      {/* ── Recent Activity (full width) ─────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-800">Recent Team Activity</h2>
          <button className="text-xs text-blue-600 hover:underline flex items-center gap-0.5 font-medium">
            View all <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <ul className="divide-y divide-gray-100">
          {RECENT_ACTIVITY.map((activity, i) => (
            <li key={i} className="flex items-center justify-between px-6 py-4 gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={activity.name} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{activity.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {activity.course}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-xs text-gray-400 hidden sm:block">{activity.time}</span>
                <ActivityBadge action={activity.action} />
              </div>
            </li>
          ))}
        </ul>
      </div>
      {/* ── Team Performance banner ──────────────────────────────────────── */}
<div className="bg-gradient-to-r from-cyan-700 to-cyan-800 rounded-xl shadow-md p-6 text-white">
  <h2 className="text-lg font-bold">Team Performance</h2>
  <p className="text-blue-100 text-sm mt-1">
    Your team has completed 148 certifications this quarter.
  </p>
</div>

    </div>
  );
}