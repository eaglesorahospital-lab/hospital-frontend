import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
  ChevronLeft,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { doctorsApi } from '../api/doctors';
import { schedulingApi } from '../api/scheduling';
import { appointmentsApi } from '../api/appointments';
import { useAuth } from '../context/AuthContext';
import SlotSelector from '../components/scheduling/SlotSelector';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Booking() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Step 1: Doctor selection
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(searchParams.get('doctor') || '');
  const [selectedDate, setSelectedDate] = useState(
    searchParams.get('date') || new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );

  // Step 2: Slot selection
  const [slots, setSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState(Number(searchParams.get('slot')) || null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState(null);

  // Step 3: Patient form info & review
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [idempotencyKey] = useState(() => `idemp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflictError, setConflictError] = useState(null);
  const [generalError, setGeneralError] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Load doctors catalog (active doctors only)
  useEffect(() => {
    async function loadDoctors() {
      try {
        const data = await doctorsApi.getDoctors();
        const activeDocs = (data || []).filter((d) =>
          d.status ? d.status === 'ACTIVE' : d.is_active !== false
        );
        setDoctors(activeDocs);
        if (activeDocs.length > 0) {
          const isValidChoice = activeDocs.some((d) => String(d.id) === String(selectedDoctorId));
          if (!isValidChoice) {
            setSelectedDoctorId(activeDocs[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load doctors:', err);
      } finally {
        setInitialLoading(false);
      }
    }
    loadDoctors();
  }, []);

  // Fetch slots whenever doctor or date changes
  const loadSlots = async (docId, dateStr, clearConflict = true) => {
    if (!docId || !dateStr) return;
    setSlotsLoading(true);
    setSlotsError(null);
    if (clearConflict) {
      setConflictError(null);
    }
    try {
      const data = await schedulingApi.getDoctorAvailability(docId, dateStr);
      setSlots(data.slots || []);
    } catch (err) {
      setSlotsError(err.message || 'Unable to retrieve doctor availability.');
    } finally {
      setSlotsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDoctorId && selectedDate) {
      loadSlots(selectedDoctorId, selectedDate);
    }
  }, [selectedDoctorId, selectedDate]);

  const selectedDoctor = doctors.find((d) => String(d.id) === String(selectedDoctorId));
  const selectedSlot = slots.find((s) => s.id === selectedSlotId);

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: window.location.pathname + window.location.search } });
      return;
    }

    if (!selectedDoctorId || !selectedSlotId) {
      setGeneralError('Please select both a physician and an open time slot.');
      return;
    }

    setIsSubmitting(true);
    setConflictError(null);
    setGeneralError(null);

    try {
      const payload = {
        doctor_id: Number(selectedDoctorId),
        slot_id: Number(selectedSlotId),
        reason: reason.trim() || 'General Consultation',
        source: 'WEBSITE',
        idempotency_key: idempotencyKey,
      };

      const appointment = await appointmentsApi.bookAppointment(payload);

      // Navigate to confirmation page with created appointment
      navigate('/booking/result', {
        state: {
          appointment,
          doctor: selectedDoctor,
          slot: selectedSlot,
          success: true,
        },
      });
    } catch (err) {
      if (err.status === 409) {
        setConflictError(
          err.message ||
            'This appointment slot was just booked by another user. Please choose a different open time slot.'
        );
        // Refresh slot list to show updated status
        loadSlots(selectedDoctorId, selectedDate, false);
        setSelectedSlotId(null);
      } else {
        setGeneralError(err.message || 'Failed to complete appointment booking. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (initialLoading) {
    return <LoadingSpinner fullPage message="Initializing booking engine..." />;
  }

  return (
    <div style={{ padding: '3rem 0' }}>
      <div className="container" style={{ maxWidth: '840px' }}>
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <Link
            to="/doctors"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: 'var(--gray-600)',
              fontSize: '0.9rem',
              marginBottom: '1rem',
            }}
          >
            <ChevronLeft size={16} /> Back to Doctor Directory
          </Link>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem', color: 'var(--gray-900)' }}>
            Schedule Medical Consultation
          </h1>
          <p style={{ color: 'var(--gray-600)', fontSize: '1.05rem', margin: '0 0 1.5rem 0' }}>
            Transaction-safe, instant confirmation with clinical reminders.
          </p>

          {/* Booking Flow Progress Indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#ffffff',
              padding: '0.85rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--gray-200)',
              boxShadow: 'var(--shadow-sm)',
              overflowX: 'auto',
              gap: '0.5rem',
            }}
            aria-label="Booking steps progress"
          >
            {[
              { num: 1, label: 'Select Physician', active: true, done: Boolean(selectedDoctorId) },
              { num: 2, label: 'Choose Date & Slot', active: Boolean(selectedDoctorId), done: Boolean(selectedSlotId) },
              { num: 3, label: 'Patient Details', active: Boolean(selectedSlotId), done: false },
              { num: 4, label: 'Instant Confirmation', active: false, done: false },
            ].map((st, idx) => (
              <div
                key={st.num}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: st.done ? 'var(--success)' : st.active ? 'var(--primary)' : 'var(--gray-400)',
                  whiteSpace: 'nowrap',
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    backgroundColor: st.done ? 'var(--success-light)' : st.active ? 'var(--primary-light)' : 'var(--gray-100)',
                    color: st.done ? 'var(--success)' : st.active ? 'var(--primary)' : 'var(--gray-400)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                  }}
                >
                  {st.done ? '✓' : st.num}
                </div>
                <span>{st.label}</span>
                {idx < 3 && <span style={{ color: 'var(--gray-300)', margin: '0 0.25rem' }}>&rarr;</span>}
              </div>
            ))}
          </div>
        </div>

        {/* 409 Conflict Alert */}
        {conflictError && (
          <div
            className="card"
            style={{
              borderLeft: '5px solid var(--danger)',
              backgroundColor: 'var(--danger-light)',
              color: 'var(--danger-hover)',
              padding: '1.25rem',
              marginBottom: '2rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <AlertCircle size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: '1rem', display: 'block', marginBottom: '0.25rem' }}>
                  Booking Conflict Detected (HTTP 409)
                </strong>
                <p style={{ fontSize: '0.9rem', margin: '0 0 0.75rem 0', color: 'var(--danger-hover)' }}>
                  {conflictError}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setConflictError(null);
                    loadSlots(selectedDoctorId, selectedDate, true);
                    setSelectedSlotId(null);
                  }}
                  className="btn btn-outline btn-sm"
                  style={{
                    borderColor: 'var(--danger)',
                    color: 'var(--danger-hover)',
                    backgroundColor: '#ffffff',
                  }}
                >
                  Return to Availability & Choose Another Slot
                </button>
              </div>
            </div>
          </div>
        )}

        {/* General Error Alert */}
        {generalError && (
          <div
            className="card"
            style={{
              borderLeft: '5px solid var(--danger)',
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
              padding: '1.25rem',
              marginBottom: '2rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <AlertCircle size={20} />
              <span>{generalError}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmitBooking}>
          {/* Step 1: Doctor & Date */}
          <div className="card" style={{ marginBottom: '2rem', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={20} style={{ color: 'var(--primary)' }} /> 1. Select Physician & Date
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1.25rem',
              }}
            >
              <div className="form-group" style={{ margin: 0 }}>
                <label htmlFor="booking-doctor" className="form-label">
                  Doctor:
                </label>
                <select
                  id="booking-doctor"
                  className="select"
                  value={selectedDoctorId}
                  onChange={(e) => {
                    setSelectedDoctorId(e.target.value);
                    setSelectedSlotId(null);
                  }}
                  required
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      Dr. {d.name} ({d.department_name || d.department?.name || 'Department'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label htmlFor="booking-date" className="form-label">
                  Consultation Date:
                </label>
                <input
                  id="booking-date"
                  type="date"
                  className="input"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedSlotId(null);
                  }}
                  required
                />
              </div>
            </div>
          </div>

          {/* Step 2: Time Slot */}
          <div className="card" style={{ marginBottom: '2rem', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={20} style={{ color: 'var(--primary)' }} /> 2. Choose Open Time Slot
            </h3>

            <SlotSelector
              slots={slots}
              selectedSlotId={selectedSlotId}
              onSelectSlot={(slot) => setSelectedSlotId(slot.id)}
              loading={slotsLoading}
              error={slotsError}
              onRetry={() => loadSlots(selectedDoctorId, selectedDate)}
            />
          </div>

          {/* Step 3: Consultation Reason & Patient Review */}
          <div className="card" style={{ marginBottom: '2.5rem', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={20} style={{ color: 'var(--primary)' }} /> 3. Consultation Reason & Patient Details
            </h3>

            <div className="form-group">
              <label htmlFor="booking-reason" className="form-label">
                Primary Clinical Reason or Symptoms:
              </label>
              <textarea
                id="booking-reason"
                className="textarea"
                rows={3}
                placeholder="Briefly describe your symptoms, concern, or if this is a routine follow-up..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            {/* Patient Authentication Status Notice */}
            {!isAuthenticated ? (
              <div
                style={{
                  backgroundColor: 'var(--gray-50)',
                  border: '1px solid var(--gray-200)',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                }}
              >
                <div>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--gray-900)', display: 'block' }}>
                    Patient Account Required
                  </strong>
                  <span style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                    You need to sign in or register to secure your consultation appointment.
                  </span>
                </div>
                <Link to="/login" className="btn btn-outline-primary btn-sm">
                  Sign In / Register
                </Link>
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: 'var(--primary-50)',
                  border: '1px solid var(--primary-light)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  color: 'var(--primary-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                }}
              >
                <ShieldCheck size={18} />
                <span>
                  Booking for patient account: <strong>{user?.email || user?.username}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', alignItems: 'center' }}>
            <Link to="/doctors" className="btn btn-outline">
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting || !selectedSlotId}
              className="btn btn-primary btn-lg"
              style={{ minWidth: '220px' }}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin">⏳</span> Reserving Slot...
                </>
              ) : (
                <>
                  <Lock size={16} /> Confirm & Book Appointment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

