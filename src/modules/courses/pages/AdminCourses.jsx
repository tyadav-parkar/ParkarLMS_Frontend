import { useState } from 'react';
import { Search, Clock, BookOpen, X, UserPlus, Plus, Pencil, Trash, Eye, Filter } from 'lucide-react';

const initialCourses = [
  { id: 1, title: 'React Fundamentals',          category: 'Technical',   difficulty: 'Beginner',     duration: 10, students: 45, status: 'active' },
  { id: 2, title: 'Node.js Backend Development', category: 'Technical',   difficulty: 'Intermediate', duration: 15, students: 32, status: 'active' },
  { id: 3, title: 'AWS Cloud Practitioner',       category: 'Certification', difficulty: 'Beginner',   duration: 20, students: 28, status: 'active' },
  { id: 4, title: 'Communication Skills',         category: 'Soft Skills', difficulty: 'Beginner',     duration: 8,  students: 56, status: 'active' },
  { id: 5, title: 'System Design',               category: 'Technical',   difficulty: 'Advanced',     duration: 25, students: 18, status: 'draft'  },
  { id: 6, title: 'Docker & Kubernetes',          category: 'Technical',   difficulty: 'Intermediate', duration: 35, students: 15, status: 'active' },
];

const ALL_EMPLOYEES = [
  { id: 1,  name: 'John Doe',       role: 'GTE',    dept: 'Engineering' },
  { id: 2,  name: 'Sarah Williams', role: 'SE1',    dept: 'Engineering' },
  { id: 3,  name: 'Mike Johnson',   role: 'SE2',    dept: 'Backend'     },
  { id: 4,  name: 'Jane Smith',     role: 'SDE',    dept: 'Frontend'    },
  { id: 5,  name: 'Tom Brown',      role: 'Intern', dept: 'DevOps'      },
  { id: 6,  name: 'Alice Chen',     role: 'GTE',    dept: 'Data'        },
  { id: 7,  name: 'Bob Kumar',      role: 'SE1',    dept: 'Engineering' },
  { id: 8,  name: 'Diana Lee',      role: 'Manager',dept: 'Engineering' },
];

const ROLES = ['All Roles', 'GTE', 'SE1', 'SE2', 'SDE', 'Intern', 'Manager'];
const DEPTS = ['All Departments', 'Engineering', 'Backend', 'Frontend', 'DevOps', 'Data'];

const DIFFICULTY_STYLES = {
  Beginner:     'bg-emerald-50 text-emerald-700',
  Intermediate: 'bg-amber-50 text-amber-700',
  Advanced:     'bg-red-50 text-red-700',
};

function Avatar({ name }) {
  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase();
  return (
    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
      {initials}
    </div>
  );
}

