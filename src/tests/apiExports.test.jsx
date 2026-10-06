import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import api, {
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
  setCurrentUser,
} from '../services/api';

describe('API Service Exports & Consistency', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('exports getUserProfile as both a named export and a default export property', () => {
    expect(typeof getUserProfile).toBe('function');
    expect(typeof api.getUserProfile).toBe('function');
    expect(getUserProfile).toBe(api.getUserProfile);
  });

  it('exports all expected API service methods consistently', () => {
    const expectedFunctions = [
      'getHospitalInfo',
      'getFacilities',
      'getAnnouncements',
      'getFAQs',
      'getDepartments',
      'getDepartment',
      'getDoctors',
      'getDoctor',
      'getDoctorAvailability',
      'bookAppointment',
      'getMyAppointments',
      'cancelAppointment',
      'rescheduleAppointment',
      'loginUser',
      'registerPatient',
      'getUserProfile',
      'refreshAccessToken',
      'getAuthToken',
      'getRefreshToken',
      'setAuthTokens',
      'clearAuth',
      'getCurrentUser',
      'setCurrentUser',
    ];

    for (const fnName of expectedFunctions) {
      expect(api[fnName]).toBeDefined();
      expect(typeof api[fnName]).toBe('function');
    }
  });

  it('invokes getUserProfile and issues an authenticated GET request to the profile endpoint', async () => {
    localStorage.setItem('access_token', 'mock-bearer-token');

    const mockProfile = {
      id: 42,
      username: 'jane_doe',
      email: 'jane@example.com',
      role: 'PATIENT',
    };

    const mockFetch = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      headers: {
        get: (h) => (h === 'content-type' ? 'application/json' : null),
      },
      json: async () => mockProfile,
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await getUserProfile();
    expect(result).toEqual(mockProfile);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/profile\/$/),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-bearer-token',
        }),
      })
    );
  });
});
