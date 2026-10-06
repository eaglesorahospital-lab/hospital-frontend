import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Activity,
  Calendar,
  User as UserIcon,
  LogOut,
  LogIn,
  Menu,
  X,
  PhoneCall,
  Clock,
  ShieldAlert,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ hospital }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const isAdminRole = user?.role && ['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'STAFF', 'DOCTOR'].includes(user.role);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinkStyle = ({ isActive }) => ({
    padding: '0.5rem 0.85rem',
    fontWeight: 600,
    fontSize: '0.95rem',
    color: isActive ? 'var(--primary)' : 'var(--gray-700)',
    borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
    transition: 'all var(--transition-fast)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  });

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 900, backgroundColor: 'var(--surface)' }}>
      {/* 24/7 Emergency & Hotline Top Strip */}
      <div className="emergency-banner" role="banner">
        <ShieldAlert size={18} aria-hidden="true" />
        <span>
          <strong>24/7 Emergency Hotline:</strong>{' '}
          <a href={`tel:${hospital?.emergency_phone || '911'}`}>
            {hospital?.emergency_phone || '+1 (800) 555-9111'}
          </a>
        </span>
        <span style={{ opacity: 0.7 }}>|</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <Clock size={15} aria-hidden="true" /> Urgent Trauma & Cardiac Care Available
        </span>
      </div>

      {/* Main Navigation Bar */}
      <div
        style={{
          borderBottom: '1px solid var(--gray-200)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '72px',
          }}
        >
          {/* Brand Logo */}
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              color: 'var(--gray-900)',
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <Activity size={24} />
            </div>
            <div>
              <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', display: 'block', lineHeight: 1.1 }}>
                {hospital?.name || 'City Care Hospital'}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 500 }}>
                {hospital?.tagline || 'Excellence in Healthcare'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '0.5rem',
            }}
            className="desktop-nav"
          >
            <NavLink to="/" style={navLinkStyle}>Home</NavLink>
            <NavLink to="/about" style={navLinkStyle}>About</NavLink>
            <NavLink to="/departments" style={navLinkStyle}>Departments</NavLink>
            <NavLink to="/doctors" style={navLinkStyle}>Doctors</NavLink>
            <NavLink to="/contact" style={navLinkStyle}>Contact</NavLink>

            {isAuthenticated && (
              <NavLink to="/my-appointments" style={navLinkStyle}>
                <Calendar size={17} />
                My Appointments
              </NavLink>
            )}

            {isAdminRole && (
              <NavLink to="/admin" style={navLinkStyle}>
                <Shield size={17} />
                Admin Portal
              </NavLink>
            )}
          </nav>

          {/* Auth Actions & Quick Booking */}
          <div
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '0.75rem',
            }}
            className="desktop-actions"
          >
            <Link to="/booking" className="btn btn-primary btn-sm">
              <Calendar size={16} /> Book Appointment
            </Link>

            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span
                  className="badge badge-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <UserIcon size={13} />
                  {user?.first_name || user?.username || 'Patient'}
                  {user?.role && user.role !== 'PATIENT' && (
                    <span style={{ opacity: 0.85, fontSize: '0.7rem' }}>
                      ({user.role.replace('_', ' ')})
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-outline btn-sm"
                  title="Sign out of portal"
                >
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn btn-outline btn-sm">
                <LogIn size={15} /> Patient Portal
              </Link>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            className="mobile-trigger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--gray-700)',
              padding: '0.5rem',
            }}
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            style={{
              backgroundColor: 'var(--surface)',
              borderTop: '1px solid var(--gray-200)',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <NavLink to="/" onClick={() => setMobileMenuOpen(false)} style={navLinkStyle}>Home</NavLink>
            <NavLink to="/about" onClick={() => setMobileMenuOpen(false)} style={navLinkStyle}>About</NavLink>
            <NavLink to="/departments" onClick={() => setMobileMenuOpen(false)} style={navLinkStyle}>Departments</NavLink>
            <NavLink to="/doctors" onClick={() => setMobileMenuOpen(false)} style={navLinkStyle}>Doctors</NavLink>
            <NavLink to="/contact" onClick={() => setMobileMenuOpen(false)} style={navLinkStyle}>Contact</NavLink>

            {isAuthenticated && (
              <NavLink to="/my-appointments" onClick={() => setMobileMenuOpen(false)} style={navLinkStyle}>
                <Calendar size={17} /> My Appointments
              </NavLink>
            )}

            {isAdminRole && (
              <NavLink to="/admin" onClick={() => setMobileMenuOpen(false)} style={navLinkStyle}>
                <Shield size={17} /> Admin Portal
              </NavLink>
            )}

            <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--gray-200)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link
                to="/booking"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                <Calendar size={16} /> Book Appointment
              </Link>

              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="btn btn-outline"
                  style={{ width: '100%' }}
                >
                  <LogOut size={16} /> Sign Out ({user?.username})
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-outline"
                  style={{ width: '100%' }}
                >
                  <LogIn size={16} /> Patient Sign In / Register
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (min-width: 860px) {
          .desktop-nav { display: flex !important; }
          .desktop-actions { display: flex !important; }
          .mobile-trigger { display: none !important; }
        }
      `}</style>
    </header>
  );
}

