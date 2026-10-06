import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminAuditLogs from '../pages/admin/AdminAuditLogs';
import AdminDoctors from '../pages/admin/AdminDoctors';
import { AuthProvider } from '../context/AuthContext';
import { authApi } from '../api/auth';
import { adminApi } from '../api/admin';

vi.mock('../api/auth', () => ({
  authApi: {
    getCurrentUser: vi.fn(),
    isAuthenticated: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
  },
}));

vi.mock('../api/admin', () => ({
  adminApi: {
    getStats: vi.fn(),
    getAppointments: vi.fn(),
    getAuditLogs: vi.fn(),
    getDoctors: vi.fn(),
    getDepartments: vi.fn(),
    createDoctor: vi.fn(),
    updateDoctor: vi.fn(),
    toggleDoctorStatus: vi.fn(),
    deleteDoctor: vi.fn(),
  },
}));

describe('Admin Operations & Security Layer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authApi.getCurrentUser.mockReturnValue({
      id: 1,
      username: 'admin_sarah',
      email: 'admin@hospital.org',
      role: 'HOSPITAL_ADMIN',
    });
    authApi.isAuthenticated.mockReturnValue(true);
  });

  it('renders operational dashboard with live aggregated metrics', async () => {
    adminApi.getStats.mockResolvedValue({
      today_appointments: 14,
      upcoming_appointments: 42,
      pending_appointments: 3,
      completed_appointments: 120,
      cancelled_appointments: 8,
      total_doctors: 18,
      active_doctors: 16,
      total_departments: 6,
      active_departments: 6,
      sent_notifications: 182,
      failed_notifications: 0,
    });

    adminApi.getAppointments.mockResolvedValue([
      {
        id: 101,
        reference: 'APT-20261002-001',
        patient_name: 'John Doe',
        patient_email: 'john@example.com',
        doctor_name: 'Dr. Emily Watson',
        department_name: 'Cardiology',
        scheduled_date: '2026-10-02',
        start_time: '10:00:00',
        end_time: '10:30:00',
        status: 'CONFIRMED',
      },
    ]);

    render(
      <AuthProvider>
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      </AuthProvider>
    );

    expect(await screen.findByText(/Operational Command Center/i)).toBeInTheDocument();
    expect(screen.getByText('14')).toBeInTheDocument(); // Today's appointments
    expect(screen.getByText('APT-20261002-001')).toBeInTheDocument();
    expect(screen.getByText('Dr. Emily Watson')).toBeInTheDocument();
  });

  it('renders audit trail log entries with action badges and detail inspection', async () => {
    const mockAuditLog = {
      id: 45,
      actor_username: 'dr_watson',
      actor_role: 'DOCTOR',
      action: 'APPOINTMENT_STATUS_CHANGE',
      entity: 'Appointment',
      object_id: '101',
      status: 'SUCCESS',
      ip_address: '192.168.1.55',
      user_agent: 'Mozilla/5.0 HospitalClinicalTerminal/4.0',
      details: {
        previous_status: 'CONFIRMED',
        new_status: 'COMPLETED',
        note: 'Patient routine checkup concluded normally.',
      },
      created_at: '2026-10-02T10:35:00Z',
    };

    adminApi.getAuditLogs.mockResolvedValue([mockAuditLog]);

    const user = userEvent.setup();

    render(
      <AuthProvider>
        <MemoryRouter>
          <AdminAuditLogs />
        </MemoryRouter>
      </AuthProvider>
    );

    expect(await screen.findByText(/System Audit Trails & Compliance Log/i)).toBeInTheDocument();
    expect(screen.getByText('dr_watson')).toBeInTheDocument();
    expect(screen.getAllByText('APPOINTMENT_STATUS_CHANGE').length).toBeGreaterThan(0);
    expect(screen.getByText('192.168.1.55')).toBeInTheDocument();

    // Click View to open detail modal
    const viewBtn = screen.getByRole('button', { name: /view/i });
    await user.click(viewBtn);

    expect(await screen.findByText(/Audit Event #45 Detail/i)).toBeInTheDocument();
    expect(screen.getByText(/Patient routine checkup concluded normally/i)).toBeInTheDocument();
  });

  it('renders doctors administration table and handles doctor creation modal', async () => {
    adminApi.getDoctors.mockResolvedValue([
      {
        id: 1,
        name: 'Dr. Gregory House',
        slug: 'dr-gregory-house',
        department: 2,
        department_name: 'Diagnostic Medicine',
        qualification: 'MD, Nephrology',
        experience: 20,
        consultation_type: 'IN_PERSON',
        consultation_duration: 45,
        room: 'Room 404',
        status: 'ACTIVE',
      },
    ]);
    adminApi.getDepartments.mockResolvedValue([
      { id: 2, name: 'Diagnostic Medicine', slug: 'diagnostic-medicine' },
    ]);

    const user = userEvent.setup();

    render(
      <AuthProvider>
        <MemoryRouter>
          <AdminDoctors />
        </MemoryRouter>
      </AuthProvider>
    );

    expect(await screen.findByText(/Medical Staff & Doctor Management/i)).toBeInTheDocument();
    expect(screen.getByText('Dr. Gregory House')).toBeInTheDocument();
    expect(screen.getAllByText('Diagnostic Medicine').length).toBeGreaterThan(0);

    // Click Add New Doctor
    const addBtn = screen.getByRole('button', { name: /add new doctor/i });
    await user.click(addBtn);

    expect(await screen.findByText(/Register New Medical Specialist/i)).toBeInTheDocument();
  });
});

