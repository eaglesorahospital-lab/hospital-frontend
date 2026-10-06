import apiClient from './client';

export const authApi = {
  login: async (username, password) => {
    const data = await apiClient.post('auth/login/', { username, password });
    if (data.access) {
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  register: async (patientData) => {
    return await apiClient.post('auth/register/', patientData);
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    try {
      if (refreshToken) {
        await apiClient.post('auth/logout/', { refresh: refreshToken });
      }
    } catch {
      // Ignore blacklist error if token is already expired
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth:logout'));
    }
  },

  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  getUserProfile: async () => {
    return await apiClient.get('auth/me/');
  },

  isAuthenticated: () => {
    return Boolean(localStorage.getItem('access_token'));
  },
};

