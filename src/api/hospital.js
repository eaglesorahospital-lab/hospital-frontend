import apiClient from './client';

export const hospitalApi = {
  getHospital: async () => {
    return await apiClient.get('hospital/');
  },

  getFacilities: async () => {
    const data = await apiClient.get('hospital/facilities/');
    return data.results || data;
  },

  getAnnouncements: async () => {
    const data = await apiClient.get('hospital/announcements/');
    return data.results || data;
  },

  getFaqs: async () => {
    const data = await apiClient.get('hospital/faqs/');
    return data.results || data;
  },

  getHealth: async () => {
    return await apiClient.get('health/');
  },
};

