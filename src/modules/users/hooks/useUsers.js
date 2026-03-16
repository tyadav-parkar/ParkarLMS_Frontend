import { useCallback, useEffect, useRef, useState } from 'react';
import { roleService } from '@roles/services/roleService';
import { userService } from '../services/userService';

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearchValue] = useState('');
  const [roleFilter, setRoleFilterValue] = useState('');
  const debounceRef = useRef(null);

  const fetchUsers = useCallback(async ({ page = 1, searchVal = '', roleVal = '' } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await userService.getUsers({ page, search: searchVal, roleId: roleVal });
      setUsers(result.users);
      setPagination(result.pagination);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    roleService.getAllUnpaginated().then(setRoles).catch(() => {});
    fetchUsers({ page: 1, searchVal: '', roleVal: '' });
  }, [fetchUsers]);

  const setSearch = (val) => {
    setSearchValue(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchUsers({ page: 1, searchVal: val, roleVal: roleFilter });
    }, 400);
  };

  const setRoleFilter = (val) => {
    setRoleFilterValue(val);
    fetchUsers({ page: 1, searchVal: search, roleVal: val });
  };

  const goToPage = (page) => {
    fetchUsers({ page, searchVal: search, roleVal: roleFilter });
  };

  const clearFilters = () => {
    setSearchValue('');
    setRoleFilterValue('');
    fetchUsers({ page: 1, searchVal: '', roleVal: '' });
  };

  const assignRole = async (employeeId, roleId) => {
    await roleService.assignToEmployee(employeeId, roleId);
    fetchUsers({ page: pagination.page, searchVal: search, roleVal: roleFilter });
  };

  return {
    users,
    roles,
    pagination,
    loading,
    error,
    search,
    roleFilter,
    setSearch,
    setRoleFilter,
    goToPage,
    clearFilters,
    assignRole,
  };
}
