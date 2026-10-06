import React, { useState, useEffect } from 'react';
import PageHero from '../components/common/PageHero';
import Button from '../components/common/Button';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, ShieldAlert, Calendar } from 'lucide-react';
import { getHospitalInfo } from '../services/api';
import { Link } from 'react-router-dom';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [hospitalInfo, setHospitalInfo] = useState(null);

  useEffect(() => {
    getHospitalInfo()
      .then((data) => setHospitalInfo(data))
      .catch(() => {});
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const address = hospitalInfo?.address || '742 Evergreen Terrace, Medical District, Metropolis';
  const emergencyPhone = hospitalInfo?.emergency_phone || '+1 (555) 911-0000';
  const generalPhone = hospitalInfo?.phone || '+1 (555) 019-2831';
  const email = hospitalInfo?.email || 'care@metropolitan-health.org';
  const visitingHours = hospitalInfo?.visiting_hours || 'Morning: 10:00 AM – 1:00 PM | Evening: 04:00 PM – 08:00 PM';

  return (
    <div className="contact-page">
      <PageHero
        badge="Reach Our Hospital"
        title="Contact & Location"
        subtitle="We are available 24/7 to assist with outpatient appointments, emergency trauma transfers, and clinical patient inquiries."
        breadcrumbs={[{ label: 'Contact & Location' }]}
        actions={
          <Link to="/book-appointment" className="btn btn-primary">
            <Calendar size={18} aria-hidden="true" />
            <span>Book Appointment Online</span>
          </Link>
        }
      />

      <section className="section-padding bg-light">
        <div className="container">
          <div className="contact-grid">
            {/* Contact Details */}
            <div className="contact-info-panel">
              <span className="badge-pill">Campus Details</span>
              <h3 className="panel-title">Hospital Directory & Access</h3>
              <p className="panel-text">
                Metropolitan General Hospital is centrally located within the city medical district,
                equipped with high-speed ambulance bays, dedicated emergency triage, and accessible parking.
              </p>

              <div className="contact-card-list">
                <div className="contact-card-item">
                  <div className="contact-icon-box bg-blue-subtle" aria-hidden="true">
                    <MapPin size={22} className="text-primary" />
                  </div>
                  <div>
                    <strong>Main Campus Address:</strong>
                    <p>{address}</p>
                    <span className="contact-sub-hint">Adjacent to Metro Line 3 Health Sciences Station</span>
                  </div>
                </div>

                <div className="contact-card-item">
                  <div className="contact-icon-box bg-red-subtle" aria-hidden="true">
                    <ShieldAlert size={22} className="text-danger" />
                  </div>
                  <div>
                    <strong>Emergency Desk (24/7/365):</strong>
                    <p className="text-danger font-bold">
                      <a href={`tel:${emergencyPhone}`} className="text-danger">{emergencyPhone}</a>
                    </p>
                    <span className="contact-sub-hint">Immediate trauma & cardiac resuscitation dispatch</span>
                  </div>
                </div>

                <div className="contact-card-item">
                  <div className="contact-icon-box bg-teal-subtle" aria-hidden="true">
                    <Phone size={22} className="text-secondary" />
                  </div>
                  <div>
                    <strong>General Enquiries & Central Desk:</strong>
                    <p>{generalPhone}</p>
                    <span className="contact-sub-hint">Monday – Saturday: 8:00 AM – 8:00 PM</span>
                  </div>
                </div>

                <div className="contact-card-item">
                  <div className="contact-icon-box bg-indigo-subtle" aria-hidden="true">
                    <Mail size={22} className="text-accent" />
                  </div>
                  <div>
                    <strong>Email Inquiries:</strong>
                    <p>{email}</p>
                  </div>
                </div>

                <div className="contact-card-item">
                  <div className="contact-icon-box bg-emerald-subtle" aria-hidden="true">
                    <Clock size={22} className="text-success" />
                  </div>
                  <div>
                    <strong>Inpatient Visiting Hours:</strong>
                    <p>{visitingHours}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enquiry Form */}
            <div className="contact-form-panel">
              <span className="badge-pill">Direct Message</span>
              <h3 className="panel-title">Send a General Inquiry</h3>
              <p className="panel-desc">
                Have questions regarding clinical admissions, patient records, or physician consultation schedules? Write to us below.
              </p>

              {submitted ? (
                <div className="alert alert-success" role="status">
                  <CheckCircle2 size={24} aria-hidden="true" />
                  <div>
                    <strong>Thank You for Contacting Us!</strong>
                    <p>Our patient relations desk will review your inquiry and respond within 24 hours.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="enquiry-form">
                  <div className="form-group">
                    <label className="form-label">Full Name: *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. John Doe"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Email Address: *</label>
                      <input
                        type="email"
                        className="form-input"
                        placeholder="e.g. user@example.com"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number:</label>
                      <input
                        type="tel"
                        className="form-input"
                        placeholder="e.g. +1 (555) 019-2831"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Message / Inquiry Details: *</label>
                    <textarea
                      className="form-input form-textarea"
                      rows={4}
                      placeholder="Please describe your question or patient inquiry..."
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>

                  <Button type="submit" variant="primary" size="lg" icon={Send} className="btn-block">
                    Submit Inquiry
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
