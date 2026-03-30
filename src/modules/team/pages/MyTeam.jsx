import { useEffect, useState } from 'react';
import { Users, GitBranch, IdCard } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { Pagination, TableSkeleton } from '@shared';
import { useAuth } from '@auth';
import { useTeam } from '../hooks/useTeam';
import MemberDetailModal from '../components/MemberDetailModal';
import { getTeamJobTitles, getIndirectJobTitles } from '../services/teamService';

function Avatar({ firstName, lastName }) {
  const initials = `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();
  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
      {initials}
    </div>
  );
}

export default function TeamPage() {
  const { isRole } = useAuth();
  if (!isRole('manager')) {
    return <Navigate to={isRole('admin') ? '/admin/analytics' : '/employee/dashboard'} replace />;
  }
  return <TeamPageContent />;
}

function TeamPageContent() {
  const {
    viewMode,
    setViewMode,
    members,
    pagination,
    loading,
    error,
    search,
    setSearch,
    jobTitleFilter,
    setJobTitle,
    goToPage,
    indirectMembers,
    indirectPagination,
    indirectLoading,
    indirectError,
    indSearch,
    setIndSearch,
    indJobTitle,
    setIndJobTitle,
    goToIndirectPage,
  } = useTeam();

  const [viewMember, setViewMember] = useState(null);
  const [directJobTitles, setDirectJobTitles] = useState([]);
  const [indirectJobTitles, setIndirectJobTitles] = useState([]);

  useEffect(() => {
    getTeamJobTitles().then(setDirectJobTitles).catch(() => setDirectJobTitles([]));
    getIndirectJobTitles().then(setIndirectJobTitles).catch(() => setIndirectJobTitles([]));
  }, []);

  const isDirect = viewMode === 'direct';
  const isIndirect = viewMode === 'indirect';

  const activeMembers = isDirect ? members : indirectMembers;
  const activePagination = isDirect ? pagination : indirectPagination;
  const activeLoading = isDirect ? loading : indirectLoading;
  const activeError = isDirect ? error : indirectError;
  const activeSearch = isDirect ? search : indSearch;
  const activeSetSearch = isDirect ? setSearch : setIndSearch;
  const activeJobTitles = isDirect ? directJobTitles : indirectJobTitles;
  const activeJobTitle = isDirect ? jobTitleFilter : indJobTitle;
  const activeSetJob = isDirect ? setJobTitle : setIndJobTitle;
  const activeGoToPage = isDirect ? goToPage : goToIndirectPage;

  function clearFilters() {
    activeSetSearch('');
    activeSetJob('');
  }

  const hasFilters = activeSearch || activeJobTitle;

  const isUnauthorized = activeError?.includes('401')
    || activeError?.includes('403')
    || activeError?.includes('Insufficient role')
    || activeError?.includes('Access denied')
    || activeError?.includes('Authentication required')
    || activeError?.includes('Session revoked')
    || activeError?.includes('unauthorized')
    || activeError?.includes('Unauthorized');

  const headerCount = activeLoading ? '-' : (activePagination.total ?? 0);

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-700 to-cyan-800 px-7 py-6 shadow-lg shadow-cyan-900/20">
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full border border-cyan-600/30 pointer-events-none" />
        <div className="absolute -right-2 -top-2 w-24 h-24 rounded-full border border-cyan-500/20 pointer-events-none" />
        <div className="absolute right-16 -bottom-10 w-32 h-32 rounded-full border border-cyan-600/20 pointer-events-none" />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-cyan-600/40 flex items-center justify-center">
                <Users className="w-4 h-4 text-cyan-300" />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">My Team</h1>
            </div>
            <p className="text-cyan-300/70 text-sm ml-11">
              View your direct and indirect reports.
            </p>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-0.5">
            <span className="text-3xl font-bold text-white tabular-nums leading-none">
              {headerCount}
            </span>
            <span className="text-xs text-cyan-400 font-medium uppercase tracking-widest">
              {isDirect ? 'Direct' : 'Indirect'}
            </span>
          </div>
        </div>
      </div>

      {isUnauthorized ? <Navigate to="/unauthorized" replace /> : (
        <>
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setViewMode('direct')}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                isDirect
                  ? 'border-cyan-700 text-cyan-800'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <Users className="w-4 h-4" />
              Direct Reports
            </button>
            <button
              onClick={() => setViewMode('indirect')}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                isIndirect
                  ? 'border-cyan-700 text-cyan-800'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <GitBranch className="w-4 h-4" />
              Indirect Reports
            </button>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <input
              type="text"
              placeholder="Search name, email, title..."
              value={activeSearch}
              onChange={(e) => activeSetSearch(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-72
                focus:outline-none focus:ring-2 focus:ring-cyan-700 focus:border-cyan-700"
            />
            <select
              value={activeJobTitle}
              onChange={(e) => activeSetJob(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-cyan-700 focus:border-cyan-700"
            >
              <option value="">All Job Titles</option>
              {activeJobTitles.map((title) => (
                <option key={title} value={title}>{title}</option>
              ))}
            </select>
            {hasFilters && (
              <button onClick={clearFilters} className="text-sm text-gray-400 hover:text-cyan-700 underline">
                Clear filters
              </button>
            )}
            <span className="ml-auto text-sm text-gray-600 font-medium">
              {activeLoading ? '...' : activePagination.total ?? 0}{' '}
              {isDirect ? 'Direct' : 'Indirect'}{' '}
              Report{activePagination.total !== 1 ? 's' : ''}
            </span>
          </div>

          {activeError && !isUnauthorized && (
            <p className="text-red-500 text-sm">{activeError}</p>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="bg-gradient-to-r from-cyan-700 to-cyan-800">
                    <th className="px-5 py-3 text-left text-xs text-cyan-200 uppercase tracking-wide font-semibold">Employee</th>
                    <th className="px-5 py-3 text-left text-xs text-cyan-200 uppercase tracking-wide font-semibold">Department</th>
                    <th className="px-5 py-3 text-left text-xs text-cyan-200 uppercase tracking-wide font-semibold">Job Title</th>
                    <th className="px-5 py-3 text-left text-xs text-cyan-200 uppercase tracking-wide font-semibold">Band / Level</th>
                    {isIndirect && (
                      <th className="px-5 py-3 text-left text-xs text-cyan-200 uppercase tracking-wide font-semibold">Reports To</th>
                    )}
                    <th className="px-5 py-3 text-right text-xs text-cyan-200 uppercase tracking-wide font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activeLoading && <TableSkeleton rows={6} cols={isIndirect ? 6 : 5} />}

                  {!activeLoading && activeMembers.length === 0 && (
                    <tr>
                      <td colSpan={isIndirect ? 6 : 5} className="px-5 py-10 text-center text-gray-400 text-sm">
                        {hasFilters ? (
                          <>
                            No members match the selected filters.{' '}
                            <button onClick={clearFilters} className="text-cyan-700 hover:underline">Clear filters</button>
                          </>
                        ) : (
                          isDirect ? 'No direct reports found.' : 'No indirect reports found.'
                        )}
                      </td>
                    </tr>
                  )}

                  {!activeLoading && activeMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-cyan-50/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar firstName={member.first_name} lastName={member.last_name} />
                          <div>
                            <p className="font-semibold text-gray-800">{member.first_name} {member.last_name}</p>
                            <p className="text-xs text-gray-400">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">{member.department?.name ?? '-'}</td>
                      <td className="px-5 py-3.5 text-gray-600">{member.job_title ?? '-'}</td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-gray-100 text-gray-600">
                          {member.band_identifier ?? '-'}
                        </span>
                      </td>
                      {isIndirect && (
                        <td className="px-5 py-3.5 text-gray-600 text-sm">
                          {member.manager ? `${member.manager.first_name} ${member.manager.last_name}` : '-'}
                        </td>
                      )}
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => setViewMember(member)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100
                            hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-semibold transition-colors"
                        >
                          <IdCard className="w-3.5 h-3.5" />
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={activePagination.page}
              totalPages={activePagination.totalPages}
              onChange={activeGoToPage}
            />
          </div>
        </>
      )}

      {viewMember && (
        <MemberDetailModal
          member={viewMember}
          isIndirect={isIndirect}
          onClose={() => setViewMember(null)}
        />
      )}
    </div>
  );
}
