import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/authContext';

// ── Assign-role modal ─────────────────────────────────────────────────────
function AssignRoleModal({ employee, roles, onClose, onSuccess }) {
  // Pre-select the primary role or the first role in the M2M roles array
  const primaryRole = employee.roles?.find((r) => r.EmployeeRole?.is_primary)
    ?? employee.roles?.[0];
  const [selectedRoleId, setSelectedRoleId] = useState(
    primaryRole?.id ?? ''
  );
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedRoleId) { setError('Please select a role.'); return; }
    setSaving(true);
    setError('');
    try {
      await api.post('/roles/assign', {
        employee_id: employee.id,
        role_id:     Number(selectedRoleId),
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to assign role.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Assign Role</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
            &times;
          </button>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-gray-600 mb-4">
            Assigning role to{' '}
            <span className="font-semibold text-gray-800">
              {employee.first_name} {employee.last_name}
            </span>{' '}
            <span className="text-gray-400">({employee.email})</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Role
              </label>
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
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function UserManagement() {
  const { can } = useAuth();
  const [users,       setUsers]       = useState([]);
  const [roles,       setRoles]       = useState([]);
  const [pagination,  setPagination]  = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [search,      setSearch]      = useState('');
  const [roleFilter,  setRoleFilter]  = useState('');
  const [assignModal, setAssignModal] = useState(null); // employee | null

  const searchTimeout = useRef(null);

  // ── Fetch users ───────────────────────────────────────────────────────
  const fetchUsers = useCallback(
    async ({ page = 1, searchVal = search, roleVal = roleFilter } = {}) => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({ page, limit: 15 });
        if (searchVal.trim()) params.append('search', searchVal.trim());
        if (roleVal)          params.append('role_id', roleVal);

        const { data } = await api.get(`/roles/users?${params}`);
        setUsers(data.data ?? []);
        if (data.meta) setPagination({
          page:       data.meta.page,
          totalPages: data.meta.pages,
          total:      data.meta.total,
        });
      } catch (err) {
        setError(err.response?.data?.message ?? 'Failed to load users.');
      } finally {
        setLoading(false);
      }
    },
    [search, roleFilter]
  );

  // ── Fetch roles list (for filter + assign modal) ──────────────────────
  const fetchRoles = useCallback(async () => {
    try {
      const { data } = await api.get('/roles');
      setRoles(data.data ?? []);
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => {
    fetchRoles();
    fetchUsers({ page: 1 });
  }, [fetchRoles]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Search with debounce ──────────────────────────────────────────────
  function handleSearchChange(val) {
    setSearch(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchUsers({ page: 1, searchVal: val });
    }, 400);
  }

  function handleRoleFilter(val) {
    setRoleFilter(val);
    fetchUsers({ page: 1, roleVal: val });
  }

  function handlePage(newPage) {
    fetchUsers({ page: newPage });
  }

  function handleAssignSuccess() {
    setAssignModal(null);
    fetchUsers({ page: pagination.page });
  }

  // ── Role badges ──────────────────────────────────────────────────
  const ROLE_COLOURS = {
    admin:    'bg-red-100 text-red-700',
    manager:  'bg-blue-100 text-blue-700',
    employee: 'bg-green-100 text-green-700',
  };

  function roleBadge(role) {
    const name   = role?.name ?? 'unknown';
    const colour = ROLE_COLOURS[name] ?? 'bg-gray-100 text-gray-700';
    return (
      <span key={name} className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${colour}`}>
        {name}
      </span>
    );
  }

  // Renders all M2M role badges for an employee row (primary role shown first with a star)
  function roleBadges(empRoles = []) {
    if (!empRoles.length) return <span className="text-xs text-gray-400">No role</span>;
    const sorted = [...empRoles].sort(
      (a, b) => (b.EmployeeRole?.is_primary ? 1 : 0) - (a.EmployeeRole?.is_primary ? 1 : 0)
    );
    return (
      <div className="flex flex-wrap gap-1">
        {sorted.map((r) => (
          <span
            key={r.id}
            title={r.EmployeeRole?.is_primary ? 'Primary role' : ''}
            className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize flex items-center gap-0.5 ${ROLE_COLOURS[r.name] ?? 'bg-gray-100 text-gray-700'}`}
          >
            {r.EmployeeRole?.is_primary && <span className="text-amber-500 text-xs">&#9733;</span>}
            {r.name}
          </span>
        ))}
      </div>
    );
  }

  // ── Page ──────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          View employees and assign roles.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search by name, email or employee #…"
          className="border rounded-lg px-3 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={roleFilter}
          onChange={(e) => handleRoleFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Roles</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        {(search || roleFilter) && (
          <button
            onClick={() => { setSearch(''); setRoleFilter(''); fetchUsers({ page: 1, searchVal: '', roleVal: '' }); }}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Clear filters
          </button>
        )}
        <span className="ml-auto text-sm text-gray-500">
          {pagination.total} employee{pagination.total !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Error / loading */}
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-5 py-3 text-left font-semibold text-gray-600">Employee</th>
              <th className="px-5 py-3 text-left font-semibold text-gray-600">Employee #</th>
              <th className="px-5 py-3 text-left font-semibold text-gray-600">Department</th>
              <th className="px-5 py-3 text-left font-semibold text-gray-600">Role</th>
              <th className="px-5 py-3 text-right font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                  Loading…
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                  No employees found.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-medium text-gray-800">
                      {u.first_name} {u.last_name}
                    </div>
                    <div className="text-xs text-gray-500">{u.email}</div>
                  </td>
                  <td className="px-5 py-4 text-gray-600">
                    {u.employee_number ?? '—'}
                  </td>
                  <td className="px-5 py-4 text-gray-600">
                    {u.department?.name ?? u.Department?.name ?? '—'}
                  </td>
                  <td className="px-5 py-4">
                    {roleBadges(u.roles || [])}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {can('user_edit') ? (
                      <button
                        onClick={() => setAssignModal(u)}
                        className="text-blue-600 hover:underline text-xs font-medium"
                      >
                        Assign Role
                      </button>
                    ) : (
                      <span className="text-gray-400 text-xs">View only</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t bg-gray-50 text-sm text-gray-600">
            <button
              onClick={() => handlePage(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1 rounded border hover:bg-white disabled:opacity-40"
            >
              &larr; Prev
            </button>
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePage(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1 rounded border hover:bg-white disabled:opacity-40"
            >
              Next &rarr;
            </button>
          </div>
        )}
      </div>

      {/* Assign modal */}
      {assignModal && (
        <AssignRoleModal
          employee={assignModal}
          roles={roles}
          onClose={() => setAssignModal(null)}
          onSuccess={handleAssignSuccess}
        />
      )}
    </div>
  );
}
