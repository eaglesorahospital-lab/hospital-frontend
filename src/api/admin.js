import apiClient from './client';

export const adminApi = {
  // Operational Dashboard Stats
  getStats: async () => {
    return await apiClient.get('appointments/stats/');
  },

  // Audit Logs
  getAuditLogs: async (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.append('search', params.search);
    if (params.action) searchParams.append('action', params.action);
    if (params.entity) searchParams.append('entity', params.entity);
    if (params.status) searchParams.append('status', params.status);
    if (params.page) searchParams.append('page', params.page);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    const res = await apiClient.get(`audit/${query}`);
    return res.results || res;
  },

  getAuditLogDetail: async (id) => {
    return await apiClient.get(`audit/${id}/`);
  },

  // Doctors Management
  getDoctors: async (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.append('search', params.search);
    if (params.department) searchParams.append('department', params.department);
    if (params.ordering) searchParams.append('ordering', params.ordering);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    const res = await apiClient.get(`doctors/${query}`);
    return res.results || res;
  },

  createDoctor: async (data) => {
    return await apiClient.post('doctors/', data);
  },

  updateDoctor: async (id, data) => {
    return await apiClient.patch(`doctors/${id}/`, data);
  },

  toggleDoctorStatus: async (id) => {
    return await apiClient.post(`doctors/${id}/toggle_status/`, {});
  },

  deleteDoctor: async (id) => {
    return await apiClient.delete(`doctors/${id}/`);
  },

  // Departments Management
  getDepartments: async (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.append('search', params.search);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    const res = await apiClient.get(`departments/${query}`);
    return res.results || res;
  },

  createDepartment: async (data) => {
    return await apiClient.post('departments/', data);
  },

  updateDepartment: async (id, data) => {
    return await apiClient.patch(`departments/${id}/`, data);
  },

  toggleDepartmentStatus: async (id) => {
    return await apiClient.post(`departments/${id}/toggle_status/`, {});
  },

  deleteDepartment: async (id) => {
    return await apiClient.delete(`departments/${id}/`);
  },

  // Schedules Management
  getSchedules: async (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.doctor) searchParams.append('doctor', params.doctor);
    if (params.day_of_week !== undefined) searchParams.append('day_of_week', params.day_of_week);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    const res = await apiClient.get(`scheduling/schedules/${query}`);
    return res.results || res;
  },

  createSchedule: async (data) => {
    return await apiClient.post('scheduling/schedules/', data);
  },

  updateSchedule: async (id, data) => {
    return await apiClient.patch(`scheduling/schedules/${id}/`, data);
  },

  deleteSchedule: async (id) => {
    return await apiClient.delete(`scheduling/schedules/${id}/`);
  },

  // Schedule Breaks
  getBreaks: async (scheduleId) => {
    const query = scheduleId ? `?schedule=${scheduleId}` : '';
    const res = await apiClient.get(`scheduling/breaks/${query}`);
    return res.results || res;
  },

  createBreak: async (data) => {
    return await apiClient.post('scheduling/breaks/', data);
  },

  deleteBreak: async (id) => {
    return await apiClient.delete(`scheduling/breaks/${id}/`);
  },

  // Leaves
  getLeaves: async (doctorId) => {
    const query = doctorId ? `?doctor=${doctorId}` : '';
    const res = await apiClient.get(`scheduling/leaves/${query}`);
    return res.results || res;
  },

  createLeave: async (data) => {
    return await apiClient.post('scheduling/leaves/', data);
  },

  deleteLeave: async (id) => {
    return await apiClient.delete(`scheduling/leaves/${id}/`);
  },

  // Schedule Overrides
  getOverrides: async (doctorId) => {
    const query = doctorId ? `?doctor=${doctorId}` : '';
    const res = await apiClient.get(`scheduling/overrides/${query}`);
    return res.results || res;
  },

  createOverride: async (data) => {
    return await apiClient.post('scheduling/overrides/', data);
  },

  deleteOverride: async (id) => {
    return await apiClient.delete(`scheduling/overrides/${id}/`);
  },

  // Appointments Admin
  getAppointments: async (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.append('search', params.search);
    if (params.status) searchParams.append('status', params.status);
    if (params.doctor) searchParams.append('doctor', params.doctor);
    if (params.department) searchParams.append('department', params.department);
    if (params.date) searchParams.append('date', params.date);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    const res = await apiClient.get(`appointments/${query}`);
    return res.results || res;
  },

  transitionAppointment: async (id, status) => {
    return await apiClient.post(`appointments/${id}/transition/`, { status });
  },

  // Users Admin
  getUsers: async (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.append('search', params.search);
    if (params.role) searchParams.append('role', params.role);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    const res = await apiClient.get(`users/${query}`);
    return res.results || res;
  },

  updateUser: async (id, data) => {
    return await apiClient.patch(`users/${id}/`, data);
  },

  // Notifications Queue
  getNotifications: async (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.append('search', params.search);
    if (params.status) searchParams.append('status', params.status);
    if (params.notification_type) searchParams.append('notification_type', params.notification_type);
    if (params.channel) searchParams.append('channel', params.channel);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    const res = await apiClient.get(`notifications/${query}`);
    return res.results || res;
  },
};

