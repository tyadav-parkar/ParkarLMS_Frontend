import api from '@shared/services/api';

export const getCareerPath = async (idealRoleId) => {
  const { data } = await api.get(`/career-path?ideal_role_id=${idealRoleId}`);
  return data.data;
};

export const getMyCareerProgress = async (idealRoleId) => {
  const { data } = await api.get(`/career-path/my-progress?ideal_role_id=${idealRoleId}`);
  return data.data;
};

export const promoteEmployeeStep = async (employeeId, careerPathId) => {
  const { data } = await api.patch(`/career-path/employee/${employeeId}/step`, {
    career_path_id: careerPathId,
  });
  return data.data;
};
