import { useState } from 'react';
import { Search, Clock, CheckCircle, PlayCircle, BookOpen, Calendar, Target, X, User } from 'lucide-react';

const coursesData = [
  {
    id: 1,
    title: 'Advanced React Patterns',
    description: 'Master advanced React patterns including hooks, context, and performance optimization techniques.',
    status: 'ongoing',
    duration: '8 hours',
    progress: 60,
    category: 'Frontend',
    dueDate: '2024-02-15',
    instructor: 'Sarah Johnson',
    level: 'Advanced',
    assignedBy: 'Manager',
  },
  {
    id: 2,
    title: 'Node.js Backend Development',
    description: 'Build scalable backend applications with Node.js, Express, and MongoDB.',
    status: 'completed',
    duration: '12 hours',
    progress: 100,
    category: 'Backend',
    dueDate: '2024-01-20',
    instructor: 'Michael Chen',
    level: 'Intermediate',
    assignedBy: 'Admin',
  },
  {
    id: 3,
    title: 'TypeScript Fundamentals',
    description: 'Learn TypeScript from basics to advanced concepts for building type-safe applications.',
    status: 'completed',
    duration: '6 hours',
    progress: 100,
    category: 'Programming',
    dueDate: '2024-01-10',
    instructor: 'Emily Davis',
    level: 'Beginner',
    assignedBy: 'Manager',
  },
  {
    id: 4,
    title: 'System Design Essentials',
    description: 'Understand system design principles and architecture patterns for scalable applications.',
    status: 'not-started',
    duration: '10 hours',
    progress: 0,
    category: 'Architecture',
    dueDate: '2024-03-01',
    instructor: 'David Kumar',
    level: 'Advanced',
    assignedBy: 'Admin',
  },
  {
    id: 5,
    title: 'GraphQL API Development',
    description: 'Build modern APIs with GraphQL, Apollo Server, and best practices.',
    status: 'ongoing',
    duration: '7 hours',
    progress: 35,
    category: 'Backend',
    dueDate: '2024-02-20',
    instructor: 'Lisa Wang',
    level: 'Intermediate',
    assignedBy: 'Manager',
  },
  {
    id: 6,
    title: 'Cloud Computing with AWS',
    description: 'Deploy and manage applications on AWS cloud infrastructure.',
    status: 'not-started',
    duration: '15 hours',
    progress: 0,
    category: 'Cloud',
    dueDate: '2024-03-15',
    instructor: 'Robert Martinez',
    level: 'Advanced',
    assignedBy: 'Admin',
  },
];

const STATUS_STYLES = {
  completed:   'bg-green-100 text-green-700 border border-green-200',
  ongoing:     'bg-blue-100 text-blue-700 border border-blue-200',
  'not-started': 'bg-gray-100 text-gray-600 border border-gray-200',
};

const LEVEL_STYLES = {
  Beginner:     'bg-emerald-50 text-emerald-700',
  Intermediate: 'bg-amber-50 text-amber-700',
  Advanced:     'bg-red-50 text-red-700',
};

function StatusIcon({ status }) {
  if (status === 'completed')   return <CheckCircle className="w-3.5 h-3.5" />;
  if (status === 'ongoing')     return <PlayCircle  className="w-3.5 h-3.5" />;
  return <Clock className="w-3.5 h-3.5" />;
}

