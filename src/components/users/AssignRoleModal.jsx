import { useState } from 'react';
import Modal from '../ui/Modal';

export default function AssignRoleModal({ employee, roles, onClose, onSuccess }) {
  const primaryRole = employee.roles?.find((r) => r.EmployeeRole?.is_primary) ?? employee.roles?.[0];
  const [selectedRoleId, setSelectedRoleId] = useState(primaryRole?.id ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedRoleId) {
      setError('Please select a role.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSuccess(employee.id, Number(selectedRoleId));
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to assign role.');
      setSaving(false);
    }
  }

  return (
    <Modal title="Assign Role" onClose={onClose}>
      <p className="text-sm text-gray-600 mb-4">
        Assigning role to{' '}
        <span className="font-semibold text-gray-800">
          {employee.first_name} {employee.last_name}
        </span>{' '}
        <span className="text-gray-400">({employee.email})</span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Role</label>
          <select
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">— select a role —</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
          Note: the new role takes effect on the employee&apos;s next login.
        </p>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Assign Role'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
