import { TableSkeleton } from '@shared';
import { BookOpen } from 'lucide-react';

const STATUS_STYLES = {
  assigned:    'bg-slate-100  text-slate-700  ring-1 ring-slate-200',
  in_progress: 'bg-cyan-100   text-cyan-700   ring-1 ring-cyan-200',
  completed:   'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
  cancelled:   'bg-gray-100   text-gray-500   ring-1 ring-gray-200',
};

function formatDate(value) {
  if (!value) return '-';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '-' : d.toLocaleDateString();
}

function getDueMeta(dueDate) {
  if (!dueDate) return { label: 'No due date', className: 'text-gray-400' };
  const now  = new Date();
  const due  = new Date(dueDate);
  if (Number.isNaN(due.getTime())) return { label: 'Invalid date', className: 'text-gray-400' };
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / 86400000);
  if (diffDays < 0)  return { label: `Overdue by ${Math.abs(diffDays)}d`, className: 'text-red-500 font-semibold' };
  if (diffDays <= 3) return { label: `Due in ${diffDays}d`,              className: 'text-amber-500 font-semibold' };
  return               { label: `Due in ${diffDays}d`,                   className: 'text-gray-400' };
}

export default function CourseAssignmentsTable({ assignments, loading, onCancel, cancelingAssignmentId }) {
  if (loading) return <TableSkeleton rows={4} cols={5} />;

  if (!assignments.length) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-gray-400">
        <BookOpen className="w-10 h-10 text-gray-200" />
        <p className="text-sm">No assignments found for this course.</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Employee', 'Assigned', 'Due Date', 'Status', 'Action'].map((h, i) => (
                <th key={h} className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i === 4 ? 'text-right' : 'text-left'}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {assignments.map((assignment) => {
              const status     = assignment.status || 'assigned';
              const isLocked   = status === 'completed' || status === 'cancelled';
              const isCanceling = cancelingAssignmentId === assignment.id;
              const dueMeta    = getDueMeta(assignment.dueDate);

              return (
                <tr key={assignment.id} className="hover:bg-cyan-50/20 transition-colors">
                  <td className="px-4 py-3 font-semibold text-gray-800">
                    {assignment.employeeName || `Employee #${assignment.employeeId}`}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(assignment.assignedDate)}</td>
                  <td className="px-4 py-3">
                    <p className="text-gray-700">{formatDate(assignment.dueDate)}</p>
                    <p className={`text-xs mt-0.5 ${dueMeta.className}`}>{dueMeta.label}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[status] || 'bg-gray-100 text-gray-600'}`}>
                      {status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onCancel(assignment)}
                      disabled={isLocked || isCanceling}
                      aria-label={`Cancel assignment for ${assignment.employeeName || `employee ${assignment.employeeId}`}`}
                      className="px-3 py-1.5 text-xs rounded-lg border border-red-200 text-red-700 hover:bg-red-50 font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      {isCanceling ? 'Cancelling…' : 'Cancel'}
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