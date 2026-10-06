import React from 'react';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorState from '../common/ErrorState';

export default function SlotSelector({
  slots = [],
  selectedSlotId = null,
  onSelectSlot,
  loading = false,
  error = null,
  onRetry = null,
}) {
  if (loading) {
    return <LoadingSpinner message="Evaluating clinical schedule & doctor availability..." />;
  }

  if (error) {
    return (
      <ErrorState
        title="Could not load time slots"
        message={error}
        onRetry={onRetry}
      />
    );
  }

  if (!slots || slots.length === 0) {
    return (
      <div
        className="card"
        style={{
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: 'var(--gray-50)',
          border: '1px dashed var(--gray-300)',
        }}
      >
        <div style={{ color: 'var(--gray-400)', marginBottom: '0.5rem' }}>
          <Clock size={32} style={{ margin: '0 auto' }} />
        </div>
        <h4 style={{ fontSize: '1.05rem', color: 'var(--gray-800)', marginBottom: '0.25rem' }}>
          No Slots Available
        </h4>
        <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', maxWidth: '360px', margin: '0 auto' }}>
          The doctor does not have working hours or open consultation slots on this date. Please choose another date.
        </p>
      </div>
    );
  }

  const availableSlots = slots.filter((s) => s.is_available || s.status === 'AVAILABLE');

  return (
    <div>
      {/* Availability Header Stats */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          fontSize: '0.875rem',
        }}
      >
        <span style={{ color: 'var(--gray-600)', fontWeight: 500 }}>
          {availableSlots.length} of {slots.length} slots open
        </span>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.775rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--gray-700)' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--primary)' }} /> Available
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--gray-400)' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--gray-300)' }} /> Booked / Blocked
          </span>
        </div>
      </div>

      {/* Grid of slot buttons */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(115px, 1fr))',
          gap: '0.65rem',
        }}
      >
        {slots.map((slot) => {
          const isSelected = selectedSlotId === slot.id;
          const isAvailable = slot.is_available !== undefined ? slot.is_available : slot.status === 'AVAILABLE';

          let buttonStyle = {
            padding: '0.65rem 0.5rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--gray-300)',
            backgroundColor: 'var(--surface)',
            color: 'var(--gray-800)',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: isAvailable ? 'pointer' : 'not-allowed',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.2rem',
            transition: 'all var(--transition-fast)',
            opacity: isAvailable ? 1 : 0.45,
          };

          if (isSelected) {
            buttonStyle = {
              ...buttonStyle,
              borderColor: 'var(--primary)',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              boxShadow: 'var(--shadow-md)',
              transform: 'scale(1.02)',
            };
          } else if (isAvailable) {
            buttonStyle = {
              ...buttonStyle,
              borderColor: 'var(--primary-light)',
              backgroundColor: 'var(--surface)',
            };
          } else {
            buttonStyle = {
              ...buttonStyle,
              backgroundColor: 'var(--gray-100)',
              borderColor: 'var(--gray-200)',
              textDecoration: 'line-through',
            };
          }

          return (
            <button
              key={slot.id}
              type="button"
              disabled={!isAvailable}
              onClick={() => onSelectSlot && onSelectSlot(slot)}
              style={buttonStyle}
              aria-label={`Time slot ${slot.start_time} to ${slot.end_time}, ${isAvailable ? 'available' : 'unavailable'}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Clock size={13} />
                <span>{slot.start_time}</span>
              </div>
              <span style={{ fontSize: '0.725rem', opacity: isSelected ? 0.9 : 0.65, textDecoration: 'none' }}>
                {isSelected ? 'Selected' : isAvailable ? 'Open' : slot.status}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

