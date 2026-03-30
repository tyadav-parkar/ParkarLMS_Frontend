import { Modal } from '@shared';

export default function ArchiveCourseModal({ course, onCancel, onConfirm, loading, error }) {
  if (!course) return null;

  return (
    <Modal title="Archive Course" onClose={onCancel}>
      <div className="space-y-4">
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
          <p className="text-sm text-amber-800">
            You are about to archive <span className="font-semibold">{course.title}</span>.
          </p>
          <p className="text-xs text-amber-700 mt-1">
            This will remove it from active lists. Existing assignments stay in history.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="border rounded-lg px-3 py-2 bg-gray-50">
            <p className="text-gray-500 text-xs">Category</p>
            <p className="font-medium text-gray-800">{course.category || 'N/A'}</p>
          </div>
          <div className="border rounded-lg px-3 py-2 bg-gray-50">
            <p className="text-gray-500 text-xs">Enrolled</p>
            <p className="font-medium text-gray-800">{course.enrolledCount ?? 0}</p>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm rounded-lg border text-gray-600 hover:bg-gray-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(course.id)}
            disabled={loading}
            className="px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-60"
          >
            {loading ? 'Archiving...' : 'Archive Course'}
          </button>
        </div>
      </div>
    </Modal>
  );
}