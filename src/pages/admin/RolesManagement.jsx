import { useCallback, useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/authContext';

// ── RoleForm — module-level so React does NOT remount on every parent render ──
// (defining it inside the parent causes re-mount on each keystroke → input loses focus)
function RoleForm({ isSystem, onSubmit, onCancel, form, setForm, allPermissions, togglePerm, formError, saving }) {
  const { can } = useAuth();
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Role Name {isSystem && <span className="text-gray-400 text-xs">(system – locked)</span>}
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          disabled={isSystem}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
          placeholder="e.g. Team Lead"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          rows={2}
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Brief description of this role…"
        />
      </div>

      {/* Permissions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          {allPermissions.map((p) => (
            <label key={p.id} className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600"
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
          className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
}

// ── Permission badge colours (cycled by index) ────────────────────────────
const BADGE_COLOURS = [
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-purple-100 text-purple-700',
  'bg-yellow-100 text-yellow-700',
  'bg-pink-100 text-pink-700',
  'bg-indigo-100 text-indigo-700',
  'bg-orange-100 text-orange-700',
];

// ── Small reusable modal wrapper ──────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            &times;
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function RolesManagement() {
  const { can } = useAuth();
  const [roles, setRoles]               = useState([]);
  const [allPermissions, setAllPerms]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');

  // Modal states
  const [editModal, setEditModal]       = useState(null); // null | role object
  const [createModal, setCreateModal]   = useState(false);
  const [deleteModal, setDeleteModal]   = useState(null); // null | role object
  const [saving, setSaving]             = useState(false);
  const [formError, setFormError]       = useState('');

  // Form state (shared for create + edit)
  const [form, setForm] = useState({ name: '', description: '', selectedPermIds: [] });
  const [reassignTo, setReassignTo]     = useState('');

  // ── Fetch data ──────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [rolesRes, permsRes] = await Promise.all([
        api.get('/roles'),
        api.get('/roles/permissions'),
      ]);
      setRoles(rolesRes.data.data ?? []);
      setAllPerms(permsRes.data.data ?? []);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Helpers ─────────────────────────────────────────────────────────────
  function openCreate() {
    setForm({ name: '', description: '', selectedPermIds: [] });
    setFormError('');
    setCreateModal(true);
  }

  function openEdit(role) {
    setForm({
      name:             role.name,
      description:      role.description ?? '',
      selectedPermIds:  (role.permissions ?? []).map((p) => p.id),
    });
    setFormError('');
    setEditModal(role);
  }

  function openDelete(role) {
    setReassignTo('');
    setFormError('');
    setDeleteModal(role);
  }

  function togglePerm(id) {
    setForm((prev) => ({
      ...prev,
      selectedPermIds: prev.selectedPermIds.includes(id)
        ? prev.selectedPermIds.filter((x) => x !== id)
        : [...prev.selectedPermIds, id],
    }));
  }

  // ── Create ──────────────────────────────────────────────────────────────
  async function handleCreate(e) {
    e.preventDefault();
    if (!form.name.trim()) { setFormError('Role name is required.'); return; }
    setSaving(true);
    setFormError('');
    try {
      await api.post('/roles', {
        name:        form.name.trim(),
        description: form.description.trim(),
        permissions: form.selectedPermIds,
      });
      setCreateModal(false);
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.message ?? 'Failed to create role.');
    } finally {
      setSaving(false);
    }
  }

  // ── Update ──────────────────────────────────────────────────────────────
  async function handleUpdate(e) {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      await api.put(`/roles/${editModal.id}`, {
        name:        form.name.trim(),
        description: form.description.trim(),
        permissions: form.selectedPermIds,
      });
      setEditModal(null);
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.message ?? 'Failed to update role.');
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ──────────────────────────────────────────────────────────────
  async function handleDelete(e) {
    e.preventDefault();
    if (!reassignTo) { setFormError('Please select a role to reassign employees to.'); return; }
    setSaving(true);
    setFormError('');
    try {
      await api.delete(`/roles/${deleteModal.id}`, {
        data: { reassign_to_id: Number(reassignTo) },
      });
      setDeleteModal(null);
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.message ?? 'Failed to delete role.');
    } finally {
      setSaving(false);
    }
  }

  // ── Page ─────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Roles &amp; Permissions</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage what each role can access across the LMS.
          </p>
        </div>
        {can('role_edit') && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            + New Role
          </button>
        )}
      </div>

      {/* Error / loading */}
      {loading && <p className="text-gray-400 text-sm">Loading…</p>}
      {error   && <p className="text-red-500 text-sm">{error}</p>}

      {/* Roles table */}
      {!loading && !error && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Role</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Permissions</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Users</th>
                <th className="px-5 py-3 text-right font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {roles.map((role) => (
                <tr key={role.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800 capitalize">{role.name}</span>
                      {role.is_system_role && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">
                          system
                        </span>
                      )}
                    </div>
                    {role.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{role.description}</p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {(role.permissions ?? []).length === 0 ? (
                        <span className="text-gray-400 text-xs italic">No permissions</span>
                      ) : (
                        (role.permissions ?? []).map((p, i) => (
                          <span
                            key={p.id}
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${BADGE_COLOURS[i % BADGE_COLOURS.length]}`}
                          >
                            {p.label}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-600">
                    {role.employee_count ?? '—'}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {can('role_edit') && (
                      <button
                        onClick={() => openEdit(role)}
                        className="text-blue-600 hover:underline text-xs font-medium mr-4"
                      >
                        Edit
                      </button>
                    )}
                    {can('role_edit') && !role.is_system_role && (
                      <button
                        onClick={() => openDelete(role)}
                        className="text-red-500 hover:underline text-xs font-medium"
                      >
                        Delete
                      </button>
                    )}
                    {!can('role_edit') && (
                      <span className="text-gray-400 text-xs">View only</span>
                    )}
                  </td>
                </tr>
              ))}
              {roles.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-gray-400">
                    No roles found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Create modal ─────────────────────────────────────────────────── */}
      {createModal && (
        <Modal title="Create New Role" onClose={() => setCreateModal(false)}>
          <RoleForm
            isSystem={false}
            onSubmit={handleCreate}
            onCancel={() => setCreateModal(false)}
            form={form}
            setForm={setForm}
            allPermissions={allPermissions}
            togglePerm={togglePerm}
            formError={formError}
            saving={saving}
          />
        </Modal>
      )}

      {/* ── Edit modal ───────────────────────────────────────────────────── */}
      {editModal && (
        <Modal
          title={`Edit Role — ${editModal.name}`}
          onClose={() => setEditModal(null)}
        >
          <RoleForm
            isSystem={editModal.is_system_role}
            onSubmit={handleUpdate}
            onCancel={() => setEditModal(null)}
            form={form}
            setForm={setForm}
            allPermissions={allPermissions}
            togglePerm={togglePerm}
            formError={formError}
            saving={saving}
          />
        </Modal>
      )}

      {/* ── Delete modal ─────────────────────────────────────────────────── */}
      {deleteModal && (
        <Modal title="Delete Role" onClose={() => setDeleteModal(null)}>
          <form onSubmit={handleDelete} className="space-y-4">
            <p className="text-sm text-gray-700">
              You are about to delete the{' '}
              <span className="font-semibold">{deleteModal.name}</span> role. All
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
                  .filter((r) => r.id !== deleteModal.id)
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
                onClick={() => setDeleteModal(null)}
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
        </Modal>
      )}
    </div>
  );
}
