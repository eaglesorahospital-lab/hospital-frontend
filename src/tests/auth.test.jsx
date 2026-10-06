import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/Login';
import { AuthProvider } from '../context/AuthContext';
import { loginUser } from '../services/api';

vi.mock('../services/api', () => ({
  loginUser: vi.fn(),
  getCurrentUser: vi.fn(),
  clearAuth: vi.fn(),
}));

describe('Login & Authentication Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders login form elements with accessible labels', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByRole('heading', { name: /account login/i })).toBeInTheDocument();
    expect(screen.getByText(/username \/ email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your username/i)).toBeInTheDocument();
    expect(screen.getByText(/^password:/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^sign in$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /hospital admin/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /patient/i })).toBeInTheDocument();
  });

  it('quick-fills credentials when clicking demo persona buttons', async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </AuthProvider>
    );

    const adminBtn = screen.getByRole('button', { name: /hospital admin/i });
    await user.click(adminBtn);

    const usernameInput = screen.getByPlaceholderText(/enter your username/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);

    expect(usernameInput).toHaveValue('admin_hospital');
    expect(passwordInput).toHaveValue('AdminPass123!');
  });

  it('submits credentials and handles failed login error message', async () => {
    const user = userEvent.setup();
    loginUser.mockRejectedValueOnce(new Error('Invalid username or password credentials.'));

    render(
      <AuthProvider>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </AuthProvider>
    );

    await user.type(screen.getByPlaceholderText(/enter your username/i), 'wronguser');
    await user.type(screen.getByPlaceholderText(/enter your password/i), 'badpass');
    await user.click(screen.getByRole('button', { name: /^sign in$/i }));

    expect(
      await screen.findByText(/invalid username or password credentials/i)
    ).toBeInTheDocument();
    expect(loginUser).toHaveBeenCalledWith('wronguser', 'badpass');
  });

  it('submits valid credentials and triggers login successfully', async () => {
    const user = userEvent.setup();
    loginUser.mockResolvedValueOnce({
      access: 'mock-access-token',
      refresh: 'mock-refresh-token',
      user: { username: 'admin_hospital', role: 'HOSPITAL_ADMIN' },
    });

    render(
      <AuthProvider>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </AuthProvider>
    );

    await user.click(screen.getByRole('button', { name: /hospital admin/i }));
    await user.click(screen.getByRole('button', { name: /^sign in$/i }));

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith('admin_hospital', 'AdminPass123!');
    });
  });

  it('renders registration link for new patient accounts', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByText(/don't have an account\?/i)).toBeInTheDocument();
    const registerLink = screen.getByRole('link', { name: /register/i });
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute('href', '/register');
  });
});

