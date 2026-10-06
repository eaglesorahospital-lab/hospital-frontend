import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import { AuthProvider } from '../context/AuthContext';
import { authApi } from '../api/auth';

vi.mock('../api/auth', () => ({
  authApi: {
    getCurrentUser: vi.fn(),
    isAuthenticated: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
  },
}));

describe('ProtectedRoute Route Guard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects unauthenticated user to login screen', () => {
    authApi.getCurrentUser.mockReturnValue(null);
    authApi.isAuthenticated.mockReturnValue(false);

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <div>Secret Patient Dashboard</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div>Login Screen Reached</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByText('Login Screen Reached')).toBeInTheDocument();
    expect(screen.queryByText('Secret Patient Dashboard')).not.toBeInTheDocument();
  });

  it('renders child component for authenticated user', () => {
    authApi.getCurrentUser.mockReturnValue({ id: 5, username: 'patient_jane', role: 'PATIENT' });
    authApi.isAuthenticated.mockReturnValue(true);

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <div>Secret Patient Dashboard</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div>Login Screen Reached</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByText('Secret Patient Dashboard')).toBeInTheDocument();
  });

  it('blocks patient role and displays Access Restricted when admin role required', () => {
    authApi.getCurrentUser.mockReturnValue({ id: 5, username: 'patient_jane', role: 'PATIENT' });
    authApi.isAuthenticated.mockReturnValue(true);

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'HOSPITAL_ADMIN']}>
                  <div>Admin Clinical System</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByText(/Access Restricted/i)).toBeInTheDocument();
    expect(screen.queryByText('Admin Clinical System')).not.toBeInTheDocument();
  });
});

