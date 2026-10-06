import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../components/common/PageHero';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import Button from '../components/common/Button';
import {
  Calendar,
  Clock,
  Stethoscope,
  AlertCircle,
  XCircle,
  RefreshCw,
  Plus,
  ShieldCheck,
  CheckCircle2,
  CalendarCheck
} from 'lucide-react';
import {
  getMyAppointments,
  cancelAppointment,
  rescheduleAppointment,
  getDoctorAvailability
} from '../services/api';
import { formatDate, formatTime, getStatusBadge } from '../utils/formatters';

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cancellation modal
  const [cancellingApt, setCancellingApt] = useState(null);
  const [cancelReason, setCancelReason] = useState('Personal schedule conflict');
  const [actionLoading, setActionLoading] = useState(false);

  // Rescheduling modal
  const [reschedulingApt, setReschedulingApt] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleSlots, setRescheduleSlots] = useState([]);
  const [selectedNewSlotId, setSelectedNewSlotId] = useState('');
  const [slotsLoading, setSlotsLoading] = useState(false);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyAppointments();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      if (
        err.status === 401 ||
        err.message?.includes('Authentication credentials') ||
        err.message?.includes('not provided')
      ) {
        setError('Please sign in to your patient account to view your scheduled consultations.');
      } else {
        setError(err.message || 'Unable to load appointments ledger.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  // Handle cancellation submit
  const handleConfirmCancel = async () => {
    if (!cancellingApt) return;
    try {
      setActionLoading(true);
      await cancelAppointment(cancellingApt.id, cancelReason);
      setCancellingApt(null);
      await loadAppointments();
    } catch (err) {
      alert(`Could not cancel appointment: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Open reschedule modal & load default date
  const openRescheduleModal = (apt) => {
    setReschedulingApt(apt);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    setRescheduleDate(dateStr);
    setSelectedNewSlotId('');
    fetchNewSlots(apt.doctor?.id || apt.doctor, dateStr);
  };

  const fetchNewSlots = async (docId, dateStr) => {
    if (!docId || !dateStr) return;
    try {
      setSlotsLoading(true);
      const data = await getDoctorAvailability(docId, dateStr);
      setRescheduleSlots(Array.isArray(data) ? data.filter((s) => s.status === 'AVAILABLE' || !s.status) : []);
    } catch (err) {
      console.warn('Could not fetch reschedule slots:', err);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleDateChange = (newDate) => {
    setRescheduleDate(newDate);
    setSelectedNewSlotId('');
    if (reschedulingApt) {
      fetchNewSlots(reschedulingApt.doctor?.id || reschedulingApt.doctor, newDate);
    }
  };

  const handleConfirmReschedule = async () => {
    if (!reschedulingApt || !selectedNewSlotId) return;
    try {
      setActionLoading(true);
      await rescheduleAppointment(reschedulingApt.id, Number(selectedNewSlotId), 'Patient rescheduled via portal');
      setReschedulingApt(null);
      await loadAppointments();
    } catch (err) {
      alert(`Could not reschedule appointment: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="my-appointments-page">
      <PageHero
        badge="Patient Services"
        title="My Scheduled Consultations"
        subtitle="Review, reschedule, or cancel your consultations at Metropolitan General Hospital."
        breadcrumbs={[{ label: 'My Appointments' }]}
        actions={
          <Link to="/book-appointment" className="btn btn-primary">
            <Plus size={18} aria-hidden="true" />
            <span>Book New Appointment</span>
          </Link>
        }
      />

      <section className="section-padding bg-light">
        <div className="container">
          {loading ? (
            <LoadingState message="Loading your consultation appointments..." />
          ) : error ? (
            <ErrorState message={error} onRetry={loadAppointments} />
          ) : appointments.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No appointments registered"
              message="You have no recorded consultations in the system."
              actionLabel="Book a New Consultation"
              onAction={() => (window.location.href = '/book-appointment')}
            />
          ) : (
            <div className="appointments-list">
              {appointments.map((apt) => {
                const doctorName =
                  apt.doctor?.name || apt.doctor_name_snapshot || apt.doctor_name || 'Senior Specialist';
                const deptName =
                  apt.doctor?.department?.name ||
                  apt.department_name_snapshot ||
                  apt.department_name ||
                  'Clinical Specialty';
                const canModify = !['CANCELLED', 'COMPLETED'].includes(apt.status);

                return (
                  <div key={apt.id} className="appointment-card">
                    <div className="apt-card-header">
                      <div className="apt-ref-wrap">
                        <span className="apt-ref-label">Reference ID:</span>
                        <strong className="apt-ref-code">{apt.reference || `APPT-${apt.id}`}</strong>
                      </div>
                      <span className={`badge ${getStatusBadge(apt.status)}`}>
                        {apt.status || 'CONFIRMED'}
                      </span>
                    </div>

                    <div className="apt-card-body">
                      <div className="apt-doctor-info">
                        <div className="doctor-avatar-circle" aria-hidden="true">
                          <Stethoscope size={22} className="text-primary" />
                        </div>
                        <div>
                          <h3 className="apt-doctor-name">
                            {doctorName.startsWith('Dr.') ? doctorName : `Dr. ${doctorName}`}
                          </h3>
                          <p className="apt-doctor-dept">{deptName}</p>
                        </div>
                      </div>

                      <div className="apt-schedule-info">
                        <div className="schedule-item">
                          <Calendar size={16} className="text-secondary" aria-hidden="true" />
                          <span>{formatDate(apt.scheduled_date)}</span>
                        </div>
                        <div className="schedule-item">
                          <Clock size={16} className="text-primary" aria-hidden="true" />
                          <span>
                            {formatTime(apt.start_time)} – {formatTime(apt.end_time)}
                          </span>
                        </div>
                      </div>

                      {apt.reason && (
                        <div className="apt-reason-box">
                          <strong>Consultation Purpose:</strong> {apt.reason}
                        </div>
                      )}
                    </div>

                    {canModify && (
                      <div className="apt-card-footer">
                        <button
                          type="button"
                          onClick={() => openRescheduleModal(apt)}
                          className="btn btn-outline btn-sm"
                        >
                          <RefreshCw size={14} aria-hidden="true" />
                          <span>Reschedule</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setCancellingApt(apt)}
                          className="btn btn-danger btn-sm"
                        >
                          <XCircle size={14} aria-hidden="true" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Cancellation Modal */}
      {cancellingApt && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="cancel-modal-title">
          <div className="modal-card">
            <h3 id="cancel-modal-title" className="modal-title text-danger">
              Confirm Appointment Cancellation
            </h3>
            <p className="modal-desc">
              Are you sure you wish to cancel this consultation with{' '}
              <strong>{cancellingApt.doctor?.name || cancellingApt.doctor_name || 'your physician'}</strong>?
            </p>

            <div className="form-group" style={{ margin: '1.25rem 0' }}>
              <label className="form-label">Reason for Cancellation:</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Schedule conflict, feeling better..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setCancellingApt(null)}
                disabled={actionLoading}
              >
                Keep Appointment
              </button>
              <Button
                variant="danger"
                onClick={handleConfirmCancel}
                loading={actionLoading}
                disabled={actionLoading}
              >
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {reschedulingApt && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="reschedule-modal-title">
          <div className="modal-card">
            <h3 id="reschedule-modal-title" className="modal-title">
              Reschedule Consultation
            </h3>
            <p className="modal-desc">
              Select a new date and open consultation slot for{' '}
              <strong>{reschedulingApt.doctor?.name || reschedulingApt.doctor_name}</strong>:
            </p>

            <div className="form-group" style={{ margin: '1rem 0' }}>
              <label className="form-label">Select New Date:</label>
              <input
                type="date"
                className="form-input"
                value={rescheduleDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => handleDateChange(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Available Slots for {formatDate(rescheduleDate)}:</label>
              {slotsLoading ? (
                <LoadingState message="Checking open slots..." />
              ) : rescheduleSlots.length === 0 ? (
                <p className="field-hint text-warning">
                  No slots open on this date. Please pick another date.
                </p>
              ) : (
                <div className="slots-radio-grid">
                  {rescheduleSlots.map((slot) => {
                    const isSelected = String(slot.id) === String(selectedNewSlotId);
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        className={`slot-select-btn ${isSelected ? 'active' : ''}`}
                        onClick={() => setSelectedNewSlotId(String(slot.id))}
                      >
                        <Clock size={14} aria-hidden="true" />
                        <span>{formatTime(slot.start_time)} – {formatTime(slot.end_time)}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setReschedulingApt(null)}
                disabled={actionLoading}
              >
                Dismiss
              </button>
              <Button
                variant="primary"
                onClick={handleConfirmReschedule}
                loading={actionLoading}
                disabled={actionLoading || !selectedNewSlotId}
              >
                Confirm Reschedule
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
