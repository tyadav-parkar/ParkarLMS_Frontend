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

export default function PendingCoursesTable({ currentStage, nextStage }) {
  const requirements = currentStage?.nextRoleRequirements ?? [];

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
        data={requirements}
        rowKey="id"
        emptyMessage="No requirements defined for the next role."
      />
    </div>
  );
}
