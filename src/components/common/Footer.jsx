import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

export default function Footer({ hospital }) {
  return (
    <footer
      style={{
        backgroundColor: 'var(--gray-900)',
        color: 'var(--gray-300)',
        paddingTop: '4rem',
        paddingBottom: '2rem',
        marginTop: 'auto',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2.5rem',
            paddingBottom: '3rem',
            borderBottom: '1px solid var(--gray-800)',
          }}
        >
          {/* Hospital Overview */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Activity size={20} />
              </div>
              <h3 style={{ color: '#ffffff', fontSize: '1.2rem', margin: 0 }}>
                {hospital?.name || 'City Care Hospital'}
              </h3>
            </div>
            <p style={{ color: 'var(--gray-400)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              {hospital?.description ||
                'Delivering compassionate, technology-driven clinical excellence 24 hours a day, 7 days a week.'}
            </p>

            <div
              style={{
                backgroundColor: 'rgba(220, 38, 38, 0.15)',
                border: '1px solid rgba(220, 38, 38, 0.3)',
                padding: '0.85rem',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                <ShieldAlert size={16} /> 24/7 Trauma Emergency
              </div>
              <a
                href={`tel:${hospital?.emergency_phone || '911'}`}
                style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: 800, textDecoration: 'none' }}
              >
                {hospital?.emergency_phone || '+1 (800) 555-9111'}
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '1.25rem' }}>Quick Navigation</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <li>
                <Link to="/" style={{ color: 'var(--gray-300)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ArrowRight size={14} style={{ color: 'var(--primary)' }} /> Home Overview
                </Link>
              </li>
              <li>
                <Link to="/about" style={{ color: 'var(--gray-300)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ArrowRight size={14} style={{ color: 'var(--primary)' }} /> About & Facilities
                </Link>
              </li>
              <li>
                <Link to="/departments" style={{ color: 'var(--gray-300)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ArrowRight size={14} style={{ color: 'var(--primary)' }} /> Clinical Departments
                </Link>
              </li>
              <li>
                <Link to="/doctors" style={{ color: 'var(--gray-300)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ArrowRight size={14} style={{ color: 'var(--primary)' }} /> Find a Doctor
                </Link>
              </li>
              <li>
                <Link to="/booking" style={{ color: 'var(--gray-300)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ArrowRight size={14} style={{ color: 'var(--primary)' }} /> Book Consultation
                </Link>
              </li>
            </ul>
          </div>

          {/* Visiting Hours & Policies */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={16} style={{ color: 'var(--primary)' }} /> Visiting Hours
            </h4>
            <div style={{ color: 'var(--gray-400)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              {hospital?.visiting_hours || (
                <>
                  <p style={{ marginBottom: '0.5rem' }}>
                    <strong style={{ color: '#ffffff' }}>General Wards:</strong>
                    <br />
                    10:00 AM - 1:00 PM & 4:00 PM - 8:00 PM daily
                  </p>
                  <p>
                    <strong style={{ color: '#ffffff' }}>Intensive Care Unit (ICU):</strong>
                    <br />
                    11:00 AM - 12:00 PM (1 visitor per patient)
                  </p>
                </>
              )}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
              Children under 12 are restricted in critical care zones.
            </p>
          </div>

          {/* Contact Details */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '1.25rem' }}>Campus & Contact</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem', color: 'var(--gray-300)' }}>
              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <MapPin size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                <span>{hospital?.address || '100 Health Avenue, Medical District'}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                <Phone size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <a href={`tel:${hospital?.phone || '8005552273'}`} style={{ color: 'var(--gray-300)' }}>
                  {hospital?.phone || '+1 (800) 555-CARE'}
                </a>
              </div>
              <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                <Mail size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <a href={`mailto:${hospital?.email || 'contact@citycarehospital.org'}`} style={{ color: 'var(--gray-300)' }}>
                  {hospital?.email || 'contact@citycarehospital.org'}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright & Disclaimer */}
        <div
          style={{
            paddingTop: '2rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            fontSize: '0.85rem',
            color: 'var(--gray-500)',
          }}
        >
          <p style={{ margin: 0, color: 'var(--gray-500)' }}>
            © {new Date().getFullYear()} {hospital?.name || 'City Care Hospital'}. All rights reserved. Hospital Management & Appointment Platform.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link to="/contact" style={{ color: 'var(--gray-500)' }}>Patient Rights</Link>
            <Link to="/about" style={{ color: 'var(--gray-500)' }}>Clinical Governance</Link>
            <Link to="/contact" style={{ color: 'var(--gray-500)' }}>Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

