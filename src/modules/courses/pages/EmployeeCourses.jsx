import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { BookOpen, Calendar, CheckCircle2, Clock3, PlayCircle, Search } from 'lucide-react';
import { Modal, Pagination, TableSkeleton } from '@shared';
import { useAuth } from '@auth';
 
import { useCourses } from '../hooks/useCourses';
 
const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];
 
const STATUS_STYLES = {
  assigned: 'bg-slate-100 text-slate-700 border border-slate-200',
  in_progress: 'bg-cyan-100 text-cyan-700 border border-cyan-200',
  completed: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  cancelled: 'bg-rose-100 text-rose-700 border border-rose-200',
};
 
function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString();
}
 
function statusLabel(value) {
  if (value === 'in_progress') return 'In Progress';
  return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : '-';
}
 
export default function EmployeeCourses({ audience = 'employee' }) {
  const { isRole } = useAuth();
  const isManagerView = audience === 'manager';
  const canAccess = isManagerView
    ? isRole('manager') && !isRole('admin')
    : isRole('employee') && !isRole('manager') && !isRole('admin');
 
  if (!canAccess) {
    return <Navigate to={isRole('admin') ? '/admin/analytics' : '/manager/dashboard'} replace />;
  }
 
  const {
    myAssignments,
    myAssignmentsPagination,
    myAssignmentsLoading,
    myAssignmentsError,
    setMyAssignmentsError,
    getMyAssignments,
    getMyAssignmentDetail,
    startMyAssignment,
    completeMyAssignment,
    saving,
    formError,
    setFormError,
  } = useCourses({ skipCatalogFetch: true });
 
  const hasInitialized = useRef(false);
 
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [notice, setNotice] = useState('');
 
  useEffect(() => {
    if (!myAssignmentsLoading) hasInitialized.current = true;
  }, [myAssignmentsLoading]);
 
  const isTableLoading = myAssignmentsLoading || !hasInitialized.current;
 
  const stats = useMemo(() => {
    const base = { assigned: 0, in_progress: 0, completed: 0, cancelled: 0 };
    myAssignments.forEach((row) => {
      if (base[row.status] !== undefined) base[row.status] += 1;
    });
    return base;
  }, [myAssignments]);
 
  useEffect(() => {
    const timer = setTimeout(() => {
      getMyAssignments({
        page: 1,
        limit: myAssignmentsPagination.limit,
        status: status || undefined,
        search: search || undefined,
      }).catch(() => {});
      setCurrentPage(1);
    }, 350);
 
    return () => clearTimeout(timer);
  }, [search, status, myAssignmentsPagination.limit]);
 
  async function onPageChange(nextPage) {
    setCurrentPage(nextPage);
    await getMyAssignments({
      page: nextPage,
      limit: myAssignmentsPagination.limit,
      status: status || undefined,
      search: search || undefined,
    }).catch(() => {});
  }
 
  async function openDetails(assignmentId) {
    setDetailLoading(true);
    setMyAssignmentsError('');
    try {
      const detail = await getMyAssignmentDetail(assignmentId);
      setSelectedAssignment(detail);
    } catch (err) {
      setMyAssignmentsError(err.response?.data?.message ?? 'Failed to load course details.');
    } finally {
      setDetailLoading(false);
    }
  }
 
  async function refreshCurrentPage() {
    await getMyAssignments({
      page: currentPage,
      limit: myAssignmentsPagination.limit,
      status: status || undefined,
      search: search || undefined,
    });
  }
 
  async function runStart(assignmentId) {
    setActionLoadingId(assignmentId);
    setFormError('');
    setNotice('');
    try {
      await startMyAssignment(assignmentId);
      await refreshCurrentPage();
      if (selectedAssignment?.id === assignmentId) {
        const refreshed = await getMyAssignmentDetail(assignmentId);
        setSelectedAssignment(refreshed);
      }
      setNotice('Course started successfully.');
    } catch {
      setNotice('');
    } finally {
      setActionLoadingId(null);
    }
  }
 
  async function runComplete(assignmentId) {
    setActionLoadingId(assignmentId);
    setFormError('');
    setNotice('');
    try {
      await completeMyAssignment(assignmentId);
      await refreshCurrentPage();
      if (selectedAssignment?.id === assignmentId) {
        const refreshed = await getMyAssignmentDetail(assignmentId);
        setSelectedAssignment(refreshed);
      }
      setNotice('Course marked as complete.');
    } catch {
      setNotice('');
    } finally {
      setActionLoadingId(null);
    }
  }
 
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-700 to-teal-800 px-7 py-6 shadow-lg shadow-teal-900/20">
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full border border-teal-700/30" />
        <div className="absolute -right-2 -top-2 w-24 h-24 rounded-full border border-teal-600/20" />
        <div className="relative">
          <h1 className="text-xl font-bold text-white">My Courses</h1>
          <p className="text-teal-200/80 text-sm mt-1">
            {isManagerView
              ? 'Track your personal learning assignments while managing team operations.'
              : 'Track assignments and update your learning status.'}
          </p>
        </div>
      </div>
 
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
          <p className="text-xs text-gray-500 uppercase">Assigned</p>
          <p className="text-2xl font-bold text-slate-700 mt-1">{stats.assigned}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
          <p className="text-xs text-gray-500 uppercase">In Progress</p>
          <p className="text-2xl font-bold text-cyan-700 mt-1">{stats.in_progress}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
          <p className="text-xs text-gray-500 uppercase">Completed</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{stats.completed}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
          <p className="text-xs text-gray-500 uppercase">Cancelled</p>
          <p className="text-2xl font-bold text-rose-700 mt-1">{stats.cancelled}</p>
        </div>
      </div>
 
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by course, provider, or category"
              aria-label="Search my courses"
              className="w-[280px] max-w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-700"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-700"
            >
              {STATUS_OPTIONS.map((item) => (
                <option key={item.value || 'all'} value={item.value}>{item.label}</option>
              ))}
            </select>
          </div>
        </div>
 
        {notice && <p className="px-6 pt-4 text-sm text-emerald-700">{notice}</p>}
        {(myAssignmentsError || formError) && <p className="px-6 pt-4 text-sm text-rose-600">{myAssignmentsError || formError}</p>}
 
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Course</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Assigned Date</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Due Date</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Assigned By</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isTableLoading && <TableSkeleton rows={4} cols={7} />}
 
              {!isTableLoading && myAssignments.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <BookOpen className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                    No assigned courses found.
                  </td>
                </tr>
              )}
 
              {!isTableLoading && myAssignments.map((assignment) => {
                const isBusy = saving && actionLoadingId === assignment.id;
                return (
                  <tr key={assignment.id} className="hover:bg-teal-50/30">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-gray-800">{assignment.course?.title || '-'}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[320px]">{assignment.course?.provider || '-'}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{assignment.course?.category || '-'}</td>
                    <td className="px-5 py-3 text-gray-600">{formatDate(assignment.assignedDate)}</td>
                    <td className="px-5 py-3 text-gray-600">{formatDate(assignment.dueDate)}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[assignment.status] || STATUS_STYLES.assigned}`}>
                        {assignment.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {assignment.status === 'in_progress' && <PlayCircle className="w-3.5 h-3.5" />}
                        {assignment.status === 'assigned' && <Clock3 className="w-3.5 h-3.5" />}
                        {assignment.status === 'cancelled' && <Calendar className="w-3.5 h-3.5" />}
                        {statusLabel(assignment.status)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{assignment.assignedBy?.fullName || '-'}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        {assignment.status === 'assigned' && (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => runStart(assignment.id)}
                            className="px-3 py-1.5 text-xs rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white disabled:opacity-50"
                          >
                            Start
                          </button>
                        )}
                        {assignment.status === 'in_progress' && (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => runComplete(assignment.id)}
                            className="px-3 py-1.5 text-xs rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white disabled:opacity-50"
                          >
                            Complete
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openDetails(assignment.id)}
                          className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
 
        <Pagination
          page={myAssignmentsPagination.page}
          totalPages={myAssignmentsPagination.totalPages}
          onChange={onPageChange}
        />
      </div>
 
      {selectedAssignment && (
        <Modal title="Course Details" onClose={() => setSelectedAssignment(null)}>
          {detailLoading ? (
            <p className="text-sm text-gray-500">Loading details...</p>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-gray-800">{selectedAssignment.course?.title || '-'}</h3>
                <p className="text-sm text-gray-500 mt-1">{selectedAssignment.course?.description || 'No description provided.'}</p>
              </div>
 
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-gray-50 p-3 border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase">Status</p>
                  <p className="font-semibold text-gray-800 mt-1">{statusLabel(selectedAssignment.status)}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3 border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase">Difficulty</p>
                  <p className="font-semibold text-gray-800 mt-1">{selectedAssignment.course?.difficulty || '-'}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3 border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase">Assigned Date</p>
                  <p className="font-semibold text-gray-800 mt-1">{formatDate(selectedAssignment.assignedDate)}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3 border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase">Due Date</p>
                  <p className="font-semibold text-gray-800 mt-1">{formatDate(selectedAssignment.dueDate)}</p>
                </div>
              </div>
 
              <div className="rounded-lg bg-gray-50 p-3 border border-gray-100 text-sm">
                <p className="text-xs text-gray-500 uppercase">Assigned By</p>
                <p className="font-semibold text-gray-800 mt-1">{selectedAssignment.assignedBy?.fullName || '-'}</p>
                <p className="text-gray-500">{selectedAssignment.assignedBy?.email || '-'}</p>
              </div>
 
              {selectedAssignment.notes && (
                <div className="rounded-lg bg-amber-50 p-3 border border-amber-100 text-sm">
                  <p className="text-xs text-amber-700 uppercase">Assignment Note</p>
                  <p className="text-amber-900 mt-1">{selectedAssignment.notes}</p>
                </div>
              )}
 
              <div className="flex items-center justify-end gap-2 pt-1">
                {selectedAssignment.status === 'assigned' && (
                  <button
                    type="button"
                    disabled={saving && actionLoadingId === selectedAssignment.id}
                    onClick={() => runStart(selectedAssignment.id)}
                    className="px-3 py-2 text-sm rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white disabled:opacity-50"
                  >
                    Start
                  </button>
                )}
                {selectedAssignment.status === 'in_progress' && (
                  <button
                    type="button"
                    disabled={saving && actionLoadingId === selectedAssignment.id}
                    onClick={() => runComplete(selectedAssignment.id)}
                    className="px-3 py-2 text-sm rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white disabled:opacity-50"
                  >
                    Complete
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedAssignment(null)}
                  className="px-3 py-2 text-sm rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
 