import apiClient from './client';

export const doctorsApi = {
  getDoctors: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `doctors/?${query}` : 'doctors/';
    const data = await apiClient.get(endpoint);
    return data.results || data;
  },

  getDoctorDetail: async (idOrSlug) => {
    return await apiClient.get(`doctors/${idOrSlug}/`);
  },
};

