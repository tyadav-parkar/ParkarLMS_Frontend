import { useState } from 'react';

export default function DeleteRoleModal({ role, onCancel, onConfirm, saving }) {
  const [confirmText, setConfirmText] = useState('');
  const isValid = confirmText === 'DELETE';

  return (
    <div className="p-4">

      <p className="text-sm text-gray-700">
        You are about to delete{' '}
        <span className="font-semibold text-gray-900">{role.name}</span>.
      </p>

      <p className="text-sm text-gray-500 mt-2">
        This removes all employee assignments.
      </p>

      <p className="mt-3 text-sm font-semibold text-red-600">
        This action cannot be undone.
      </p>

      <div className="mt-4">
        <label className="block text-xs font-semibold text-gray-500 mb-2">
          Type <span className="text-red-600 font-bold">DELETE</span>
        </label>

        <input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          className="w-full px-3 py-2 text-sm border rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      <div className="flex justify-end gap-3 mt-5 border-t pt-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm rounded-lg border text-gray-600"
        >
          Cancel
        </button>

        <button
          onClick={onConfirm}
          disabled={!isValid || saving}
          className="px-4 py-2 text-sm rounded-lg text-white
                     bg-red-600 hover:bg-red-700 disabled:opacity-60"
        >
          {saving ? 'Deleting...' : 'Delete Role'}
        </button>
      </div>
    </div>
  );
}