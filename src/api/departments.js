import apiClient from './client';

export const departmentsApi = {
  getDepartments: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `departments/?${query}` : 'departments/';
    const data = await apiClient.get(endpoint);
    return data.results || data;
  },

  getDepartmentDetail: async (idOrSlug) => {
    return await apiClient.get(`departments/${idOrSlug}/`);
  },
};

