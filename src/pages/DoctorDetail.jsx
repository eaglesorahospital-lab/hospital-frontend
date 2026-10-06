import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageHero from '../components/common/PageHero';
import {
  Stethoscope,
  Award,
  Clock,
  DollarSign,
  Calendar,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Building2,
  FileText,
  HeartPulse,
  BadgeCheck
} from 'lucide-react';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import { getDoctor } from '../services/api';
import { formatCurrency } from '../utils/formatters';

export default function DoctorDetail() {
  const { slug } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDoctor = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDoctor(slug);
      setDoctor(data);
    } catch (err) {
      setError('Physician profile not found or could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctor();
  }, [slug]);

  if (loading) {
    return (
      <div className="container section-padding">
        <LoadingState message="Loading doctor profile..." />
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="container section-padding">
        <ErrorState message={error || 'Profile not found'} onRetry={loadDoctor} />
      </div>
    );
  }

  const departmentName = doctor.department?.name || doctor.department_name || 'Specialist Medicine';
  const fullName = doctor.name?.startsWith('Dr.') ? doctor.name : `Dr. ${doctor.name}`;

  return (
    <div className="doctor-detail-page">
      <PageHero
        badge={departmentName}
        title={fullName}
        subtitle={`${doctor.specialization || 'Attending Physician'} • ${doctor.qualification || 'MBBS, MD'}`}
        breadcrumbs={[
          { label: 'Doctors', to: '/doctors' },
          { label: fullName },
        ]}
      />

      <section className="section-padding bg-light">
        <div className="container">
          <Link to="/doctors" className="back-link" style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 600 }}>
            <ArrowLeft size={16} /> Back to Doctor Directory
          </Link>

          <div className="doctor-profile-card">
            <div className="profile-header-grid">
              <div className="profile-avatar-box" aria-hidden="true">
                <Stethoscope size={56} className="profile-icon text-primary" />
              </div>

              <div className="profile-meta">
                <div className="profile-badge-row">
                  <span className="badge-pill">{departmentName}</span>
                  <span className="profile-verified-badge">
                    <BadgeCheck size={16} className="text-secondary" aria-hidden="true" />
                    <span>Verified Medical Faculty</span>
                  </span>
                </div>

                <h1 className="profile-doctor-name">{fullName}</h1>
                <p className="profile-specialty">{doctor.specialization || 'Attending Physician'}</p>

                <div className="profile-metrics-row">
                  <div className="metric-item">
                    <Award size={18} className="metric-icon text-secondary" aria-hidden="true" />
                    <span>{doctor.qualification || 'MBBS, MD'}</span>
                  </div>
                  <div className="metric-item">
                    <Clock size={18} className="metric-icon text-primary" aria-hidden="true" />
                    <span>
                      {doctor.experience_years
                        ? `${doctor.experience_years} Years Experience`
                        : 'Senior Consultant'}
                    </span>
                  </div>
                  <div className="metric-item">
                    <DollarSign size={18} className="metric-icon text-success" aria-hidden="true" />
                    <span>
                      Consultation: <strong>{formatCurrency(doctor.consultation_fee)}</strong>
                    </span>
                  </div>
                </div>
              </div>

              <div className="profile-actions-box">
                <Link
                  to={`/book-appointment?doctor=${doctor.id}`}
                  className="btn btn-primary btn-lg btn-block"
                >
                  <Calendar size={18} aria-hidden="true" />
                  <span>Book Appointment</span>
                </Link>
                <Link
                  to={`/availability?doctor=${doctor.id}`}
                  className="btn btn-outline btn-block"
                >
                  Check Slot Availability
                </Link>
              </div>
            </div>

            <div className="profile-bio-section">
              <h3>Clinical Biography & Credentials</h3>
              <p className="bio-text">
                {doctor.bio ||
                  `${fullName} is an accredited senior consultant at Metropolitan General Hospital, dedicated to providing evidence-based healthcare with multidisciplinary collaboration across specialized clinical departments.`}
              </p>

              <div className="credentials-highlights">
                <h4>Practice Credentials & Quality Standards:</h4>
                <div className="highlight-tags">
                  <span className="tag">
                    <ShieldCheck size={14} className="text-secondary" aria-hidden="true" />
                    <span>Medical Council Registered & Board Certified</span>
                  </span>
                  <span className="tag">
                    <CheckCircle2 size={14} className="text-secondary" aria-hidden="true" />
                    <span>Level 1 Hospital Attending Consultant</span>
                  </span>
                  <span className="tag">
                    <CheckCircle2 size={14} className="text-secondary" aria-hidden="true" />
                    <span>Outpatient & Inpatient Clinical Supervision</span>
                  </span>
                  <span className="tag">
                    <HeartPulse size={14} className="text-secondary" aria-hidden="true" />
                    <span>Multidisciplinary Review Panel Member</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
