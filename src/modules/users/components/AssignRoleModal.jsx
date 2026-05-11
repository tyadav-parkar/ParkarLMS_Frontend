import { useState } from 'react';
import { Modal } from '@shared';
import { useAuth } from '@auth';

export default function AssignRoleModal({ employee, roles, onClose, onSuccess }) {
  const { user } = useAuth();
  const [selectedRoleId, setSelectedRoleId] = useState(
    employee?.roles?.[0]?.id?.toString() || ''
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const isSelf = Number(employee?.id) === Number(user?.id);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!selectedRoleId) {
      setError('Please select a role.');
      return;
    }

    if (isSelf) {
      setError('You cannot change your own role.');
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

        <select
          value={selectedRoleId}
          onChange={(e) => setSelectedRoleId(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-cyan-700"
        >
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name.replace(/\b\w/g, l => l.toUpperCase())}
            </option>
          ))}
        </select>

        <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
          Note: role applies on next login.
        </p>

        {isSelf && (
          <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
            You cannot assign a role to your own account.
          </p>
        )}

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold rounded-lg border text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving || isSelf}
            className="px-4 py-2 font-bold text-sm rounded-lg
                       bg-linear-to-r from-[#0f2236] to-cyan-800
                       hover:to-cyan-700 text-white disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Assign Role'}
          </button>
        </div>
      </form>
    </Modal>
  );
}