import { Eye, Pencil, Trash2, UserPlus, BookOpen } from 'lucide-react';
import { TableSkeleton } from '@shared';

const DIFFICULTY_STYLES = {
  Beginner:     'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  Intermediate: 'bg-amber-50   text-amber-700   ring-1 ring-amber-200',
  Advanced:     'bg-red-50     text-red-700     ring-1 ring-red-200',
};

export default function CourseList({
  courses, loading,
  onAssign, onEdit, onArchive, onViewAssignments,
  canEdit, canAssign,
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[860px]">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            {['Course Title', 'Category', 'Difficulty', 'Duration', 'Enrolled', 'Status', 'Actions'].map((h, i) => (
              <th
                key={h}
                className={`px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${
                  i === 6 ? 'text-right' : 'text-left'
                }`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {loading && <TableSkeleton rows={4} cols={7} />}

          {/* ✅ SAFE MAP */}
          {!loading && (courses || []).map((course) => {
            const isArchived = course.status === 'archived';
            return (
              <tr
                key={course.id}
                className={`transition-colors hover:bg-cyan-50/20 ${
                  isArchived ? 'opacity-60' : ''
                }`}
              >
                <td className="px-5 py-3.5 max-w-[220px]">
                  <p className="font-semibold text-gray-800 truncate">
                    {course.title}
                  </p>
                  {course.provider && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {course.provider}
                    </p>
                  )}
                </td>

                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200">
                    {course.category || 'N/A'}
                  </span>
                </td>

                <td className="px-5 py-3.5">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      DIFFICULTY_STYLES[course.difficulty] ||
                      'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {course.difficulty || 'N/A'}
                  </span>
                </td>

                <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">
                  {course.estimatedDurationHours ?? '-'} hrs
                </td>

                <td className="px-5 py-3.5 text-gray-600">
                  {course.enrolledCount ?? 0}
                </td>

                <td className="px-5 py-3.5">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      isArchived
                        ? 'bg-gray-100 text-gray-500 ring-1 ring-gray-200'
                        : 'bg-green-50 text-green-700 ring-1 ring-green-200'
                    }`}
                  >
                    {isArchived ? 'Archived' : 'Active'}
                  </span>
                </td>

                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onAssign(course)}
                      disabled={!canAssign || isArchived}
                      title="Assign"
                      aria-label={`Assign ${course.title}`}
                      className="p-2 text-cyan-700 hover:bg-cyan-50 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onViewAssignments(course)}
                      disabled={!canAssign}
                      title="View Assignments"
                      aria-label={`Assignments for ${course.title}`}
                      className="p-2 text-gray-500 hover:text-cyan-700 hover:bg-cyan-50 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onEdit(course)}
                      disabled={!canEdit || isArchived}
                      title="Edit"
                      aria-label={`Edit ${course.title}`}
                      className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onArchive(course)}
                      disabled={!canEdit || isArchived}
                      title="Archive"
                      aria-label={`Archive ${course.title}`}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}

          {/* ✅ SAFE LENGTH */}
          {!loading && (courses || []).length === 0 && (
            <tr>
              <td colSpan={7} className="px-5 py-14 text-center">
                <BookOpen className="w-10 h-10 mx-auto text-gray-200 mb-2" />
                <p className="text-sm text-gray-400">No courses found</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}