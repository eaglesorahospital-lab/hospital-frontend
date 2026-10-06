import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import SlotSelector from '../components/scheduling/SlotSelector';

describe('SlotSelector & Availability Component', () => {
  const mockSlots = [
    {
      id: 101,
      start_time: '09:00',
      end_time: '09:30',
      status: 'AVAILABLE',
      is_available: true,
    },
    {
      id: 102,
      start_time: '09:30',
      end_time: '10:00',
      status: 'BOOKED',
      is_available: false,
    },
    {
      id: 103,
      start_time: '10:00',
      end_time: '10:30',
      status: 'AVAILABLE',
      is_available: true,
    },
  ];

  it('renders empty placeholder when no slots are scheduled', () => {
    render(<SlotSelector slots={[]} />);
    expect(screen.getByText(/no slots available/i)).toBeInTheDocument();
  });

  it('renders slot badges and indicates availability count', () => {
    render(<SlotSelector slots={mockSlots} selectedSlotId={null} />);

    expect(screen.getByText(/2 of 3 slots open/i)).toBeInTheDocument();
    expect(screen.getByText('09:00')).toBeInTheDocument();
    expect(screen.getByText('09:30')).toBeInTheDocument();
    expect(screen.getByText('10:00')).toBeInTheDocument();
  });

  it('disables booked slots and permits selecting open slots', async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();

    render(
      <SlotSelector
        slots={mockSlots}
        selectedSlotId={null}
        onSelectSlot={handleSelect}
      />
    );

    const bookedButton = screen.getByLabelText(/time slot 09:30 to 10:00, unavailable/i);
    expect(bookedButton).toBeDisabled();

    const openButton = screen.getByLabelText(/time slot 09:00 to 09:30, available/i);
    expect(openButton).toBeEnabled();

    await user.click(openButton);
    expect(handleSelect).toHaveBeenCalledWith(mockSlots[0]);
  });
});

