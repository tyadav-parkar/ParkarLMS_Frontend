import { Modal } from '@shared';
import { Archive, AlertTriangle } from 'lucide-react';

export default function ArchiveCourseModal({
  course,
  onCancel,
  onConfirm,
  loading = false,
  error,
}) {
  if (!course) return null;

  return (
    <Modal title="Archive Course" onClose={onCancel}>
      <div className="space-y-5">

        {/* ── Course badge ── */}
        <div className="flex items-center gap-3 bg-cyan-50 border border-cyan-100 rounded-xl px-4 py-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center flex-shrink-0">
            <Archive className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-cyan-900 truncate">{course.title}</p>
            <p className="text-xs text-cyan-600">
              {course.category || 'Uncategorized'} · {course.difficulty || 'N/A'}
            </p>
          </div>
        </div>

        {/* ── Warning ── */}
        <div className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
          <AlertTriangle className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              What happens when you archive
            </p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Hidden from all employee course lists</li>
              <li>• No new assignments can be created</li>
              <li>• Existing assignments and progress are preserved</li>
              <li>• Can be unarchived anytime from the course list</li>
            </ul>
          </div>
        </div>

        {/* ── Impact stats ── */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`flex items-center justify-center flex-col py-4 rounded-xl border text-sm font-bold ${
            (course.enrolledCount || 0) > 0
              ? 'bg-cyan-50 border-cyan-200 text-cyan-700'
              : 'bg-gray-50 border-gray-200 text-gray-400'
          }`}>
            <span className="text-2xl font-bold">{course.enrolledCount || 0}</span>
            <span className="text-xs text-gray-500 uppercase tracking-wide font-medium mt-0.5">
              Active Assignments
            </span>
          </div>
          <div className={`flex items-center justify-center flex-col py-4 rounded-xl border text-sm font-bold ${
            (course.completedCount || 0) > 0
              ? 'bg-cyan-50 border-cyan-200 text-cyan-700'
              : 'bg-gray-50 border-gray-200 text-gray-400'
          }`}>
            <span className="text-2xl font-bold">{course.completedCount || 0}</span>
            <span className="text-xs text-gray-500 uppercase tracking-wide font-medium mt-0.5">
              Completed
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* ── Actions ── */}
        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-5 py-2.5 text-sm font-semibold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white disabled:opacity-50 transition-colors shadow-sm disabled:cursor-not-allowed"
          >
            {loading ? 'Archiving...' : 'Archive Course'}
          </button>
        </div>

      </div>
    </Modal>
  );
}