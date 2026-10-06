import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Register from '../pages/Register';
import Login from '../pages/Login';
import { AuthProvider } from '../context/AuthContext';
import { registerPatient } from '../services/api';

vi.mock('../services/api', () => ({
  registerPatient: vi.fn(),
  loginUser: vi.fn(),
  getCurrentUser: vi.fn(),
  clearAuth: vi.fn(),
}));

describe('Patient Registration Flow (/register)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders registration form fields with accessible labels', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/register']}>
          <Register />
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByRole('heading', { name: /create an account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^register$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/login');
  });

  it('validates empty required fields and displays inline validation errors', async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/register']}>
          <Register />
        </MemoryRouter>
      </AuthProvider>
    );

    await user.click(screen.getByRole('button', { name: /^register$/i }));

    expect(screen.getByText(/full name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/email address is required/i)).toBeInTheDocument();
    expect(screen.getByText(/phone number is required/i)).toBeInTheDocument();
    expect(screen.getByText(/^password is required/i)).toBeInTheDocument();
    expect(registerPatient).not.toHaveBeenCalled();
  });

  it('validates invalid email format and password mismatch', async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/register']}>
          <Register />
        </MemoryRouter>
      </AuthProvider>
    );

    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email address/i), 'invalid-email');
    await user.type(screen.getByLabelText(/phone number/i), '555-1234');
    await user.type(screen.getByLabelText(/^password:/i), 'SecretPass123!');
    await user.type(screen.getByLabelText(/confirm password/i), 'DifferentPass456!');

    await user.click(screen.getByRole('button', { name: /^register$/i }));

    expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    expect(registerPatient).not.toHaveBeenCalled();
  });

  it('handles backend validation errors (e.g. duplicate email)', async () => {
    const user = userEvent.setup();
    const error = new Error('A user with this email already exists.');
    error.data = { email: ['A user with this email already exists.'] };
    registerPatient.mockRejectedValueOnce(error);

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/register']}>
          <Register />
        </MemoryRouter>
      </AuthProvider>
    );

    await user.type(screen.getByLabelText(/full name/i), 'Alice Smith');
    await user.type(screen.getByLabelText(/email address/i), 'existing@example.com');
    await user.type(screen.getByLabelText(/phone number/i), '555-9876');
    await user.type(screen.getByLabelText(/^password:/i), 'Password123!');
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123!');

    await user.click(screen.getByRole('button', { name: /^register$/i }));

    expect(
      await screen.findByText(/a user with this email already exists/i)
    ).toBeInTheDocument();
  });

  it('submits valid registration payload, shows success and redirects to login', async () => {
    const user = userEvent.setup();
    registerPatient.mockResolvedValueOnce({
      id: 99,
      username: 'clara_oswald',
      email: 'clara@example.com',
      role: 'PATIENT',
    });

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/register']}>
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    await user.type(screen.getByLabelText(/full name/i), 'Clara Oswald');
    await user.type(screen.getByLabelText(/email address/i), 'clara@example.com');
    await user.type(screen.getByLabelText(/phone number/i), '555-0199');
    await user.type(screen.getByLabelText(/^password:/i), 'ImpossibleGirl@2026');
    await user.type(screen.getByLabelText(/confirm password/i), 'ImpossibleGirl@2026');

    await user.click(screen.getByRole('button', { name: /^register$/i }));

    expect(registerPatient).toHaveBeenCalledWith({
      name: 'Clara Oswald',
      email: 'clara@example.com',
      phone: '555-0199',
      password: 'ImpossibleGirl@2026',
      password_confirm: 'ImpossibleGirl@2026',
    });

    expect(
      await screen.findByText(/account created successfully! redirecting to login/i)
    ).toBeInTheDocument();
  });
});
