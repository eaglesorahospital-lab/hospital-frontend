import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import PageHero from '../components/common/PageHero';
import Button from '../components/common/Button';
import LoadingState from '../components/common/LoadingState';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  LogIn,
  DollarSign,
  Building2,
  FileText
} from 'lucide-react';
import {
  getDepartments,
  getDoctors,
  getDoctorAvailability,
  bookAppointment,
  getCurrentUser,
  getAuthToken
} from '../services/api';
import { formatTime, formatDate, formatCurrency } from '../utils/formatters';

export default function BookAppointment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Selection states
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);

  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState(searchParams.get('doctor') || '');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState(searchParams.get('date') || defaultDate);
  const [selectedSlotId, setSelectedSlotId] = useState(searchParams.get('slot') || '');

  // Patient form states
  const currentUser = getCurrentUser();
  const [patientName, setPatientName] = useState(currentUser?.name || currentUser?.username || '');
  const [patientEmail, setPatientEmail] = useState(currentUser?.email || '');
  const [patientPhone, setPatientPhone] = useState('');
  const [visitReason, setVisitReason] = useState('General consultation and clinical assessment');
  const [notes, setNotes] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Load initial departments and doctors
  useEffect(() => {
    async function loadData() {
      try {
        const [deptList, docList] = await Promise.all([
          getDepartments(),
          getDoctors()
        ]);
        setDepartments(deptList);
        setDoctors(docList);

        if (searchParams.get('doctor')) {
          const doc = docList.find(d => String(d.id) === searchParams.get('doctor'));
          if (doc?.department?.id) {
            setSelectedDeptId(String(doc.department.id));
          }
        }
      } catch (err) {
        setErrorMessage('Failed to load clinic departments or doctors.');
      }
    }
    loadData();
  }, []);

  // 2. Fetch slots when doctor or date changes
  useEffect(() => {
    if (!selectedDoctorId || !selectedDate) {
      setSlots([]);
      return;
    }

    async function loadSlots() {
      try {
        setSlotsLoading(true);
        const data = await getDoctorAvailability(selectedDoctorId, selectedDate);
        setSlots(data.filter(s => s.status === 'AVAILABLE' || !s.status));
      } catch (err) {
        console.warn('Slot load error:', err);
      } finally {
        setSlotsLoading(false);
      }
    }

    loadSlots();
  }, [selectedDoctorId, selectedDate]);

  // Handle department filter
  const filteredDoctors = selectedDeptId
    ? doctors.filter(d => String(d.department?.id || d.department) === String(selectedDeptId))
    : doctors;

  const chosenDoctor = doctors.find(d => String(d.id) === String(selectedDoctorId));
  const chosenSlot = slots.find(s => String(s.id) === String(selectedSlotId));

  // Handle booking submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!selectedDoctorId) {
      setErrorMessage('Please select a specialist doctor.');
      return;
    }
    if (!selectedSlotId) {
      setErrorMessage('Please select an available consultation slot.');
      return;
    }
    if (!patientName.trim()) {
      setErrorMessage('Please enter the patient full name.');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        doctor: Number(selectedDoctorId),
        doctor_id: Number(selectedDoctorId),
        slot: Number(selectedSlotId),
        slot_id: Number(selectedSlotId),
        scheduled_date: selectedDate,
        reason: visitReason,
        notes: notes,
        patient_name: patientName,
        patient_email: patientEmail,
        patient_phone: patientPhone,
        idempotency_key: `booking-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      };

      const result = await bookAppointment(payload);

      // Navigate to confirmation page
      navigate('/appointment-result', {
        state: {
          appointment: result,
          doctor: chosenDoctor,
          slot: chosenSlot,
          date: selectedDate,
          patientName
        }
      });
    } catch (err) {
      console.error('Booking submission failed:', err);
      if (err.status === 401 || err.message?.includes('Authentication credentials') || err.message?.includes('not provided')) {
        setErrorMessage('Authentication required: Please sign in to your patient account to book an appointment.');
      } else if (err.status === 409 || err.message?.includes('already booked')) {
        setErrorMessage('This time slot was just booked by another patient. Please pick another available slot.');
      } else {
        setErrorMessage(err.message || 'Unable to book consultation. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = Boolean(currentUser || getAuthToken());

  return (
    <div className="book-appointment-page">
      <PageHero
        badge="Direct Reservation"
        title="Book a Medical Consultation"
        subtitle="Fast, verified outpatient scheduling with instant digital confirmation and double-booking concurrency protection."
        breadcrumbs={[{ label: 'Book Appointment' }]}
      />

      <section className="section-padding bg-light">
        <div className="container">
          {/* Step Progress Indicators */}
          <div className="booking-steps-bar" role="progressbar" aria-valuenow="3" aria-valuemin="1" aria-valuemax="4">
            <div className={`step-item ${selectedDoctorId ? 'completed' : 'active'}`}>
              <div className="step-num">1</div>
              <div className="step-label">Specialist</div>
            </div>
            <div className={`step-item ${selectedDate && selectedSlotId ? 'completed' : selectedDoctorId ? 'active' : ''}`}>
              <div className="step-num">2</div>
              <div className="step-label">Date & Slot</div>
            </div>
            <div className={`step-item ${patientName ? 'completed' : selectedSlotId ? 'active' : ''}`}>
              <div className="step-num">3</div>
              <div className="step-label">Patient Details</div>
            </div>
            <div className="step-item">
              <div className="step-num">4</div>
              <div className="step-label">Confirmation</div>
            </div>
          </div>

          <div className="booking-layout-grid">
            {/* Left: Main Form */}
            <div className="booking-form-col">
              <div className="booking-card">
                {!isAuthenticated && (
                  <div className="alert alert-info" role="status" style={{ marginBottom: '1.5rem' }}>
                    <LogIn size={18} aria-hidden="true" />
                    <div>
                      <strong>Have an existing patient account?</strong>
                      <p>
                        <Link to="/login" className="text-primary font-bold">Sign in</Link> to pre-fill your medical record details and view consultation history.
                      </p>
                    </div>
                  </div>
                )}

                {errorMessage && (
                  <div className="alert alert-danger" role="alert" style={{ marginBottom: '1.5rem' }}>
                    <AlertCircle size={18} aria-hidden="true" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="booking-form">
                  {/* Step 1: Doctor & Department Selection */}
                  <div className="form-section-block">
                    <h3 className="section-block-title">
                      <Stethoscope size={18} className="text-primary" aria-hidden="true" />
                      <span>Step 1: Choose Department & Specialist</span>
                    </h3>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Clinical Specialty / Department:</label>
                        <select
                          className="form-input form-select"
                          value={selectedDeptId}
                          onChange={(e) => {
                            setSelectedDeptId(e.target.value);
                            setSelectedDoctorId('');
                            setSelectedSlotId('');
                          }}
                          aria-label="Filter by department"
                        >
                          <option value="">All Clinical Departments</option>
                          {departments.map((d) => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Consulting Specialist: *</label>
                        <select
                          className="form-input form-select"
                          value={selectedDoctorId}
                          onChange={(e) => {
                            setSelectedDoctorId(e.target.value);
                            setSelectedSlotId('');
                          }}
                          required
                          aria-label="Select Consulting Specialist"
                        >
                          <option value="">Select a physician...</option>
                          {filteredDoctors.map((doc) => (
                            <option key={doc.id} value={doc.id}>
                              {doc.name.startsWith('Dr.') ? doc.name : `Dr. ${doc.name}`} (
                              {doc.department?.name || doc.department_name || 'Specialist'})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Date & Available Slots */}
                  <div className="form-section-block">
                    <h3 className="section-block-title">
                      <Calendar size={18} className="text-secondary" aria-hidden="true" />
                      <span>Step 2: Consultation Date & Available Time Slot</span>
                    </h3>

                    <div className="form-group">
                      <label className="form-label">Consultation Date: *</label>
                      <input
                        type="date"
                        className="form-input"
                        value={selectedDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => {
                          setSelectedDate(e.target.value);
                          setSelectedSlotId('');
                        }}
                        required
                        aria-label="Consultation Date"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Select Open Consultation Slot: *</label>
                      {slotsLoading ? (
                        <LoadingState message="Checking specialist roster..." />
                      ) : !selectedDoctorId ? (
                        <p className="field-hint">Please select a specialist above to inspect available consultation slots.</p>
                      ) : slots.length === 0 ? (
                        <div className="empty-slots-box">
                          <Clock size={20} className="text-warning" aria-hidden="true" />
                          <span>No open slots for this physician on {formatDate(selectedDate)}. Please choose another date.</span>
                        </div>
                      ) : (
                        <div className="slots-radio-grid">
                          {slots.map((slot) => {
                            const isSelected = String(slot.id) === String(selectedSlotId);
                            return (
                              <button
                                key={slot.id}
                                type="button"
                                className={`slot-select-btn ${isSelected ? 'active' : ''}`}
                                onClick={() => setSelectedSlotId(String(slot.id))}
                                aria-pressed={isSelected}
                              >
                                <Clock size={14} aria-hidden="true" />
                                <span>{formatTime(slot.start_time)} – {formatTime(slot.end_time)}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 3: Patient Information */}
                  <div className="form-section-block">
                    <h3 className="section-block-title">
                      <User size={18} className="text-accent" aria-hidden="true" />
                      <span>Step 3: Patient Details</span>
                    </h3>

                    <div className="form-group">
                      <label className="form-label">Patient Full Name: *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. John Doe"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        required
                        aria-label="Patient Full Name"
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Email Address:</label>
                        <input
                          type="email"
                          className="form-input"
                          placeholder="e.g. patient@example.com"
                          value={patientEmail}
                          onChange={(e) => setPatientEmail(e.target.value)}
                          aria-label="Email Address"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Phone Number:</label>
                        <input
                          type="tel"
                          className="form-input"
                          placeholder="e.g. +1 (555) 019-2831"
                          value={patientPhone}
                          onChange={(e) => setPatientPhone(e.target.value)}
                          aria-label="Phone Number"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Reason for Consultation:</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Annual cardiology checkup, routine evaluation..."
                        value={visitReason}
                        onChange={(e) => setVisitReason(e.target.value)}
                        aria-label="Reason for Consultation"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Clinical Notes / Prior History (Optional):</label>
                      <textarea
                        className="form-input form-textarea"
                        rows={3}
                        placeholder="List relevant allergies, current medications, or previous surgeries..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        aria-label="Clinical Notes"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="booking-submit-wrap">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="btn-block"
                      loading={loading}
                      disabled={loading || !selectedDoctorId || !selectedSlotId || !patientName}
                    >
                      <CheckCircle2 size={18} aria-hidden="true" />
                      <span>Confirm & Book Appointment</span>
                    </Button>
                    <p className="submit-hint">
                      <ShieldCheck size={14} className="text-secondary" aria-hidden="true" />
                      <span>Zero double-booking guarantee • Concurrency protected database reservation</span>
                    </p>
                  </div>
                </form>
              </div>
            </div>

            {/* Right: Booking Summary Card */}
            <aside className="booking-summary-col">
              <div className="summary-card">
                <h3 className="summary-card-title">Consultation Summary</h3>

                <div className="summary-item">
                  <span className="summary-label">Attending Specialist:</span>
                  <strong className="summary-val">
                    {chosenDoctor
                      ? (chosenDoctor.name?.startsWith('Dr.') ? chosenDoctor.name : `Dr. ${chosenDoctor.name}`)
                      : 'None selected'}
                  </strong>
                  {chosenDoctor && (
                    <span className="summary-sub">
                      {chosenDoctor.department?.name || chosenDoctor.department_name || chosenDoctor.specialization}
                    </span>
                  )}
                </div>

                <div className="summary-item">
                  <span className="summary-label">Scheduled Date:</span>
                  <strong className="summary-val">{formatDate(selectedDate)}</strong>
                </div>

                <div className="summary-item">
                  <span className="summary-label">Consultation Slot:</span>
                  <strong className="summary-val text-primary">
                    {chosenSlot
                      ? `${formatTime(chosenSlot.start_time)} – ${formatTime(chosenSlot.end_time)}`
                      : 'None selected'}
                  </strong>
                </div>

                {chosenDoctor && (
                  <div className="summary-item">
                    <span className="summary-label">Consultation Fee:</span>
                    <strong className="summary-val text-success">
                      {formatCurrency(chosenDoctor.consultation_fee)}
                    </strong>
                    <span className="summary-sub">Inclusive of clinical examination</span>
                  </div>
                )}

                <div className="summary-guarantee-box">
                  <ShieldCheck size={20} className="text-secondary" aria-hidden="true" />
                  <div>
                    <strong>Immediate Reservation</strong>
                    <p>Your appointment slot is locked directly into the clinical ledger upon confirmation.</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
