import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  HeartPulse,
  Menu,
  X,
  Calendar,
  PhoneCall,
  Clock,
  User,
  LogOut,
  Shield,
  ChevronDown,
  Activity,
  Stethoscope,
  Building2,
  Ambulance,
  CalendarCheck
} from 'lucide-react';
import { getCurrentUser, clearAuth } from '../../services/api';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deptDropdownOpen, setDeptDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const currentUser = getCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDeptDropdownOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDeptDropdownOpen(false);
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearAuth();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="site-header" ref={dropdownRef}>
      {/* 24/7 Emergency & Accreditation Top Strip */}
      <div className="top-banner">
        <div className="container top-banner-content">
          <div className="top-banner-left">
            <span className="emergency-pill">24/7 EMERGENCY</span>
            <a href="tel:5559110000" className="banner-link" aria-label="Call 24/7 Emergency Desk">
              <PhoneCall size={13} aria-hidden="true" />
              <span>+1 (555) 911-0000</span>
            </a>
            <span className="separator" aria-hidden="true">|</span>
            <span className="banner-text">
              <Clock size={13} aria-hidden="true" />
              <span>Outpatient Clinics: Mon – Fri (8:00 AM – 6:00 PM)</span>
            </span>
          </div>
          <div className="top-banner-right">
            <span className="banner-badge">NABH & JCI Accredited Hospital</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="main-navbar" aria-label="Primary Navigation">
        <div className="container navbar-container">
          {/* Logo / Brand */}
          <Link to="/" className="navbar-brand" onClick={closeMenu}>
            <div className="brand-icon-wrap" aria-hidden="true">
              <HeartPulse size={26} className="brand-icon" />
            </div>
            <div className="brand-text-wrap">
              <span className="brand-name">Metropolitan General</span>
              <span className="brand-tag">Hospital & Medical Center</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="nav-links-desktop">
            <NavLink
              to="/"
              end
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Home
            </NavLink>

            <NavLink
              to="/about"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              About
            </NavLink>

            {/* Departments with Dropdown */}
            <div
              className={`nav-dropdown-wrapper ${deptDropdownOpen ? 'open' : ''}`}
              onMouseEnter={() => setDeptDropdownOpen(true)}
              onMouseLeave={() => setDeptDropdownOpen(false)}
            >
              <NavLink
                to="/departments"
                className={({ isActive }) =>
                  isActive ? 'nav-link nav-dropdown-trigger active' : 'nav-link nav-dropdown-trigger'
                }
              >
                <span>Departments</span>
                <ChevronDown size={14} className="dropdown-caret" />
              </NavLink>

              {deptDropdownOpen && (
                <div className="nav-dropdown-menu">
                  <div className="dropdown-menu-header">
                    <strong>Centres of Excellence</strong>
                    <span>Specialized tertiary clinical care</span>
                  </div>
                  <div className="dropdown-links-grid">
                    <Link to="/departments" className="dropdown-item">
                      <Building2 size={16} className="dropdown-icon" />
                      <div>
                        <div className="dropdown-title">All Departments</div>
                        <div className="dropdown-desc">Explore all clinical specialties</div>
                      </div>
                    </Link>
                    <Link to="/doctors?department=1" className="dropdown-item">
                      <HeartPulse size={16} className="dropdown-icon text-danger" />
                      <div>
                        <div className="dropdown-title">Cardiology & Vascular</div>
                        <div className="dropdown-desc">Comprehensive heart & rhythm care</div>
                      </div>
                    </Link>
                    <Link to="/doctors?department=2" className="dropdown-item">
                      <Activity size={16} className="dropdown-icon text-primary" />
                      <div>
                        <div className="dropdown-title">Neurology & Stroke</div>
                        <div className="dropdown-desc">Neuro-interventions & trauma</div>
                      </div>
                    </Link>
                    <Link to="/doctors?department=3" className="dropdown-item">
                      <Stethoscope size={16} className="dropdown-icon text-secondary" />
                      <div>
                        <div className="dropdown-title">Orthopedics & Joints</div>
                        <div className="dropdown-desc">Joint replacement & spine care</div>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <NavLink
              to="/doctors"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Doctors
            </NavLink>

            <NavLink
              to="/availability"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Availability
            </NavLink>

            <NavLink
              to="/contact"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Contact
            </NavLink>

            <NavLink
              to="/my-appointments"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              My Appointments
            </NavLink>
          </div>

          {/* Right Action Buttons */}
          <div className="nav-actions-desktop">
            {currentUser && ['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'STAFF', 'DOCTOR'].includes(currentUser.role) && (
              <Link to="/admin" className="btn btn-outline btn-sm nav-admin-btn">
                <Shield size={14} /> Admin
              </Link>
            )}

            {currentUser ? (
              <div className="user-profile-menu">
                <span className="user-greeting">
                  <User size={15} />
                  <span>{currentUser.username || 'Patient'}</span>
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn-logout"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="auth-btn-cluster">
                <Link to="/login" className="btn btn-outline btn-sm">
                  Login
                </Link>
                <Link to="/register" className="btn btn-ghost btn-sm nav-register-link">
                  Register
                </Link>
              </div>
            )}

            <Link to="/book-appointment" className="btn btn-primary btn-sm nav-book-btn">
              <Calendar size={16} /> Book Appointment
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="mobile-menu-toggle"
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-menu-drawer">
            <div className="container mobile-menu-links">
              <Link to="/" onClick={closeMenu} className="mobile-nav-link">
                Home
              </Link>
              <Link to="/about" onClick={closeMenu} className="mobile-nav-link">
                About Us
              </Link>
              <Link to="/departments" onClick={closeMenu} className="mobile-nav-link">
                Medical Departments
              </Link>
              <Link to="/doctors" onClick={closeMenu} className="mobile-nav-link">
                Find a Doctor
              </Link>
              <Link to="/availability" onClick={closeMenu} className="mobile-nav-link">
                Doctor Slot Availability
              </Link>
              <Link to="/contact" onClick={closeMenu} className="mobile-nav-link">
                Contact & Location
              </Link>
              <Link to="/my-appointments" onClick={closeMenu} className="mobile-nav-link">
                My Appointments
              </Link>

              <div className="mobile-menu-actions">
                <Link
                  to="/book-appointment"
                  onClick={closeMenu}
                  className="btn btn-primary btn-block"
                >
                  <Calendar size={18} /> Book Appointment
                </Link>

                {currentUser ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleLogout();
                      closeMenu();
                    }}
                    className="btn btn-outline btn-block"
                  >
                    <LogOut size={18} /> Logout ({currentUser.username})
                  </button>
                ) : (
                  <div className="mobile-auth-grid">
                    <Link to="/login" onClick={closeMenu} className="btn btn-outline">
                      <User size={16} /> Login
                    </Link>
                    <Link to="/register" onClick={closeMenu} className="btn btn-outline">
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
