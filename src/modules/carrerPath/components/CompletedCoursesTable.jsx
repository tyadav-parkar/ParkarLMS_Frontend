import { useState } from 'react';
import Table from '../../global_components/table/Table';

const COLUMNS = [
  { key: 'name', header: 'Course / Certificate' },
  { key: 'type', header: 'Type' },
  { key: 'completedOn', header: 'Completed On', align: 'right' },
];

export default function CompletedCoursesTable({ stages = [] }) {
  const visibleStages = stages.filter((s) => s.completedCourses?.length > 0);

  const defaultId = (
    visibleStages.find((s) => s.status === 'current') ??
    visibleStages.find((s) => s.status === 'completed') ??
    visibleStages[0]
  )?.id;

  const [selectedId, setSelectedId] = useState(defaultId);

  const selectedStage = visibleStages.find((s) => s.id === selectedId) ?? visibleStages[0];
  const courses = selectedStage?.completedCourses ?? [];

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs text-gray-500">Completed Course &amp; Certificate for role</p>
          <h3 className="text-base font-bold text-gray-900 mt-0.5">
            {selectedStage?.title ?? '—'}
          </h3>
        </div>

        {visibleStages.length > 1 && (
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-600 bg-white
              focus:outline-none focus:ring-2 focus:ring-cyan-700 focus:border-cyan-700 shrink-0"
          >
            {visibleStages.map((s) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
        )}
      </div>

      <Table
        columns={COLUMNS}
        data={courses}
        rowKey="id"
        emptyMessage="No completed courses for this role."
      />
    </div>
  );
}
