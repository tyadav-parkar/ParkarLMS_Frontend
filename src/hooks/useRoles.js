import { useCallback, useEffect, useState } from 'react';
import { roleService } from '../services/roleService';

export function useRoles() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const [rolesData, permsData] = await Promise.all([
        roleService.getAll(page),
        roleService.getPermissions(),
      ]);
      // Handle both paginated response { data, pagination } and plain array
      setRoles(rolesData.data ?? rolesData);
      setPagination(
        rolesData.pagination ?? {
          page: 1,
          totalPages: 1,
          total: Array.isArray(rolesData) ? rolesData.length : 0,
        }
      );
      setPermissions(permsData);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to load roles.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(1);
  }, [load]);

  const goToPage = (page) => load(page);

  const create = async (payload) => {
    setSaving(true);
    setFormError('');
    try {
      await roleService.create(payload);
      await load(pagination.page);
      return true;
    } catch (err) {
      setFormError(err.response?.data?.message ?? 'Failed to create role.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const update = async (id, payload) => {
    setSaving(true);
    setFormError('');
    try {
      await roleService.update(id, payload);
      await load(pagination.page);
      return true;
    } catch (err) {
      setFormError(err.response?.data?.message ?? 'Failed to update role.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id, reassignToId) => {
    setSaving(true);
    setFormError('');
    try {
      await roleService.delete(id, reassignToId);
      await load(pagination.page);
      return true;
    } catch (err) {
      setFormError(err.response?.data?.message ?? 'Failed to delete role.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    roles,
    permissions,
    pagination,
    loading,
    error,
    saving,
    formError,
    setFormError,
    create,
    update,
    remove,
    goToPage,
    reload: load,
  };
}