import { Modal } from '@shared';

export default function CancelAssignmentModal({ assignment, onCancel, onConfirm, loading, error }) {
  if (!assignment) return null;

  return (
    <Modal title="Cancel Assignment" onClose={onCancel}>
      <div className="space-y-4">
        <p className="text-sm text-gray-700">
          Cancel assignment for <span className="font-semibold">{assignment.employeeName || `Employee #${assignment.employeeId}`}</span>?
        </p>
        <p className="text-xs text-gray-500">
          Completed assignments cannot be cancelled. This will set status to <span className="font-semibold">cancelled</span>.
        </p>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm rounded-lg border text-gray-600 hover:bg-gray-50 disabled:opacity-60"
          >
            Keep Assignment
          </button>
          <button
            type="button"
            onClick={() => onConfirm(assignment.id)}
            disabled={loading}
            className="px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-60"
          >
            {loading ? 'Cancelling...' : 'Confirm Cancel'}
          </button>
        </div>
      </div>
    </Modal>
  );
}