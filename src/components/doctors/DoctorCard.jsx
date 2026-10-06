import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Award,
  Video,
  Building,
  ChevronRight,
  User,
} from 'lucide-react';

export default function DoctorCard({ doctor }) {
  const departmentName = doctor.department_name || doctor.department?.name || 'Specialty';
  const isActive = doctor.status ? doctor.status === 'ACTIVE' : doctor.is_active !== false;

  const getConsultationBadge = (type) => {
    switch (type) {
      case 'ONLINE':
        return (
          <span className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <Video size={11} /> Video Call
          </span>
        );
      case 'BOTH':
        return (
          <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <Building size={11} /> In-Person & Telehealth
          </span>
        );
      case 'IN_PERSON':
      default:
        return (
          <span className="badge badge-gray" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <Building size={11} /> Hospital Clinic
          </span>
        );
    }
  };

  return (
    <div
      className="card card-interactive"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        {/* Doctor Avatar / Photo */}
        <div
          style={{
            width: '68px',
            height: '68px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            overflow: 'hidden',
          }}
        >
          {doctor.photo ? (
            <img
              src={doctor.photo}
              alt={doctor.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <User size={36} />
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.3rem' }}>
            <span className="badge badge-primary">{departmentName}</span>
            {getConsultationBadge(doctor.consultation_type)}
            {!isActive && <span className="badge badge-warning">Inactive</span>}
          </div>

          <h3
            style={{
              fontSize: '1.2rem',
              color: 'var(--gray-900)',
              margin: '0 0 0.2rem 0',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            Dr. {doctor.name}
          </h3>

          <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', margin: 0 }}>
            {doctor.qualification}
          </p>
        </div>
      </div>

      {/* Expertise & Bio Snippet */}
      <div style={{ flexGrow: 1, marginBottom: '1rem' }}>
        {(doctor.areas_of_expertise || doctor.expertise) && (
          <p style={{ fontSize: '0.85rem', color: 'var(--gray-700)', marginBottom: '0.5rem', lineHeight: 1.4 }}>
            <strong>Specialization:</strong> {doctor.areas_of_expertise || doctor.expertise}
          </p>
        )}
        <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', lineHeight: 1.5, margin: 0 }}>
          {doctor.bio
            ? doctor.bio.slice(0, 110) + (doctor.bio.length > 110 ? '...' : '')
            : 'Dedicated physician providing comprehensive clinical consultations, diagnosis, and patient-centered treatment plans.'}
        </p>
      </div>

      {/* Clinical Meta (Duration, Experience, Room) */}
      <div
        style={{
          borderTop: '1px solid var(--gray-100)',
          paddingTop: '0.75rem',
          marginBottom: '1rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '0.5rem',
          fontSize: '0.8rem',
          color: 'var(--gray-600)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Award size={14} style={{ color: 'var(--primary)' }} />
          <span>{doctor.experience ?? doctor.experience_years ?? 0} Yrs Experience</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Clock size={14} style={{ color: 'var(--primary)' }} />
          <span>{doctor.consultation_duration} mins / slot</span>
        </div>
        {doctor.room && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', gridColumn: 'span 2' }}>
            <MapPin size={14} style={{ color: 'var(--primary)' }} />
            <span>Clinic Room: {doctor.room}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
        <Link
          to={`/doctors/${doctor.id}`}
          className="btn btn-outline btn-sm"
          style={{ flex: 1 }}
        >
          Full Profile
        </Link>
        {isActive ? (
          <Link
            to={`/booking?doctor=${doctor.id}`}
            className="btn btn-primary btn-sm"
            style={{ flex: 1.2 }}
          >
            <Calendar size={14} /> Book <ChevronRight size={14} />
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="btn btn-outline btn-sm"
            style={{ flex: 1.2, opacity: 0.6, cursor: 'not-allowed' }}
            title="Specialist is not currently accepting bookings"
          >
            Unavailable
          </button>
        )}
      </div>
    </div>
  );
}

