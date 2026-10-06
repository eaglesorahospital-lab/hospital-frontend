import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import MyAppointments from '../pages/MyAppointments';
import { AuthProvider } from '../context/AuthContext';
import { getMyAppointments, cancelAppointment, rescheduleAppointment } from '../services/api';

vi.mock('../services/api', () => ({
  getMyAppointments: vi.fn(),
  cancelAppointment: vi.fn(),
  rescheduleAppointment: vi.fn(),
  getDoctorAvailability: vi.fn(),
  getCurrentUser: vi.fn(() => ({ id: 1, username: 'patient_jane', role: 'PATIENT' })),
  getAuthToken: vi.fn(() => 'mock-token'),
  clearAuth: vi.fn(),
}));

const mockAppointments = [
  {
    id: 1,
    reference: 'APPT-20261015-8831',
    doctor: { id: 1, name: 'Dr. Sarah Jenkins' },
    doctor_name_snapshot: 'Dr. Sarah Jenkins',
    department_name_snapshot: 'Cardiology',
    scheduled_date: '2026-10-15',
    start_time: '10:00:00',
    end_time: '10:30:00',
    status: 'CONFIRMED',
    reason: 'Follow-up ECG consultation',
  },
];

describe('My Appointments Listing & Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('access_token', 'mock-token');
    localStorage.setItem('user', JSON.stringify({ id: 1, username: 'patient_jane', role: 'PATIENT' }));
    getMyAppointments.mockResolvedValue(mockAppointments);
  });

  it('renders patient appointment card with reference code and status badge', async () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <MyAppointments />
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('APPT-20261015-8831')).toBeInTheDocument();
      expect(screen.getByText('Dr. Sarah Jenkins')).toBeInTheDocument();
    });

    expect(screen.getByText(/Confirmed/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^cancel$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^reschedule$/i })).toBeInTheDocument();
  });

  it('opens cancellation confirmation modal when clicking cancel button', async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <MemoryRouter>
          <MyAppointments />
        </MemoryRouter>
      </AuthProvider>
    );

    const cancelBtn = await screen.findByRole('button', { name: /^cancel$/i });
    await user.click(cancelBtn);

    expect(
      screen.getByRole('heading', { name: /confirm appointment cancellation/i })
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e\.g\. schedule conflict/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirm cancellation/i })).toBeInTheDocument();
  });

  it('renders empty state when patient has no booked appointments', async () => {
    getMyAppointments.mockResolvedValue([]);

    render(
      <AuthProvider>
        <MemoryRouter>
          <MyAppointments />
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('No appointments registered')).toBeInTheDocument();
    });

    expect(
      screen.getByText(/You have no recorded consultations in the system/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /book a new consultation/i })).toBeInTheDocument();
  });
});

