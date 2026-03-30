import { useCallback, useEffect, useRef, useState } from 'react';
import { getMyTeam, getIndirectReports } from '../services/teamService';

const PAGE_SIZE = 30;

export function useTeam() {
  const [viewMode, setViewModeState] = useState('direct');

  const [members, setMembers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [indirectMembers, setIndirectMembers] = useState([]);
  const [indirectPagination, setIndirectPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [indirectLoading, setIndirectLoading] = useState(false);
  const [indirectError, setIndirectError] = useState(null);

  const [directSearch, setDirectSearchVal] = useState('');
  const [directJobTitle, setDirectJobTitle] = useState('');
  const [indSearch, setIndSearchVal] = useState('');
  const [indJobTitle, setIndJobTitle] = useState('');

  const directSearchRef = useRef('');
  const directJobTitleRef = useRef('');
  const indSearchRef = useRef('');
  const indJobTitleRef = useRef('');
  const debounceRef = useRef(null);

  const fetchDirect = useCallback(async ({ page = 1, search: s, jobTitle: jt } = {}) => {
    const finalSearch = s !== undefined ? s : directSearchRef.current;
    const finalJobTitle = jt !== undefined ? jt : directJobTitleRef.current;

    setLoading(true);
    setError(null);
    try {
      const result = await getMyTeam({ page, limit: PAGE_SIZE, search: finalSearch, jobTitle: finalJobTitle });
      setMembers(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to load team members.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchIndirect = useCallback(async ({ page = 1, search: s, jobTitle: jt } = {}) => {
    const finalSearch = s !== undefined ? s : indSearchRef.current;
    const finalJobTitle = jt !== undefined ? jt : indJobTitleRef.current;

    setIndirectLoading(true);
    setIndirectError(null);
    try {
      const result = await getIndirectReports({ page, limit: PAGE_SIZE, search: finalSearch, jobTitle: finalJobTitle });
      setIndirectMembers(result.data);
      setIndirectPagination(result.pagination);
    } catch (err) {
      setIndirectError(err.response?.data?.message ?? 'Failed to load indirect reports.');
    } finally {
      setIndirectLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDirect({ page: 1 });
  }, [fetchDirect]);

  const indirectFetchedRef = useRef(false);
  const setViewMode = (mode) => {
    setViewModeState(mode);
    if (mode === 'indirect' && !indirectFetchedRef.current) {
      indirectFetchedRef.current = true;
      fetchIndirect({ page: 1 });
    }
  };

  const setSearch = (val) => {
    setDirectSearchVal(val);
    directSearchRef.current = val;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchDirect({ page: 1, search: val }), 400);
  };

  const setJobTitle = (val) => {
    setDirectJobTitle(val);
    directJobTitleRef.current = val;
    fetchDirect({ page: 1, jobTitle: val });
  };

  const setIndSearch = (val) => {
    setIndSearchVal(val);
    indSearchRef.current = val;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchIndirect({ page: 1, search: val }), 400);
  };

  const setIndJobTitleFilter = (val) => {
    setIndJobTitle(val);
    indJobTitleRef.current = val;
    fetchIndirect({ page: 1, jobTitle: val });
  };

  const goToPage = (p) => fetchDirect({ page: p });
  const goToIndirectPage = (p) => fetchIndirect({ page: p });

  return {
    viewMode,
    setViewMode,

    members,
    pagination,
    loading,
    error,
    search: directSearch,
    setSearch,
    jobTitleFilter: directJobTitle,
    setJobTitle,
    goToPage,

    indirectMembers,
    indirectPagination,
    indirectLoading,
    indirectError,
    indSearch,
    setIndSearch,
    indJobTitle,
    setIndJobTitle: setIndJobTitleFilter,
    goToIndirectPage,
  };
}