export default function AdminCourses() {
  const [courses, setCourses]           = useState(initialCourses);
  const [searchQuery, setSearchQuery]   = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [createModal, setCreateModal]   = useState(false);
  const [assignModal, setAssignModal]   = useState(null);
  const [assignRole, setAssignRole]     = useState('All Roles');
  const [assignDept, setAssignDept]     = useState('All Departments');
  const [assignSelected, setAssignSelected] = useState([]);
  const [assignSuccess, setAssignSuccess]   = useState(false);
  const [assignDeadline, setAssignDeadline] = useState('');

  // form state
  const [form, setForm] = useState({ title: '', description: '', category: 'Technical', difficulty: 'Beginner', duration: '' });

  const categories = ['all', ...new Set(initialCourses.map((c) => c.category))];

  const filtered = courses.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat    = categoryFilter === 'all' || c.category === categoryFilter;
    return matchSearch && matchCat;
  });

  function handleCreate(e) {
    e.preventDefault();
    const newCourse = {
      id:         courses.length + 1,
      title:      form.title,
      category:   form.category,
      difficulty: form.difficulty,
      duration:   parseInt(form.duration) || 0,
      students:   0,
      status:     'active',
    };
    setCourses([newCourse, ...courses]);
    setCreateModal(false);
    setForm({ title: '', description: '', category: 'Technical', difficulty: 'Beginner', duration: '' });
  }

  function handleDelete(id) {
    if (window.confirm('Delete this course?')) {
      setCourses((prev) => prev.filter((c) => c.id !== id));
    }
  }

  // Assign modal
  const filteredEmployees = ALL_EMPLOYEES.filter((e) => {
    const matchRole = assignRole === 'All Roles' || e.role === assignRole;
    const matchDept = assignDept === 'All Departments' || e.dept === assignDept;
    return matchRole && matchDept;
  });

  function toggleEmployee(id) {
    setAssignSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  function handleAssign() {
    setAssignSuccess(true);
    setTimeout(() => {
      setAssignSuccess(false);
      setAssignModal(null);
      setAssignSelected([]);
      setAssignRole('All Roles');
      setAssignDept('All Departments');
    }, 1200);
  }

  const stats = {
    total:    courses.length,
    active:   courses.filter((c) => c.status === 'active').length,
    enrolled: courses.reduce((s, c) => s + c.students, 0),
  };

  return (
    <div className="space-y-6">

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Course Management</h1>
          <p className="text-sm text-gray-500 mt-1">Create, manage and assign courses across the organisation</p>
        </div>
        <button
          onClick={() => setCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Create Course
        </button>
      </div>

      {/* ── Stat cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Courses',     value: stats.total,    color: 'blue'   },
          { label: 'Active Courses',    value: stats.active,   color: 'green'  },
          { label: 'Total Enrollments', value: stats.enrolled, color: 'purple' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
            <p className={`text-2xl font-bold text-${color}-700 mt-1`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Courses table ────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-800">All Courses</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Course Title', 'Category', 'Difficulty', 'Duration', 'Enrolled', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-semibold text-gray-800">{course.title}</td>
                  <td className="px-5 py-3">
                    <span className="inline-block px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 rounded-full">{course.category}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full ${DIFFICULTY_STYLES[course.difficulty] ?? 'bg-gray-100 text-gray-600'}`}>
                      {course.difficulty}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{course.duration}h</td>
                  <td className="px-5 py-3 text-gray-600">{course.students}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                      course.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {course.status === 'active' ? 'Active' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setAssignModal(course); setAssignSelected([]); }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Assign"
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" title="View">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Edit">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm">No courses found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Create Course modal ───────────────────────────────────────── */}
      {createModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-800">Create New Course</h2>
              <button onClick={() => setCreateModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Course Title *</label>
                <input
                  type="text" required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Advanced Java Programming"
                  className="mt-1.5 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Course description..."
                  className="mt-1.5 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="mt-1.5 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {['Technical', 'Soft Skills', 'Certification', 'Compliance'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Difficulty</label>
                  <select
                    value={form.difficulty}
                    onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                    className="mt-1.5 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {['Beginner', 'Intermediate', 'Advanced'].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Duration (hrs)</label>
                  <input
                    type="number" min="1"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    placeholder="10"
                    className="mt-1.5 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setCreateModal(false)} className="flex-1 py-2.5 border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors">
                  Create Course
                </button>
              </div>
            </form>
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

              {/* Filter by department */}
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Filter by Department</label>
                <select
                  value={assignDept}
                  onChange={(e) => setAssignDept(e.target.value)}
                  className="mt-1.5 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {DEPTS.map((d) => <option key={d} value={d}>{d}</option>)}
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

              {/* Employee list */}
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Select Employees
                  <span className="ml-1 text-gray-400 normal-case font-normal">({filteredEmployees.length} shown)</span>
                </label>
                <div className="mt-2 space-y-2 max-h-52 overflow-y-auto">
                  {filteredEmployees.map((emp) => (
                    <label key={emp.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={assignSelected.includes(emp.id)}
                        onChange={() => toggleEmployee(emp.id)}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <Avatar name={emp.name} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-800">{emp.name}</p>
                        <p className="text-xs text-gray-400">{emp.role} · {emp.dept}</p>
                      </div>
                    </label>
                  ))}
                  {filteredEmployees.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">No employees for selected filters</p>
                  )}
                </div>
              </div>

              {assignSuccess && (
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