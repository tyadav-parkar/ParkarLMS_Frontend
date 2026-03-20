import { useCallback, useEffect, useRef, useState } from 'react';
import { getMyTeam } from '../services/teamService';

const PAGE_SIZE = 5;

export function useTeam() {
  const [members,        setMembers]        = useState([]);
  const [pagination,     setPagination]     = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [search,         setSearchVal]      = useState('');
  const [jobTitleFilter, setJobTitleFilter] = useState('');

  // Keep refs so fetchTeam always reads latest values without stale closure
  const searchRef      = useRef('');
  const jobTitleRef    = useRef('');
  const debounceRef    = useRef(null);

  const fetchTeam = useCallback(async ({ page = 1, search: s, jobTitle: jt } = {}) => {
    // Fall back to latest ref values if not explicitly passed
    const finalSearch   = s  !== undefined ? s  : searchRef.current;
    const finalJobTitle = jt !== undefined ? jt : jobTitleRef.current;

    setLoading(true);
    setError(null);
    try {
      const result = await getMyTeam({
        page,
        limit:    PAGE_SIZE,
        search:   finalSearch,
        jobTitle: finalJobTitle,
      });
      setMembers(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to load team members.');
    } finally {
      setLoading(false);
    }
  }, []); // stable — reads from refs, no deps needed

  // Initial load
  useEffect(() => {
    fetchTeam({ page: 1 });
  }, [fetchTeam]);

  // Debounced search
  const setSearch = (val) => {
    setSearchVal(val);
    searchRef.current = val;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      () => fetchTeam({ page: 1, search: val }),
      400
    );
  };

  // Job title filter — immediate, resets to page 1
  const setJobTitle = (val) => {
    setJobTitleFilter(val);
    jobTitleRef.current = val;
    fetchTeam({ page: 1, jobTitle: val });
  };

  const goToPage = (p) => fetchTeam({ page: p });

  return {
    members,
    pagination,
    loading,
    error,
    search,
    setSearch,
    jobTitleFilter,
    setJobTitle,
    goToPage,
  };
}