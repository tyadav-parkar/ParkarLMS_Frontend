import { useState } from "react";
import { useAuth } from "@auth";
import { Pagination, TableSkeleton } from "@shared";
import { useUsers } from "../hooks/useUsers";
import AssignRoleModal from "../components/AssignRoleModal";
import UserDetailModal from "../components/UserDetailModal";
import { IdCard, UserCog, Users, UserX } from "lucide-react";

const ROLE_COLOURS = {
  admin:    "bg-red-100   text-red-700   ring-1 ring-red-200",
  manager:  "bg-cyan-100  text-cyan-800  ring-1 ring-cyan-200",
  employee: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
};

function RoleBadges({ empRoles = [] }) {
  if (!empRoles.length)
    return <span className="text-xs text-gray-300 italic">No role</span>;

  const sorted = [...empRoles].sort(
    (a, b) =>
      (b.EmployeeRole?.is_primary ? 1 : 0) -
      (a.EmployeeRole?.is_primary ? 1 : 0)
  );

  return (
    <div className="flex flex-wrap gap-1">
      {sorted.map((r) => (
        <span
          key={r.id}
          title={r.EmployeeRole?.is_primary ? "Primary role" : ""}
          className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold capitalize flex items-center gap-1 ${
            ROLE_COLOURS[r.name] ?? "bg-gray-100 text-gray-600"
          }`}
        >
          {r.EmployeeRole?.is_primary && (
            <span className="text-amber-400 text-[10px]">★</span>
          )}
          {r.name}
        </span>
      ))}
    </div>
  );
}

function Avatar({ firstName, lastName, inactive = false }) {
  const initials =
    `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?";
  return (
    <div
      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm ${
        inactive
          ? "bg-gray-200 text-gray-400"
          : "bg-[#00c8b4] text-[#0f2236]"
      }`}
    >
      {initials}
    </div>
  );
}

export default function UserManagement() {
  const { can, user } = useAuth();
  const {
    users, roles, pagination, loading, 
    search, roleFilter, activeFilter,
    setSearch, setRoleFilter, setActive,
    goToPage, clearFilters, assignRole,
  } = useUsers();

  const [assignModal, setAssignModal] = useState(null);
  const [viewUser, setViewUser] = useState(null);

  async function handleAssignSuccess(employeeId, roleId) {
    await assignRole(employeeId, roleId);
    setAssignModal(null);
  }

  const isActive = activeFilter === "true";

  return (
    <div className="space-y-2">

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl main-background px-7 py-6 shadow-lg shadow-cyan-900/20">
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full border border-cyan-700/90 pointer-events-none" />
        <div className="absolute -right-2 -top-2 w-24 h-24 rounded-full border border-cyan-600/50 pointer-events-none" />
        <div className="absolute right-16 -bottom-10 w-32 h-32 rounded-full border border-cyan-600/50 pointer-events-none" />

        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-cyan-700/40 flex items-center justify-center">
                <Users className="w-4 h-4 text-cyan-300" />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                User Management
              </h1>
            </div>
            <p className="text-cyan-300/70 text-sm ml-11">
              View employees, manage roles and access.
            </p>
          </div>

          <div className="hidden sm:flex flex-col items-end gap-0.5">
            <span className="text-3xl font-bold text-white tabular-nums leading-none">
              {pagination.total}
            </span>
            <span className="text-xs text-cyan-400 font-medium uppercase tracking-widest">
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActive("true")}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            isActive
              ? "border-cyan-700 text-cyan-800"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          <Users className="w-4 h-4" />
          Active
        </button>

        <button
          onClick={() => setActive("false")}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            !isActive
              ? "border-cyan-700 text-cyan-800"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          <UserX className="w-4 h-4" />
          Inactive
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-cyan-700 focus:border-cyan-700"
          placeholder="Search..."
        />

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-cyan-700 focus:border-cyan-700"
        >
          <option value="">All Roles</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>

        {(search || roleFilter) && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-400 hover:text-cyan-700 underline"
          >
            Clear filters
          </button>
        )}

        <span className="ml-auto text-sm text-gray-800">
          {pagination.total} Employee{pagination.total !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="bg-gradient-to-r from-cyan-700 to-cyan-800">
                <th className="px-5 py-3 text-left text-xs text-cyan-200 uppercase">Employee</th>
                <th className="px-5 py-3 text-left text-xs text-cyan-200 uppercase">Employee ID</th>
                <th className="px-5 py-3 text-left text-xs text-cyan-200 uppercase">Department</th>
                <th className="px-5 py-3 text-left text-xs text-cyan-200 uppercase">Role</th>
                <th className="px-5 py-3 text-middle text-xs text-cyan-200 uppercase">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <TableSkeleton rows={8} cols={5} />
              ) : users.map((u) => (
                <tr key={u.id} className="hover:bg-cyan-50/30">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar firstName={u.first_name} lastName={u.last_name} inactive={!isActive} />
                      <div>
                        <p className="font-semibold text-gray-800">
                          {u.first_name} {u.last_name}
                        </p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-3">{u.employee_number}</td>

                  <td className="px-5 py-3">{u.department?.name}</td>

                  <td className="px-5 py-3">
                    <RoleBadges empRoles={u.roles || []} />
                  </td>

                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setViewUser(u)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 font-bold bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-lg"
                      >
                        <IdCard className="w-3.5 h-3.5" />
                        Details
                      </button>

                      {can("user_edit") && isActive && Number(u.id) !== Number(user?.id) && (
                        <button
                          onClick={() => setAssignModal(u)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 btn-dark text-white disabled:opacity-60 disabled:cursor-not-allowed rounded-lg "  
                        >
                          <UserCog className="w-3.5 h-3.5" />
                          Assign Role
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onChange={goToPage}
        />
      </div>

      {viewUser && (
        <UserDetailModal user={viewUser} onClose={() => setViewUser(null)} />
      )}

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