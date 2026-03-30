import { useMemo, useState } from 'react';
import { Plus, Search, Users } from 'lucide-react';
import { Modal, Pagination } from '@shared';
import { useAuth } from '@auth';

import { useCourses } from '../hooks/useCourses';
import CourseList from '../components/CourseList';
import CourseForm from '../components/CourseForm';
import AssignmentModal from '../components/AssignmentModal';
import ArchiveCourseModal from '../components/ArchiveCourseModal';
import CourseAssignmentsModal from '../components/CourseAssignmentsModal';
import CancelAssignmentModal from '../components/CancelAssignmentModal';

const initialForm = {
  title: '',
  provider: '',
  externalUrl: '',
  category: '',
  difficulty: 'Beginner',
  estimatedDurationMonths: '',
  description: '',
  prerequisites: '',
};

export default function AdminCourses() {
  const { can, user } = useAuth();
  const canEdit = can('course_edit');
  const canAssign = can('course_assign');

  const {
    courses,
    pagination,
    loading,
    error,
    saving,
    formError,
    setFormError,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    difficultyFilter,
    setDifficultyFilter,
    statusFilter,
    setStatusFilter,
    create,
    update,
    archive,
    bulkAssign,
    cancelAssign,
    getAssignments,
    assignments,
    assignmentsPagination,
    assignmentsLoading,
    assignmentError,
    setAssignmentError,
    getEligibleEmployees,
    goToPage,
  } = useCourses();

  const [createModal, setCreateModal] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [assignCourse, setAssignCourse] = useState(null);
  const [archiveCourse, setArchiveCourse] = useState(null);
  const [assignmentsCourse, setAssignmentsCourse] = useState(null);
  const [assignmentStatusFilter, setAssignmentStatusFilter] = useState('');
  const [cancelAssignmentTarget, setCancelAssignmentTarget] = useState(null);
  const [cancelingAssignmentId, setCancelingAssignmentId] = useState(null);

  const [form, setForm] = useState(initialForm);

  const [eligibleEmployees, setEligibleEmployees] = useState([]);
  const [eligibleLoading, setEligibleLoading] = useState(false);
  const [assignError, setAssignError] = useState('');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  const categories = useMemo(() => {
    const set = new Set(courses.map((c) => c.category).filter(Boolean));
    return ['all', ...set];
  }, [courses]);

  const stats = useMemo(() => ({
    total: pagination.total,
    active: courses.filter((c) => c.status === 'active').length,
    enrolled: courses.reduce((sum, c) => sum + (c.enrolledCount || 0), 0),
  }), [courses, pagination.total]);

  function resetFormState() {
    setForm(initialForm);
    setFormError('');
  }

  function openCreateModal() {
    resetFormState();
    setSuccessMessage('');
    setCreateModal(true);
  }

  function openEditModal(course) {
    setFormError('');
    setSuccessMessage('');
    setEditCourse(course);
    setForm({
      title: course.title || '',
      provider: course.provider || '',
      externalUrl: course.externalUrl || '',
      category: course.category || '',
      difficulty: course.difficulty || 'Beginner',
      estimatedDurationMonths: course.estimatedDurationMonths ?? '',
      description: course.description || '',
      prerequisites: course.prerequisites || '',
    });
  }

  async function handleCreateSubmit(e) {
    e.preventDefault();
    try {
      await create({
        ...form,
        estimatedDurationMonths: form.estimatedDurationMonths === '' ? null : Number(form.estimatedDurationMonths),
      });
      setCreateModal(false);
      resetFormState();
      setSuccessMessage('Course created successfully.');
    } catch {
      // handled by hook formError
    }
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    if (!editCourse) return;

    try {
      await update(editCourse.id, {
        ...form,
        estimatedDurationMonths: form.estimatedDurationMonths === '' ? null : Number(form.estimatedDurationMonths),
      });
      setEditCourse(null);
      resetFormState();
      setSuccessMessage('Course updated successfully.');
    } catch {
      // handled by hook formError
    }
  }

  async function handleArchive(course) {
    setArchiveCourse(course);
  }

  async function confirmArchive() {
    if (!archiveCourse) return;
    try {
      await archive(archiveCourse.id);
      setArchiveCourse(null);
      setSuccessMessage('Course archived successfully.');
    } catch {
      // handled by hook formError
    }
  }

  async function openAssignmentsModal(course) {
    setAssignmentsCourse(course);
    setAssignmentStatusFilter('');
    setAssignmentError('');
    setSuccessMessage('');
    try {
      await getAssignments(course.id, { page: 1, limit: 10 });
    } catch {
      // handled by hook assignmentError
    }
  }

  async function onAssignmentsPageChange(nextPage) {
    if (!assignmentsCourse) return;
    try {
      await getAssignments(assignmentsCourse.id, { page: nextPage, limit: 10, status: assignmentStatusFilter || undefined });
    } catch {
      // handled by hook assignmentError
    }
  }

  async function onAssignmentsStatusFilterChange(nextStatus) {
    if (!assignmentsCourse) return;
    setAssignmentStatusFilter(nextStatus);
    try {
      await getAssignments(assignmentsCourse.id, { page: 1, limit: 10, status: nextStatus || undefined });
    } catch {
      // handled by hook assignmentError
    }
  }

  function askCancelAssignment(assignment) {
    setCancelAssignmentTarget(assignment);
  }

  async function confirmCancelAssignment(assignmentId) {
    if (!assignmentsCourse) return;
    setCancelingAssignmentId(assignmentId);
    setAssignmentError('');
    try {
      await cancelAssign(assignmentsCourse.id, assignmentId);
      await getAssignments(assignmentsCourse.id, {
        page: assignmentsPagination.page,
        limit: assignmentsPagination.limit,
        status: assignmentStatusFilter || undefined,
      });
      setCancelAssignmentTarget(null);
      setSuccessMessage('Assignment cancelled successfully.');
    } catch (err) {
      setAssignmentError(err.response?.data?.message ?? 'Failed to cancel assignment.');
    } finally {
      setCancelingAssignmentId(null);
    }
  }

  async function loadEligible(filters = {}, courseId = null) {
    const targetCourseId = courseId ?? assignCourse?.id;
    if (!targetCourseId) return;
    setEligibleLoading(true);
    setAssignError('');
    try {
      const result = await getEligibleEmployees({
        page: 1,
        limit: 50,
        courseId: targetCourseId,
        ...filters,
      });
      const sanitized = (result.data || []).filter((employee) => {
        const isSelf = Number(employee.id) === Number(user?.id);
        const isAdmin = (employee.roles || []).some(
          (role) => String(role.name || '').toLowerCase() === 'admin'
        );
        return !isSelf && !isAdmin;
      });
      setEligibleEmployees(sanitized);
    } catch (err) {
      setAssignError(err.response?.data?.message ?? 'Failed to load eligible employees.');
    } finally {
      setEligibleLoading(false);
    }
  }

  function openAssignModal(course) {
    setAssignCourse(course);
    setSelectedEmployeeIds([]);
    setEligibleEmployees([]);
    setAssignError('');
    setSuccessMessage('');
    loadEligible({}, course.id);
  }

  function toggleEmployee(employeeId) {
    setSelectedEmployeeIds((prev) => (
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    ));
  }

  async function handleAssign(payload) {
    if (!assignCourse) return;
    setAssignError('');
    try {
      await bulkAssign(assignCourse.id, payload);
      setAssignCourse(null);
      setSelectedEmployeeIds([]);
      setEligibleEmployees([]);
      setSuccessMessage('Course assigned successfully.');
    } catch (err) {
      setAssignError(err.response?.data?.message ?? 'Failed to assign course.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-700 to-cyan-800 px-7 py-6 shadow-lg shadow-cyan-900/20">
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full border border-cyan-700/30" />
        <div className="absolute -right-2 -top-2 w-24 h-24 rounded-full border border-cyan-600/20" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-cyan-700/40 flex items-center justify-center">
              <Users className="w-4 h-4 text-cyan-300" />
            </div>
            <h1 className="text-xl font-bold text-white">Course Management</h1>
          </div>
          <p className="text-cyan-300/70 text-sm ml-11">
            Create, manage and assign courses across the organisation
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">Manage all courses in the system</span>

        <button
          onClick={openCreateModal}
          disabled={!canEdit}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Create Course
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 px-4 py-3 text-sm">
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Courses', value: stats.total },
          { label: 'Active (current page)', value: stats.active },
          { label: 'Total Enrollments (current page)', value: stats.enrolled },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
            <p className="text-2xl font-bold text-cyan-800 mt-1">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-800">All Courses</h2>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                aria-label="Search courses"
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-700"
              />
            </div>

            <select
              value={categoryFilter || 'all'}
              onChange={(e) => setCategoryFilter(e.target.value === 'all' ? '' : e.target.value)}
              aria-label="Filter by category"
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-700"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
              ))}
            </select>

            <select
              value={difficultyFilter || 'all'}
              onChange={(e) => setDifficultyFilter(e.target.value === 'all' ? '' : e.target.value)}
              aria-label="Filter by difficulty"
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-700"
            >
              <option value="all">All Difficulty</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-700"
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <CourseList
          courses={courses}
          loading={loading}
          onAssign={openAssignModal}
          onEdit={openEditModal}
          onArchive={handleArchive}
          onViewAssignments={openAssignmentsModal}
          canEdit={canEdit}
          canAssign={canAssign}
        />

        <Pagination
          page={pagination.page}
          totalPages={Math.max(1, pagination.totalPages)}
          onChange={goToPage}
        />
      </div>

      {createModal && (
        <Modal title="Create Course" onClose={() => setCreateModal(false)}>
          <CourseForm
            form={form}
            setForm={setForm}
            formError={formError}
            saving={saving}
            onSubmit={handleCreateSubmit}
            onCancel={() => setCreateModal(false)}
          />
        </Modal>
      )}

      {editCourse && (
        <Modal title={`Edit Course - ${editCourse.title}`} onClose={() => setEditCourse(null)}>
          <CourseForm
            form={form}
            setForm={setForm}
            formError={formError}
            saving={saving}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditCourse(null)}
            isEdit
          />
        </Modal>
      )}

      {assignCourse && (
        <AssignmentModal
          course={assignCourse}
          onClose={() => setAssignCourse(null)}
          onSubmit={handleAssign}
          loading={eligibleLoading}
          error={assignError || formError}
          employees={eligibleEmployees}
          selectedIds={selectedEmployeeIds}
          onToggleEmployee={toggleEmployee}
          onFilterChange={loadEligible}
          saving={saving}
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
          course={assignmentsCourse}
          loading={assignmentsLoading}
          error={assignmentError}
          assignments={assignments}
          pagination={assignmentsPagination}
          statusFilter={assignmentStatusFilter}
          onStatusFilterChange={onAssignmentsStatusFilterChange}
          onPageChange={onAssignmentsPageChange}
          onCancel={askCancelAssignment}
          cancelingAssignmentId={cancelingAssignmentId}
          onClose={() => {
            setAssignmentsCourse(null);
            setCancelAssignmentTarget(null);
            setAssignmentError('');
          }}
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
