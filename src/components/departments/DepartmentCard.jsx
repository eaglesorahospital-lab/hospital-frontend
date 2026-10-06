import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Clock, Phone, ChevronRight } from 'lucide-react';

export default function DepartmentCard({ department, onViewDetails }) {
  const servicesList = department.services
    ? department.services
        .split(/[,;\n]/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  return (
    <div
      className="card card-interactive"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary-dark)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Stethoscope size={22} />
        </div>
        <div style={{ flex: 1 }}>
          <h3
            style={{
              fontSize: '1.2rem',
              margin: 0,
              color: 'var(--gray-900)',
              cursor: onViewDetails ? 'pointer' : 'default',
            }}
            onClick={() => onViewDetails && onViewDetails(department)}
          >
            {department.name}
          </h3>
          <span className="badge badge-primary" style={{ marginTop: '0.2rem' }}>
            {department.is_active ? 'Active Specialty' : 'Consultation Paused'}
          </span>
        </div>
      </div>

      <p
        style={{
          fontSize: '0.9rem',
          color: 'var(--gray-600)',
          lineHeight: 1.5,
          marginBottom: '1rem',
          flexGrow: 1,
        }}
      >
        {department.description ||
          'Comprehensive diagnostic, surgical, and therapeutic medical services with board-certified physicians.'}
      </p>

      {/* Services pills */}
      {servicesList.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
          {servicesList.slice(0, 4).map((srv, idx) => (
            <span
              key={idx}
              style={{
                fontSize: '0.75rem',
                backgroundColor: 'var(--gray-100)',
                color: 'var(--gray-700)',
                padding: '0.2rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {srv}
            </span>
          ))}
          {servicesList.length > 4 && (
            <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', padding: '0.2rem' }}>
              +{servicesList.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Timings & Contact */}
      <div
        style={{
          fontSize: '0.825rem',
          color: 'var(--gray-500)',
          borderTop: '1px solid var(--gray-100)',
          paddingTop: '0.75rem',
          marginBottom: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem',
        }}
      >
        {(department.timings || department.clinic_timings) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Clock size={14} style={{ color: 'var(--primary)' }} />
            <span>{department.timings || department.clinic_timings}</span>
          </div>
        )}
        {(department.contact || department.contact_phone) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Phone size={14} style={{ color: 'var(--primary)' }} />
            <span>{department.contact || department.contact_phone}</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
        <Link
          to={`/doctors?department=${department.id}`}
          className="btn btn-outline btn-sm"
          style={{ flex: 1 }}
        >
          Specialists
        </Link>
        <Link
          to={`/booking?department=${department.id}`}
          className="btn btn-primary btn-sm"
          style={{ flex: 1 }}
        >
          Book <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}

