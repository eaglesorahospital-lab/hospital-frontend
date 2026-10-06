import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  User,
  Calendar,
  Clock,
  MapPin,
  Award,
  Video,
  Building,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { doctorsApi } from '../api/doctors';
import { schedulingApi } from '../api/scheduling';
import SlotSelector from '../components/scheduling/SlotSelector';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';

export default function DoctorProfile() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Availability Date & Slots State
  const [selectedDate, setSelectedDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const fetchDoctor = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await doctorsApi.getDoctorDetail(id);
      setDoctor(data);
    } catch (err) {
      setError(err.message || 'Could not find the requested doctor profile.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async (docId, dateStr) => {
    setSlotsLoading(true);
    setSlotsError(null);
    setSelectedSlot(null);
    try {
      const data = await schedulingApi.getDoctorAvailability(docId, dateStr);
      setSlots(data.slots || []);
    } catch (err) {
      setSlotsError(err.message || 'Could not retrieve slot availability for this date.');
    } finally {
      setSlotsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctor();
  }, [id]);

  useEffect(() => {
    if (doctor?.id && selectedDate) {
      fetchSlots(doctor.id, selectedDate);
    }
  }, [doctor?.id, selectedDate]);

  if (loading) {
    return <LoadingSpinner fullPage message="Loading physician credentials and profile..." />;
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '3rem 0' }}>
        <ErrorState title="Doctor Profile Not Found" message={error} onRetry={fetchDoctor} />
      </div>
    );
  }

  const departmentName = doctor.department_name || doctor.department?.name || 'Department';
  const isDoctorActive = doctor.status ? doctor.status === 'ACTIVE' : doctor.is_active !== false;

  return (
    <div style={{ padding: '3rem 0' }}>
      <div className="container">
        {/* Breadcrumb Navigation */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/doctors"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: 'var(--gray-600)',
              fontSize: '0.9rem',
              fontWeight: 500,
            }}
          >
            <ChevronLeft size={16} /> Back to Doctor Directory
          </Link>
        </div>

        {/* Profile Card Header */}
        <div
          className="card"
          style={{
            padding: '2.5rem',
            marginBottom: '2.5rem',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '2rem',
              alignItems: 'flex-start',
            }}
          >
            {/* Doctor Photo */}
            <div
              style={{
                width: '120px',
                height: '120px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              {doctor.photo ? (
                <img
                  src={doctor.photo}
                  alt={doctor.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <User size={64} />
              )}
            </div>

            {/* Profile Info */}
            <div style={{ flex: 1, minWidth: '280px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span className="badge badge-primary">{departmentName}</span>
                {isDoctorActive ? (
                  <span className="badge badge-success">
                    <ShieldCheck size={12} /> Active Practicing
                  </span>
                ) : (
                  <span className="badge badge-warning">
                    <ShieldCheck size={12} /> Inactive / On Leave
                  </span>
                )}
                <span className="badge badge-gray">
                  {doctor.consultation_type === 'BOTH'
                    ? 'In-Person & Video'
                    : doctor.consultation_type === 'ONLINE'
                    ? 'Telehealth Only'
                    : 'Clinic Only'}
                </span>
              </div>

              <h1 style={{ fontSize: '2.25rem', color: 'var(--gray-900)', margin: '0 0 0.35rem 0' }}>
                Dr. {doctor.name}
              </h1>

              <p style={{ fontSize: '1.05rem', color: 'var(--primary-hover)', fontWeight: 600, margin: '0 0 1rem 0' }}>
                {doctor.qualification}
              </p>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '1.5rem',
                  fontSize: '0.9rem',
                  color: 'var(--gray-600)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Award size={16} style={{ color: 'var(--primary)' }} />
                  <span><strong>{doctor.experience}</strong> Years Experience</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Clock size={16} style={{ color: 'var(--primary)' }} />
                  <span><strong>{doctor.consultation_duration}</strong> Mins Consultation</span>
                </div>
                {doctor.room && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={16} style={{ color: 'var(--primary)' }} />
                    <span>Clinic Room: <strong>{doctor.room}</strong></span>
                  </div>
                )}
              </div>
            </div>

            {/* Book Now Quick CTA */}
            <div>
              {isDoctorActive ? (
                <Link
                  to={`/booking?doctor=${doctor.id}`}
                  className="btn btn-primary btn-lg"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Calendar size={18} /> Book Appointment
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="btn btn-outline btn-lg"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.6, cursor: 'not-allowed' }}
                >
                  <Calendar size={18} /> Currently Unavailable
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Details & Interactive Availability Section */}
        <div className="grid-2" style={{ gap: '2.5rem', alignItems: 'flex-start' }}>
          {/* Biography & Clinical Expertise */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card">
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Clinical Expertise</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--gray-700)', lineHeight: 1.6 }}>
                {doctor.areas_of_expertise ||
                  'General and specialized consultation, diagnostics, prevention, and treatment protocols.'}
              </p>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Physician Biography</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--gray-600)', lineHeight: 1.7, margin: 0 }}>
                {doctor.bio ||
                  `Dr. ${doctor.name} is an experienced practitioner in the department of ${departmentName}. Committed to evidence-based healthcare, continuous patient monitoring, and collaborative clinical excellence.`}
              </p>
            </div>

            {doctor.schedules && doctor.schedules.length > 0 && (
              <div className="card">
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={18} style={{ color: 'var(--primary)' }} />
                  Weekly Consultation Timetable
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {doctor.schedules.map((sch) => (
                    <div
                      key={sch.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.5rem 0.75rem',
                        backgroundColor: 'var(--gray-50)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.875rem',
                      }}
                    >
                      <strong style={{ color: 'var(--gray-900)' }}>{sch.day_name}</strong>
                      <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                        {sch.start_time?.slice(0, 5)} - {sch.end_time?.slice(0, 5)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Real-Time Slot Inspector */}
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Check Availability</h3>
                <span style={{ fontSize: '0.825rem', color: 'var(--gray-500)' }}>
                  View real-time openings and reserve instantly
                </span>
              </div>
            </div>

            {!isDoctorActive ? (
              <div
                style={{
                  padding: '2rem 1.5rem',
                  backgroundColor: 'var(--gray-50)',
                  border: '1px dashed var(--gray-300)',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                  color: 'var(--gray-600)',
                }}
              >
                <div style={{ fontWeight: 600, color: 'var(--gray-800)', marginBottom: '0.5rem' }}>
                  Physician Currently Unavailable
                </div>
                <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.9rem' }}>
                  Dr. {doctor.name} is currently inactive or on leave and is not accepting appointment bookings at this time.
                </p>
                <Link to="/doctors" className="btn btn-outline btn-sm">
                  Find an Available Specialist
                </Link>
              </div>
            ) : (
              <>
                {/* Date Input */}
                <div className="form-group">
                  <label htmlFor="slot-date-picker" className="form-label">
                    Select Consultation Date:
                  </label>
                  <input
                    id="slot-date-picker"
                    type="date"
                    className="input"
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>

                {/* Slot Selector Component */}
                <div style={{ marginTop: '1.25rem' }}>
                  <SlotSelector
                    slots={slots}
                    selectedSlotId={selectedSlot?.id}
                    onSelectSlot={(slot) => setSelectedSlot(slot)}
                    loading={slotsLoading}
                    error={slotsError}
                    onRetry={() => fetchSlots(doctor.id, selectedDate)}
                  />
                </div>

                {/* Selected Slot Confirmation CTA */}
                {selectedSlot && (
                  <div
                    style={{
                      marginTop: '1.75rem',
                      padding: '1.25rem',
                      backgroundColor: 'var(--primary-50)',
                      border: '1px solid var(--primary-light)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--primary-dark)', fontWeight: 600 }}>
                      <CheckCircle2 size={18} /> Slot Selected: {selectedSlot.start_time} - {selectedSlot.end_time}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', marginBottom: '1rem' }}>
                      Date: {selectedDate} with Dr. {doctor.name}
                    </p>
                    <Link
                      to={`/booking?doctor=${doctor.id}&slot=${selectedSlot.id}&date=${selectedDate}`}
                      className="btn btn-primary"
                      style={{ width: '100%' }}
                    >
                      Proceed to Secure Booking <ChevronRight size={16} />
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

