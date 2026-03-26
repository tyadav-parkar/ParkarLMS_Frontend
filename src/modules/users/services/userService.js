import api from '@shared/services/api';

export const userService = {
  getUsers: async ({ page = 1, limit = 30, search = '', roleId = '', active = 'true' } = {}) => {
    const params = new URLSearchParams({ page, limit, active });
    if (search.trim()) params.append('search', search.trim());
    if (roleId)        params.append('role_id', roleId);

    const { data } = await api.get(`/users?${params}`);
    return {
      users: data.data ?? [],
      pagination: {
        page:       data.meta?.page  ?? 1,
        totalPages: data.meta?.pages ?? 1,
        total:      data.meta?.total ?? 0,
      },
    };
  },

  assignRole: async (employeeId, roleId) => {
    const { data } = await api.post('/users/assign', { employee_id: employeeId, role_id: roleId });
    return data;
  },
};