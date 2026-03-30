const STATUS_STYLES = {
  assigned: 'bg-cyan-100 text-cyan-800',
  in_progress: 'bg-amber-100 text-amber-800',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-gray-100 text-gray-700',
};

function formatDate(value) {
  if (!value) return '-';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '-' : d.toLocaleDateString();
}

function getDueMeta(dueDate) {
  if (!dueDate) return { label: 'No due date', className: 'text-gray-500' };
  const now = new Date();
  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) return { label: 'Invalid date', className: 'text-gray-500' };
  const dayMs = 24 * 60 * 60 * 1000;
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / dayMs);
  if (diffDays < 0) return { label: `Overdue by ${Math.abs(diffDays)} day(s)`, className: 'text-red-600' };
  if (diffDays <= 3) return { label: `Due in ${diffDays} day(s)`, className: 'text-amber-600' };
  return { label: `Due in ${diffDays} day(s)`, className: 'text-gray-500' };
}

export default function CourseAssignmentsTable({ assignments, loading, onCancel, cancelingAssignmentId }) {
  if (loading) {
    return <p className="text-sm text-gray-500">Loading assignments...</p>;
  }

  if (!assignments.length) {
    return <p className="text-sm text-gray-500">No assignments found for this course.</p>;
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Employee', 'Assigned', 'Due Date', 'Status', 'Action'].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {assignments.map((assignment) => {
              const status = assignment.status || 'assigned';
              const isLocked = status === 'completed' || status === 'cancelled';
              const isCanceling = cancelingAssignmentId === assignment.id;
              const dueMeta = getDueMeta(assignment.dueDate);

              return (
                <tr key={assignment.id}>
                  <td className="px-4 py-3 font-medium text-gray-800">{assignment.employeeName || `Employee #${assignment.employeeId}`}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(assignment.assignedDate)}</td>
                  <td className="px-4 py-3 text-gray-600">
                    <p>{formatDate(assignment.dueDate)}</p>
                    <p className={`text-xs ${dueMeta.className}`}>{dueMeta.label}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-0.5 text-xs rounded-full ${STATUS_STYLES[status] || 'bg-gray-100 text-gray-700'}`}>
                      {status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onCancel(assignment)}
                      disabled={isLocked || isCanceling}
                      aria-label={`Cancel assignment for ${assignment.employeeName || `employee ${assignment.employeeId}`}`}
                      className="px-2.5 py-1 text-xs rounded-md border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCanceling ? 'Cancelling...' : 'Cancel'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}