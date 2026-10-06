import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, Phone, Mail, MapPin, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="site-footer" aria-label="Site Footer">
      <div className="container footer-grid">
        {/* Brand Column */}
        <div className="footer-col brand-col">
          <div className="footer-brand">
            <div className="footer-brand-icon-wrap" aria-hidden="true">
              <HeartPulse size={26} className="footer-brand-icon" />
            </div>
            <div>
              <h3 className="footer-brand-name">Metropolitan General</h3>
              <p className="footer-brand-tag">Hospital & Medical Center</p>
            </div>
          </div>
          <p className="footer-desc">
            A premier multidisciplinary tertiary medical institution dedicated to evidence-based healthcare,
            surgical precision, compassionate nursing, and high-standard patient healing.
          </p>
          <div className="footer-badge">
            <ShieldCheck size={18} className="badge-icon text-secondary" />
            <span>NABH & JCI Accredited • Level 1 Trauma Facility</span>
          </div>
        </div>

        {/* Hospital Column */}
        <div className="footer-col">
          <h4 className="footer-heading">Hospital</h4>
          <ul className="footer-nav-list">
            <li><Link to="/about">About Our Hospital</Link></li>
            <li><Link to="/departments">Clinical Departments</Link></li>
            <li><Link to="/doctors">Find a Doctor</Link></li>
            <li><Link to="/contact">Contact & Location</Link></li>
            <li><Link to="/">Home Page</Link></li>
          </ul>
        </div>

        {/* Patient Care Column */}
        <div className="footer-col">
          <h4 className="footer-heading">Patient Care</h4>
          <ul className="footer-nav-list">
            <li><Link to="/book-appointment">Book Appointment</Link></li>
            <li><Link to="/my-appointments">My Appointments</Link></li>
            <li><Link to="/availability">Doctor Availability</Link></li>
            <li><Link to="/contact">24/7 Emergency Care</Link></li>
            <li><Link to="/login">Patient Portal Login</Link></li>
          </ul>
        </div>

        {/* Resources Column */}
        <div className="footer-col">
          <h4 className="footer-heading">Resources</h4>
          <ul className="footer-nav-list">
            <li><Link to="/contact">Visiting Hours & Guide</Link></li>
            <li><Link to="/about">Accreditations & Standards</Link></li>
            <li><Link to="/departments">Clinical Facilities</Link></li>
            <li><Link to="/about">Hospital Mission & Vision</Link></li>
            <li><Link to="/contact">Patient Rights & Privacy</Link></li>
          </ul>
        </div>

        {/* Contact Information Column */}
        <div className="footer-col">
          <h4 className="footer-heading">Contact & Campus</h4>
          <div className="footer-contact-list">
            <div className="contact-item">
              <MapPin size={18} className="contact-icon text-primary" aria-hidden="true" />
              <span>742 Evergreen Terrace, Medical District, Metropolis</span>
            </div>
            <div className="contact-item">
              <Phone size={18} className="contact-icon text-danger" aria-hidden="true" />
              <span>
                Emergency 24/7:{' '}
                <a href="tel:5559110000" className="text-danger font-bold">
                  +1 (555) 911-0000
                </a>
              </span>
            </div>
            <div className="contact-item">
              <Phone size={18} className="contact-icon text-primary" aria-hidden="true" />
              <span>Intake Desk: +1 (555) 019-2831</span>
            </div>
            <div className="contact-item">
              <Mail size={18} className="contact-icon text-primary" aria-hidden="true" />
              <span>info@metropolitan-health.org</span>
            </div>
            <div className="contact-item">
              <Clock size={18} className="contact-icon text-secondary" aria-hidden="true" />
              <span>Emergency Center: Open 24/7 / 365 Days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>© {new Date().getFullYear()} Metropolitan General Hospital. All rights reserved.</p>
          <div className="footer-legal-links">
            <span className="legal-pill"><CheckCircle2 size={13} /> HIPAA Compliant</span>
            <span className="legal-sep">•</span>
            <span className="legal-pill"><CheckCircle2 size={13} /> NABH Accredited</span>
            <span className="legal-sep">•</span>
            <span className="legal-pill"><CheckCircle2 size={13} /> JCI Certified</span>
            <span className="legal-sep">•</span>
            <Link to="/contact" className="legal-link">Patient Rights & Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
