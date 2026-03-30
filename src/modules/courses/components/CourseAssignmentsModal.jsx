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
    <Modal title={`Assignments - ${course.title}`} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs text-gray-500">
            Total assignments: <span className="font-semibold text-gray-700">{pagination.total}</span>
          </p>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-700"
          >
            <option value="">All Status</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

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