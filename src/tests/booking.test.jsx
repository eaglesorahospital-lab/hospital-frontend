import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import Booking from '../pages/Booking';
import { AuthProvider } from '../context/AuthContext';
import { doctorsApi } from '../api/doctors';
import { schedulingApi } from '../api/scheduling';
import { appointmentsApi } from '../api/appointments';
import { authApi } from '../api/auth';
import { ApiError } from '../api/client';

vi.mock('../api/doctors', () => ({
  doctorsApi: {
    getDoctors: vi.fn(),
  },
}));

vi.mock('../api/scheduling', () => ({
  schedulingApi: {
    getDoctorAvailability: vi.fn(),
  },
}));

vi.mock('../api/appointments', () => ({
  appointmentsApi: {
    bookAppointment: vi.fn(),
  },
}));

vi.mock('../api/auth', () => ({
  authApi: {
    getCurrentUser: vi.fn(),
    isAuthenticated: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
  },
}));

const mockDoctors = [
  {
    id: 1,
    name: 'Dr. Sarah Jenkins',
    department_name: 'Cardiology',
    qualification: 'MD, FACC',
    consultation_fee: '120.00',
    consultation_duration: 30,
    is_active: true,
  },
];

const mockSlots = [
  {
    id: 201,
    start_time: '10:00',
    end_time: '10:30',
    status: 'AVAILABLE',
    is_available: true,
  },
];

describe('Appointment Booking Engine Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authApi.getCurrentUser.mockReturnValue({ id: 1, username: 'patient_jane', role: 'PATIENT' });
    authApi.isAuthenticated.mockReturnValue(true);
    doctorsApi.getDoctors.mockResolvedValue(mockDoctors);
    schedulingApi.getDoctorAvailability.mockResolvedValue({
      doctor: mockDoctors[0],
      date: '2026-10-15',
      slots: mockSlots,
    });
  });

  it('renders booking workflow with doctor and slot selector', async () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/booking']}>
          <Booking />
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/schedule medical consultation/i)).toBeInTheDocument();
      expect(screen.getByText(/Dr. Sarah Jenkins/i)).toBeInTheDocument();
    });

    // Slot 10:00 is rendered and available
    expect(await screen.findByText('10:00')).toBeInTheDocument();
  });

  it('handles 409 slot booking conflict and prompts user to pick another slot', async () => {
    // Mock 409 conflict on appointment submission
    const conflictError = new ApiError(
      'This appointment slot was just booked by another user. Please choose a different open time slot.',
      409,
      { code: 'SLOT_UNAVAILABLE' }
    );
    appointmentsApi.bookAppointment.mockRejectedValueOnce(conflictError);

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/booking?doctor=1&slot=201']}>
          <Booking />
        </MemoryRouter>
      </AuthProvider>
    );

    // Wait for slot to appear
    const slotBtn = await screen.findByLabelText(/time slot 10:00 to 10:30, available/i);
    fireEvent.click(slotBtn);

    // Wait for confirm button to become enabled
    const confirmBtn = await screen.findByRole('button', { name: /confirm & book appointment/i });
    await waitFor(() => {
      expect(confirmBtn).toBeEnabled();
    });

    fireEvent.click(confirmBtn);

    // Expect conflict alert banner to be visible
    expect(
      await screen.findByText(/slot was just booked by another user/i)
    ).toBeInTheDocument();

    // Verify slots were re-fetched
    expect(schedulingApi.getDoctorAvailability).toHaveBeenCalled();
  });
});

