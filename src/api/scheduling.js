import apiClient from './client';

export const schedulingApi = {
  getDoctorAvailability: async (doctorId, dateStr) => {
    const params = new URLSearchParams({ doctor: doctorId });
    if (dateStr) {
      params.append('date', dateStr);
    }
    return await apiClient.get(`scheduling/availability/?${params.toString()}`);
  },

  getDoctorSchedules: async (doctorId) => {
    const data = await apiClient.get(`scheduling/schedules/?doctor=${doctorId}`);
    return data.results || data;
  },
};

