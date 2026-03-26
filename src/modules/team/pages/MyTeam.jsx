
import { useState, useEffect } from 'react';
import { Pagination, TableSkeleton } from '@shared';
import { useTeam } from '../hooks/useTeam';
import MemberDetailModal from '../components/MemberDetailModal';
import { getTeamJobTitles } from '../services/teamService';
import { IdCard } from 'lucide-react';

function Avatar({ firstName, lastName }) {
  const initials = `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
      {initials}
    </div>
  );
}

export default function TeamPage() {
  const {
    members,
    pagination,
    loading,
    error,
    search,
    setSearch,
    jobTitleFilter,
    setJobTitle,
    goToPage,
  } = useTeam();

  const [viewMember, setViewMember] = useState(null);
  const [jobTitles,  setJobTitles]  = useState([]);

  // Fetch all distinct job titles once on mount
  useEffect(() => {
    getTeamJobTitles()
      .then(setJobTitles)
      .catch(() => setJobTitles([]));
  }, []);

  function clearFilters() {
    setSearch('');
    setJobTitle('');
  }

  return (
    <div>

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Team</h1>
        <p className="text-sm text-gray-500 mt-0.5">View and manage your direct reports.</p>
      </div>

      {/* ── Filters row ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search name, email, title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={jobTitleFilter}
          onChange={(e) => setJobTitle(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Job Titles</option>
          {jobTitles.map((title) => (
            <option key={title} value={title}>{title}</option>
          ))}
        </select>

        {(search || jobTitleFilter) && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {/* ── Table ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Employee</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Department</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Job Title</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Band/Level</th>
              <th className="px-5 py-3 text-middle text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {loading && <TableSkeleton rows={6} cols={5} />}

            {!loading && members.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                  {search || jobTitleFilter ? (
                    <>
                      No members match the selected filters.{' '}
                      <button onClick={clearFilters} className="text-blue-600 hover:underline">
                        Clear filters
                      </button>
                    </>
                  ) : (
                    'No team members found.'
                  )}
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
                <td className="px-5 py-4 text-gray-600">{member.department?.name ?? '—'}</td>
                <td className="px-5 py-4 text-gray-600">{member.job_title ?? '—'}</td>
                <td className="px-5 py-4">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">
                    {member.band_identifier ?? '—'}
                  </span>
                </td>
                <td className="px-5 py-4 text-center">
                  <button
      onClick={() => setViewMember(member)}
      title="View Details"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-800 rounded-lg transition-colors text-xs font-semibold"
    >
      <IdCard className="w-3.5 h-3.5" />
      Details
    </button>
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

      {viewMember && (
        <MemberDetailModal
          member={viewMember}
          onClose={() => setViewMember(null)}
        />
      )}
    </div>
  );
}