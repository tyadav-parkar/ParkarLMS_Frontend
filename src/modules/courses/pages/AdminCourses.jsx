import { useState } from 'react';
import {
  Search, X, UserPlus, Plus, Pencil, Trash, Eye, Users
} from 'lucide-react';

const initialCourses = [
  { id: 1, title: 'React Fundamentals', category: 'Technical', difficulty: 'Beginner', duration: 10, students: 45, status: 'active' },
  { id: 2, title: 'Node.js Backend Development', category: 'Technical', difficulty: 'Intermediate', duration: 15, students: 32, status: 'active' },
  { id: 3, title: 'AWS Cloud Practitioner', category: 'Certification', difficulty: 'Beginner', duration: 20, students: 28, status: 'active' },
  { id: 4, title: 'Communication Skills', category: 'Soft Skills', difficulty: 'Beginner', duration: 8, students: 56, status: 'active' },
  { id: 5, title: 'System Design', category: 'Technical', difficulty: 'Advanced', duration: 25, students: 18, status: 'draft' },
  { id: 6, title: 'Docker & Kubernetes', category: 'Technical', difficulty: 'Intermediate', duration: 35, students: 15, status: 'active' },
];

const ALL_EMPLOYEES = [
  { id: 1, name: 'John Doe', role: 'GTE', dept: 'Engineering' },
  { id: 2, name: 'Sarah Williams', role: 'SE1', dept: 'Engineering' },
  { id: 3, name: 'Mike Johnson', role: 'SE2', dept: 'Backend' },
  { id: 4, name: 'Jane Smith', role: 'SDE', dept: 'Frontend' },
  { id: 5, name: 'Tom Brown', role: 'Intern', dept: 'DevOps' },
  { id: 6, name: 'Alice Chen', role: 'GTE', dept: 'Data' },
  { id: 7, name: 'Bob Kumar', role: 'SE1', dept: 'Engineering' },
  { id: 8, name: 'Diana Lee', role: 'Manager', dept: 'Engineering' },
];

const ROLES = ['All Roles', 'GTE', 'SE1', 'SE2', 'SDE', 'Intern', 'Manager'];
const DEPTS = ['All Departments', 'Engineering', 'Backend', 'Frontend', 'DevOps', 'Data'];

const DIFFICULTY_STYLES = {
  Beginner: 'bg-emerald-50 text-emerald-700',
  Intermediate: 'bg-amber-50 text-amber-700',
  Advanced: 'bg-red-50 text-red-700',
};

function Avatar({ name }) {
  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase();
  return (
    <div className="w-7 h-7 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
      {initials}
    </div>
  );
}

export default function AdminCourses() {
  const [courses, setCourses] = useState(initialCourses);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [createModal, setCreateModal] = useState(false);
  const [assignModal, setAssignModal] = useState(null);
  const [assignRole, setAssignRole] = useState('All Roles');
  const [assignDept, setAssignDept] = useState('All Departments');
  const [assignSelected, setAssignSelected] = useState([]);
  const [assignSuccess, setAssignSuccess] = useState(false);
  const [assignDeadline, setAssignDeadline] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Technical',
    difficulty: 'Beginner',
    duration: ''
  });

  const categories = ['all', ...new Set(initialCourses.map((c) => c.category))];

  const filtered = courses.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = categoryFilter === 'all' || c.category === categoryFilter;
    return matchSearch && matchCat;
  });

  function handleCreate(e) {
    e.preventDefault();
    const newCourse = {
      id: courses.length + 1,
      title: form.title,
      category: form.category,
      difficulty: form.difficulty,
      duration: parseInt(form.duration) || 0,
      students: 0,
      status: 'active',
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

  const filteredEmployees = ALL_EMPLOYEES.filter((e) => {
    const matchRole = assignRole === 'All Roles' || e.role === assignRole;
    const matchDept = assignDept === 'All Departments' || e.dept === assignDept;
    return matchRole && matchDept;
  });

  function toggleEmployee(id) {
    setAssignSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function handleAssign() {
    setAssignSuccess(true);
    setTimeout(() => {
      setAssignSuccess(false);
      setAssignModal(null);
      setAssignSelected([]);
      setAssignRole('All Roles');
      setAssignDept('All Departments');
      setAssignDeadline('');
    }, 1200);
  }

  const stats = {
    total: courses.length,
    active: courses.filter((c) => c.status === 'active').length,
    enrolled: courses.reduce((s, c) => s + c.students, 0),
  };

  return (
    <div className="space-y-6">

      {/* 🔷 HEADER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-700 to-cyan-800 px-7 py-6 shadow-lg shadow-cyan-900/20">
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full border border-cyan-700/30" />
        <div className="absolute -right-2 -top-2 w-24 h-24 rounded-full border border-cyan-600/20" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-cyan-700/40 flex items-center justify-center">
              <Users className="w-4 h-4 text-cyan-300" />
            </div>
            <h1 className="text-xl font-bold text-white">
              Course Management
            </h1>
          </div>
          <p className="text-cyan-300/70 text-sm ml-11">
            Create, manage and assign courses across the organisation
          </p>
        </div>
      </div>

      {/* 🔷 ACTION BAR */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          Manage all courses in the system
        </span>

        <button
          onClick={() => setCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Course
        </button>
      </div>

      {/* 🔷 STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Courses', value: stats.total },
          { label: 'Active Courses', value: stats.active },
          { label: 'Total Enrollments', value: stats.enrolled },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
            <p className="text-2xl font-bold text-cyan-800 mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* 🔷 TABLE */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-800">All Courses</h2>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-700"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-700"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'all' ? 'All Categories' : c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Course Title', 'Category', 'Difficulty', 'Duration', 'Enrolled', 'Status', 'Actions'].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {filtered.map((course) => (
              <tr key={course.id} className="hover:bg-cyan-50/40">
                <td className="px-5 py-3 font-semibold text-gray-800">{course.title}</td>

                <td className="px-5 py-3">
                  <span className="px-2.5 py-0.5 text-xs bg-cyan-50 text-cyan-700 rounded-full">
                    {course.category}
                  </span>
                </td>

                <td className="px-5 py-3">
                  <span className={`px-2.5 py-0.5 text-xs rounded-full ${DIFFICULTY_STYLES[course.difficulty]}`}>
                    {course.difficulty}
                  </span>
                </td>

                <td className="px-5 py-3">{course.duration}h</td>
                <td className="px-5 py-3">{course.students}</td>

                <td className="px-5 py-3">
                  <span className={`px-2.5 py-0.5 text-xs rounded-full ${
                    course.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {course.status === 'active' ? 'Active' : 'Draft'}
                  </span>
                </td>

                <td className="px-5 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setAssignModal(course); setAssignSelected([]); }}
                      className="p-1.5 text-cyan-700 hover:bg-cyan-50 rounded-lg"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>

                    <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg">
                      <Eye className="w-4 h-4" />
                    </button>

                    <button className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg">
                      <Pencil className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(course.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-400">
                  No courses found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}