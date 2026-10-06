import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import Departments from '../pages/Departments';
import { getDepartments } from '../services/api';

vi.mock('../services/api', () => ({
  getDepartments: vi.fn(),
}));

const mockDepartments = [
  {
    id: 1,
    name: 'Cardiology Center',
    code: 'CARD',
    description: 'Comprehensive cardiac assessment and intervention.',
    doctor_count: 5,
    is_active: true,
  },
  {
    id: 2,
    name: 'Pediatrics Department',
    code: 'PEDI',
    description: 'Dedicated care for infants, children, and adolescents.',
    doctor_count: 3,
    is_active: true,
  },
];

describe('Departments Listing & Search', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getDepartments.mockResolvedValue(mockDepartments);
  });

  it('renders clinical departments and their services', async () => {
    render(
      <MemoryRouter>
        <Departments />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Cardiology Center')).toBeInTheDocument();
      expect(screen.getByText('Pediatrics Department')).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Comprehensive cardiac assessment and intervention/i)
    ).toBeInTheDocument();
    expect(screen.getByText('5 Specialists')).toBeInTheDocument();
    expect(screen.getByText('3 Specialists')).toBeInTheDocument();
    expect(screen.getAllByText(/Explore Doctors/i)).toHaveLength(2);
  });

  it('filters departments using search query input', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Departments />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Cardiology Center')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search departments by specialty or name/i);
    await user.type(searchInput, 'Pediatrics');

    expect(screen.getByText('Pediatrics Department')).toBeInTheDocument();
    expect(screen.queryByText('Cardiology Center')).not.toBeInTheDocument();
  });

  it('handles API loading failure and offers retry button', async () => {
    getDepartments.mockRejectedValueOnce(new Error('Network connection timeout'));

    render(
      <MemoryRouter>
        <Departments />
      </MemoryRouter>
    );

    expect(
      await screen.findByText(/Network connection timeout/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });
});

