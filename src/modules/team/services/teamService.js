import api from '@shared/services/api';

/**
 * Fetches the current manager's direct reports.
 *
 * @param {object} params
 * @param {number} params.page
 * @param {number} params.limit
 * @param {string} params.search
 */
export const getMyTeam = async ({ page = 1, limit = 3, search = '' } = {}) => {
  const params = new URLSearchParams({ page, limit });
  if (search.trim()) params.append('search', search.trim());

  const { data } = await api.get(`/team?${params}`);
  return {
    data:       data.data  ?? [],
    pagination: {
      page:       data.meta?.page   ?? 1,
      totalPages: data.meta?.pages  ?? 1,
      total:      data.meta?.total  ?? 0,
    },
  };
};
