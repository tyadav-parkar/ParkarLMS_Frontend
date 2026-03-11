import Pagination        from '../../components/ui/Pagination';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { useTeam }       from '../../hooks/useTeams';

function Avatar({ firstName, lastName }) {
  const initials = `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
      {initials}
    </div>
  );
}

export default function TeamPage() {
  const { members, pagination, loading, error, search, setSearch, goToPage } = useTeam();

  return (
    <div>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Team</h1>
          <p className="text-sm text-gray-500 mt-0.5">View and manage your direct reports.</p>
        </div>

        {/* Search */}
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search name, email, title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-8 py-2 text-sm border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {/* ── Table card ── */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-5 py-3 text-left font-semibold text-gray-600">Employee</th>
              <th className="px-5 py-3 text-left font-semibold text-gray-600">Department</th>
              <th className="px-5 py-3 text-left font-semibold text-gray-600">Job Title</th>
              <th className="px-5 py-3 text-left font-semibold text-gray-600">Band</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {loading && <TableSkeleton rows={6} cols={4} />}

            {!loading && members.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-gray-400">
                  {search
                    ? <>No members match "{search}". <button onClick={() => setSearch('')} className="text-blue-600 hover:underline">Clear search</button></>
                    : 'No team members found.'
                  }
                </td>
              </tr>
            )}

            {!loading && members.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50 transition-colors">

                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar firstName={member.first_name} lastName={member.last_name} />
                    <div>
                      <div className="font-medium text-gray-800">
                        {member.first_name} {member.last_name}
                      </div>
                      <div className="text-xs text-gray-500">{member.email}</div>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4 text-gray-600">
                  {member.department?.name ?? '—'}
                </td>

                <td className="px-5 py-4 text-gray-600">
                  {member.job_title ?? '—'}
                </td>

                <td className="px-5 py-4">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">
                    {member.band_identifier ?? '—'}
                  </span>
                </td>

              </tr>
            ))}
          </tbody>
        </table>

        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          label="members"
          onChange={goToPage}
        />
      </div>
    </div>
  );
}