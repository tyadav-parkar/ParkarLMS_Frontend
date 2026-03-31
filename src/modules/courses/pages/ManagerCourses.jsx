import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Search, UserPlus, Users, BookOpen } from 'lucide-react';
import { Modal, Pagination, TableSkeleton } from '@shared';
import { useAuth } from '@auth';

import { useCourses } from '../hooks/useCourses';
import AssignmentModal from '../components/AssignmentModal';
import CancelAssignmentModal from '../components/CancelAssignmentModal';
import { getMyTeam, getIndirectReports } from '../../team/services/teamService';

const PAGE_LIMIT = 30;
const TABS = { catalog: 'catalog', byEmployee: 'by-employee' };
const COURSE_MODAL_TABS = { details: 'details', assignments: 'assignments' };

export default function ManagerCourses() {
  const { isRole, can } = useAuth();
  const canAssign = can('course_assign');
  const canView   = can('course_view') || can('course_assign');

  // ── All hooks BEFORE any conditional return ────────────────────────────────
  const {
    courses, pagination, loading, error,
    search, setSearch, categoryFilter, setCategoryFilter,
    difficultyFilter, setDifficultyFilter, goToPage,
    assignments, assignmentsPagination, assignmentsLoading,
    assignmentError, setAssignmentError,
    employeeAssignments, employeeAssignmentsPagination,
    employeeAssignmentsLoading, employeeAssignmentsError, setEmployeeAssignmentsError,
    getAssignments, getEmployeeAssignments, getEligibleEmployees,
    bulkAssign, cancelAssign, saving,
  } = useCourses();

  const [activeTab,              setActiveTab]              = useState(TABS.catalog);
  const [teamMembers,            setTeamMembers]            = useState([]);
  const [teamLoading,            setTeamLoading]            = useState(false);
  const [assignCourse,           setAssignCourse]           = useState(null);
  const [eligibleEmployees,      setEligibleEmployees]      = useState([]);
  const [eligibleLoading,        setEligibleLoading]        = useState(false);
  const [eligibleLoadingMore,    setEligibleLoadingMore]    = useState(false);
  const [eligibleHasMore,        setEligibleHasMore]        = useState(false);
  const [totalEligibleEmployeesCount, setTotalEligibleEmployeesCount] = useState(0);
  const [selectedEmployeeIds,    setSelectedEmployeeIds]    = useState([]);
  const [assignError,            setAssignError]            = useState('');
  const [viewCourse,             setViewCourse]             = useState(null);
  const [viewCourseTab,          setViewCourseTab]          = useState(COURSE_MODAL_TABS.details);
  const [viewCourseStatusFilter, setViewCourseStatusFilter] = useState('');
  const [employeeStatusFilter,   setEmployeeStatusFilter]   = useState('');
  const [employeeSearch,         setEmployeeSearch]         = useState('');
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState('');
  const [cancelTarget,           setCancelTarget]           = useState(null);
  const [cancelLoading,          setCancelLoading]          = useState(false);

  const categories = useMemo(() => {
    const set = new Set(courses.map((c) => c.category).filter(Boolean));
    return ['all', ...set];
  }, [courses]);

  const byEmployeeOptions = useMemo(() => teamMembers.map((m) => ({
    id: m.id, label: `${m.first_name} ${m.last_name}`.trim(),
  })), [teamMembers]);

  // Load full team once
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
        [...(direct.data || []), ...(indirect.data || [])].forEach((m) => map.set(Number(m.id), m));
        if (!cancelled) setTeamMembers([...map.values()]);
      } catch { if (!cancelled) setTeamMembers([]); }
      finally   { if (!cancelled) setTeamLoading(false); }
    }
    loadTeam();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!viewCourse || viewCourseTab !== COURSE_MODAL_TABS.assignments || !canView) return;
    getAssignments(Number(viewCourse.id), {
      page: 1, limit: 10,
      status: viewCourseStatusFilter || undefined,
    }).catch(() => {});
  }, [viewCourse, viewCourseTab, viewCourseStatusFilter, canView, getAssignments]);

  useEffect(() => {
    if (activeTab !== TABS.byEmployee || !canView) return;
    getEmployeeAssignments({
      page: 1, limit: 10,
      status:     employeeStatusFilter    || undefined,
      employeeId: selectedEmployeeFilter  || undefined,
      search:     employeeSearch          || undefined,
    }).catch(() => {});
  }, [activeTab, canView, employeeStatusFilter, selectedEmployeeFilter, employeeSearch, getEmployeeAssignments]);

  // ── Guard AFTER hooks ──────────────────────────────────────────────────────
  if (!isRole('manager')) {
    return <Navigate to={isRole('admin') ? '/admin/analytics' : '/employee/dashboard'} replace />;
  }

  // ── Eligible employees with infinite scroll ────────────────────────────────
  /**
   * Called by AssignmentModal as onFilterChange(filters, page, append).
   * append=false → replace list (initial load / filter change)
   * append=true  → merge next page (scroll trigger)
   */
  async function loadEligibleForCourse(courseId, filters = {}, page = 1, append = false) {
    if (!courseId) return;

    if (append) {
      setEligibleLoadingMore(true);
    } else {
      setEligibleLoading(true);
      setAssignError('');
    }

    try {
      const result = await getEligibleEmployees({ page, limit: PAGE_LIMIT, ...filters });
      const sanitized = (result.data || []);

      if (append) {
        setEligibleEmployees((prev) => {
          const existingIds = new Set(prev.map((e) => e.id));
          return [...prev, ...sanitized.filter((e) => !existingIds.has(e.id))];
        });
      } else {
        setEligibleEmployees(sanitized);
      }

      setEligibleHasMore(page < (result.pagination?.totalPages ?? 1));
      setTotalEligibleEmployeesCount(result.pagination?.totalRecords || result.pagination?.totalCount || 0);
    } catch (err) {
      if (!append) {
        setAssignError(err.response?.data?.message ?? 'Failed to load eligible employees.');
      }
    } finally {
      setEligibleLoading(false);
      setEligibleLoadingMore(false);
    }
  }

  function handleSelectAll(visibleIds) {
    setSelectedEmployeeIds(prev => {
      const newSet = new Set(prev);
      visibleIds.forEach(id => newSet.add(id));
      return Array.from(newSet);
    });
  }

  function handleDeselectAll() {
    setSelectedEmployeeIds([]);
  }

  async function handleSelectAllPages() {
    if (!assignCourse) return;
    const currentFilters = {}; // Track current filters - simple for manager text filters
    let page = 1;
    let allIds = new Set();
    let loadingAll = true;

    while (loadingAll) {
      try {
        const result = await getEligibleEmployees({ page, limit: PAGE_LIMIT, courseId: assignCourse.id, ...currentFilters });
        const employees = result.data || [];
        employees.forEach(e => allIds.add(e.id));
        if (result.pagination?.totalPages <= page || employees.length === 0) {
          loadingAll = false;
        } else {
          page++;
        }
      } catch {
        break;
      }
    }
    setSelectedEmployeeIds(Array.from(allIds));
  }

  function openAssignModal(course) {
    setAssignCourse(course);
    setSelectedEmployeeIds([]);
    setEligibleEmployees([]);
    setEligibleHasMore(false);
    setAssignError('');
    loadEligibleForCourse(course.id, {}, 1, false);
  }

  function openCourseModal(course) {
    setViewCourse(course);
    setViewCourseTab(COURSE_MODAL_TABS.details);
    setViewCourseStatusFilter('');
    setAssignmentError('');
  }

  function toggleEmployee(id) {
    setSelectedEmployeeIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
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
          page:   assignmentsPagination.page,
          limit:  assignmentsPagination.limit,
          status: viewCourseStatusFilter || undefined,
        });
      }
      if (activeTab === TABS.byEmployee) {
        await getEmployeeAssignments({
          page:       employeeAssignmentsPagination.page,
          limit:      employeeAssignmentsPagination.limit,
          status:     employeeStatusFilter   || undefined,
          employeeId: selectedEmployeeFilter || undefined,
          search:     employeeSearch         || undefined,
        });
      }
      setCancelTarget(null);
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Failed to cancel assignment.';
      if (viewCourse && viewCourseTab === COURSE_MODAL_TABS.assignments) setAssignmentError(msg);
      if (activeTab === TABS.byEmployee) setEmployeeAssignmentsError(msg);
    } finally {
      setCancelLoading(false);
    }
  }

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-700 to-cyan-800 px-7 py-6 shadow-lg shadow-cyan-900/20">
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full border border-cyan-700/30 pointer-events-none" />
        <div className="absolute -right-2 -top-2 w-24 h-24 rounded-full border border-cyan-600/20 pointer-events-none" />
        <div className="relative flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-cyan-600/40 flex items-center justify-center">
            <Users className="w-4 h-4 text-cyan-300" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Manager Course Operations</h1>
            <p className="text-cyan-300/70 text-sm mt-0.5">
              Assign and monitor learning across direct and indirect team members.
            </p>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-1.5 flex gap-1 w-fit">
        {[
          { key: TABS.catalog,    label: 'Course Catalog'    },
          { key: TABS.byEmployee, label: 'Assignment History' },
        ].map(({ key, label }) => (
          <button key={key} type="button" onClick={() => setActiveTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === key ? 'bg-cyan-700 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Catalog tab ── */}
      {activeTab === TABS.catalog && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-700 to-cyan-800 px-5 py-3 flex items-center justify-between flex-wrap gap-3">
            <p className="text-xs font-semibold text-cyan-200 uppercase tracking-widest">Course Catalog</p>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-cyan-300/60" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..."
                  className="pl-8 pr-3 py-1.5 text-xs bg-white/10 border border-white/20 rounded-lg text-white placeholder-cyan-300/50 focus:outline-none focus:ring-1 focus:ring-white/40 w-40" />
              </div>
              <select value={categoryFilter || 'all'} onChange={(e) => setCategoryFilter(e.target.value === 'all' ? '' : e.target.value)}
                className="px-2 py-1.5 text-xs bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none">
                {categories.map((c) => (
                  <option key={c} value={c} className="text-gray-800">{c === 'all' ? 'All Categories' : c}</option>
                ))}
              </select>
              <select value={difficultyFilter || 'all'} onChange={(e) => setDifficultyFilter(e.target.value === 'all' ? '' : e.target.value)}
                className="px-2 py-1.5 text-xs bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none">
                <option value="all"          className="text-gray-800">All Difficulty</option>
                <option value="Beginner"     className="text-gray-800">Beginner</option>
                <option value="Intermediate" className="text-gray-800">Intermediate</option>
                <option value="Advanced"     className="text-gray-800">Advanced</option>
              </select>
            </div>
          </div>

          {error && <p className="px-6 py-3 text-sm text-red-600">{error}</p>}

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[760px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Course', 'Category', 'Difficulty', 'Enrolled', 'Actions'].map((h, i) => (
                    <th key={h} className={`px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i === 4 ? 'text-right' : 'text-left'}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && <TableSkeleton rows={4} cols={5} />}
                {!loading && courses.map((course) => (
                  <tr key={course.id} className="hover:bg-cyan-50/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-gray-800">{course.title}</p>
                      <p className="text-xs text-gray-400 truncate max-w-[320px]">{course.description || 'No description'}</p>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{course.category || '-'}</td>
                    <td className="px-5 py-3.5 text-gray-600">{course.difficulty || '-'}</td>
                    <td className="px-5 py-3.5 text-gray-600">{course.enrolledCount ?? 0}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button type="button" disabled={!canAssign} onClick={() => openAssignModal(course)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white font-semibold disabled:opacity-50 transition-colors">
                          <UserPlus className="w-3.5 h-3.5" /> Assign
                        </button>
                        <button type="button" onClick={() => openCourseModal(course)}
                          className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold transition-colors">
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && courses.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center">
                      <BookOpen className="w-10 h-10 mx-auto text-gray-200 mb-2" />
                      <p className="text-gray-400 text-sm">No active courses found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination page={pagination.page} totalPages={Math.max(1, pagination.totalPages)} onChange={goToPage} />
        </div>
      )}

      {/* ── Assignment history tab ── */}
      {activeTab === TABS.byEmployee && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-700 to-cyan-800 px-5 py-3 flex items-center justify-between flex-wrap gap-3">
            <p className="text-xs font-semibold text-cyan-200 uppercase tracking-widest">Assignment History</p>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-cyan-300/60" />
                <input value={employeeSearch} onChange={(e) => setEmployeeSearch(e.target.value)} placeholder="Search..."
                  className="pl-8 pr-3 py-1.5 text-xs bg-white/10 border border-white/20 rounded-lg text-white placeholder-cyan-300/50 focus:outline-none w-36" />
              </div>
              <select value={selectedEmployeeFilter} onChange={(e) => setSelectedEmployeeFilter(e.target.value)}
                className="px-2 py-1.5 text-xs bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none">
                <option value="" className="text-gray-800">All Members</option>
                {byEmployeeOptions.map((m) => (
                  <option key={m.id} value={m.id} className="text-gray-800">{m.label}</option>
                ))}
              </select>
              <select value={employeeStatusFilter} onChange={(e) => setEmployeeStatusFilter(e.target.value)}
                className="px-2 py-1.5 text-xs bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none">
                <option value=""            className="text-gray-800">All Status</option>
                <option value="assigned"    className="text-gray-800">Assigned</option>
                <option value="in_progress" className="text-gray-800">In Progress</option>
                <option value="completed"   className="text-gray-800">Completed</option>
                <option value="cancelled"   className="text-gray-800">Cancelled</option>
              </select>
            </div>
          </div>

          {teamLoading            && <p className="px-6 py-3 text-sm text-gray-500">Loading team members…</p>}
          {employeeAssignmentsError && <p className="px-6 py-3 text-sm text-red-600">{employeeAssignmentsError}</p>}

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[860px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Employee', 'Course', 'Assigned', 'Due', 'Status', 'Action'].map((h, i) => (
                    <th key={h} className={`px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i === 5 ? 'text-right' : 'text-left'}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {employeeAssignmentsLoading && <TableSkeleton rows={4} cols={6} />}
                {!employeeAssignmentsLoading && employeeAssignments.map((assignment) => {
                  const isLocked = assignment.status === 'completed' || assignment.status === 'cancelled';
                  return (
                    <tr key={assignment.id} className="hover:bg-cyan-50/20 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-gray-800">{assignment.employeeName || '-'}</td>
                      <td className="px-5 py-3.5 text-gray-600">{assignment.courseTitle || '-'}</td>
                      <td className="px-5 py-3.5 text-gray-600">{assignment.assignedDate || '-'}</td>
                      <td className="px-5 py-3.5 text-gray-600">{assignment.dueDate || '-'}</td>
                      <td className="px-5 py-3.5 text-gray-600 capitalize">{assignment.status}</td>
                      <td className="px-5 py-3.5 text-right">
                        <button type="button" disabled={!canAssign || isLocked}
                          onClick={() => setCancelTarget({ courseId: assignment.courseId, assignment })}
                          className="px-3 py-1.5 text-xs rounded-lg border border-red-200 text-red-700 hover:bg-red-50 font-semibold disabled:opacity-40 transition-colors">
                          Cancel
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {!employeeAssignmentsLoading && employeeAssignments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-gray-400 text-sm">
                      No assignment history found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            page={employeeAssignmentsPagination.page}
            totalPages={Math.max(1, employeeAssignmentsPagination.totalPages)}
            onChange={(p) => getEmployeeAssignments({
              page: p, limit: employeeAssignmentsPagination.limit,
              status:     employeeStatusFilter   || undefined,
              employeeId: selectedEmployeeFilter || undefined,
              search:     employeeSearch         || undefined,
            }).catch(() => {})}
          />
        </div>
      )}

      {/* ── Modals ── */}
      {assignCourse && (
        <AssignmentModal
          course={assignCourse}
          onClose={() => {
            setAssignCourse(null);
            setEligibleEmployees([]);
            setEligibleHasMore(false);
          }}
          onSubmit={submitAssign}
          loading={eligibleLoading}
          error={assignError}
          employees={eligibleEmployees}
          selectedIds={selectedEmployeeIds}
          onToggleEmployee={toggleEmployee}
          onFilterChange={(filters, page, append) =>
            loadEligibleForCourse(assignCourse.id, filters, page, append)
          }
          employeesHasMore={eligibleHasMore}
          employeesLoadingMore={eligibleLoadingMore}
          totalEligibleEmployees={totalEligibleEmployeesCount}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          onSelectAllPages={handleSelectAllPages}
          departments={[]}
          roles={[]}
          saving={saving}
        />
      )}

      {viewCourse && (
        <Modal title={`Course — ${viewCourse.title}`} onClose={() => setViewCourse(null)}>
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 border-b border-gray-100 pb-3">
              {[
                { key: COURSE_MODAL_TABS.details,     label: 'Details'     },
                { key: COURSE_MODAL_TABS.assignments,  label: 'Assignments' },
              ].map(({ key, label }) => (
                <button key={key} type="button" onClick={() => setViewCourseTab(key)}
                  className={`px-3 py-1.5 text-sm rounded-lg font-semibold transition-colors ${
                    viewCourseTab === key ? 'bg-cyan-700 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}>
                  {label}
                </button>
              ))}
            </div>

            {viewCourseTab === COURSE_MODAL_TABS.details && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    { label: 'Category',   value: viewCourse.category         || 'N/A' },
                    { label: 'Difficulty', value: viewCourse.difficulty        || 'N/A' },
                    { label: 'Provider',   value: viewCourse.provider          || 'N/A' },
                    { label: 'Enrolled',   value: viewCourse.enrolledCount     ?? 0     },
                    { label: 'Duration',   value: `${viewCourse.estimatedDurationHours ?? 'N/A'} hour(s)` },
                    { label: 'Status',     value: viewCourse.status            || 'N/A' },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-xl bg-gray-50 p-3 border border-gray-100">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
                      <p className="font-semibold text-gray-800 mt-1">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl bg-gray-50 p-3 border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Description</p>
                  <p className="text-sm text-gray-700">{viewCourse.description || 'No description available.'}</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-3 border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Prerequisites</p>
                  <p className="text-sm text-gray-700">{viewCourse.prerequisites || 'None listed.'}</p>
                </div>
                {viewCourse.externalUrl && (
                  <a href={viewCourse.externalUrl} target="_blank" rel="noreferrer"
                    className="inline-flex text-sm text-cyan-700 hover:underline">
                    Open External Link →
                  </a>
                )}
              </div>
            )}

            {viewCourseTab === COURSE_MODAL_TABS.assignments && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <p className="text-xs text-gray-500">
                    Assignments for <span className="font-semibold text-gray-700">{viewCourse.title}</span>
                  </p>
                  <select value={viewCourseStatusFilter} onChange={(e) => setViewCourseStatusFilter(e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-700">
                    <option value="">All Status</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                {assignmentError && <p className="text-sm text-red-600">{assignmentError}</p>}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[600px]">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          {['Employee', 'Assigned', 'Due', 'Status', 'Action'].map((h, i) => (
                            <th key={h} className={`px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i === 4 ? 'text-right' : 'text-left'}`}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {assignmentsLoading && <TableSkeleton rows={3} cols={5} />}
                        {!assignmentsLoading && assignments.map((a) => {
                          const isLocked = a.status === 'completed' || a.status === 'cancelled';
                          return (
                            <tr key={a.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 font-medium text-gray-800">{a.employeeName || `Employee #${a.employeeId}`}</td>
                              <td className="px-4 py-3 text-gray-600">{a.assignedDate || '-'}</td>
                              <td className="px-4 py-3 text-gray-600">{a.dueDate || '-'}</td>
                              <td className="px-4 py-3 text-gray-600 capitalize">{a.status}</td>
                              <td className="px-4 py-3 text-right">
                                <button type="button" disabled={!canAssign || isLocked}
                                  onClick={() => setCancelTarget({ courseId: Number(viewCourse.id), assignment: a })}
                                  className="px-2.5 py-1 text-xs rounded-lg border border-red-200 text-red-700 hover:bg-red-50 font-semibold disabled:opacity-40 transition-colors">
                                  Cancel
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                        {!assignmentsLoading && assignments.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">
                              No assignments found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                <Pagination
                  page={assignmentsPagination.page}
                  totalPages={Math.max(1, assignmentsPagination.totalPages)}
                  onChange={(p) => getAssignments(Number(viewCourse.id), {
                    page: p, limit: assignmentsPagination.limit,
                    status: viewCourseStatusFilter || undefined,
                  }).catch(() => {})}
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