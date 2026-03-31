import { Users } from 'lucide-react';
import { Modal, Pagination } from '@shared';
import CourseAssignmentsTable from './CourseAssignmentsTable';

export default function CourseAssignmentsModal({
  course,
  loading,
  error,
  assignments,
  pagination,
  statusFilter,
  onStatusFilterChange,
  onPageChange,
  onCancel,
  cancelingAssignmentId,
  onClose,
}) {
  if (!course) return null;

  return (
    <Modal title={`Assignments — ${course.title}`} onClose={onClose}>
      <div className="space-y-5">

        {/* Header meta row */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-50 border border-cyan-100 flex items-center justify-center">
              <Users className="w-3.5 h-3.5 text-cyan-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total Assignments</p>
              <p className="text-sm font-bold text-gray-800">{pagination.total}</p>
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-700 focus:border-cyan-700"
          >
            <option value="">All Status</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">{error}</p>
        )}

        <CourseAssignmentsTable
          assignments={assignments}
          loading={loading}
          onCancel={onCancel}
          cancelingAssignmentId={cancelingAssignmentId}
        />

        <Pagination
          page={pagination.page}
          totalPages={Math.max(1, pagination.totalPages)}
          onChange={onPageChange}
        />
      </div>
    </Modal>
  );
}