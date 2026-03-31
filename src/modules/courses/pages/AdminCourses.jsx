import { useMemo, useState, useCallback } from 'react';
import { Plus, Search, BookOpen } from 'lucide-react';
import { Modal, Pagination } from '@shared';
import { useAuth } from '@auth';

import { useCourses } from '../hooks/useCourses';
import CourseList from '../components/CourseList';
import CourseForm from '../components/CourseForm';
import AssignmentModal from '../components/AssignmentModal';
import ArchiveCourseModal from '../components/ArchiveCourseModal';
import CourseAssignmentsModal from '../components/CourseAssignmentsModal';
import CancelAssignmentModal from '../components/CancelAssignmentModal';

const PAGE_LIMIT = 30;

const initialForm = {
  title: '', provider: '', externalUrl: '', category: '',
  difficulty: 'Beginner', estimatedDurationHours: '',
  description: '', prerequisites: '',
};

export default function AdminCourses() {
  const { can, user } = useAuth();
  const canEdit   = can('course_edit');
  const canAssign = can('course_assign');

  const {
    courses, pagination, loading, error,
    saving, formError, setFormError,
    search, setSearch,
    categoryFilter, setCategoryFilter,
    difficultyFilter, setDifficultyFilter,
    statusFilter, setStatusFilter,
    create, update, archive,
    bulkAssign, cancelAssign,
    getAssignments, assignments, assignmentsPagination, assignmentsLoading,
    assignmentError, setAssignmentError,
    getEligibleEmployees, getAllEligibleEmployeeIds,
    departments, roles,
    goToPage,
  } = useCourses();

  const [createModal,            setCreateModal]            = useState(false);
  const [editCourse,             setEditCourse]             = useState(null);
  const [assignCourse,           setAssignCourse]           = useState(null);
  const [archiveCourse,          setArchiveCourse]          = useState(null);
  const [assignmentsCourse,      setAssignmentsCourse]      = useState(null);
  const [assignmentStatusFilter, setAssignmentStatusFilter] = useState('');
  const [cancelAssignmentTarget, setCancelAssignmentTarget] = useState(null);
  const [cancelingAssignmentId,  setCancelingAssignmentId]  = useState(null);
  const [form,                   setForm]                   = useState(initialForm);

  const [eligibleEmployees,      setEligibleEmployees]      = useState([]);
  const [eligibleLoading,        setEligibleLoading]        = useState(false);
  const [eligibleLoadingMore,    setEligibleLoadingMore]    = useState(false);
  const [eligibleHasMore,        setEligibleHasMore]        = useState(false);
  const [currentFilters,         setCurrentFilters]         = useState({});
  const [totalEligibleEmployees, setTotalEligibleEmployees] = useState(0);
  const [assignError,            setAssignError]            = useState('');
  const [selectedEmployeeIds,    setSelectedEmployeeIds]    = useState([]);

  const categories = useMemo(() => {
    const set = new Set(courses.map((c) => c.category).filter(Boolean));
    return ['all', ...set];
  }, [courses]);

  const stats = useMemo(() => ({
    total:    pagination.total,
    active:   courses.filter((c) => c.status === 'active').length,
    enrolled: courses.reduce((sum, c) => sum + (c.enrolledCount || 0), 0),
  }), [courses, pagination.total]);

  function resetFormState() { setForm(initialForm); setFormError(''); }
  function openCreateModal() { resetFormState(); setCreateModal(true); }

  function openEditModal(course) {
    setFormError('');
    setEditCourse(course);
    setForm({
      title:                  course.title                  || '',
      provider:               course.provider               || '',
      externalUrl:            course.externalUrl            || '',
      category:               course.category               || '',
      difficulty:             course.difficulty             || 'Beginner',
      estimatedDurationHours: course.estimatedDurationHours ?? '',
      description:            course.description            || '',
      prerequisites:          course.prerequisites          || '',
    });
  }

  async function handleCreateSubmit(e) {
    e.preventDefault();
    try {
      await create({ ...form, estimatedDurationHours: form.estimatedDurationHours === '' ? null : Number(form.estimatedDurationHours) });
      setCreateModal(false); resetFormState();
    } catch { /* formError set by hook */ }
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    if (!editCourse) return;
    try {
      await update(editCourse.id, { ...form, estimatedDurationHours: form.estimatedDurationHours === '' ? null : Number(form.estimatedDurationHours) });
      setEditCourse(null); resetFormState();
    } catch { /* formError set by hook */ }
  }

  async function confirmArchive() {
    if (!archiveCourse) return;
    setFormError('');
    try { await archive(archiveCourse.id); setArchiveCourse(null); }
    catch (err) { setFormError(err.response?.data?.message ?? 'Failed to archive course.'); }
  }

  async function openAssignmentsModal(course) {
    setAssignmentsCourse(course); setAssignmentStatusFilter(''); setAssignmentError('');
    try { await getAssignments(course.id, { page: 1, limit: 10 }); } catch { /* handled */ }
  }

  async function onAssignmentsPageChange(nextPage) {
    if (!assignmentsCourse) return;
    try { await getAssignments(assignmentsCourse.id, { page: nextPage, limit: 10, status: assignmentStatusFilter || undefined }); } catch { /* handled */ }
  }

  async function onAssignmentsStatusFilterChange(nextStatus) {
    if (!assignmentsCourse) return;
    setAssignmentStatusFilter(nextStatus);
    try { await getAssignments(assignmentsCourse.id, { page: 1, limit: 10, status: nextStatus || undefined }); } catch { /* handled */ }
  }

  async function confirmCancelAssignment(assignmentId) {
    if (!assignmentsCourse) return;
    setCancelingAssignmentId(assignmentId); setAssignmentError('');
    try {
      await cancelAssign(assignmentsCourse.id, assignmentId);
      await getAssignments(assignmentsCourse.id, { page: assignmentsPagination.page, limit: assignmentsPagination.limit, status: assignmentStatusFilter || undefined });
      setCancelAssignmentTarget(null);
    } catch (err) {
      setAssignmentError(err.response?.data?.message ?? 'Failed to cancel assignment.');
    } finally { setCancelingAssignmentId(null); }
  }

  // Loads a page of eligible employees — replaces or appends depending on `append`
  async function loadEligibleForCourse(courseId, filters = {}, page = 1, append = false) {
    if (!courseId) return;
    if (append) { setEligibleLoadingMore(true); }
    else        { setEligibleLoading(true); setAssignError(''); }
    try {
      const result = await getEligibleEmployees({ page, limit: PAGE_LIMIT, ...filters });
      const sanitized = (result.data || []).filter((emp) => {
        const isSelf  = Number(emp.id) === Number(user?.id);
        const isAdmin = (emp.roles || []).some((r) => String(r.name || '').toLowerCase() === 'admin');
        return !isSelf && !isAdmin;
      });
      if (append) {
        setEligibleEmployees((prev) => {
          const existing = new Set(prev.map((e) => e.id));
          return [...prev, ...sanitized.filter((e) => !existing.has(e.id))];
        });
      } else {
        setEligibleEmployees(sanitized);
        setCurrentFilters(filters);
        setTotalEligibleEmployees(result.pagination?.total || 0);
      }
      setEligibleHasMore(page < (result.pagination?.totalPages ?? 1));
    } catch (err) {
      if (!append) setAssignError(err.response?.data?.message ?? 'Failed to load eligible employees.');
    } finally {
      setEligibleLoading(false);
      setEligibleLoadingMore(false);
    }
  }

  function openAssignModal(course) {
    setAssignCourse(course); setSelectedEmployeeIds([]); setEligibleEmployees([]);
    setEligibleHasMore(false); setAssignError('');
    loadEligibleForCourse(course.id, {}, 1, false);
  }

  function toggleEmployee(id) {
    setSelectedEmployeeIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  // Select all visible (current page)
  function handleSelectAll(visibleIds) {
    setSelectedEmployeeIds((prev) => [...new Set([...prev, ...visibleIds])]);
  }

  // Select all across ALL pages — fetches just IDs from backend
  const handleTrueSelectAll = useCallback(async () => {
    try {
      const result = await getAllEligibleEmployeeIds({ ...currentFilters });
      setSelectedEmployeeIds(result.eligibleEmployeeIds || []);
    } catch (err) {
      setAssignError(err.response?.data?.message ?? 'Failed to get all eligible employees.');
    }
  }, [currentFilters, getAllEligibleEmployeeIds]);

  function handleDeselectAll() { setSelectedEmployeeIds([]); }

  async function handleAssign(payload) {
    if (!assignCourse) return;
    setAssignError('');
    try {
      await bulkAssign(assignCourse.id, payload);
      setAssignCourse(null); setSelectedEmployeeIds([]); setEligibleEmployees([]);
    } catch (err) {
      setAssignError(err.response?.data?.message ?? 'Failed to assign course.');
    }
  }

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-700 to-cyan-800 px-7 py-6 shadow-lg shadow-cyan-900/20">
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full border border-cyan-700/30 pointer-events-none" />
        <div className="absolute -right-2 -top-2 w-24 h-24 rounded-full border border-cyan-600/20 pointer-events-none" />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-cyan-600/40 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-cyan-300" />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">Course Management</h1>
            </div>
            <p className="text-cyan-300/70 text-sm ml-11">Create, manage and assign courses across the organisation</p>
          </div>
          
        </div>
      </div>

       <div className="flex justify-end">
        {canEdit && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all border border-cyan-400/50"
          >
            <Plus className="w-4 h-4" />
            Create Course
          </button>
        )}
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div>}

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Courses',                    value: stats.total    },
          { label: 'Active (current page)',             value: stats.active   },
          { label: 'Total Enrollments (current page)', value: stats.enrolled },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
            <p className="text-2xl font-bold text-cyan-800 mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* ── Course table ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-cyan-700 to-cyan-800 px-5 py-3 flex items-center justify-between flex-wrap gap-3">
          <p className="text-xs font-semibold text-cyan-200 uppercase tracking-widest">All Courses</p>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-cyan-300/60" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..."
                className="pl-8 pr-3 py-1.5 text-xs bg-white/10 border border-white/20 rounded-lg text-white placeholder-cyan-300/50 focus:outline-none focus:ring-1 focus:ring-white/40 w-44" />
            </div>
            <select value={categoryFilter || 'all'} onChange={(e) => setCategoryFilter(e.target.value === 'all' ? '' : e.target.value)}
              className="px-2 py-1.5 text-xs bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-white/40">
              {categories.map((c) => <option key={c} value={c} className="text-gray-800">{c === 'all' ? 'All Categories' : c}</option>)}
            </select>
            <select value={difficultyFilter || 'all'} onChange={(e) => setDifficultyFilter(e.target.value === 'all' ? '' : e.target.value)}
              className="px-2 py-1.5 text-xs bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-white/40">
              <option value="all"          className="text-gray-800">All Difficulty</option>
              <option value="Beginner"     className="text-gray-800">Beginner</option>
              <option value="Intermediate" className="text-gray-800">Intermediate</option>
              <option value="Advanced"     className="text-gray-800">Advanced</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2 py-1.5 text-xs bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-white/40">
              <option value="active"   className="text-gray-800">Active</option>
              <option value="archived" className="text-gray-800">Archived</option>
            </select>
          </div>
        </div>

        <CourseList
          courses={courses} loading={loading}
          onAssign={openAssignModal} onEdit={openEditModal}
          onArchive={(course) => { setFormError(''); setArchiveCourse(course); }}
          onViewAssignments={openAssignmentsModal}
          canEdit={canEdit} canAssign={canAssign}
        />

        <Pagination page={pagination.page} totalPages={Math.max(1, pagination.totalPages)} onChange={goToPage} />
      </div>

      {/* ── Modals ── */}
      {createModal && (
        <Modal title="Create Course" onClose={() => setCreateModal(false)}>
          <CourseForm form={form} setForm={setForm} formError={formError} saving={saving} onSubmit={handleCreateSubmit} onCancel={() => setCreateModal(false)} />
        </Modal>
      )}

      {editCourse && (
        <Modal title={`Edit — ${editCourse.title}`} onClose={() => setEditCourse(null)}>
          <CourseForm form={form} setForm={setForm} formError={formError} saving={saving} onSubmit={handleEditSubmit} onCancel={() => setEditCourse(null)} isEdit />
        </Modal>
      )}

      {assignCourse && (
        <AssignmentModal
          course={assignCourse}
          onClose={() => { setAssignCourse(null); setEligibleEmployees([]); setEligibleHasMore(false); }}
          onSubmit={handleAssign}
          loading={eligibleLoading}
          error={assignError || formError}
          employees={eligibleEmployees}
          selectedIds={selectedEmployeeIds}
          onToggleEmployee={toggleEmployee}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          onSelectAllPages={handleTrueSelectAll}
          onFilterChange={(filters, page, append) => loadEligibleForCourse(assignCourse.id, filters, page, append)}
          totalEligibleEmployees={totalEligibleEmployees}
          employeesHasMore={eligibleHasMore}
          employeesLoadingMore={eligibleLoadingMore}
          saving={saving}
          departments={departments}
          roles={roles}
        />
      )}

      {archiveCourse && (
        <ArchiveCourseModal
          course={archiveCourse}
          onCancel={() => setArchiveCourse(null)}
          onConfirm={confirmArchive}
          loading={saving}
          error={formError}
        />
      )}

      {assignmentsCourse && (
        <CourseAssignmentsModal
          course={assignmentsCourse} loading={assignmentsLoading}
          error={assignmentError} assignments={assignments}
          pagination={assignmentsPagination} statusFilter={assignmentStatusFilter}
          onStatusFilterChange={onAssignmentsStatusFilterChange}
          onPageChange={onAssignmentsPageChange}
          onCancel={setCancelAssignmentTarget}
          cancelingAssignmentId={cancelingAssignmentId}
          onClose={() => { setAssignmentsCourse(null); setCancelAssignmentTarget(null); setAssignmentError(''); }}
        />
      )}

      {cancelAssignmentTarget && (
        <CancelAssignmentModal
          assignment={cancelAssignmentTarget}
          onCancel={() => setCancelAssignmentTarget(null)}
          onConfirm={confirmCancelAssignment}
          loading={Boolean(cancelingAssignmentId)}
          error={assignmentError}
        />
      )}
    </div>
  );
}