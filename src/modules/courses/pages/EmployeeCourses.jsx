import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { BookOpen, Calendar, CheckCircle2, Clock3, PlayCircle, Search } from 'lucide-react';
import { Modal, Pagination, TableSkeleton } from '@shared';
import { useAuth } from '@auth';
import { useCourses } from '../hooks/useCourses';

const STATUS_OPTIONS = [
  { value: '',            label: 'All'         },
  { value: 'assigned',   label: 'Assigned'    },
  { value: 'in_progress',label: 'In Progress' },
  { value: 'completed',  label: 'Completed'   },
  { value: 'cancelled',  label: 'Cancelled'   },
];

const STATUS_STYLES = {
  assigned:    'bg-slate-100 text-slate-700 border border-slate-200',
  in_progress: 'bg-cyan-100  text-cyan-700  border border-cyan-200',
  completed:   'bg-emerald-100 text-emerald-700 border border-emerald-200',
  cancelled:   'bg-rose-100  text-rose-700  border border-rose-200',
};

function formatDate(value) {
  if (!value) return '-';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '-' : d.toLocaleDateString();
}

function statusLabel(value) {
  if (value === 'in_progress') return 'In Progress';
  return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : '-';
}

export default function EmployeeCourses({ audience = 'employee' }) {
  const { isRole } = useAuth();
  const isManagerView = audience === 'manager';

  // ── All hooks BEFORE any conditional return ───────────────────────
  const {
    myAssignments, myAssignmentsPagination, myAssignmentsLoading,
    myAssignmentsError, setMyAssignmentsError,
    getMyAssignments, getMyAssignmentDetail,
    startMyAssignment, completeMyAssignment,
    saving, formError, setFormError,
  } = useCourses({ skipCatalogFetch: true });

  const [search,             setSearch]             = useState('');
  const [status,             setStatus]             = useState('');
  const [currentPage,        setCurrentPage]        = useState(1);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [detailLoading,      setDetailLoading]      = useState(false);
  const [actionLoadingId,    setActionLoadingId]    = useState(null);
  const [notice,             setNotice]             = useState('');

  const stats = useMemo(() => {
    const base = { assigned: 0, in_progress: 0, completed: 0, cancelled: 0 };
    myAssignments.forEach((row) => { if (base[row.status] !== undefined) base[row.status] += 1; });
    return base;
  }, [myAssignments]);

  useEffect(() => {
    const timer = setTimeout(() => {
      getMyAssignments({ page: 1, limit: myAssignmentsPagination.limit, status: status || undefined, search: search || undefined }).catch(() => {});
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search, status, getMyAssignments, myAssignmentsPagination.limit]);

  useEffect(() => {
    getMyAssignments({ page: 1, limit: myAssignmentsPagination.limit }).catch(() => {});
  }, []);

  // ── Guard AFTER hooks ─────────────────────────────────────────────
  const canAccess = isManagerView
    ? isRole('manager') && !isRole('admin')
    : isRole('employee') && !isRole('manager') && !isRole('admin');

  if (!canAccess) {
    return <Navigate to={isRole('admin') ? '/admin/analytics' : '/manager/dashboard'} replace />;
  }

  async function onPageChange(nextPage) {
    setCurrentPage(nextPage);
    await getMyAssignments({ page: nextPage, limit: myAssignmentsPagination.limit, status: status || undefined, search: search || undefined }).catch(() => {});
  }

  async function openDetails(assignmentId) {
    setDetailLoading(true); setMyAssignmentsError('');
    try { const detail = await getMyAssignmentDetail(assignmentId); setSelectedAssignment(detail); }
    catch (err) { setMyAssignmentsError(err.response?.data?.message ?? 'Failed to load course details.'); }
    finally { setDetailLoading(false); }
  }

  async function refreshCurrentPage() {
    await getMyAssignments({ page: currentPage, limit: myAssignmentsPagination.limit, status: status || undefined, search: search || undefined });
  }

  async function runStart(assignmentId) {
    setActionLoadingId(assignmentId); setFormError(''); setNotice('');
    try {
      await startMyAssignment(assignmentId); await refreshCurrentPage();
      if (selectedAssignment?.id === assignmentId) { const r = await getMyAssignmentDetail(assignmentId); setSelectedAssignment(r); }
      setNotice('Course started successfully.');
    } catch { setNotice(''); } finally { setActionLoadingId(null); }
  }

  async function runComplete(assignmentId) {
    setActionLoadingId(assignmentId); setFormError(''); setNotice('');
    try {
      await completeMyAssignment(assignmentId); await refreshCurrentPage();
      if (selectedAssignment?.id === assignmentId) { const r = await getMyAssignmentDetail(assignmentId); setSelectedAssignment(r); }
      setNotice('Course marked as complete.');
    } catch { setNotice(''); } finally { setActionLoadingId(null); }
  }

  return (
    <div className="space-y-6">

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-700 to-cyan-800 px-7 py-6 shadow-lg shadow-cyan-900/20">
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full border border-cyan-700/30 pointer-events-none" />
        <div className="absolute -right-2 -top-2 w-24 h-24 rounded-full border border-cyan-600/20 pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-cyan-600/40 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-cyan-300" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">My Courses</h1>
          </div>
          <p className="text-cyan-300/70 text-sm ml-11">
            {isManagerView
              ? 'Track your personal learning assignments while managing team operations.'
              : 'Track assignments and update your learning status.'}
          </p>
        </div>
      </div>

      {/* ── Stat cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Assigned',    value: stats.assigned,    color: 'text-slate-700'   },
          { label: 'In Progress', value: stats.in_progress, color: 'text-cyan-700'    },
          { label: 'Completed',   value: stats.completed,   color: 'text-emerald-700' },
          { label: 'Cancelled',   value: stats.cancelled,   color: 'text-rose-700'    },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Table card ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-cyan-700 to-cyan-800 px-5 py-3 flex items-center justify-between flex-wrap gap-3">
          <p className="text-xs font-semibold text-cyan-200 uppercase tracking-widest">Course Assignments</p>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-cyan-300/60" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="pl-8 pr-3 py-1.5 text-xs bg-white/10 border border-white/20 rounded-lg text-white placeholder-cyan-300/50 focus:outline-none focus:ring-1 focus:ring-white/40 w-44"
              />
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-2 py-1.5 text-xs bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-white/40"
            >
              {STATUS_OPTIONS.map((item) => (
                <option key={item.value || 'all'} value={item.value} className="text-gray-800">{item.label}</option>
              ))}
            </select>
          </div>
        </div>

        {notice             && <p className="px-6 pt-4 text-sm text-emerald-700">{notice}</p>}
        {(myAssignmentsError || formError) && <p className="px-6 pt-4 text-sm text-rose-600">{myAssignmentsError || formError}</p>}

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Course', 'Category', 'Assigned Date', 'Due Date', 'Status', 'Assigned By', 'Actions'].map((h, i) => (
                  <th key={h} className={`px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i === 6 ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {myAssignmentsLoading && <TableSkeleton rows={4} cols={7} />}

              {!myAssignmentsLoading && myAssignments.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    <BookOpen className="w-10 h-10 mx-auto text-gray-200 mb-2" />
                    No assigned courses found.
                  </td>
                </tr>
              )}

              {!myAssignmentsLoading && myAssignments.map((assignment) => {
                const isBusy = saving && actionLoadingId === assignment.id;
                return (
                  <tr key={assignment.id} className="hover:bg-cyan-50/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-gray-800">{assignment.course?.title || '-'}</p>
                      <p className="text-xs text-gray-400 truncate max-w-[280px]">{assignment.course?.provider || '-'}</p>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{assignment.course?.category || '-'}</td>
                    <td className="px-5 py-3.5 text-gray-600">{formatDate(assignment.assignedDate)}</td>
                    <td className="px-5 py-3.5 text-gray-600">{formatDate(assignment.dueDate)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[assignment.status] || STATUS_STYLES.assigned}`}>
                        {assignment.status === 'completed'   && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {assignment.status === 'in_progress' && <PlayCircle   className="w-3.5 h-3.5" />}
                        {assignment.status === 'assigned'    && <Clock3       className="w-3.5 h-3.5" />}
                        {assignment.status === 'cancelled'   && <Calendar     className="w-3.5 h-3.5" />}
                        {statusLabel(assignment.status)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{assignment.assignedBy?.fullName || '-'}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center gap-2">
                        {assignment.status === 'assigned' && (
                          <button type="button" disabled={isBusy} onClick={() => runStart(assignment.id)}
                            className="px-3 py-1.5 text-xs rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white font-semibold disabled:opacity-50 transition-colors">
                            Start
                          </button>
                        )}
                        {assignment.status === 'in_progress' && (
                          <button type="button" disabled={isBusy} onClick={() => runComplete(assignment.id)}
                            className="px-3 py-1.5 text-xs rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold disabled:opacity-50 transition-colors">
                            Complete
                          </button>
                        )}
                        <button type="button" onClick={() => openDetails(assignment.id)}
                          className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold transition-colors">
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

        <Pagination page={myAssignmentsPagination.page} totalPages={myAssignmentsPagination.totalPages} onChange={onPageChange} />
      </div>

      {/* ── Detail modal ─────────────────────────────────────────────── */}
      {selectedAssignment && !detailLoading && (
        <Modal title="Course Details" onClose={() => setSelectedAssignment(null)}>
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-gray-800">{selectedAssignment.course?.title || '-'}</h3>
              <p className="text-sm text-gray-500 mt-1">{selectedAssignment.course?.description || 'No description provided.'}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: 'Status',        value: statusLabel(selectedAssignment.status)                                                },
                { label: 'Difficulty',    value: selectedAssignment.course?.difficulty || '-'                                          },
                { label: 'Provider',      value: selectedAssignment.course?.provider   || '-'                                          },
                { label: 'Duration',      value: selectedAssignment.course?.estimatedDurationHours ? `${selectedAssignment.course.estimatedDurationHours} hrs` : '-' },
                { label: 'Assigned Date', value: formatDate(selectedAssignment.assignedDate)                                           },
                { label: 'Due Date',      value: formatDate(selectedAssignment.dueDate)                                                },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl bg-gray-50 p-3 border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
                  <p className="font-semibold text-gray-800 mt-1">{value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-gray-50 p-3 border border-gray-100 text-sm">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Assigned By</p>
              <p className="font-semibold text-gray-800 mt-1">{selectedAssignment.assignedBy?.fullName || '-'}</p>
              <p className="text-gray-500 text-xs">{selectedAssignment.assignedBy?.email || '-'}</p>
            </div>

            {selectedAssignment.notes && (
              <div className="rounded-xl bg-amber-50 p-3 border border-amber-100 text-sm">
                <p className="text-xs text-amber-700 uppercase tracking-wide">Assignment Note</p>
                <p className="text-amber-900 mt-1">{selectedAssignment.notes}</p>
              </div>
            )}

            {selectedAssignment.course?.externalUrl && (
              <a
                href={selectedAssignment.course.externalUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded-xl transition-colors"
              >
                Open Course Link →
              </a>
            )}

            <div className="flex items-center justify-end gap-2 pt-1 border-t border-gray-100">
              {selectedAssignment.status === 'assigned' && (
                <button type="button"
                  disabled={saving && actionLoadingId === selectedAssignment.id}
                  onClick={() => runStart(selectedAssignment.id)}
                  className="px-4 py-2 text-sm rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-semibold disabled:opacity-50 transition-colors">
                  Start
                </button>
              )}
              {selectedAssignment.status === 'in_progress' && (
                <button type="button"
                  disabled={saving && actionLoadingId === selectedAssignment.id}
                  onClick={() => runComplete(selectedAssignment.id)}
                  className="px-4 py-2 text-sm rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold disabled:opacity-50 transition-colors">
                  Complete
                </button>
              )}
              <button type="button" onClick={() => setSelectedAssignment(null)}
                className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold transition-colors">
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}