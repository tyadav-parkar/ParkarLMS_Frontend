import Table from '../../global_components/table/Table';

const COLUMNS = [
  { key: 'name', header: 'Course / Certificate' },
  { key: 'type', header: 'Type' },
  { key: 'completedOn', header: 'Completed On', align: 'right' },
];

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function CompletedCoursesTable({ stages = [], defaultCourses = [], certifications = [], managerAssignedCourses = [] }) {
  const currentStage = stages.find((s) => s.status === 'current') ?? stages[0];

  const completedAssigned = [
    ...defaultCourses.filter((c) => c.status === 'completed').map((c) => ({
      id: `dc-${c.id}`,
      name: c.courseName || '',
      type: c.type || '',
      completedOn: formatDate(c.completionDate),
    })),
    ...certifications.filter((c) => c.status === 'completed').map((c) => ({
      id: `cert-${c.id}`,
      name: c.courseName || '',
      type: c.type || '',
      completedOn: formatDate(c.completionDate),
    })),
    ...managerAssignedCourses.filter((m) => m.status === 'completed').map((m) => ({
      id: `mc-${m.id}`,
      name: m.courseName || '',
      type: m.courseCategory || '',
      completedOn: formatDate(m.completionDate),
    })),
  ];

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs text-gray-500">Completed courses &amp; certificates for role</p>
            <h3 className="text-base font-bold text-gray-900 mt-0.5">
              {currentStage?.role_title ?? currentStage?.title ?? '—'}
            </h3>
          </div>
        </div>

        <Table
          columns={COLUMNS}
          data={completedAssigned}
          rowKey="id"
          emptyMessage="No completed courses or certificates yet."
          maxHeight="500px"
        />
      </div>

      
    </div>
  );
}
