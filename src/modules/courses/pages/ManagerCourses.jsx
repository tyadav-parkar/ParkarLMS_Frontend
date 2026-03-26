import { useState } from 'react';
import { Search, Clock, CheckCircle, PlayCircle, BookOpen, Calendar, Target, X, User, UserPlus, Filter } from 'lucide-react';

// ── My Courses (assigned to this manager) ────────────────────────────────────
const myCoursesData = [
  {
    id: 'm1',
    title: 'Executive Leadership Program',
    description: 'Advanced leadership and team management skills for senior managers.',
    status: 'ongoing',
    duration: '60 hours',
    progress: 40,
    category: 'Leadership',
    dueDate: '2024-03-10',
    instructor: 'Dr. James Carter',
    level: 'Advanced',
    assignedBy: 'Admin',
  },
  {
    id: 'm2',
    title: 'Advanced Project Management',
    description: 'Learn advanced project management techniques and methodologies.',
    status: 'not-started',
    duration: '45 hours',
    progress: 0,
    category: 'Management',
    dueDate: '2024-04-01',
    instructor: 'Anna Lee',
    level: 'Advanced',
    assignedBy: 'Admin',
  },
  {
    id: 'm1',
    title: 'Executive Leadership Program II',
    description: 'Advanced leadership and team management skills for senior managers.',
    status: 'not-started',
    duration: '60 hours',
    progress: 40,
    category: 'Leadership',
    dueDate: '2024-03-10',
    instructor: 'Dr. James Carter',
    level: 'Advanced',
    assignedBy: 'Admin',
  },
  {
    id: 'm3',
    title: 'Agile & Scrum Mastery',
    description: 'Deep dive into Agile methodologies and Scrum framework for team leads.',
    status: 'completed',
    duration: '20 hours',
    progress: 100,
    category: 'Agile',
    dueDate: '2024-01-15',
    instructor: 'Mark Stevens',
    level: 'Intermediate',
    assignedBy: 'Admin',
  },
];

// ── Course Catalog (to assign to team) ───────────────────────────────────────
const catalogData = [
  { id: 1, title: 'Advanced Java Programming',      description: 'Master advanced Java including multithreading and design patterns.',        technology: 'Java',   duration: '40 hours', level: 'Advanced',     enrolledCount: 12 },
  { id: 2, title: '.NET Core Fundamentals',         description: 'Learn .NET Core and build modern web applications.',                        technology: '.NET',   duration: '30 hours', level: 'Beginner',     enrolledCount: 8  },
  { id: 3, title: 'Docker & Kubernetes Mastery',    description: 'Complete guide to containerization and orchestration.',                     technology: 'DevOps', duration: '35 hours', level: 'Intermediate', enrolledCount: 15 },
  { id: 4, title: 'React Advanced Patterns',        description: 'Deep dive into React hooks, context and advanced component patterns.',      technology: 'React',  duration: '25 hours', level: 'Advanced',     enrolledCount: 10 },
  { id: 5, title: 'Python for Data Science',        description: 'Python programming with focus on data analysis and machine learning.',      technology: 'Python', duration: '45 hours', level: 'Intermediate', enrolledCount: 6  },
  { id: 6, title: 'Spring Boot Microservices',      description: 'Build scalable microservices using Spring Boot framework.',                 technology: 'Java',   duration: '50 hours', level: 'Advanced',     enrolledCount: 9  },
];

const TEAM_MEMBERS = [
  { id: 1, name: 'John Doe',       role: 'GTE'  },
  { id: 2, name: 'Sarah Williams', role: 'SE1'  },
  { id: 3, name: 'Mike Johnson',   role: 'SE2'  },
  { id: 4, name: 'Jane Smith',     role: 'SDE'  },
  { id: 5, name: 'Tom Brown',      role: 'Intern'},
];

const ROLES = ['All Roles', 'GTE', 'SE1', 'SE2', 'SDE', 'Intern'];

const STATUS_STYLES = {
  completed:     'bg-green-100 text-green-700 border border-green-200',
  ongoing:       'bg-blue-100 text-blue-700 border border-blue-200',
  'not-started': 'bg-gray-100 text-gray-600 border border-gray-200',
};

const LEVEL_STYLES = {
  Beginner:     'bg-emerald-50 text-emerald-700',
  Intermediate: 'bg-amber-50 text-amber-700',
  Advanced:     'bg-red-50 text-red-700',
};

