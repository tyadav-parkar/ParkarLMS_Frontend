import { useState } from 'react';
import { useAuth } from '../../contexts/authContext';
import { useUsers } from '../../hooks/useUsers';
import Pagination from '../../components/ui/Pagination';
import { TableSkeleton } from '../../components/ui/Skeleton';
import AssignRoleModal from '../../components/users/AssignRoleModal';

const ROLE_COLOURS = {
  admin:    'bg-red-100 text-red-700',
  manager:  'bg-blue-100 text-blue-700',
  employee: 'bg-green-100 text-green-700',
};

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
          className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize flex items-center gap-0.5 ${
            ROLE_COLOURS[r.name] ?? 'bg-gray-100 text-gray-700'
          }`}
        >
          {r.EmployeeRole?.is_primary && (
            <span className="text-amber-500 text-xs">&#9733;</span>
          )}
          {r.name}
        </span>
      ))}
    </div>
  );
}

export default function UserManagement() {
  const { can } = useAuth();
  const {
    users,
    roles,
    pagination,
    loading,
    error,
    search,
    roleFilter,
    setSearch,
    setRoleFilter,
    goToPage,
    clearFilters,
    assignRole,
  } = useUsers();

  const [assignModal, setAssignModal] = useState(null);

  async function handleAssignSuccess(employeeId, roleId) {
    await assignRole(employeeId, roleId);
    setAssignModal(null);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <p className="text-sm text-gray-500 mt-0.5">View employees and assign roles.</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email or employee #…"
          className="border rounded-lg px-3 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
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
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Clear filters
          </button>
        )}
        <span className="ml-auto text-sm text-gray-500">
          {pagination.total} employee{pagination.total !== 1 ? 's' : ''}
        </span>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

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
              <TableSkeleton rows={8} cols={5} />
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
                  <td className="px-5 py-4 text-gray-600">{u.employee_number ?? '—'}</td>
                  <td className="px-5 py-4 text-gray-600">
                    {u.department?.name ?? u.Department?.name ?? '—'}
                  </td>
                  <td className="px-5 py-4">{roleBadges(u.roles || [])}</td>
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

        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          label="employees"
          onChange={goToPage}
        />
      </div>

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