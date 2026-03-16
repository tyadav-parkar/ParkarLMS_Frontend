export default function DeleteRoleForm({ roles, deletingRole, reassignTo, setReassignTo, formError, saving, onCancel, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="text-sm text-gray-700">
        You are about to delete the{' '}
        <span className="font-semibold">{deletingRole.name}</span> role. All
        employees currently assigned to this role must be reassigned first.
      </p>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Reassign employees to
        </label>
        <select
          value={reassignTo}
          onChange={(e) => setReassignTo(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">— select a role —</option>
          {roles
            .filter((r) => r.id !== deletingRole.id)
            .map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
        </select>
      </div>
      {formError && <p className="text-red-500 text-sm">{formError}</p>}
      <div className="flex justify-end gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm rounded-lg border text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
        >
          {saving ? 'Deleting…' : 'Delete Role'}
        </button>
      </div>
    </form>
  );
}
