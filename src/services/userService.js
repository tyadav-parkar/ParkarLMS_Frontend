import api from './api';

export const userService = {
  getUsers: async ({ page = 1, limit = 15, search = '', roleId = '' } = {}) => {
    const params = new URLSearchParams({ page, limit });
    if (search.trim()) params.append('search', search.trim());
    if (roleId) params.append('role_id', roleId);

    const { data } = await api.get(`/roles/users?${params}`);
    return {
      users: data.data ?? [],
      pagination: {
        page: data.meta?.page ?? 1,
        totalPages: data.meta?.pages ?? 1,
        total: data.meta?.total ?? 0,
      },
    };
  },
};