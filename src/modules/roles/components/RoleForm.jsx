import { useAuth } from '@auth';

export default function RoleForm({
  isSystem,
  onSubmit,
  onCancel,
  form,
  setForm,
  allPermissions,
  togglePerm,
  formError,
  saving
}) {
  const { can } = useAuth();

  return (
    <form onSubmit={onSubmit} className="space-y-4">

      {/* Role Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Role Name {isSystem && <span className="text-gray-400 text-xs">(system - locked)</span>}
        </label>

        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          disabled={isSystem}
          className="w-full border rounded-lg px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-cyan-700
                     disabled:bg-gray-50 disabled:text-gray-400"
          placeholder="e.g. Team Lead"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>

        <textarea
          rows={2}
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          className="w-full border rounded-lg px-3 py-2 text-sm resize-none
                     focus:outline-none focus:ring-2 focus:ring-cyan-700"
          placeholder="Brief description of this role..."
        />
      </div>

      {/* Permissions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Permissions
        </label>

        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          {allPermissions.map((p) => (
            <label key={p.id} className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-cyan-700"
                checked={form.selectedPermIds.includes(p.id)}
                onChange={() => togglePerm(p.id)}
                disabled={!can('role_edit')}
              />

              <span className="text-sm">
                <span className="font-medium text-gray-800">{p.label}</span>
                {p.description && (
                  <span className="block text-xs text-gray-500">{p.description}</span>
                )}
              </span>
            </label>
          ))}
        </div>
      </div>

      {formError && <p className="text-red-500 text-sm">{formError}</p>}

      {/* Actions */}
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
          className="px-4 py-2 text-sm rounded-lg
                     bg-gradient-to-r from-[#0f2236] to-cyan-800
                     hover:to-cyan-700 text-white shadow-sm
                     disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
}