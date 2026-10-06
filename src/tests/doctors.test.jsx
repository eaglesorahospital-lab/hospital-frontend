import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import Doctors from '../pages/Doctors';
import { getDoctors, getDepartments } from '../services/api';

vi.mock('../services/api', () => ({
  getDoctors: vi.fn(),
  getDepartments: vi.fn(),
}));

const mockDoctors = [
  {
    id: 1,
    name: 'Sarah Jenkins',
    qualification: 'MD, FACC Cardiology',
    experience_years: 14,
    department: 1,
    department_name: 'Cardiology',
    specialization: 'Interventional Cardiology, Heart Failure',
    consultation_fee: 150,
    is_active: true,
  },
  {
    id: 2,
    name: 'Robert Chen',
    qualification: 'MBBS, MS Neurology',
    experience_years: 9,
    department: 2,
    department_name: 'Neurology',
    specialization: 'Stroke Care, Epilepsy Management',
    consultation_fee: 120,
    is_active: true,
  },
];

const mockDepartments = [
  { id: 1, name: 'Cardiology' },
  { id: 2, name: 'Neurology' },
];

describe('Doctors Listing & Filtering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getDoctors.mockResolvedValue(mockDoctors);
    getDepartments.mockResolvedValue(mockDepartments);
  });

  it('renders doctors list with credentials and consultation types', async () => {
    render(
      <MemoryRouter>
        <Doctors />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Dr. Sarah Jenkins')).toBeInTheDocument();
      expect(screen.getByText('Dr. Robert Chen')).toBeInTheDocument();
    });

    expect(screen.getByText(/MD, FACC Cardiology/i)).toBeInTheDocument();
    expect(screen.getByText(/14 Years Clinical Exp/i)).toBeInTheDocument();
    expect(screen.getByText(/Interventional Cardiology, Heart Failure/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Book Slot/i)).toHaveLength(2);
  });

  it('filters doctors by name search query', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Doctors />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Dr. Sarah Jenkins')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search by physician name/i);
    await user.type(searchInput, 'Sarah');

    expect(screen.getByText('Dr. Sarah Jenkins')).toBeInTheDocument();
    expect(screen.queryByText('Dr. Robert Chen')).not.toBeInTheDocument();
  });

  it('displays empty state when no doctors match the criteria', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Doctors />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Dr. Sarah Jenkins')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search by physician name/i);
    await user.type(searchInput, 'NonExistentDoctor');

    expect(screen.getByText('No doctors found')).toBeInTheDocument();
    expect(screen.getByText(/No physician records matched your search filters/i)).toBeInTheDocument();
  });
});

