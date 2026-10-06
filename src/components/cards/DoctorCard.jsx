import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Award, DollarSign, Clock, Stethoscope, CheckCircle2, UserCheck } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export default function DoctorCard({ doctor }) {
  if (!doctor) return null;

  const departmentName = doctor.department?.name || doctor.department_name || 'Specialist Medicine';
  const fullName = doctor.name?.startsWith('Dr.') ? doctor.name : `Dr. ${doctor.name}`;

  return (
    <div className="doctor-card">
      <div className="doctor-card-header">
        <div className="doctor-avatar" aria-hidden="true">
          <Stethoscope size={28} className="doctor-avatar-icon" />
        </div>
        <div className="doctor-card-title-wrap">
          <span className="department-tag">{departmentName}</span>
          <h3 className="doctor-name">{fullName}</h3>
          <p className="doctor-specialization">{doctor.specialization || 'Attending Physician'}</p>
        </div>
      </div>

      <div className="doctor-card-body">
        {doctor.qualification && (
          <div className="doctor-detail-item">
            <Award size={15} className="detail-icon text-secondary" aria-hidden="true" />
            <span className="detail-text">{doctor.qualification}</span>
          </div>
        )}

        <div className="doctor-detail-item">
          <Clock size={15} className="detail-icon text-primary" aria-hidden="true" />
          <span className="detail-text">
            {doctor.experience_years
              ? `${doctor.experience_years} Years Clinical Exp.`
              : '10+ Years Experience'}
          </span>
        </div>

        <div className="doctor-detail-item">
          <DollarSign size={15} className="detail-icon text-success" aria-hidden="true" />
          <span className="detail-text">
            Consultation: <strong>{formatCurrency(doctor.consultation_fee)}</strong>
          </span>
        </div>

        {/* Real-time availability indicator badge */}
        <div className="doctor-availability-badge">
          <span className="avail-pulse" aria-hidden="true" />
          <span>Active Practice • Open Slots</span>
        </div>

        {doctor.bio && (
          <p className="doctor-bio-snippet">{doctor.bio.substring(0, 105)}...</p>
        )}
      </div>

      <div className="doctor-card-footer">
        <Link
          to={`/doctors/${doctor.id}`}
          className="btn btn-outline btn-sm doctor-profile-btn"
          aria-label={`View Profile of ${fullName}`}
        >
          Profile
        </Link>
        <Link
          to={`/book-appointment?doctor=${doctor.id}`}
          className="btn btn-primary btn-sm doctor-book-btn"
          aria-label={`Book Consultation with ${fullName}`}
        >
          <Calendar size={15} aria-hidden="true" />
          <span>Book Slot</span>
        </Link>
      </div>
    </div>
  );
}
