import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from '../components/common/ProtectedRoute';
import AdminLayout from '../components/admin/AdminLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminAppointments from '../pages/admin/AdminAppointments';
import AdminDoctors from '../pages/admin/AdminDoctors';
import AdminDepartments from '../pages/admin/AdminDepartments';
import AdminSchedules from '../pages/admin/AdminSchedules';
import AdminNotifications from '../pages/admin/AdminNotifications';
import AdminAuditLogs from '../pages/admin/AdminAuditLogs';
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
    getStats: vi.fn().mockResolvedValue({
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
    }),
    getAppointments: vi.fn().mockResolvedValue([]),
    getAuditLogs: vi.fn().mockResolvedValue([]),
    getDoctors: vi.fn().mockResolvedValue([]),
    getDepartments: vi.fn().mockResolvedValue([]),
    getSchedules: vi.fn().mockResolvedValue([]),
    getWeeklyTemplates: vi.fn().mockResolvedValue([]),
    getNotifications: vi.fn().mockResolvedValue([]),
  },
}));

function renderAdminApp(initialRoute = '/admin') {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'STAFF', 'DOCTOR']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="appointments" element={<AdminAppointments />} />
            <Route path="doctors" element={<AdminDoctors />} />
            <Route path="departments" element={<AdminDepartments />} />
            <Route path="schedules" element={<AdminSchedules />} />
            <Route path="patients" element={<AdminAppointments />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="audit" element={<AdminAuditLogs />} />
            <Route path="audit-logs" element={<AdminAuditLogs />} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

describe('Admin Portal Route & Navigation Mounting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authApi.getCurrentUser.mockReturnValue({
      id: 6,
      username: 'admin_hospital',
      email: 'admin@metropolitan-health.org',
      role: 'HOSPITAL_ADMIN',
    });
    authApi.isAuthenticated.mockReturnValue(true);
  });

  it('renders /admin successfully with header banner and operator info', async () => {
    renderAdminApp('/admin');

    expect(screen.getByText('Hospital Management Operations')).toBeInTheDocument();
    expect(screen.getByText(/Authenticated Operator:/i)).toBeInTheDocument();
    expect(screen.getByText('admin_hospital')).toBeInTheDocument();
    expect(screen.getByText('Return to Public Portal')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Operational Command Center')).toBeInTheDocument();
    });
  });

  it('renders all main admin navigation tabs', () => {
    renderAdminApp('/admin');

    const nav = screen.getByRole('navigation', { name: /admin navigation/i });
    expect(nav).toBeInTheDocument();

    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/admin');
    expect(screen.getByRole('link', { name: /doctors/i })).toHaveAttribute('href', '/admin/doctors');
    expect(screen.getByRole('link', { name: /departments/i })).toHaveAttribute('href', '/admin/departments');
    expect(screen.getByRole('link', { name: /schedules/i })).toHaveAttribute('href', '/admin/schedules');
    expect(screen.getByRole('link', { name: /appointments/i })).toHaveAttribute('href', '/admin/appointments');
    expect(screen.getByRole('link', { name: /patients/i })).toHaveAttribute('href', '/admin/patients');
    expect(screen.getByRole('link', { name: /notifications/i })).toHaveAttribute('href', '/admin/notifications');
    expect(screen.getByRole('link', { name: /audit logs/i })).toHaveAttribute('href', '/admin/audit');
  });

  it('navigates to /admin/appointments and mounts AdminAppointments', async () => {
    renderAdminApp('/admin/appointments');

    expect(screen.getByText('Hospital Management Operations')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Clinical Appointments & Patient Intake')).toBeInTheDocument();
    });
  });

  it('navigates to /admin/doctors and mounts AdminDoctors', async () => {
    renderAdminApp('/admin/doctors');

    expect(screen.getByText('Hospital Management Operations')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Medical Staff & Doctor Management')).toBeInTheDocument();
    });
  });

  it('navigates to /admin/departments and mounts AdminDepartments', async () => {
    renderAdminApp('/admin/departments');

    expect(screen.getByText('Hospital Management Operations')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Clinical Departments')).toBeInTheDocument();
    });
  });

  it('navigates to /admin/schedules and mounts AdminSchedules', async () => {
    renderAdminApp('/admin/schedules');

    expect(screen.getByText('Hospital Management Operations')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Physician Rosters & Scheduling Engine')).toBeInTheDocument();
    });
  });

  it('navigates to /admin/patients and mounts patient management view', async () => {
    renderAdminApp('/admin/patients');

    expect(screen.getByText('Hospital Management Operations')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Clinical Appointments & Patient Intake')).toBeInTheDocument();
    });
  });

  it('navigates to /admin/notifications and mounts AdminNotifications', async () => {
    renderAdminApp('/admin/notifications');

    expect(screen.getByText('Hospital Management Operations')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Notification Queue & Delivery Logs')).toBeInTheDocument();
    });
  });

  it('navigates to /admin/audit and mounts AdminAuditLogs', async () => {
    renderAdminApp('/admin/audit');

    expect(screen.getByText('Hospital Management Operations')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('System Audit Trails & Compliance Log')).toBeInTheDocument();
    });
  });
});

