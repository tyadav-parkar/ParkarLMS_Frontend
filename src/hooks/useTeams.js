import { useCallback, useEffect, useRef, useState } from 'react';
import { getMyTeam } from '../services/teamService';

const PAGE_SIZE = 3;

export function useTeam() {
  const [members,    setMembers]    = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [search,     setSearchVal]  = useState('');

  const debounceRef = useRef(null);

  const fetchTeam = useCallback(
    async ({ page = 1, search: s = search } = {}) => {
      setLoading(true);
      setError(null);
      try {
        const result = await getMyTeam({ page, limit: PAGE_SIZE, search: s });
        setMembers(result.data);
        setPagination(result.pagination);
      } catch (err) {
        setError(err.response?.data?.message ?? 'Failed to load team members.');
      } finally {
        setLoading(false);
      }
    },
    [search]
  );

  useEffect(() => {
    fetchTeam({ page: 1 });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setSearch = (val) => {
    setSearchVal(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      () => fetchTeam({ page: 1, search: val }),
      400
    );
  };

  const goToPage = (p) => fetchTeam({ page: p });

  return {
    members,
    pagination,
    loading,
    error,
    search,
    setSearch,
    goToPage,
  };
}