import { useState } from 'react';
import { useAuth } from '@auth';
import { useRoles } from '../hooks/useRoles';
import { Modal, Pagination, TableSkeleton } from '@shared';
import RoleForm from '../components/RoleForm';
import { ShieldCheck } from 'lucide-react';

const BADGE_COLOURS = [
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-purple-100 text-purple-700',
  'bg-yellow-100 text-yellow-700',
  'bg-pink-100 text-pink-700',
  'bg-indigo-100 text-indigo-700',
  'bg-orange-100 text-orange-700',
];

export default function RolesManagement() {
  const { can } = useAuth();

  const {
    roles,
    permissions,
    pagination,
    loading,
    saving,
    formError,
    setFormError,
    create,
    update,
    remove,
    goToPage,
  } = useRoles();

  const [editModal, setEditModal] = useState(null);
  const [createModal, setCreateModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [confirmText, setConfirmText] = useState('');

  const [form, setForm] = useState({
    name: '',
    description: '',
    selectedPermIds: [],
  });

  // ─────────── HANDLERS ───────────

  function openCreate() {
    setForm({ name: '', description: '', selectedPermIds: [] });
    setFormError('');
    setCreateModal(true);
  }

  function openEdit(role) {
    setForm({
      name: role.name,
      description: role.description ?? '',
      selectedPermIds: (role.permissions ?? []).map((p) => p.id),
    });
    setFormError('');
    setEditModal(role);
  }

  function openDelete(role) {
    setFormError('');
    setConfirmText('');
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

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError('Role name is required.');
      return;
    }

    const ok = await create({
      name: form.name.trim(),
      description: form.description.trim(),
      permissions: form.selectedPermIds,
    });

    if (ok) setCreateModal(false);
  }

  async function handleUpdate(e) {
    e.preventDefault();

    const ok = await update(editModal.id, {
      name: form.name.trim(),
      description: form.description.trim(),
      permissions: form.selectedPermIds,
    });

    if (ok) setEditModal(null);
  }

  async function handleDelete() {
    if (confirmText !== 'DELETE') return;

    const ok = await remove(deleteModal.id);

    if (ok) {
      setDeleteModal(null);
      setConfirmText('');
    }
  }

  // ─────────── UI ───────────

  return (
    <div className="space-y-6">

      {/* ── CYAN HEADER (MATCHES USER MANAGEMENT) ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-700 to-cyan-800 px-7 py-6 shadow-lg shadow-cyan-900/20">
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full border border-cyan-700/30 pointer-events-none" />
        <div className="absolute -right-2 -top-2 w-24 h-24 rounded-full border border-cyan-600/20 pointer-events-none" />
        <div className="absolute right-16 -bottom-10 w-32 h-32 rounded-full border border-cyan-700/20 pointer-events-none" />

        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-cyan-700/40 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-cyan-300" />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Roles & Permissions
              </h1>
            </div>
            <p className="text-cyan-300/70 text-sm ml-11">
              Manage what each role can access across the LMS.
            </p>
          </div>

          <div className="hidden sm:flex flex-col items-end gap-0.5">
            <span className="text-3xl font-bold text-white tabular-nums leading-none">
              {pagination.total}
            </span>
            <span className="text-xs text-cyan-400 font-medium uppercase tracking-widest">
              Roles
            </span>
          </div>
        </div>
      </div>

      {/* ── ACTION BUTTON ── */}
      <div className="flex justify-end">
        {can('role_edit') && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
          >
            + New Role
          </button>
        )}
      </div>

      {/* ── TABLE ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-cyan-700 to-cyan-800">
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-cyan-200 uppercase tracking-widest">
                Role
              </th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-cyan-200 uppercase tracking-widest">
                Permissions
              </th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-cyan-200 uppercase tracking-widest">
                Users
              </th>
              <th className="px-5 py-3.5 text-right text-[11px] font-semibold text-cyan-200 uppercase tracking-widest">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <TableSkeleton rows={6} cols={4} />
            ) : roles.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-gray-400">
                  No roles found.
                </td>
              </tr>
            ) : (
              roles.map((role) => (
                <tr key={role.id} className="hover:bg-cyan-50/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800 capitalize">
                        {role.name}
                      </span>
                      {role.is_system_role && (
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide">
                          system
                        </span>
                      )}
                    </div>
                    {role.description && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {role.description}
                      </p>
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {(role.permissions ?? []).length === 0 ? (
                        <span className="text-gray-400 text-xs italic">
                          No permissions
                        </span>
                      ) : (
                        role.permissions.map((p, i) => (
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
                    {can('role_edit') && !role.is_system_role ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(role)}
                          className="text-cyan-700 hover:underline text-xs font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openDelete(role)}
                          className="text-red-500 hover:underline text-xs font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">View only</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          label="roles"
          onChange={goToPage}
        />
      </div>

      {/* ── CREATE MODAL ── */}
      {createModal && (
        <Modal title="Create New Role" onClose={() => setCreateModal(false)}>
          <RoleForm
            isSystem={false}
            onSubmit={handleCreate}
            onCancel={() => setCreateModal(false)}
            form={form}
            setForm={setForm}
            allPermissions={permissions}
            togglePerm={togglePerm}
            formError={formError}
            saving={saving}
          />
        </Modal>
      )}

      {/* ── EDIT MODAL ── */}
      {editModal && (
        <Modal title={`Edit Role — ${editModal.name}`} onClose={() => setEditModal(null)}>
          <RoleForm
            isSystem={editModal.is_system_role}
            onSubmit={handleUpdate}
            onCancel={() => setEditModal(null)}
            form={form}
            setForm={setForm}
            allPermissions={permissions}
            togglePerm={togglePerm}
            formError={formError}
            saving={saving}
          />
        </Modal>
      )}

      {/* ── DELETE MODAL ── */}
      {deleteModal && (
        <Modal title="Delete Role" onClose={() => setDeleteModal(null)}>
          <div className="p-4 text-sm text-gray-700">
            <p>This will permanently delete the role and remove all employee assignments.</p>
            <p className="mt-2 font-semibold text-red-600">This action cannot be undone.</p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Type <span className="text-red-600 font-bold">DELETE</span> to confirm
              </label>
              <input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="DELETE"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t px-4 pb-4">
            <button
              onClick={() => setDeleteModal(null)}
              className="px-4 py-2 text-sm rounded-lg border text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              onClick={handleDelete}
              disabled={saving || confirmText !== 'DELETE'}
              className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
            >
              {saving ? 'Deleting...' : 'Delete Role'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}