function StatusIcon({ status }) {
  if (status === 'completed') return <CheckCircle className="w-3.5 h-3.5" />;
  if (status === 'ongoing')   return <PlayCircle  className="w-3.5 h-3.5" />;
  return <Clock className="w-3.5 h-3.5" />;
}

function Avatar({ name }) {
  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase();
  return (
    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
      {initials}
    </div>
  );
}

export default function ManagerCourses() {
  const [activeTab, setActiveTab]               = useState('catalog');
  const [myCourses, setMyCourses]               = useState(myCoursesData);
  const [searchQuery, setSearchQuery]           = useState('');
  const [filterStatus, setFilterStatus]         = useState('all');
  const [techFilter, setTechFilter]             = useState('all');
  const [levelFilter, setLevelFilter]           = useState('all');
  const [selectedCourse, setSelectedCourse]     = useState(null);
  const [assignModal, setAssignModal]           = useState(null); // course to assign
  const [assignRole, setAssignRole]             = useState('All Roles');
  const [assignSelected, setAssignSelected]     = useState([]);
  const [assignedSuccess, setAssignedSuccess]   = useState(false);
  const [assignDeadline, setAssignDeadline] = useState('');

  // My courses actions
  function handleStart(id) {
    setMyCourses((prev) => prev.map((c) => c.id === id ? { ...c, status: 'ongoing', progress: 5 } : c));
    setSelectedCourse((prev) => prev?.id === id ? { ...prev, status: 'ongoing', progress: 5 } : prev);
  }
  function handleComplete(id) {
    setMyCourses((prev) => prev.map((c) => c.id === id ? { ...c, status: 'completed', progress: 100 } : c));
    setSelectedCourse((prev) => prev?.id === id ? { ...prev, status: 'completed', progress: 100 } : prev);
  }

  // Filtered my courses
  const filteredMy = myCourses.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = filterStatus === 'all' || c.status === filterStatus;
    return matchSearch && matchFilter;
  });

  // Filtered catalog
  const technologies = ['all', ...new Set(catalogData.map((c) => c.technology))];
  const levels       = ['all', 'Beginner', 'Intermediate', 'Advanced'];
  const filteredCatalog = catalogData.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchTech   = techFilter === 'all' || c.technology === techFilter;
    const matchLevel  = levelFilter === 'all' || c.level === levelFilter;
    return matchSearch && matchTech && matchLevel;
  });

  // Assign modal
  const filteredMembers = TEAM_MEMBERS.filter((m) =>
    assignRole === 'All Roles' || m.role === assignRole
  );
  function toggleMember(id) {
    setAssignSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }
  function handleAssign() {
    setAssignedSuccess(true);
    setTimeout(() => {
      setAssignedSuccess(false);
      setAssignModal(null);
      setAssignSelected([]);
      setAssignRole('All Roles');
    }, 1200);
  }

  const myStats = {
    completed:  myCourses.filter((c) => c.status === 'completed').length,
    ongoing:    myCourses.filter((c) => c.status === 'ongoing').length,
    notStarted: myCourses.filter((c) => c.status === 'not-started').length,
  };

  return (
    <div className="space-y-6">

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Course Management</h1>
        <p className="text-sm text-gray-500 mt-1">View your courses and assign courses to your team</p>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-1.5 flex gap-1 w-fit">
        {[
          { key: 'catalog',    label: 'Course Catalog'  },
          { key: 'my-courses', label: 'My Courses'      },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => { setActiveTab(key); setSearchQuery(''); setFilterStatus('all'); }}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === key ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Course Catalog tab ───────────────────────────────────────── */}
      {activeTab === 'catalog' && (
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
            <div className="flex gap-2">
              <select
                value={techFilter}
                onChange={(e) => setTechFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {technologies.map((t) => (
                  <option key={t} value={t}>{t === 'all' ? 'All Technologies' : t}</option>
                ))}
              </select>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {levels.map((l) => (
                  <option key={l} value={l}>{l === 'all' ? 'All Levels' : l}</option>
                ))}
              </select>
            </div>
            <span className="text-xs text-gray-400 flex-shrink-0">
              {filteredCatalog.length} of {catalogData.length} courses
            </span>
          </div>

          <div className="p-6">
            {filteredCatalog.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-500">No courses found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredCatalog.map((course) => (
                  <div key={course.id} className="rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow bg-white">
                    <div className="flex items-start justify-between mb-3">
                      <span className="inline-block px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 rounded-full">
                        {course.technology}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${LEVEL_STYLES[course.level] ?? 'bg-gray-100 text-gray-600'}`}>
                        {course.level}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-800 mb-1 line-clamp-2">{course.title}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">{course.description}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{course.duration}</span>
                      <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{course.enrolledCount} enrolled</span>
                    </div>
                    <button
                      onClick={() => { setAssignModal(course); setAssignSelected([]); setAssignRole('All Roles'); }}
                      className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      <UserPlus className="w-3.5 h-3.5" /> Assign to Team
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── My Courses tab ───────────────────────────────────────────── */}
      {activeTab === 'my-courses' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Completed',   value: myStats.completed,  icon: CheckCircle, color: 'green' },
              { label: 'In Progress', value: myStats.ongoing,    icon: PlayCircle,  color: 'blue'  },
              { label: 'Not Started', value: myStats.notStarted, icon: Clock,       color: 'gray'  },
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
                      filterStatus === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {f === 'all' ? 'All' : f === 'not-started' ? 'Not Started' : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              {filteredMy.length === 0 ? (
                <div className="text-center py-16">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-gray-500">No courses found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredMy.map((course) => (
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
                      <h3 className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">{course.title}</h3>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3">{course.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{course.duration}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{course.dueDate}</span>
                      </div>
                      {/* {course.status === 'ongoing' && (
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Progress</span><span className="font-semibold">{course.progress}%</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${course.progress}%` }} />
                          </div>
                        </div>
                      )} */}
                      <div className="flex gap-2 mt-auto" onClick={(e) => e.stopPropagation()}>
                        {course.status === 'not-started' && (
                          <button onClick={() => handleStart(course.id)} className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors">
                            Start Course
                          </button>
                        )}
                        {course.status === 'ongoing' && (
                          <button onClick={() => handleComplete(course.id)} className="flex-1 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors">
                            Mark Complete
                          </button>
                        )}
                        {course.status === 'completed' && (
                          <span className="flex-1 py-1.5 text-center bg-green-50 text-green-700 text-xs font-semibold rounded-lg border border-green-200">✓ Completed</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

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
                  { icon: Clock,    label: 'Duration',    value: selectedCourse.duration    },
                  { icon: Target,   label: 'Level',       value: selectedCourse.level        },
                  { icon: BookOpen, label: 'Category',    value: selectedCourse.category     },
                  { icon: Calendar, label: 'Due Date',    value: selectedCourse.dueDate      },
                  { icon: User,     label: 'Instructor',  value: selectedCourse.instructor   },
                  { icon: User,     label: 'Assigned By', value: selectedCourse.assignedBy   },
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
                  <button onClick={() => handleStart(selectedCourse.id)} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors">
                    Start Course
                  </button>
                )}
                {selectedCourse.status === 'ongoing' && (
                  <button onClick={() => handleComplete(selectedCourse.id)} className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors">
                    Mark as Complete
                  </button>
                )}
                <button onClick={() => setSelectedCourse(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Assign modal ─────────────────────────────────────────────── */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-gray-800">Assign Course</h2>
                <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[260px]">{assignModal.title}</p>
              </div>
              <button onClick={() => setAssignModal(null)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Filter by role */}
             <div>
  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Filter by Role</label>
  <select
    value={assignRole}
    onChange={(e) => setAssignRole(e.target.value)}
    className="mt-1.5 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
  </select>
</div>
<div>
  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
    Deadline * <span className="text-red-500">required before assigning</span>
  </label>
  <input
    type="date"
    value={assignDeadline}
    onChange={(e) => setAssignDeadline(e.target.value)}
    min={new Date().toISOString().split('T')[0]}
    className="mt-1.5 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
</div>

              {/* Team members list */}
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Select Team Members</label>
                <div className="mt-2 space-y-2 max-h-52 overflow-y-auto">
                  {filteredMembers.map((member) => (
                    <label
                      key={member.id}
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={assignSelected.includes(member.id)}
                        onChange={() => toggleMember(member.id)}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <Avatar name={member.name} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800">{member.name}</p>
                        <p className="text-xs text-gray-400">{member.role}</p>
                      </div>
                    </label>
                  ))}
                  {filteredMembers.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">No members for this role</p>
                  )}
                </div>
              </div>

              {assignedSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 text-sm text-green-700 font-semibold text-center">
                  ✓ Course assigned successfully!
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button onClick={() => setAssignModal(null)} className="flex-1 py-2.5 border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleAssign}
                  disabled={assignSelected.length === 0}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  Assign ({assignSelected.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}