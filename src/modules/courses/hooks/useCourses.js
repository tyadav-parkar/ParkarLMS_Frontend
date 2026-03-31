import { useCallback, useEffect, useMemo, useState } from 'react';
import { courseService } from '../services/courseService';

export function useCourses(options = {}) {
  const { skipCatalogFetch = false } = options;

  // ── Catalog ────────────────────────────────────────────────────────────────
  const [courses, setCourses] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // ── Filters ────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [page, setPage] = useState(1);

  // ── Course assignments ─────────────────────────────────────────────────────
  const [assignments, setAssignments] = useState([]);
  const [assignmentsPagination, setAssignmentsPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 10 });
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [assignmentError, setAssignmentError] = useState('');

  // ── Employee assignments ───────────────────────────────────────────────────
  const [employeeAssignments, setEmployeeAssignments] = useState([]);
  const [employeeAssignmentsPagination, setEmployeeAssignmentsPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 10 });
  const [employeeAssignmentsLoading, setEmployeeAssignmentsLoading] = useState(false);
  const [employeeAssignmentsError, setEmployeeAssignmentsError] = useState('');

  // ── My assignments ─────────────────────────────────────────────────────────
  const [myAssignments, setMyAssignments] = useState([]);
  const [myAssignmentsPagination, setMyAssignmentsPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 10 });
  const [myAssignmentsLoading, setMyAssignmentsLoading] = useState(false);
  const [myAssignmentsError, setMyAssignmentsError] = useState('');

  // ── Reference data (admin dropdowns only — non-critical) ───────────────────
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);

  // ── Derived query ──────────────────────────────────────────────────────────
  const query = useMemo(
    () => ({
      page,
      limit: pagination.limit,
      search,
      category: categoryFilter,
      difficulty: difficultyFilter,
      status: statusFilter,
    }),
    [page, pagination.limit, search, categoryFilter, difficultyFilter, statusFilter]
  );

  // ── Fetch courses ──────────────────────────────────────────────────────────
  const fetchCourses = useCallback(
    async (overrides = {}) => {
      setLoading(true);
      setError(null);
      try {
        const merged = { ...query, ...overrides };
        const result = await courseService.getCourses(merged);
        setCourses(result.data);
        setPagination((prev) => ({ ...prev, ...result.pagination }));
        if (overrides.page) setPage(overrides.page);
        return result;
      } catch (err) {
        setError(err.response?.data?.message ?? 'Failed to load courses.');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [query]
  );

  // Debounced re-fetch on filter changes
  useEffect(() => {
    if (skipCatalogFetch) return undefined;
    const timer = setTimeout(() => {
      fetchCourses({ page: 1 }).catch(() => {});
    }, 350);
    return () => clearTimeout(timer);
  }, [search, categoryFilter, difficultyFilter, statusFilter, fetchCourses, skipCatalogFetch]);

  // Initial fetch
  useEffect(() => {
    if (skipCatalogFetch) return;
    fetchCourses({ page: 1 }).catch(() => {});
  }, [skipCatalogFetch]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fetch reference data for admin dropdowns ───────────────────────────────
  // Runs once on mount; silently ignored if endpoints don't exist for this role
  useEffect(() => {
    let cancelled = false;
    async function loadReference() {
      try {
        const [depts, roleList] = await Promise.all([
          courseService.getDepartments(),
          courseService.getRoles(),
        ]);
        if (!cancelled) {
          setDepartments(depts);
          setRoles(roleList);
        }
      } catch {
        // Non-critical — dropdowns just stay empty; text inputs used as fallback
      }
    }
    loadReference();
    return () => { cancelled = true; };
  }, []);

  // ── Pagination ─────────────────────────────────────────────────────────────
  const goToPage = useCallback(
    (nextPage) => {
      fetchCourses({ page: nextPage }).catch(() => {});
    },
    [fetchCourses]
  );

  // ── CRUD ───────────────────────────────────────────────────────────────────
  const create = useCallback(
    async (payload) => {
      setSaving(true);
      setFormError('');
      try {
        const created = await courseService.createCourse(payload);
        await fetchCourses({ page: 1 });
        return created;
      } catch (err) {
        setFormError(err.response?.data?.message ?? 'Failed to create course.');
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [fetchCourses]
  );

  const update = useCallback(
    async (id, payload) => {
      setSaving(true);
      setFormError('');
      try {
        const updated = await courseService.updateCourse(id, payload);
        await fetchCourses({ page });
        return updated;
      } catch (err) {
        setFormError(err.response?.data?.message ?? 'Failed to update course.');
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [fetchCourses, page]
  );

  const archive = useCallback(
    async (id) => {
      setSaving(true);
      setFormError('');
      try {
        const archived = await courseService.archiveCourse(id);
        await fetchCourses({ page });
        return archived;
      } catch (err) {
        setFormError(err.response?.data?.message ?? 'Failed to archive course.');
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [fetchCourses, page]
  );

  // ── Assignments ────────────────────────────────────────────────────────────
  const bulkAssign = useCallback(
    async (courseId, payload) => {
      setSaving(true);
      setFormError('');
      try {
        const result = await courseService.bulkAssignCourse(courseId, payload);
        await fetchCourses({ page });
        return result;
      } catch (err) {
        setFormError(err.response?.data?.message ?? 'Failed to assign course.');
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [fetchCourses, page]
  );

  const cancelAssign = useCallback(
    async (courseId, assignmentId) => {
      setSaving(true);
      setFormError('');
      try {
        const result = await courseService.cancelAssignment(courseId, assignmentId);
        await fetchCourses({ page });
        return result;
      } catch (err) {
        setFormError(err.response?.data?.message ?? 'Failed to cancel assignment.');
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [fetchCourses, page]
  );

  // Original signature preserved — limit defaults to 50 as before
  const getEligibleEmployees = useCallback(async (params = {}) => {
    return courseService.getEligibleEmployees(params);
  }, []);

  const getAllEligibleEmployeeIds = useCallback(async (params = {}) => {
    return courseService.getAllEligibleEmployeeIds(params);
  }, []);


  const getAssignments = useCallback(async (courseId, params = {}) => {
    setAssignmentsLoading(true);
    setAssignmentError('');
    try {
      const result = await courseService.getCourseAssignments(courseId, params);
      setAssignments(result.data);
      setAssignmentsPagination(result.pagination);
      return result;
    } catch (err) {
      setAssignmentError(err.response?.data?.message ?? 'Failed to load assignments.');
      throw err;
    } finally {
      setAssignmentsLoading(false);
    }
  }, []);

  const getEmployeeAssignments = useCallback(async (params = {}) => {
    setEmployeeAssignmentsLoading(true);
    setEmployeeAssignmentsError('');
    try {
      const result = await courseService.getEmployeeAssignments(params);
      setEmployeeAssignments(result.data);
      setEmployeeAssignmentsPagination(result.pagination);
      return result;
    } catch (err) {
      setEmployeeAssignmentsError(
        err.response?.data?.message ?? 'Failed to load employee assignments.'
      );
      throw err;
    } finally {
      setEmployeeAssignmentsLoading(false);
    }
  }, []);

  const getMyAssignments = useCallback(async (params = {}) => {
    setMyAssignmentsLoading(true);
    setMyAssignmentsError('');
    try {
      const result = await courseService.getMyAssignments(params);
      setMyAssignments(result.data);
      setMyAssignmentsPagination(result.pagination);
      return result;
    } catch (err) {
      setMyAssignmentsError(err.response?.data?.message ?? 'Failed to load my courses.');
      throw err;
    } finally {
      setMyAssignmentsLoading(false);
    }
  }, []);

  const getMyAssignmentDetail = useCallback(async (assignmentId) => {
    return courseService.getMyAssignmentDetail(assignmentId);
  }, []);

  const startMyAssignment = useCallback(async (assignmentId) => {
    setSaving(true);
    setFormError('');
    try {
      return await courseService.startMyAssignment(assignmentId);
    } catch (err) {
      setFormError(err.response?.data?.message ?? 'Failed to start course.');
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const completeMyAssignment = useCallback(async (assignmentId) => {
    setSaving(true);
    setFormError('');
    try {
      return await courseService.completeMyAssignment(assignmentId);
    } catch (err) {
      setFormError(err.response?.data?.message ?? 'Failed to complete course.');
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    // Catalog
    courses,
    pagination,
    loading,
    error,
    saving,
    formError,
    setFormError,

    // Filters
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    difficultyFilter,
    setDifficultyFilter,
    statusFilter,
    setStatusFilter,
    goToPage,
    reload: fetchCourses,

    // Reference data (admin dropdowns — empty arrays for manager/employee, safe to spread)
    departments,
    roles,

    // CRUD
    create,
    update,
    archive,

    // Course assignments
    assignments,
    assignmentsPagination,
    assignmentsLoading,
    assignmentError,
    setAssignmentError,
    getAssignments,
    bulkAssign,
    cancelAssign,
    getEligibleEmployees,
    getAllEligibleEmployeeIds,

    // Employee assignments
    employeeAssignments,
    employeeAssignmentsPagination,
    employeeAssignmentsLoading,
    employeeAssignmentsError,
    setEmployeeAssignmentsError,
    getEmployeeAssignments,

    // My assignments
    myAssignments,
    myAssignmentsPagination,
    myAssignmentsLoading,
    myAssignmentsError,
    setMyAssignmentsError,
    getMyAssignments,
    getMyAssignmentDetail,
    startMyAssignment,
    completeMyAssignment,
  };
}