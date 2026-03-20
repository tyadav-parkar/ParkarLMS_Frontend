import api from '@shared/services/api';
 
export const roleService = {
  getAll: async (page = 1, limit = 6) => {
    const { data } = await api.get(`/roles?page=${page}&limit=${limit}`);
    if (data.meta) {
      return {
        data: data.data ?? [],
        pagination: {
          page:       data.meta.page,
          totalPages: data.meta.pages,
          total:      data.meta.total,
        },
      };
    }
    return data.data ?? data;
  },
 
  // Fetches ALL roles unpaginated — used for dropdowns
  getAllUnpaginated: async () => {
    const { data } = await api.get('/roles?page=1&limit=100');
    return data.data ?? [];
  },
 
  getPermissions: async () => {
    const { data } = await api.get('/roles/permissions');
    return data.data ?? [];
  },
 
  create: async (payload) => {
    const { data } = await api.post('/roles', payload);
    return data;
  },
 
  update: async (id, payload) => {
    const { data } = await api.put(`/roles/${id}`, payload);
    return data;
  },
 
  delete: async (id, reassignToId) => {
    const { data } = await api.delete(`/roles/${id}`, {
      data: { reassign_to_id: reassignToId },
    });
    return data;
  },
};
 
 