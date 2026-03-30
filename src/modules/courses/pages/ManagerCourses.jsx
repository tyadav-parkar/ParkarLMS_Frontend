import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Search, UserPlus, Users } from 'lucide-react';
import { Modal, Pagination, TableSkeleton } from '@shared';
import { useAuth } from '@auth';

import { useCourses } from '../hooks/useCourses';
import AssignmentModal from '../components/AssignmentModal';
import CancelAssignmentModal from '../components/CancelAssignmentModal';
import { getMyTeam, getIndirectReports } from '../../team/services/teamService';

const TABS = {
  catalog: 'catalog',
  byEmployee: 'by-employee',
};

const COURSE_MODAL_TABS = {
  details: 'details',
  assignments: 'assignments',
};

export default function ManagerCourses() {
  const { isRole, can } = useAuth();
  const canAssign = can('course_assign');
  const canView = can('course_view') || can('course_assign');

  if (!isRole('manager')) {
    return <Navigate to={isRole('admin') ? '/admin/analytics' : '/employee/dashboard'} replace />;
  }

  const {
    courses,
    pagination,
    loading,
    error,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    difficultyFilter,
    setDifficultyFilter,
    goToPage,
    assignments,
    assignmentsPagination,
    assignmentsLoading,
    assignmentError,
    setAssignmentError,
    employeeAssignments,
    employeeAssignmentsPagination,
    employeeAssignmentsLoading,
    employeeAssignmentsError,
    setEmployeeAssignmentsError,
    getAssignments,
    getEmployeeAssignments,
    getEligibleEmployees,
    bulkAssign,
    cancelAssign,
    saving,
  } = useCourses();

  const [activeTab, setActiveTab] = useState(TABS.catalog);

  const [teamMembers, setTeamMembers] = useState([]);
  const [teamLoading, setTeamLoading] = useState(false);

  const [assignCourse, setAssignCourse] = useState(null);
  const [eligibleEmployees, setEligibleEmployees] = useState([]);
  const [eligibleLoading, setEligibleLoading] = useState(false);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [assignError, setAssignError] = useState('');

  const [viewCourse, setViewCourse] = useState(null);
  const [viewCourseTab, setViewCourseTab] = useState(COURSE_MODAL_TABS.details);
  const [viewCourseStatusFilter, setViewCourseStatusFilter] = useState('');

  const [employeeStatusFilter, setEmployeeStatusFilter] = useState('');
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState('');

  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const categories = useMemo(() => {
    const set = new Set(courses.map((c) => c.category).filter(Boolean));
    return ['all', ...set];
  }, [courses]);

  const byEmployeeOptions = useMemo(() => teamMembers.map((m) => ({
    id: m.id,
    label: `${m.first_name} ${m.last_name}`.trim(),
  })), [teamMembers]);

  useEffect(() => {
    let cancelled = false;
    async function loadTeam() {
      setTeamLoading(true);
      try {
        const [direct, indirect] = await Promise.all([
          getMyTeam({ page: 1, limit: 200 }),
          getIndirectReports({ page: 1, limit: 200 }),
        ]);

        const map = new Map();
        [...(direct.data || []), ...(indirect.data || [])].forEach((member) => {
          map.set(Number(member.id), member);
        });

        if (!cancelled) setTeamMembers([...map.values()]);
      } catch {
        if (!cancelled) setTeamMembers([]);
      } finally {
        if (!cancelled) setTeamLoading(false);
      }
    }
    loadTeam();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!viewCourse || viewCourseTab !== COURSE_MODAL_TABS.assignments || !canView) return;
    getAssignments(Number(viewCourse.id), {
      page: 1,
      limit: 10,
      status: viewCourseStatusFilter || undefined,
    }).catch(() => {});
  }, [viewCourse, viewCourseTab, viewCourseStatusFilter, canView, getAssignments]);

  useEffect(() => {
    if (activeTab !== TABS.byEmployee || !canView) return;
    getEmployeeAssignments({
      page: 1,
      limit: 10,
      status: employeeStatusFilter || undefined,
      employeeId: selectedEmployeeFilter || undefined,
      search: employeeSearch || undefined,
    }).catch(() => {});
  }, [activeTab, canView, employeeStatusFilter, selectedEmployeeFilter, employeeSearch, getEmployeeAssignments]);

  async function loadEligible(filters = {}, courseId = null) {
    const targetCourseId = courseId ?? assignCourse?.id;
    if (!targetCourseId) return;

    setEligibleLoading(true);
    setAssignError('');
    try {
      const result = await getEligibleEmployees({
        page: 1,
        limit: 100,
        courseId: targetCourseId,
        ...filters,
      });
      setEligibleEmployees(result.data || []);
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
    loadEligible({}, course.id);
  }

  function openCourseModal(course) {
    setViewCourse(course);
    setViewCourseTab(COURSE_MODAL_TABS.details);
    setViewCourseStatusFilter('');
    setAssignmentError('');
  }

  function toggleEmployee(employeeId) {
    setSelectedEmployeeIds((prev) => (
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    ));
  }

  async function submitAssign(payload) {
    if (!assignCourse) return;

    setAssignError('');
    try {
      await bulkAssign(assignCourse.id, payload);
      setAssignCourse(null);
      setSelectedEmployeeIds([]);
      setEligibleEmployees([]);
    } catch (err) {
      setAssignError(err.response?.data?.message ?? 'Failed to assign course.');
    }
  }

  async function confirmCancel(assignmentId) {
    if (!cancelTarget) return;

    setCancelLoading(true);
    setAssignmentError('');
    setEmployeeAssignmentsError('');

    try {
      await cancelAssign(cancelTarget.courseId, assignmentId);

      if (viewCourse && viewCourseTab === COURSE_MODAL_TABS.assignments) {
        await getAssignments(Number(viewCourse.id), {
          page: assignmentsPagination.page,
          limit: assignmentsPagination.limit,
          status: viewCourseStatusFilter || undefined,
        });
      }

      if (activeTab === TABS.byEmployee) {
        await getEmployeeAssignments({
          page: employeeAssignmentsPagination.page,
          limit: employeeAssignmentsPagination.limit,
          status: employeeStatusFilter || undefined,
          employeeId: selectedEmployeeFilter || undefined,
          search: employeeSearch || undefined,
        });
      }

      setCancelTarget(null);
    } catch (err) {
      const message = err.response?.data?.message ?? 'Failed to cancel assignment.';
      if (viewCourse && viewCourseTab === COURSE_MODAL_TABS.assignments) setAssignmentError(message);
      if (activeTab === TABS.byEmployee) setEmployeeAssignmentsError(message);
    } finally {
      setCancelLoading(false);
    }
  }

  function onViewCourseAssignmentsPageChange(nextPage) {
    if (!viewCourse) return;
    getAssignments(Number(viewCourse.id), {
      page: nextPage,
      limit: assignmentsPagination.limit,
      status: viewCourseStatusFilter || undefined,
    }).catch(() => {});
  }

  function onByEmployeePageChange(nextPage) {
    getEmployeeAssignments({
      page: nextPage,
      limit: employeeAssignmentsPagination.limit,
      status: employeeStatusFilter || undefined,
      employeeId: selectedEmployeeFilter || undefined,
      search: employeeSearch || undefined,
    }).catch(() => {});
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-700 to-cyan-800 px-7 py-6 shadow-lg shadow-cyan-900/20">
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full border border-cyan-700/30" />
        <div className="absolute -right-2 -top-2 w-24 h-24 rounded-full border border-cyan-600/20" />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-cyan-700/40 flex items-center justify-center">
                <Users className="w-4 h-4 text-cyan-300" />
              </div>
              <h1 className="text-xl font-bold text-white">Manager Course Operations</h1>
            </div>
            <p className="text-cyan-300/70 text-sm ml-11">
              Assign and monitor learning across direct and indirect team members.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-1.5 flex gap-1 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab(TABS.catalog)}
          className={`px-4 py-2 rounded-lg text-sm font-semibold ${activeTab === TABS.catalog ? 'bg-cyan-700 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          Course Catalog
        </button>
        <button
          type="button"
          onClick={() => setActiveTab(TABS.byEmployee)}
          className={`px-4 py-2 rounded-lg text-sm font-semibold ${activeTab === TABS.byEmployee ? 'bg-cyan-700 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          Course Assignment History
        </button>
      </div>

      {activeTab === TABS.catalog && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses..."
                aria-label="Search courses"
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-700"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={categoryFilter || 'all'}
                onChange={(e) => setCategoryFilter(e.target.value === 'all' ? '' : e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-700"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>

              <select
                value={difficultyFilter || 'all'}
                onChange={(e) => setDifficultyFilter(e.target.value === 'all' ? '' : e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-700"
              >
                <option value="all">All Difficulty</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          {error && <p className="px-6 py-3 text-sm text-red-600">{error}</p>}

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[760px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Course</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Difficulty</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Enrolled</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && <TableSkeleton rows={4} cols={5} />}

                {!loading && courses.map((course) => (
                  <tr key={course.id} className="hover:bg-cyan-50/30">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-gray-800">{course.title}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[360px]">{course.description || 'No description'}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{course.category || '-'}</td>
                    <td className="px-5 py-3 text-gray-600">{course.difficulty || '-'}</td>
                    <td className="px-5 py-3 text-gray-600">{course.enrolledCount ?? 0}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          disabled={!canAssign}
                          onClick={() => openAssignModal(course)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white disabled:opacity-50"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          Assign
                        </button>
                        <button
                          type="button"
                          onClick={() => openCourseModal(course)}
                          className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                        >
                          View Course
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!loading && courses.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-gray-400">No active courses found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination page={pagination.page} totalPages={Math.max(1, pagination.totalPages)} onChange={goToPage} />
        </div>
      )}

      {activeTab === TABS.byEmployee && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
                placeholder="Search employee or course"
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg"
              />
            </div>

            <select
              value={selectedEmployeeFilter}
              onChange={(e) => setSelectedEmployeeFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg"
            >
              <option value="">All Team Members</option>
              {byEmployeeOptions.map((member) => (
                <option key={member.id} value={member.id}>{member.label}</option>
              ))}
            </select>

            <select
              value={employeeStatusFilter}
              onChange={(e) => setEmployeeStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg"
            >
              <option value="">All Status</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {teamLoading && <p className="text-sm text-gray-500">Loading team members...</p>}
          {employeeAssignmentsError && <p className="text-sm text-red-600">{employeeAssignmentsError}</p>}

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[860px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Employee</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Course</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Assigned</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Due</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {employeeAssignmentsLoading && <TableSkeleton rows={4} cols={6} />}

                  {!employeeAssignmentsLoading && employeeAssignments.map((assignment) => {
                    const isLocked = assignment.status === 'completed' || assignment.status === 'cancelled';
                    return (
                      <tr key={assignment.id}>
                        <td className="px-4 py-3 text-gray-800 font-medium">{assignment.employeeName || '-'}</td>
                        <td className="px-4 py-3 text-gray-600">{assignment.courseTitle || '-'}</td>
                        <td className="px-4 py-3 text-gray-600">{assignment.assignedDate || '-'}</td>
                        <td className="px-4 py-3 text-gray-600">{assignment.dueDate || '-'}</td>
                        <td className="px-4 py-3 text-gray-600">{assignment.status}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            disabled={!canAssign || isLocked}
                            onClick={() => setCancelTarget({ courseId: assignment.courseId, assignment })}
                            className="px-2.5 py-1 text-xs rounded-md border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {!employeeAssignmentsLoading && employeeAssignments.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-400">No assignment history found for selected filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination
            page={employeeAssignmentsPagination.page}
            totalPages={Math.max(1, employeeAssignmentsPagination.totalPages)}
            onChange={onByEmployeePageChange}
          />
        </div>
      )}

      {assignCourse && (
        <AssignmentModal
          course={assignCourse}
          onClose={() => setAssignCourse(null)}
          onSubmit={submitAssign}
          loading={eligibleLoading}
          error={assignError}
          employees={eligibleEmployees}
          selectedIds={selectedEmployeeIds}
          onToggleEmployee={toggleEmployee}
          onFilterChange={loadEligible}
          saving={saving}
        />
      )}

      {viewCourse && (
        <Modal title={`Course Details - ${viewCourse.title}`} onClose={() => setViewCourse(null)}>
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <button
                type="button"
                onClick={() => setViewCourseTab(COURSE_MODAL_TABS.details)}
                className={`px-3 py-1.5 text-sm rounded-lg font-semibold ${
                  viewCourseTab === COURSE_MODAL_TABS.details
                    ? 'bg-cyan-700 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Details
              </button>
              <button
                type="button"
                onClick={() => setViewCourseTab(COURSE_MODAL_TABS.assignments)}
                className={`px-3 py-1.5 text-sm rounded-lg font-semibold ${
                  viewCourseTab === COURSE_MODAL_TABS.assignments
                    ? 'bg-cyan-700 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Assignments
              </button>
            </div>

            {viewCourseTab === COURSE_MODAL_TABS.details && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="border rounded-lg px-3 py-2 bg-gray-50">
                    <p className="text-gray-500 text-xs">Category</p>
                    <p className="font-medium text-gray-800">{viewCourse.category || 'N/A'}</p>
                  </div>
                  <div className="border rounded-lg px-3 py-2 bg-gray-50">
                    <p className="text-gray-500 text-xs">Difficulty</p>
                    <p className="font-medium text-gray-800">{viewCourse.difficulty || 'N/A'}</p>
                  </div>
                  <div className="border rounded-lg px-3 py-2 bg-gray-50">
                    <p className="text-gray-500 text-xs">Provider</p>
                    <p className="font-medium text-gray-800">{viewCourse.provider || 'N/A'}</p>
                  </div>
                  <div className="border rounded-lg px-3 py-2 bg-gray-50">
                    <p className="text-gray-500 text-xs">Enrolled</p>
                    <p className="font-medium text-gray-800">{viewCourse.enrolledCount ?? 0}</p>
                  </div>
                  <div className="border rounded-lg px-3 py-2 bg-gray-50">
                    <p className="text-gray-500 text-xs">Estimated Duration</p>
                    <p className="font-medium text-gray-800">{viewCourse.estimatedDurationMonths ?? 'N/A'} month(s)</p>
                  </div>
                  <div className="border rounded-lg px-3 py-2 bg-gray-50">
                    <p className="text-gray-500 text-xs">Status</p>
                    <p className="font-medium text-gray-800">{viewCourse.status || 'N/A'}</p>
                  </div>
                </div>

                <div className="border rounded-lg px-3 py-2">
                  <p className="text-gray-500 text-xs mb-1">Description</p>
                  <p className="text-sm text-gray-700">{viewCourse.description || 'No description available.'}</p>
                </div>

                <div className="border rounded-lg px-3 py-2">
                  <p className="text-gray-500 text-xs mb-1">Prerequisites</p>
                  <p className="text-sm text-gray-700">{viewCourse.prerequisites || 'No prerequisites listed.'}</p>
                </div>

                {viewCourse.externalUrl && (
                  <a
                    href={viewCourse.externalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex text-sm text-cyan-700 hover:underline"
                  >
                    Open External Course Link
                  </a>
                )}
              </div>
            )}

            {viewCourseTab === COURSE_MODAL_TABS.assignments && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <p className="text-xs text-gray-500">
                    Assignment history for <span className="font-semibold text-gray-700">{viewCourse.title}</span>
                  </p>
                  <select
                    value={viewCourseStatusFilter}
                    onChange={(e) => setViewCourseStatusFilter(e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg"
                  >
                    <option value="">All Status</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {assignmentError && <p className="text-sm text-red-600">{assignmentError}</p>}

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[700px]">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Employee</th>
                          <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Assigned</th>
                          <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Due</th>
                          <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                          <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {assignmentsLoading && <TableSkeleton rows={4} cols={5} />}

                        {!assignmentsLoading && assignments.map((assignment) => {
                          const isLocked = assignment.status === 'completed' || assignment.status === 'cancelled';
                          return (
                            <tr key={assignment.id}>
                              <td className="px-4 py-3 text-gray-800 font-medium">{assignment.employeeName || `Employee #${assignment.employeeId}`}</td>
                              <td className="px-4 py-3 text-gray-600">{assignment.assignedDate || '-'}</td>
                              <td className="px-4 py-3 text-gray-600">{assignment.dueDate || '-'}</td>
                              <td className="px-4 py-3 text-gray-600">{assignment.status}</td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  type="button"
                                  disabled={!canAssign || isLocked}
                                  onClick={() => setCancelTarget({ courseId: Number(viewCourse.id), assignment })}
                                  className="px-2.5 py-1 text-xs rounded-md border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50"
                                >
                                  Cancel
                                </button>
                              </td>
                            </tr>
                          );
                        })}

                        {!assignmentsLoading && assignments.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-gray-400">No assignments found for this course.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <Pagination
                  page={assignmentsPagination.page}
                  totalPages={Math.max(1, assignmentsPagination.totalPages)}
                  onChange={onViewCourseAssignmentsPageChange}
                />
              </div>
            )}
          </div>
        </Modal>
      )}

      {cancelTarget && (
        <CancelAssignmentModal
          assignment={cancelTarget.assignment}
          onCancel={() => setCancelTarget(null)}
          onConfirm={confirmCancel}
          loading={cancelLoading}
          error={activeTab === TABS.byEmployee ? employeeAssignmentsError : assignmentError}
        />
      )}
    </div>
  );
}
