import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../components/common/PageHero';
import {
  ShieldCheck,
  Heart,
  Award,
  Users,
  CheckCircle2,
  Calendar,
  Sparkles,
  Building2,
  Activity,
  ArrowRight,
  HeartPulse
} from 'lucide-react';
import { getHospitalInfo } from '../services/api';
import hospitalCampusImg from '../assets/hospital-campus.jpg';
import hospitalConsultationImg from '../assets/hospital-consultation.jpg';

export default function About() {
  const [hospitalInfo, setHospitalInfo] = useState(null);

  useEffect(() => {
    getHospitalInfo()
      .then((data) => setHospitalInfo(data))
      .catch(() => {});
  }, []);

  const hospitalName = hospitalInfo?.name || 'Metropolitan General Hospital';
  const tagline = hospitalInfo?.tagline || 'Advanced Medicine, Trusted Compassion';
  const mission =
    hospitalInfo?.mission ||
    'To deliver patient-centered, technologically advanced, and ethical medical care to all individuals, ensuring dignity, safety, and optimal clinical outcomes.';
  const vision =
    hospitalInfo?.vision ||
    'To be the benchmark for tertiary healthcare and biomedical research, recognized regionally and globally for clinical excellence, patient trust, and professional integrity.';
  const description =
    hospitalInfo?.description ||
    'Metropolitan General Hospital is a premier multidisciplinary healthcare destination offering comprehensive medical specialities, sub-specialty clinics, Level 1 emergency trauma care, and intensive therapy units.';

  return (
    <div className="about-page">
      <PageHero
        badge="Institutional Overview"
        title={`About ${hospitalName}`}
        subtitle={tagline}
        breadcrumbs={[{ label: 'About Us' }]}
        actions={
          <Link to="/book-appointment" className="btn btn-primary">
            <Calendar size={18} aria-hidden="true" />
            <span>Book a Consultation</span>
          </Link>
        }
      />

      {/* Main Split Showcase */}
      <section className="section-padding bg-white">
        <div className="container">
          <div className="about-hospital-grid">
            <div className="about-visual-col">
              <div className="about-image-frame">
                <img
                  src={hospitalCampusImg}
                  alt="Metropolitan General Hospital Medical Campus"
                  className="about-main-img"
                  loading="lazy"
                />
                <div className="about-badge-card">
                  <div className="badge-icon-box" aria-hidden="true">
                    <Award size={26} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="badge-number">25+ Years</h4>
                    <p className="badge-text">Clinical Excellence & Research</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="about-text-col">
              <span className="badge-pill">Our Legacy & Purpose</span>
              <h2 className="section-title">Dedication to Compassionate Clinical Care</h2>
              <p className="about-lead">{tagline}</p>
              <p className="about-paragraph">{description}</p>

              <div className="about-pillars-grid">
                <div className="pillar-item">
                  <div className="pillar-icon-box" aria-hidden="true">
                    <Heart size={22} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="pillar-title">Our Mission</h4>
                    <p className="pillar-desc">{mission}</p>
                  </div>
                </div>

                <div className="pillar-item">
                  <div className="pillar-icon-box" aria-hidden="true">
                    <Sparkles size={22} className="text-secondary" />
                  </div>
                  <div>
                    <h4 className="pillar-title">Our Vision</h4>
                    <p className="pillar-desc">{vision}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Institutional Pillars */}
      <section className="section-padding bg-light">
        <div className="container">
          <div className="section-heading-wrapper text-center">
            <span className="badge-pill">Our Philosophy</span>
            <h2 className="section-title">Guiding Clinical Principles</h2>
            <p className="section-subtitle">
              Every diagnostic procedure, surgical intervention, and patient interaction is grounded in our commitments.
            </p>
          </div>

          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon-box bg-blue-subtle" aria-hidden="true">
                <Users size={24} className="text-primary" />
              </div>
              <h3 className="benefit-title">Multidisciplinary Tumor & Case Boards</h3>
              <p className="benefit-text">
                Complex patient conditions are collaboratively reviewed by panels of surgeons, radiologists, and pathologists for optimal therapeutic plans.
              </p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon-box bg-teal-subtle" aria-hidden="true">
                <ShieldCheck size={24} className="text-secondary" />
              </div>
              <h3 className="benefit-title">Zero-Infection Safety Protocols</h3>
              <p className="benefit-text">
                Strict adherence to international hygiene and clinical sterilization standards across laminar-airflow operating suites and intensive wards.
              </p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon-box bg-emerald-subtle" aria-hidden="true">
                <HeartPulse size={24} className="text-success" />
              </div>
              <h3 className="benefit-title">Transparent & Ethical Practice</h3>
              <p className="benefit-text">
                Full transparency in patient counseling, diagnosis verification, and consultation pricing with no institutional markups.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quality Accreditations & Compliance Strip */}
      <section className="section-padding bg-white">
        <div className="container">
          <div className="accreditation-box">
            <div className="acc-left">
              <ShieldCheck size={48} className="acc-icon text-secondary" aria-hidden="true" />
              <div>
                <h3>Quality Accreditations & Compliance</h3>
                <p>
                  National and international healthcare quality certifications affirming our evidence-based, zero-tolerance safety standards.
                </p>
              </div>
            </div>
            <div className="acc-list">
              <div className="acc-item">
                <CheckCircle2 size={18} className="text-success" aria-hidden="true" />
                <span>NABH Hospital Accreditation</span>
              </div>
              <div className="acc-item">
                <CheckCircle2 size={18} className="text-success" aria-hidden="true" />
                <span>JCI International Healthcare Standard</span>
              </div>
              <div className="acc-item">
                <CheckCircle2 size={18} className="text-success" aria-hidden="true" />
                <span>ISO 9001:2015 Clinical Pathology Certified</span>
              </div>
              <div className="acc-item">
                <CheckCircle2 size={18} className="text-success" aria-hidden="true" />
                <span>Level 1 Emergency & Trauma Care Facility</span>
              </div>
            </div>
          </div>

          <div className="about-actions-row text-center" style={{ marginTop: '2.5rem', justifyContent: 'center' }}>
            <Link to="/departments" className="btn btn-primary btn-lg">
              <span>Explore Clinical Departments</span>
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link to="/contact" className="btn btn-outline btn-lg">
              <span>Contact Administration</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
