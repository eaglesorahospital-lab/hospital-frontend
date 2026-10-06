const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

export function getAuthToken() {
  return localStorage.getItem('access_token');
}

export function getRefreshToken() {
  return localStorage.getItem('refresh_token');
}

export function setAuthTokens(access, refresh) {
  if (access) localStorage.setItem('access_token', access);
  if (refresh) localStorage.setItem('refresh_token', refresh);
}

export function clearAuth() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_info');
  localStorage.removeItem('user');
  window.dispatchEvent(new Event('auth:logout'));
}

export function getCurrentUser() {
  try {
    const user = localStorage.getItem('user_info');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user) {
  if (user) {
    localStorage.setItem('user_info', JSON.stringify(user));
  } else {
    localStorage.removeItem('user_info');
  }
}

export async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) {
    throw new Error('No refresh token available');
  }

  const base = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api').replace(/\/+$/, '');
  const response = await fetch(`${base}/auth/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh })
  });

  if (!response.ok) {
    clearAuth();
    throw new Error('Session expired. Please log in again.');
  }

  const data = await response.json();
  if (data?.access) {
    setAuthTokens(data.access, data.refresh || refresh);
    return data.access;
  }
  throw new Error('Failed to refresh authentication token.');
}

async function request(endpoint, options = {}, isRetry = false) {
  const base = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api').replace(/\/+$/, '');
  const cleanPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${base}${cleanPath}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = getAuthToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 204) {
    return null;
  }

  // Handle 401 Unauthorized: Attempt token refresh if not already an auth route and not already retrying
  const isAuthRoute = cleanPath.includes('/auth/login/') || cleanPath.includes('/auth/refresh/');
  if (response.status === 401 && !isRetry && !isAuthRoute && getRefreshToken()) {
    try {
      const newAccessToken = await refreshAccessToken();
      const retryHeaders = {
        ...headers,
        'Authorization': `Bearer ${newAccessToken}`
      };
      return await request(endpoint, { ...options, headers: retryHeaders }, true);
    } catch (refreshErr) {
      clearAuth();
      const err = new Error(refreshErr.message || 'Authentication credentials were not provided or have expired.');
      err.status = 401;
      throw err;
    }
  }

  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  }

  if (!response.ok) {
    const errorMsg = data?.error || data?.detail || data?.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

// 1. Hospital CMS info
export async function getHospitalInfo() {
  try {
    const res = await request('/hospital/');
    if (Array.isArray(res)) return res[0] || null;
    if (res?.results && Array.isArray(res.results)) return res.results[0] || null;
    return res;
  } catch (error) {
    console.warn('Could not fetch hospital info:', error.message);
    return {
      name: 'Metropolitan General Hospital',
      tagline: 'Center for Advanced Medicine & Compassionate Care',
      phone: '+1 (800) 425-9999',
      emergency_phone: '+1 (800) 911-0000',
      email: 'care@metrohealth.org',
      address: '742 Healthcare Boulevard, Medical District, Suite 100',
      visiting_hours: 'Daily: 10:00 AM - 12:00 PM & 04:00 PM - 07:00 PM'
    };
  }
}

// 2. Departments
export async function getDepartments() {
  const res = await request('/departments/');
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.results)) return res.results;
  return [];
}

export async function getDepartment(idOrSlug) {
  return await request(`/departments/${idOrSlug}/`);
}

// 3. Doctors
export async function getDoctors(params = {}) {
  const query = new URLSearchParams();
  if (params.department) query.append('department', params.department);
  if (params.search) query.append('search', params.search);
  const qStr = query.toString() ? `?${query.toString()}` : '';
  const res = await request(`/doctors/${qStr}`);
  return Array.isArray(res) ? res : (res?.results || []);
}

export async function getDoctor(idOrSlug) {
  return await request(`/doctors/${idOrSlug}/`);
}

// 4. Scheduling & Availability
export async function getDoctorAvailability(doctorId, date) {
  const query = new URLSearchParams();
  if (doctorId) {
    query.append('doctor', doctorId);
    query.append('doctor_id', doctorId);
  }
  if (date) query.append('date', date);
  const res = await request(`/scheduling/availability/?${query.toString()}`);
  return Array.isArray(res) ? res : (res?.results || res?.slots || []);
}

// 5. Appointments
export async function bookAppointment(appointmentData) {
  return await request('/appointments/book/', {
    method: 'POST',
    body: JSON.stringify(appointmentData)
  });
}

export async function getMyAppointments() {
  const res = await request('/appointments/');
  return Array.isArray(res) ? res : (res?.results || []);
}

export async function cancelAppointment(appointmentId, reason) {
  return await request(`/appointments/${appointmentId}/cancel/`, {
    method: 'POST',
    body: JSON.stringify({ reason: reason || 'Patient requested cancellation' })
  });
}

export async function rescheduleAppointment(appointmentId, newSlotId, reason) {
  return await request(`/appointments/${appointmentId}/reschedule/`, {
    method: 'POST',
    body: JSON.stringify({
      new_slot_id: newSlotId,
      reason: reason || 'Patient requested reschedule'
    })
  });
}

// 6. Authentication
export async function loginUser(username, password) {
  const data = await request('/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
  if (data?.access) {
    setAuthTokens(data.access, data.refresh);
    if (data.user) {
      setCurrentUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    window.dispatchEvent(new Event('auth:login'));
  }
  return data;
}

export async function registerPatient(patientData) {
  return await request('/auth/register/', {
    method: 'POST',
    body: JSON.stringify(patientData)
  });
}

export async function getUserProfile() {
  return await request('/profile/');
}

// 7. Hospital CMS Facilities, Announcements, FAQs
export async function getFacilities() {
  try {
    const res = await request('/hospital/facilities/');
    return Array.isArray(res) ? res : (res?.results || []);
  } catch {
    return [];
  }
}

export async function getAnnouncements() {
  try {
    const res = await request('/hospital/announcements/');
    return Array.isArray(res) ? res : (res?.results || []);
  } catch {
    return [];
  }
}

export async function getFAQs() {
  try {
    const res = await request('/hospital/faqs/');
    return Array.isArray(res) ? res : (res?.results || []);
  } catch {
    return [];
  }
}

export default {
  getHospitalInfo,
  getFacilities,
  getAnnouncements,
  getFAQs,
  getDepartments,
  getDepartment,
  getDoctors,
  getDoctor,
  getDoctorAvailability,
  bookAppointment,
  getMyAppointments,
  cancelAppointment,
  rescheduleAppointment,
  loginUser,
  registerPatient,
  getUserProfile,
  refreshAccessToken,
  getAuthToken,
  getRefreshToken,
  setAuthTokens,
  clearAuth,
  getCurrentUser,
  setCurrentUser
};

