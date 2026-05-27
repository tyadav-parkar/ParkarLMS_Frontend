import Table from '../../global_components/table/Table';

const STATUS_CONFIG = {
  Pending:     { label: 'Pending',     className: 'text-amber-500 font-semibold' },
  assigned:    { label: 'Assigned',    className: 'text-amber-600 font-semibold' },
  in_progress: { label: 'In Progress', className: 'text-indigo-600 font-semibold' },
  completed:   { label: 'Completed',   className: 'text-emerald-600 font-semibold' },
};

const COLUMNS = [
  { key: 'name', header: 'Requirement' },
  { key: 'type', header: 'Type' },
  {
    key: 'status',
    header: 'Status',
    align: 'right',
    render: (value) => {
      const config = STATUS_CONFIG[value];
      return (
        <span className={config?.className ?? 'text-gray-500'}>
          {config?.label ?? value}
        </span>
      );
    },
  },
];

export default function PendingCoursesTable({ currentStage, nextStage, defaultCourses = [], certifications = [], managerAssignedCourses = [] }) {
  const requirements = currentStage?.nextRoleRequirements ?? [];

  const normalizedDefaultCourses = defaultCourses
    .map((c) => ({
      id: `dc-${c.id}`,
      name: c.courseName || '',
      type: c.type || '',
      status: c.status || '',
    }));

  const normalizedCertifications = certifications
    .map((c) => ({
      id: `cert-${c.id}`,
      name: c.courseName || '',
      type: c.type || '',
      status: c.status || '',
    }));

  const normalizedManagerCourses = managerAssignedCourses
    .map((m) => ({
      id: `mc-${m.id}`,
      name: m.courseName || m.courseTitle || (m.course && m.course.title) || '',
      type: m.courseCategory || '',
      status: m.status || '',
    }));

  const allData = [...requirements, ...normalizedDefaultCourses, ...normalizedCertifications, ...normalizedManagerCourses];

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="text-left">
          <p className="text-xs text-gray-500">Next role</p>
          <h3 className="text-base font-bold text-cyan-700 mt-0.5">
            {nextStage?.role_title ?? nextStage?.title ?? '—'}
          </h3>
        </div>
      </div>

      <Table
        columns={COLUMNS}
        data={allData}
        rowKey="id"
        emptyMessage="No requirements defined for the next role."
        maxHeight="500px"
      />
    </div>
  );
}
