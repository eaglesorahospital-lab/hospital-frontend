import apiClient from './client';

export const appointmentsApi = {
  bookAppointment: async (payload) => {
    return await apiClient.post('appointments/', payload);
  },

  getMyAppointments: async () => {
    const data = await apiClient.get('appointments/');
    return data.results || data;
  },

  getAppointmentDetail: async (id) => {
    return await apiClient.get(`appointments/${id}/`);
  },

  cancelAppointment: async (id, cancellationReason) => {
    return await apiClient.post(`appointments/${id}/cancel/`, {
      cancellation_reason: cancellationReason,
    });
  },

  rescheduleAppointment: async (id, newSlotId, rescheduleReason = '') => {
    return await apiClient.post(`appointments/${id}/reschedule/`, {
      new_slot: newSlotId,
      new_slot_id: newSlotId,
      reschedule_reason: rescheduleReason,
    });
  },
};

