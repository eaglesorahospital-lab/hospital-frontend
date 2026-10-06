import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import {
  CheckCircle2,
  Calendar,
  Clock,
  User,
  MapPin,
  FileText,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export default function BookingResult() {
  const location = useLocation();
  const state = location.state || {};
  const { appointment, doctor, slot } = state;

  if (!appointment) {
    return <Navigate to="/booking" replace />;
  }

  const doctorName =
    appointment.doctor_name_snapshot || doctor?.name || (appointment.doctor?.name ? `Dr. ${appointment.doctor.name}` : 'Physician');
  const departmentName =
    appointment.department_name_snapshot || doctor?.department_name || 'Medical Department';

  return (
    <div style={{ padding: '3.5rem 0' }}>
      <div className="container" style={{ maxWidth: '680px' }}>
        {/* Success Card Header */}
        <div
          className="card"
          style={{
            padding: '3rem 2rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-lg)',
            borderTop: '6px solid var(--success)',
            marginBottom: '2rem',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--success-light)',
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <CheckCircle2 size={36} />
          </div>

          <span className="badge badge-success" style={{ marginBottom: '0.75rem' }}>
            Confirmed & Registered
          </span>

          <h1 style={{ fontSize: '2rem', color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
            Appointment Successfully Booked!
          </h1>

          <p style={{ color: 'var(--gray-600)', fontSize: '1rem', marginBottom: '2rem' }}>
            Your consultation slot is locked in the hospital database. A confirmation email and notification have been sent.
          </p>

          {/* Appointment Reference Pill */}
          <div
            style={{
              backgroundColor: 'var(--gray-50)',
              border: '1px dashed var(--primary)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              display: 'inline-flex',
              flexDirection: 'column',
              gap: '0.35rem',
              minWidth: '280px',
              marginBottom: '2rem',
            }}
          >
            <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Booking Reference Code
            </span>
            <strong style={{ fontSize: '1.4rem', color: 'var(--primary-dark)', letterSpacing: '0.04em' }}>
              {appointment.reference}
            </strong>
          </div>

          {/* Summary Details Table */}
          <div
            style={{
              textAlign: 'left',
              borderTop: '1px solid var(--gray-200)',
              paddingTop: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              fontSize: '0.95rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--gray-100)', paddingBottom: '0.65rem' }}>
              <span style={{ color: 'var(--gray-500)' }}>Physician:</span>
              <strong style={{ color: 'var(--gray-900)' }}>{doctorName}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--gray-100)', paddingBottom: '0.65rem' }}>
              <span style={{ color: 'var(--gray-500)' }}>Specialty:</span>
              <span style={{ color: 'var(--gray-900)' }}>{departmentName}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--gray-100)', paddingBottom: '0.65rem' }}>
              <span style={{ color: 'var(--gray-500)' }}>Consultation Date:</span>
              <strong style={{ color: 'var(--gray-900)' }}>{appointment.scheduled_date}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--gray-100)', paddingBottom: '0.65rem' }}>
              <span style={{ color: 'var(--gray-500)' }}>Scheduled Time:</span>
              <strong style={{ color: 'var(--primary-hover)' }}>
                {appointment.start_time} - {appointment.end_time}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--gray-500)' }}>Status:</span>
              <span className="badge badge-success">{appointment.status}</span>
            </div>
          </div>
        </div>

        {/* Important Next Steps Guidance */}
        <div
          className="card"
          style={{
            padding: '1.75rem',
            marginBottom: '2rem',
            backgroundColor: 'var(--surface)',
          }}
        >
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={20} style={{ color: 'var(--primary)' }} /> Next Steps for Your Visit
          </h3>

          <ul style={{ paddingLeft: '1.25rem', color: 'var(--gray-600)', fontSize: '0.9rem', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>Please arrive 15 minutes prior to your scheduled time for check-in and registration verification.</li>
            <li>Carry your medical identification or insurance card and any relevant prior lab reports.</li>
            <li>If you need to cancel or reschedule, you can do so through the <strong>My Appointments</strong> portal.</li>
          </ul>
        </div>

        {/* Navigation Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/my-appointments" className="btn btn-primary" style={{ flex: 1 }}>
            View My Appointments <ArrowRight size={16} />
          </Link>
          <Link to="/" className="btn btn-outline" style={{ flex: 1 }}>
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

