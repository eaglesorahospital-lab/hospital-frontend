import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import PageHero from '../components/common/PageHero';
import {
  CheckCircle2,
  Calendar,
  Clock,
  Stethoscope,
  ArrowRight,
  Printer,
  ShieldCheck,
  User,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { formatDate, formatTime } from '../utils/formatters';

export default function AppointmentResult() {
  const location = useLocation();
  const state = location.state || {};
  const appointment = state.appointment || {};
  const doctor = state.doctor || {};
  const slot = state.slot || {};

  const referenceNumber = appointment.reference || appointment.id || 'APT-CONFIRMED';
  const doctorName = doctor.name || appointment.doctor_name || 'Senior Specialist';
  const deptName = doctor.department?.name || appointment.department_name || 'Clinical Care';

  return (
    <div className="result-page">
      <PageHero
        badge="Booking Successful"
        title="Consultation Confirmed"
        subtitle="Your appointment has been registered in the hospital ledger. Please retain your reference number."
        breadcrumbs={[
          { label: 'Book Appointment', to: '/book-appointment' },
          { label: 'Confirmation' },
        ]}
      />

      <section className="section-padding bg-light">
        <div className="container max-w-lg">
          <div className="result-card">
            <div className="result-icon-wrap" aria-hidden="true">
              <CheckCircle2 size={56} className="result-icon text-success" />
            </div>

            <span className="badge-pill">Appointment Confirmed</span>
            <h2 className="result-title">Consultation Successfully Scheduled</h2>
            <p className="result-desc">
              Your consultation has been confirmed at Metropolitan General Hospital. A digital receipt and confirmation summary have been generated below.
            </p>

            <div className="reference-box">
              <span className="reference-label">Appointment Reference Number</span>
              <strong className="reference-code">{referenceNumber}</strong>
            </div>

            <div className="confirmation-details-list">
              <div className="detail-row">
                <span className="detail-label">
                  <Stethoscope size={16} aria-hidden="true" />
                  <span>Consulting Specialist:</span>
                </span>
                <span className="detail-val font-bold">
                  {doctorName.startsWith('Dr.') ? doctorName : `Dr. ${doctorName}`} ({deptName})
                </span>
              </div>

              <div className="detail-row">
                <span className="detail-label">
                  <Calendar size={16} aria-hidden="true" />
                  <span>Scheduled Date:</span>
                </span>
                <span className="detail-val">
                  {formatDate(state.date || appointment.scheduled_date)}
                </span>
              </div>

              <div className="detail-row">
                <span className="detail-label">
                  <Clock size={16} aria-hidden="true" />
                  <span>Consultation Time:</span>
                </span>
                <span className="detail-val font-bold text-primary">
                  {formatTime(slot.start_time || appointment.start_time)}
                </span>
              </div>

              <div className="detail-row">
                <span className="detail-label">
                  <MapPin size={16} aria-hidden="true" />
                  <span>Clinical Location:</span>
                </span>
                <span className="detail-val">
                  Tower B, Outpatient Specialist Suites, Gate 2
                </span>
              </div>
            </div>

            <div className="instructions-box">
              <h4>Important Patient Instructions:</h4>
              <ul>
                <li>Please arrive at the clinic check-in counter 15 minutes before your scheduled consultation.</li>
                <li>Present your Appointment Reference Number at the outpatient reception desk.</li>
                <li>Bring your previous diagnostic reports, imaging scans, and prescription lists.</li>
              </ul>
            </div>

            <div className="result-actions">
              <button
                type="button"
                onClick={() => window.print()}
                className="btn btn-outline"
                aria-label="Print Confirmation"
              >
                <Printer size={16} aria-hidden="true" />
                <span>Print Confirmation</span>
              </button>
              <Link to="/my-appointments" className="btn btn-primary">
                <span>View My Appointments</span>
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
