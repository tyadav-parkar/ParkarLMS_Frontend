import { useMemo, useState } from 'react';
import { Modal } from '@shared';
import EligibleEmployeesPicker from './EligibleEmployeesPicker';

export default function AssignmentModal({
  course,
  onClose,
  onSubmit,
  loading,
  error,
  employees,
  selectedIds,
  onToggleEmployee,
  onFilterChange,
  saving,
}) {
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('');
  const [search, setSearch] = useState('');

  const canSubmit = useMemo(() => selectedIds.length > 0 && !saving, [selectedIds.length, saving]);

  function handleApplyFilters() {
    onFilterChange({ role, department, search });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    await onSubmit({ employeeIds: selectedIds, dueDate: dueDate || null, notes: notes || null });
    setDueDate('');
    setNotes('');
  }

  return (
    <Modal title={`Assign Course: ${course.title}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-gray-500">Filter employees before selecting recipients for this course assignment.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Search</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employee"
              aria-label="Search employee"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Role"
              aria-label="Filter by role"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Department</label>
            <input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Department"
              aria-label="Filter by department"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleApplyFilters}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            Apply Filters
          </button>
        </div>

        <EligibleEmployeesPicker
          employees={employees}
          loading={loading}
          selectedIds={selectedIds}
          onToggle={onToggleEmployee}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              aria-label="Assignment due date"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Selected Employees</label>
            <div className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-700">
              {selectedIds.length}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            aria-label="Assignment notes"
            className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
            placeholder="Optional notes"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="px-4 py-2 text-sm rounded-lg btn-dark text-white disabled:opacity-60"
          >
            {saving ? 'Assigning...' : 'Assign Course'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