export default function EmployeeCourses() {
  const [courses, setCourses]           = useState(coursesData);
  const [searchQuery, setSearchQuery]   = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState(null);

  const stats = {
    completed:  courses.filter((c) => c.status === 'completed').length,
    ongoing:    courses.filter((c) => c.status === 'ongoing').length,
    notStarted: courses.filter((c) => c.status === 'not-started').length,
  };

  const filtered = courses.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = filterStatus === 'all' || c.status === filterStatus;
    return matchSearch && matchFilter;
  });

  function handleStart(id) {
    setCourses((prev) =>
      prev.map((c) => c.id === id ? { ...c, status: 'ongoing', progress: 5 } : c)
    );
    setSelectedCourse((prev) => prev?.id === id ? { ...prev, status: 'ongoing', progress: 5 } : prev);
  }

  function handleComplete(id) {
    setCourses((prev) =>
      prev.map((c) => c.id === id ? { ...c, status: 'completed', progress: 100 } : c)
    );
    setSelectedCourse((prev) => prev?.id === id ? { ...prev, status: 'completed', progress: 100 } : prev);
  }

  return (
    <div className="space-y-6">

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Courses</h1>
        <p className="text-sm text-gray-500 mt-1">Courses assigned to you by your manager or admin</p>
      </div>

      {/* ── Stat cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Completed',   value: stats.completed,  icon: CheckCircle, color: 'green' },
          { label: 'In Progress', value: stats.ongoing,    icon: PlayCircle,  color: 'blue'  },
          { label: 'Not Started', value: stats.notStarted, icon: Clock,       color: 'gray'  },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-6 h-6 text-${color}-600`} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
              <p className={`text-2xl font-bold text-${color}-700 mt-0.5`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search + Filters + Grid ───────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'ongoing', 'completed', 'not-started'].map((f) => (
              <button
                key={f}
                onClick={() => setFilterStatus(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filterStatus === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? 'All' : f === 'not-started' ? 'Not Started' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-500">No courses found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((course) => (
                <div
                  key={course.id}
                  onClick={() => setSelectedCourse(course)}
                  className="rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer group bg-white"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[course.status]}`}>
                      <StatusIcon status={course.status} />
                      {course.status === 'not-started' ? 'Not Started' : course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${LEVEL_STYLES[course.level] ?? 'bg-gray-100 text-gray-600'}`}>
                      {course.level}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                    {course.title}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">{course.description}</p>

                  <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{course.duration}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{course.dueDate}</span>
                  </div>

                  {/* {course.status === 'ongoing' && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span className="font-semibold">{course.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${course.progress}%` }} />
                      </div>
                    </div>
                  )} */}
                  {/* {course.status === 'completed' && (
                    <div className="h-1.5 bg-green-100 rounded-full overflow-hidden mb-3">
                      <div className="h-full bg-green-500 rounded-full w-full" />
                    </div>
                  )} */}

                  <div className="flex gap-2 mt-auto" onClick={(e) => e.stopPropagation()}>
                    {course.status === 'not-started' && (
                      <button
                        onClick={() => handleStart(course.id)}
                        className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        Start Course
                      </button>
                    )}
                    {course.status === 'ongoing' && (
                      <button
                        onClick={() => handleComplete(course.id)}
                        className="flex-1 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        Mark Complete
                      </button>
                    )}
                    {course.status === 'completed' && (
                      <span className="flex-1 py-1.5 text-center bg-green-50 text-green-700 text-xs font-semibold rounded-lg border border-green-200">
                        ✓ Completed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Course detail modal ───────────────────────────────────────── */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-800">Course Details</h2>
              <button onClick={() => setSelectedCourse(null)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-bold text-gray-800">{selectedCourse.title}</h3>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${STATUS_STYLES[selectedCourse.status]}`}>
                  <StatusIcon status={selectedCourse.status} />
                  {selectedCourse.status === 'not-started' ? 'Not Started' : selectedCourse.status.charAt(0).toUpperCase() + selectedCourse.status.slice(1)}
                </span>
              </div>
              <p className="text-sm text-gray-600">{selectedCourse.description}</p>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Clock,     label: 'Duration',   value: selectedCourse.duration   },
                  { icon: Target,    label: 'Level',      value: selectedCourse.level       },
                  { icon: BookOpen,  label: 'Category',   value: selectedCourse.category    },
                  { icon: Calendar,  label: 'Due Date',   value: selectedCourse.dueDate     },
                  { icon: User,      label: 'Instructor', value: selectedCourse.instructor  },
                  { icon: User,      label: 'Assigned By',value: selectedCourse.assignedBy  },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-semibold text-gray-500">{label}</span>
                    </div>
                    <p className="text-sm font-bold text-gray-800">{value}</p>
                  </div>
                ))}
              </div>

              {selectedCourse.status === 'ongoing' && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-gray-600">Progress</span>
                    <span className="font-bold text-blue-700">{selectedCourse.progress}%</span>
                  </div>
                  <div className="h-2 bg-white rounded-full overflow-hidden border border-blue-100">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${selectedCourse.progress}%` }} />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                {selectedCourse.status === 'not-started' && (
                  <button
                    onClick={() => handleStart(selectedCourse.id)}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    Start Course
                  </button>
                )}
                {selectedCourse.status === 'ongoing' && (
                  <button
                    onClick={() => handleComplete(selectedCourse.id)}
                    className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    Mark as Complete
                  </button>
                )}
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}