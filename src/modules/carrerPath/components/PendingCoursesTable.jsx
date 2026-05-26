import Table from '../../global_components/table/Table';

const STATUS_STYLES = {
  Completed: 'text-emerald-600 font-semibold',
  Pending: 'text-amber-500 font-semibold',
};

const COLUMNS = [
  { key: 'name', header: 'Requirement' },
  { key: 'type', header: 'Type' },
  {
    key: 'status',
    header: 'Status',
    align: 'right',
    render: (value) => (
      <span className={STATUS_STYLES[value] ?? 'text-gray-500'}>
        {value}
      </span>
    ),
  },
];

export default function PendingCoursesTable({ currentStage, nextStage, defaultCourses = [], certifications = [], managerAssignedCourses = [] }) {
  const requirements = currentStage?.nextRoleRequirements ?? [];

  const normalizedDefaultCourses = defaultCourses.map((c) => ({
    id: `dc-${c.id}`,
    name: c.courseName || '',
    type: c.type || '',
    status: c.status || '',
  }));

  const normalizedCertifications = certifications.map((c) => ({
    id: `cert-${c.id}`,
    name: c.courseName || '',
    type: c.type || '',
    status: c.status || '',
  }));

  const normalizedManagerCourses = managerAssignedCourses.map((m) => ({
    id: `mc-${m.id}`,
    name: m.courseName || m.courseTitle || (m.course && m.course.title) || '',
    type: m.courseCategory || '',
    status: m.status || '',
  }));

  const allData = [...requirements, ...normalizedDefaultCourses, ...normalizedCertifications, ...normalizedManagerCourses];

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs text-gray-500">Requirements for next role</p>
        <h3 className="text-base font-bold text-cyan-700 mt-0.5">
          {nextStage?.title ?? '—'}
        </h3>
      </div>

      <Table
        columns={COLUMNS}
        data={allData}
        rowKey="id"
        emptyMessage="No requirements defined for the next role."
      />
    </div>
  );
}
