import { BookOpen, Award, ChevronRight, Download, Building2, Users } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '@auth';

// ── Dummy Data ────────────────────────────────────────────────────────────────

const STATS = [
  { label: 'Total Employees', value: '156', icon: Users,     color: 'blue',   sub: '+12% this month'     },
  { label: 'Total Courses',   value: '48',  icon: BookOpen,  color: 'green',  sub: '+5 this month'       },
  { label: 'Certifications',  value: '148', icon: Award,     color: 'purple', sub: '+15 this month'      },
  { label: 'Departments',     value: '6',   icon: Building2, color: 'amber',  sub: 'Active departments'  },
];

const DEPARTMENTS = [
  { name: 'Product Engineering', employees: 45, courses: 12 },
  { name: 'Data Engineering',    employees: 28, courses: 9  },
  { name: 'DevOps',              employees: 18, courses: 7  },
  { name: 'Sales',               employees: 32, courses: 8  },
  { name: 'Marketing',           employees: 24, courses: 6  },
  { name: 'HR',                  employees: 15, courses: 4  },
];

const DEPT_CHART_DATA = DEPARTMENTS.map((d) => ({
  name:      d.name.length > 12 ? d.name.split(' ')[0] : d.name,
  Employees: d.employees,
  Courses:   d.courses,
}));

const RECENT_ACTIVITY = [
  { user: 'John Doe',       action: 'completed React Fundamentals course',   time: '2 hours ago' },
  { user: 'Jane Smith',     action: 'assigned JavaScript Advanced course',    time: '4 hours ago' },
  { user: 'Mike Johnson',   action: 'submitted quiz for review',             time: '6 hours ago' },
  { user: 'Sarah Williams', action: 'promoted to Senior Developer',          time: '1 day ago'   },
  { user: 'Robert Brown',   action: 'completed all assigned certifications', time: '2 days ago'  },
];

// ── Color maps ────────────────────────────────────────────────────────────────

const ICON_BG = {
  green:  'bg-green-100',
  purple: 'bg-purple-100',
  blue:   'bg-blue-100',
  amber:  'bg-amber-100',
};
const ICON_COLOR = {
  green:  'text-green-600',
  purple: 'text-purple-600',
  blue:   'text-blue-600',
  amber:  'text-amber-600',
};
const STAT_VALUE_COLOR = {
  green:  'text-green-700',
  purple: 'text-purple-700',
  blue:   'text-blue-700',
  amber:  'text-amber-700',
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

function Avatar({ name }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
  return (
    <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
      {initials}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { user } = useAuth();
  const firstName = user?.first_name ?? 'there';

  return (
    <div className="space-y-6">

      {/* ── Hero banner ──────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-md p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold leading-snug">
              Welcome back, {firstName}!
            </h1>
            <p className="text-blue-100 text-sm mt-1">
              Here's what's happening across your organisation today.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-4 text-blue-50 text-sm">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                156 employees across 6 departments
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                48 active courses
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

      {/* ── Department Overview chart + table ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Bar chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-800">Department Overview</h2>
            <p className="text-xs text-gray-400 mt-0.5">Employees vs active courses per department</p>
          </div>
          <div className="p-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEPT_CHART_DATA} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Employees" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Courses"   fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-gray-800">Departments</h2>
              <p className="text-xs text-gray-400 mt-0.5">Headcount &amp; active courses</p>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors">
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Department</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Employees</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Active Courses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {DEPARTMENTS.map((dept) => (
                <tr key={dept.name} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-800">{dept.name}</td>
                  <td className="px-5 py-3 text-gray-600">{dept.employees}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                      {dept.courses}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Recent Activity ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-800">Recent Activity</h2>
          <button className="text-xs text-blue-600 hover:underline flex items-center gap-0.5 font-medium">
            View all <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <ul className="divide-y divide-gray-100">
          {RECENT_ACTIVITY.map((activity, i) => (
            <li
              key={i}
              className="flex items-center justify-between px-6 py-4 gap-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={activity.user} />
                <div className="min-w-0">
                  <p className="text-sm text-gray-800 truncate">
                    <span className="font-semibold">{activity.user}</span>{' '}
                    <span className="text-gray-500">{activity.action}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}