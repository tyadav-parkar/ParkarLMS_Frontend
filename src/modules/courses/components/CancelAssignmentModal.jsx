import { AlertTriangle } from 'lucide-react';
import { Modal } from '@shared';

export default function CancelAssignmentModal({ assignment, onCancel, onConfirm, loading, error }) {
  if (!assignment) return null;

  const employeeName = assignment.employeeName || `Employee #${assignment.employeeId}`;

  return (
    <Modal title="Cancel Assignment" onClose={onCancel}>
      <div className="space-y-5">

        {/* Warning */}
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">
              Cancel assignment for {employeeName}?
            </p>
            <p className="text-xs text-red-600 mt-1">
              This will set the status to <span className="font-semibold">cancelled</span>. Completed assignments cannot be cancelled.
            </p>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">{error}</p>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-5 py-2.5 text-sm font-semibold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-60 transition-colors"
          >
            Keep Assignment
          </button>
          <button
            type="button"
            onClick={() => onConfirm(assignment.id)}
            disabled={loading}
            className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-red-600 hover:bg-red-700 text-white disabled:opacity-60 transition-colors shadow-sm"
          >
            {loading ? 'Cancelling…' : 'Confirm Cancel'}
          </button>
        </div>
      </div>
    </Modal>
  );
}