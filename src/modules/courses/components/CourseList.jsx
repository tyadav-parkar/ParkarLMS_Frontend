import { Eye, Pencil, Trash, UserPlus } from 'lucide-react';
import { TableSkeleton } from '@shared';

const DIFFICULTY_STYLES = {
  Beginner: 'bg-emerald-50 text-emerald-700',
  Intermediate: 'bg-amber-50 text-amber-700',
  Advanced: 'bg-red-50 text-red-700',
};

export default function CourseList({
  courses,
  loading,
  onAssign,
  onEdit,
  onArchive,
  onViewAssignments,
  canEdit,
  canAssign,
}) {
  return (
    <table className="w-full text-sm">
      <thead className="bg-gray-50 border-b border-gray-100">
        <tr>
          {['Course Title', 'Category', 'Difficulty', 'Duration', 'Enrolled', 'Status', 'Actions'].map((h) => (
            <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
          ))}
        </tr>
      </thead>

      <tbody className="divide-y divide-gray-100">
        {loading && <TableSkeleton rows={3} cols={7} />}

        {!loading && courses.map((course) => {
          const isArchived = course.status === 'archived';
          return (
            <tr key={course.id} className="hover:bg-cyan-50/40">
              <td className="px-5 py-3 font-semibold text-gray-800">{course.title}</td>

              <td className="px-5 py-3">
                <span className="px-2.5 py-0.5 text-xs bg-cyan-50 text-cyan-700 rounded-full">
                  {course.category || 'N/A'}
                </span>
              </td>

              <td className="px-5 py-3">
                <span className={`px-2.5 py-0.5 text-xs rounded-full ${DIFFICULTY_STYLES[course.difficulty] || 'bg-gray-100 text-gray-600'}`}>
                  {course.difficulty}
                </span>
              </td>

              <td className="px-5 py-3">{course.estimatedDurationMonths ?? '-'} mo</td>
              <td className="px-5 py-3">{course.enrolledCount ?? 0}</td>

              <td className="px-5 py-3">
                <span className={`px-2.5 py-0.5 text-xs rounded-full ${
                  isArchived ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'
                }`}>
                  {isArchived ? 'Archived' : 'Active'}
                </span>
              </td>

              <td className="px-5 py-3">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onAssign(course)}
                    disabled={!canAssign || isArchived}
                    className="p-1.5 text-cyan-700 hover:bg-cyan-50 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label={`Assign ${course.title}`}
                    title="Assign"
                  >
                    <UserPlus className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onViewAssignments(course)}
                    disabled={!canAssign}
                    className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label={`View assignments for ${course.title}`}
                    title="View assignments"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onEdit(course)}
                    disabled={!canEdit || isArchived}
                    className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label={`Edit ${course.title}`}
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onArchive(course)}
                    disabled={!canEdit || isArchived}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label={`Archive ${course.title}`}
                    title="Archive"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}

        {!loading && courses.length === 0 && (
          <tr>
            <td colSpan={7} className="text-center py-10 text-gray-400">
              No courses found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
