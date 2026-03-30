function Row({ employee, selected, onToggle }) {
  const initials = employee.fullName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <label className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
      <div className="flex items-center gap-2 min-w-0">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggle(employee.id)}
          className="h-4 w-4"
        />
        <span className="w-7 h-7 rounded-full bg-cyan-100 text-cyan-700 text-xs font-bold flex items-center justify-center">
          {initials}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{employee.fullName}</p>
          <p className="text-xs text-gray-500 truncate">{employee.email}</p>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs text-gray-500">{employee.jobTitle || 'N/A'}</p>
        <p className="text-xs text-gray-400">{employee.department || 'N/A'}</p>
      </div>
    </label>
  );
}

export default function EligibleEmployeesPicker({
  employees,
  loading,
  selectedIds,
  onToggle,
}) {
  if (loading) {
    return <div className="text-sm text-gray-500">Loading employees...</div>;
  }

  if (employees.length === 0) {
    return <div className="text-sm text-gray-500">No eligible employees found.</div>;
  }

  return (
    <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1">
      {employees.map((employee) => (
        <Row
          key={employee.id}
          employee={employee}
          selected={selectedIds.includes(employee.id)}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}
