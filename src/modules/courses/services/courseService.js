import api from '@shared/services/api';

function buildParams(paramsObj) {
  const params = new URLSearchParams();

  Object.entries(paramsObj).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    const str = String(value).trim();
    if (!str) return;
    params.append(key, str);
  });

  return params.toString();
}

function toPagination(meta) {
  return {
    page: meta?.page ?? 1,
    totalPages: meta?.pages ?? 1,
    total: meta?.total ?? 0,
    limit: meta?.limit ?? 10,
  };
}

export const courseService = {
  async getCourses({ page = 1, limit = 10, search = '', category = '', difficulty = '', status = 'active' } = {}) {
    const query = buildParams({ page, limit, search, category, difficulty, status });
    const { data } = await api.get(`/courses?${query}`);
    return {
      data: data.data ?? [],
      pagination: toPagination(data.meta),
    };
  },

  async createCourse(payload) {
    const { data } = await api.post('/courses', payload);
    return data.data;
  },

  async updateCourse(id, payload) {
    const { data } = await api.patch(`/courses/${id}`, payload);
    return data.data;
  },

  async archiveCourse(id) {
    const { data } = await api.delete(`/courses/${id}`);
    return data.data;
  },

  async getCourseAssignments(courseId, { page = 1, limit = 10, status = '' } = {}) {
    const query = buildParams({ page, limit, status });
    const { data } = await api.get(`/courses/${courseId}/assignments?${query}`);
    return {
      data: data.data ?? [],
      pagination: toPagination(data.meta),
    };
  },

  async getEmployeeAssignments({ page = 1, limit = 10, status = '', employeeId = '', search = '' } = {}) {
    const query = buildParams({ page, limit, status, employeeId, search });
    const { data } = await api.get(`/courses/employee-assignments?${query}`);
    return {
      data: data.data ?? [],
      pagination: toPagination(data.meta),
    };
  },

  async getMyAssignments({ page = 1, limit = 10, status = '', search = '' } = {}) {
    const query = buildParams({ page, limit, status, search });
    const { data } = await api.get(`/courses/my-assignments?${query}`);
    return {
      data: data.data ?? [],
      pagination: toPagination(data.meta),
    };
  },

  async getMyAssignmentDetail(assignmentId) {
    const { data } = await api.get(`/courses/my-assignments/${assignmentId}`);
    return data.data;
  },

  async startMyAssignment(assignmentId) {
    const { data } = await api.patch(`/courses/my-assignments/${assignmentId}/start`);
    return data.data;
  },

  async completeMyAssignment(assignmentId) {
    const { data } = await api.patch(`/courses/my-assignments/${assignmentId}/complete`);
    return data.data;
  },

  async bulkAssignCourse(courseId, payload) {
    const { data } = await api.post(`/courses/${courseId}/assign`, payload);
    return {
      data: data.data ?? [],
      meta: data.meta ?? {},
    };
  },

  async cancelAssignment(courseId, assignmentId) {
    const { data } = await api.patch(`/courses/${courseId}/assignments/${assignmentId}/cancel`);
    return data.data;
  },

  async getEligibleEmployees({ page = 1, limit = 10, search = '', role = '', department = '', jobTitle = '', courseId = '' } = {}) {
    const query = buildParams({ page, limit, search, role, department, jobTitle, course_id: courseId });
    const { data } = await api.get(`/courses/eligible-employees?${query}`);
    return {
      data: data.data ?? [],
      pagination: toPagination(data.meta),
    };
  },
};
