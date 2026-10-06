import React, { useState, useEffect } from 'react';
import {
  Search,
  XCircle,
  RotateCcw,
  FileText,
  X,
} from 'lucide-react';
import { adminApi } from '../../api/admin';
import { appointmentsApi } from '../../api/appointments';
import { schedulingApi } from '../../api/scheduling';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Selected Appointment for Detail / Transitions
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  const [actionError, setActionError] = useState(null);

  // Reschedule Modal
  const [rescheduleModalAppt, setRescheduleModalAppt] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const [rescheduleError, setRescheduleError] = useState(null);

  // Cancel Modal
  const [cancelModalAppt, setCancelModalAppt] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  const fetchAppointments = async () => {
    try {
      setError(null);
      const [apptData, docData] = await Promise.all([
        adminApi.getAppointments(),
        adminApi.getDoctors(),
      ]);
      setAppointments(Array.isArray(apptData) ? apptData : apptData.results || []);
      setDoctors(Array.isArray(docData) ? docData : docData.results || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch appointments directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleStatusTransition = async (apptId, nextStatus) => {
    setTransitioning(true);
    setActionError(null);
    try {
      await adminApi.transitionAppointment(apptId, nextStatus);
      await fetchAppointments();
      if (selectedAppt && selectedAppt.id === apptId) {
        setSelectedAppt((prev) => ({ ...prev, status: nextStatus }));
      }
    } catch (err) {
      setActionError(err.message || 'Status transition failed.');
    } finally {
      setTransitioning(false);
    }
  };

  // Reschedule slots fetch
  const handleDateChangeForReschedule = async (date) => {
    setRescheduleDate(date);
    setSelectedSlotId('');
    if (!rescheduleModalAppt || !date) return;

    setLoadingSlots(true);
    setRescheduleError(null);
    try {
      const data = await schedulingApi.getDoctorSlots(rescheduleModalAppt.doctor, date);
      const slots = Array.isArray(data) ? data : data.results || [];
      const openSlots = slots.filter((s) => s.status === 'AVAILABLE' || s.is_available);
      setAvailableSlots(openSlots);
    } catch (err) {
      setRescheduleError('Failed to fetch slots for selected date.');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleConfirmReschedule = async (e) => {
    e.preventDefault();
    if (!selectedSlotId) {
      setRescheduleError('Please choose a time slot.');
      return;
    }
    setRescheduling(true);
    setRescheduleError(null);
    try {
      await appointmentsApi.rescheduleAppointment(
        rescheduleModalAppt.id,
        parseInt(selectedSlotId, 10),
        rescheduleReason || 'Administrative reschedule'
      );
      setRescheduleModalAppt(null);
      await fetchAppointments();
    } catch (err) {
      setRescheduleError(err.message || 'Reschedule failed.');
    } finally {
      setRescheduling(false);
    }
  };

  const handleConfirmCancel = async (e) => {
    e.preventDefault();
    if (!cancellationReason.trim()) {
      setCancelError('Cancellation reason is required.');
      return;
    }
    setCancelling(true);
    setCancelError(null);
    try {
      await appointmentsApi.cancelAppointment(cancelModalAppt.id, cancellationReason);
      setCancelModalAppt(null);
      await fetchAppointments();
    } catch (err) {
      setCancelError(err.message || 'Cancellation failed.');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="badge badge-success">Confirmed</span>;
      case 'CHECKED_IN':
        return <span className="badge badge-primary" style={{ backgroundColor: '#0284c7', color: '#fff' }}>Checked In</span>;
      case 'COMPLETED':
        return <span className="badge badge-primary">Completed</span>;
      case 'REQUESTED':
        return <span className="badge badge-warning">Requested</span>;
      case 'CANCELLED':
        return <span className="badge badge-danger">Cancelled</span>;
      case 'NO_SHOW':
        return <span className="badge badge-danger" style={{ backgroundColor: '#64748b', color: '#fff' }}>No Show</span>;
      case 'RESCHEDULED':
        return <span className="badge" style={{ backgroundColor: '#d97706', color: '#fff' }}>Rescheduled</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const filteredAppointments = appointments.filter((appt) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (appt.reference || '').toLowerCase().includes(term) ||
      (appt.patient_name || '').toLowerCase().includes(term) ||
      (appt.patient_email || '').toLowerCase().includes(term) ||
      (appt.doctor_name || '').toLowerCase().includes(term);

    const matchesStatus = !statusFilter || appt.status === statusFilter;
    const matchesDoctor = !doctorFilter || String(appt.doctor) === String(doctorFilter);
    const matchesDate = !dateFilter || appt.scheduled_date === dateFilter;

    return matchesSearch && matchesStatus && matchesDoctor && matchesDate;
  });

  if (loading) {
    return <LoadingSpinner message="Loading hospital appointments registry..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchAppointments} />;
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gray-900)', margin: 0 }}>
          Clinical Appointments & Patient Intake
        </h2>
        <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', margin: '0.2rem 0 0' }}>
          Real-time patient intake triage, status transitions, clinical notes review, and appointment reassignments.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          marginBottom: '1.5rem',
          backgroundColor: '#ffffff',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.85rem',
          alignItems: 'center',
        }}
      >
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search ref #, patient, physician..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.2rem' }}
          />
        </div>

        <div>
          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="REQUESTED">Requested</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CHECKED_IN">Checked In</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="NO_SHOW">No Show</option>
            <option value="RESCHEDULED">Rescheduled</option>
          </select>
        </div>

        <div>
          <select
            className="form-control"
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
          >
            <option value="">All Physicians</option>
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <input
            type="date"
            className="form-control"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
      </div>

      {actionError && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.9rem' }}>
          {actionError}
        </div>
      )}

      {/* Appointments Table */}
      <div className="card" style={{ padding: '1rem', backgroundColor: '#ffffff' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--gray-200)', textAlign: 'left', color: 'var(--gray-600)' }}>
                <th style={{ padding: '0.75rem 0.5rem' }}>Reference #</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Patient</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Physician</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Date & Slot</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Transitions & Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-500)' }}>
                    No appointments match your filters.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((appt) => (
                  <tr key={appt.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <div style={{ fontWeight: 800, color: 'var(--primary)', fontFamily: 'monospace' }}>
                        {appt.reference}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                        Source: {appt.source || 'WEBSITE'}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--gray-900)' }}>
                        {appt.patient_name || appt.patient_name_snapshot || 'Patient'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                        {appt.patient_email}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <div style={{ fontWeight: 600 }}>{appt.doctor_name || appt.doctor_name_snapshot}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                        {appt.department_name || appt.department_name_snapshot}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <div style={{ fontWeight: 600 }}>{appt.scheduled_date}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                        {appt.start_time?.slice(0, 5)} - {appt.end_time?.slice(0, 5)}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      {getStatusBadge(appt.status)}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        {/* Quick transitions based on current status */}
                        {appt.status === 'REQUESTED' && (
                          <button
                            type="button"
                            onClick={() => handleStatusTransition(appt.id, 'CONFIRMED')}
                            disabled={transitioning}
                            className="btn btn-primary btn-sm"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.78rem' }}
                          >
                            Confirm
                          </button>
                        )}

                        {appt.status === 'CONFIRMED' && (
                          <button
                            type="button"
                            onClick={() => handleStatusTransition(appt.id, 'CHECKED_IN')}
                            disabled={transitioning}
                            className="btn btn-outline btn-sm"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.78rem' }}
                          >
                            Check In
                          </button>
                        )}

                        {(appt.status === 'CONFIRMED' || appt.status === 'CHECKED_IN') && (
                          <button
                            type="button"
                            onClick={() => handleStatusTransition(appt.id, 'COMPLETED')}
                            disabled={transitioning}
                            className="btn btn-outline btn-sm"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.78rem', color: 'var(--success)' }}
                          >
                            Complete
                          </button>
                        )}

                        {(appt.status === 'REQUESTED' || appt.status === 'CONFIRMED') && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setRescheduleModalAppt(appt);
                                setRescheduleDate(appt.scheduled_date);
                                handleDateChangeForReschedule(appt.scheduled_date);
                              }}
                              className="btn btn-outline btn-sm"
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.78rem' }}
                              title="Reschedule"
                            >
                              <RotateCcw size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setCancelModalAppt(appt);
                                setCancellationReason('');
                                setCancelError(null);
                              }}
                              className="btn btn-outline btn-sm"
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.78rem', color: 'var(--danger)' }}
                              title="Cancel"
                            >
                              <XCircle size={14} />
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          onClick={() => setSelectedAppt(appt)}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.78rem' }}
                          title="Details"
                        >
                          <FileText size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedAppt && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: 540, width: '100%', padding: '1.75rem', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                  Appointment {selectedAppt.reference}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                  Created on {new Date(selectedAppt.created_at).toLocaleString()}
                </span>
              </div>
              <button type="button" onClick={() => setSelectedAppt(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem' }}>
              <div>
                <strong style={{ color: 'var(--gray-700)' }}>Current Status:</strong> {getStatusBadge(selectedAppt.status)}
              </div>
              <div>
                <strong style={{ color: 'var(--gray-700)' }}>Patient:</strong> {selectedAppt.patient_name} ({selectedAppt.patient_email})
              </div>
              <div>
                <strong style={{ color: 'var(--gray-700)' }}>Physician:</strong> {selectedAppt.doctor_name}
              </div>
              <div>
                <strong style={{ color: 'var(--gray-700)' }}>Department:</strong> {selectedAppt.department_name}
              </div>
              <div>
                <strong style={{ color: 'var(--gray-700)' }}>Scheduled Slot:</strong> {selectedAppt.scheduled_date} from {selectedAppt.start_time?.slice(0, 5)} to {selectedAppt.end_time?.slice(0, 5)}
              </div>
              {selectedAppt.reason && (
                <div>
                  <strong style={{ color: 'var(--gray-700)' }}>Reason for Visit:</strong>
                  <p style={{ margin: '0.25rem 0 0', color: 'var(--gray-600)', fontStyle: 'italic' }}>
                    "{selectedAppt.reason}"
                  </p>
                </div>
              )}
              {selectedAppt.cancellation_reason && (
                <div>
                  <strong style={{ color: 'var(--danger)' }}>Cancellation Note:</strong>
                  <p style={{ margin: '0.25rem 0 0', color: 'var(--danger)' }}>
                    "{selectedAppt.cancellation_reason}"
                  </p>
                </div>
              )}
              {selectedAppt.reschedule_reason && (
                <div>
                  <strong style={{ color: 'var(--warning)' }}>Reschedule Note:</strong>
                  <p style={{ margin: '0.25rem 0 0', color: 'var(--gray-700)' }}>
                    "{selectedAppt.reschedule_reason}"
                  </p>
                </div>
              )}
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setSelectedAppt(null)} className="btn btn-outline btn-sm">
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESCHEDULE MODAL */}
      {rescheduleModalAppt && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: 500, width: '100%', padding: '1.75rem', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
                Reschedule {rescheduleModalAppt.reference}
              </h3>
              <button type="button" onClick={() => setRescheduleModalAppt(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            {rescheduleError && (
              <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {rescheduleError}
              </div>
            )}

            <form onSubmit={handleConfirmReschedule} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div>
                <label className="form-label">Select Target Date *</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="form-control"
                  value={rescheduleDate}
                  onChange={(e) => handleDateChangeForReschedule(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label">Available Time Slots *</label>
                {loadingSlots ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>Querying available slots...</p>
                ) : availableSlots.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>No open slots on selected date.</p>
                ) : (
                  <select
                    required
                    className="form-control"
                    value={selectedSlotId}
                    onChange={(e) => setSelectedSlotId(e.target.value)}
                  >
                    <option value="">Choose a slot...</option>
                    {availableSlots.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.start_time?.slice(0, 5)} - {s.end_time?.slice(0, 5)}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="form-label">Reason for Rescheduling</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Physician timetable revision, patient request..."
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setRescheduleModalAppt(null)} className="btn btn-outline" disabled={rescheduling}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={rescheduling || !selectedSlotId}>
                  {rescheduling ? 'Rescheduling...' : 'Confirm Reschedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CANCELLATION MODAL */}
      {cancelModalAppt && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: 460, width: '100%', padding: '1.75rem', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--danger)' }}>
                Cancel Appointment
              </h3>
              <button type="button" onClick={() => setCancelModalAppt(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--gray-600)', marginBottom: '1rem' }}>
              Are you sure you want to cancel appointment <strong>{cancelModalAppt.reference}</strong> for {cancelModalAppt.patient_name}? The reserved slot will be freed.
            </p>

            {cancelError && (
              <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {cancelError}
              </div>
            )}

            <form onSubmit={handleConfirmCancel} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div>
                <label className="form-label">Mandatory Cancellation Reason *</label>
                <textarea
                  required
                  rows="3"
                  className="form-control"
                  placeholder="Clinical emergency, patient cancellation, schedule conflict..."
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setCancelModalAppt(null)} className="btn btn-outline" disabled={cancelling}>
                  Keep Appointment
                </button>
                <button type="submit" className="btn btn-danger" disabled={cancelling}>
                  {cancelling ? 'Cancelling...' : 'Cancel Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

