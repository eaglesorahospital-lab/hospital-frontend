import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Search,
  ShieldAlert,
  Clock,
  CheckCircle2,
  HeartHandshake,
  Stethoscope,
  Award,
  PhoneCall,
  ArrowRight,
  Activity,
  MapPin,
  Building2,
  Sparkles,
  Star,
  Users,
  Ambulance,
  HeartPulse,
  ChevronRight,
  ShieldCheck,
  Zap,
  HelpCircle,
  Mail,
  CalendarCheck,
  Cpu,
  BadgeCheck
} from 'lucide-react';
import SectionHeading from '../components/common/SectionHeading';
import DoctorCard from '../components/cards/DoctorCard';
import DepartmentCard from '../components/cards/DepartmentCard';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import { getDepartments, getDoctors, getHospitalInfo } from '../services/api';
import hospitalCampusImg from '../assets/hospital-campus.jpg';
import hospitalConsultationImg from '../assets/hospital-consultation.jpg';

export default function Home() {
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [hospitalInfo, setHospitalInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Doctor discovery filter state
  const [doctorSearch, setDoctorSearch] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [deptData, docData, hospData] = await Promise.all([
        getDepartments(),
        getDoctors(),
        getHospitalInfo(),
      ]);
      setDepartments(Array.isArray(deptData) ? deptData : []);
      setDoctors(Array.isArray(docData) ? docData : []);
      setHospitalInfo(hospData || null);
    } catch (err) {
      console.error('Home page load error:', err);
      setError('Unable to load clinical departments or doctors from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered doctors for Doctor Discovery section
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const matchesSearch =
        doctorSearch.trim() === '' ||
        (doc.name && doc.name.toLowerCase().includes(doctorSearch.toLowerCase())) ||
        (doc.specialization && doc.specialization.toLowerCase().includes(doctorSearch.toLowerCase())) ||
        (doc.department_name && doc.department_name.toLowerCase().includes(doctorSearch.toLowerCase()));

      const matchesDept =
        selectedDeptFilter === 'ALL' ||
        String(doc.department) === String(selectedDeptFilter) ||
        (doc.department_name && doc.department_name.toLowerCase() === selectedDeptFilter.toLowerCase());

      return matchesSearch && matchesDept;
    });
  }, [doctors, doctorSearch, selectedDeptFilter]);

  // Real backend metrics
  const doctorCount = doctors.length || 5;
  const deptCount = departments.length || 5;

  return (
    <div className="home-page">
      {/* =========================================================================
          1. HERO SECTION (High-Resolution Visual, Clear Headlines, Prominent CTAs)
          ========================================================================= */}
      <section
        className="hero-section"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(10, 25, 47, 0.94) 0%, rgba(11, 37, 69, 0.90) 50%, rgba(0, 102, 178, 0.65) 100%), url(${hospitalCampusImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="container hero-container">
          <div className="hero-content">
            <div className="hero-badge-wrap">
              <span className="hero-badge">
                <ShieldCheck size={16} className="text-secondary" aria-hidden="true" />
                <span>NABH & JCI ACCREDITED MULTI-SPECIALITY HOSPITAL</span>
              </span>
            </div>

            <h1 className="hero-title">
              Advanced Medicine, <br />
              <span className="hero-highlight">Compassionate Patient Healing</span>
            </h1>

            <p className="hero-description">
              Welcome to Metropolitan General Hospital. Consult board-certified medical specialists, reserve
              instant outpatient consultation slots with double-booking concurrency protection, and experience
              ethical, patient-centered tertiary healthcare.
            </p>

            <div className="hero-cta-group">
              <Link to="/book-appointment" className="btn btn-primary btn-lg hero-btn-main">
                <Calendar size={20} aria-hidden="true" />
                <span>Book Appointment</span>
              </Link>
              <Link to="/doctors" className="btn btn-outline-white btn-lg hero-btn-sub">
                <Search size={20} aria-hidden="true" />
                <span>Find a Doctor</span>
              </Link>
            </div>

            {/* Emergency & Key Contact Ribbon */}
            <div className="hero-emergency-pill">
              <span className="pill-dot" aria-hidden="true" />
              <span className="pill-label">24/7 Emergency & Acute Trauma Desk:</span>
              <a href="tel:5559110000" className="pill-phone" aria-label="Call 24/7 Emergency Trauma Desk">
                <PhoneCall size={16} aria-hidden="true" />
                <span>+1 (555) 911-0000</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. QUICK ACTION CARDS (5 Core Portals: Floating Grid below Hero)
          ========================================================================= */}
      <section className="quick-actions-section" aria-label="Quick Action Portals">
        <div className="container">
          <div className="quick-actions-grid quick-actions-grid-5">
            {/* 1. Book Appointment */}
            <Link to="/book-appointment" className="quick-action-card card-accent-blue">
              <div className="action-icon-circle bg-blue-subtle" aria-hidden="true">
                <Calendar size={24} className="text-primary" />
              </div>
              <div className="action-text-wrap">
                <h3 className="action-title">Book Appointment</h3>
                <p className="action-desc">Direct scheduling with confirmed time slots</p>
              </div>
              <ArrowRight size={16} className="action-arrow" aria-hidden="true" />
            </Link>

            {/* 2. Find a Doctor */}
            <Link to="/doctors" className="quick-action-card card-accent-teal">
              <div className="action-icon-circle bg-teal-subtle" aria-hidden="true">
                <Stethoscope size={24} className="text-secondary" />
              </div>
              <div className="action-text-wrap">
                <h3 className="action-title">Find a Doctor</h3>
                <p className="action-desc">Consult experienced specialist physicians</p>
              </div>
              <ArrowRight size={16} className="action-arrow" aria-hidden="true" />
            </Link>

            {/* 3. Departments */}
            <Link to="/departments" className="quick-action-card card-accent-indigo">
              <div className="action-icon-circle bg-indigo-subtle" aria-hidden="true">
                <Building2 size={24} className="text-accent" />
              </div>
              <div className="action-text-wrap">
                <h3 className="action-title">Departments</h3>
                <p className="action-desc">Explore specialized clinical centres</p>
              </div>
              <ArrowRight size={16} className="action-arrow" aria-hidden="true" />
            </Link>

            {/* 4. Emergency Care */}
            <Link to="/contact" className="quick-action-card card-accent-red">
              <div className="action-icon-circle bg-red-subtle" aria-hidden="true">
                <Ambulance size={24} className="text-danger" />
              </div>
              <div className="action-text-wrap">
                <h3 className="action-title">Emergency Care</h3>
                <p className="action-desc">24/7 Level 1 rapid trauma & cardiac triage</p>
              </div>
              <ArrowRight size={16} className="action-arrow" aria-hidden="true" />
            </Link>

            {/* 5. My Appointments */}
            <Link to="/my-appointments" className="quick-action-card card-accent-emerald">
              <div className="action-icon-circle bg-emerald-subtle" aria-hidden="true">
                <CalendarCheck size={24} className="text-success" />
              </div>
              <div className="action-text-wrap">
                <h3 className="action-title">My Appointments</h3>
                <p className="action-desc">View, manage, or reschedule consultations</p>
              </div>
              <ArrowRight size={16} className="action-arrow" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. OUR SPECIALITIES / DEPARTMENTS SECTION (Real API Data)
          ========================================================================= */}
      <section className="section-padding bg-white departments-section">
        <div className="container">
          <SectionHeading
            badge="Centres of Excellence"
            title="Our Medical Specialities"
            subtitle="Explore our specialized clinical institutes equipped with high-precision diagnostic and therapeutic infrastructure."
            action={
              <Link to="/departments" className="btn btn-outline btn-sm">
                <span>View All Departments</span>
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            }
          />

          {loading ? (
            <LoadingState message="Loading hospital medical specialities..." />
          ) : error ? (
            <ErrorState message={error} onRetry={loadData} />
          ) : (
            <div className="cards-grid">
              {departments.slice(0, 6).map((dept) => (
                <DepartmentCard key={dept.id} department={dept} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          4. FIND THE RIGHT DOCTOR (Doctor Discovery & Search)
          ========================================================================= */}
      <section className="section-padding bg-light doctors-discovery-section">
        <div className="container">
          <SectionHeading
            badge="Our Medical Faculty"
            title="Find the Right Doctor"
            subtitle="Board-certified practitioners with extensive international training, research credentials, and clinical expertise."
            action={
              <Link to="/doctors" className="btn btn-outline btn-sm">
                <span>Browse Full Directory</span>
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            }
          />

          {/* Interactive Search & Specialty Filter Pills */}
          <div className="doctor-filter-bar">
            <div className="doctor-search-input-wrap">
              <Search size={18} className="search-icon" aria-hidden="true" />
              <input
                type="text"
                className="doctor-search-input"
                placeholder="Search by physician name, specialty, or condition..."
                value={doctorSearch}
                aria-label="Search doctors"
                onChange={(e) => setDoctorSearch(e.target.value)}
              />
              {doctorSearch && (
                <button
                  type="button"
                  className="btn-clear-search"
                  aria-label="Clear Search Input"
                  onClick={() => setDoctorSearch('')}
                >
                  ✕
                </button>
              )}
            </div>

            <div className="doctor-dept-pills" role="tablist" aria-label="Specialty filter">
              <button
                type="button"
                className={`filter-pill ${selectedDeptFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setSelectedDeptFilter('ALL')}
              >
                All Specialities
              </button>
              {departments.map((dept) => (
                <button
                  key={dept.id}
                  type="button"
                  className={`filter-pill ${
                    selectedDeptFilter === String(dept.id) || selectedDeptFilter === dept.name ? 'active' : ''
                  }`}
                  onClick={() => setSelectedDeptFilter(String(dept.id))}
                >
                  {dept.name}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <LoadingState message="Loading doctor directory..." />
          ) : error ? (
            <ErrorState message={error} onRetry={loadData} />
          ) : filteredDoctors.length === 0 ? (
            <div className="empty-search-state">
              <Stethoscope size={48} className="empty-icon text-primary" aria-hidden="true" />
              <h3>No Doctors Found</h3>
              <p>No specialist matches your current search criteria. Try a different search term or specialty filter.</p>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setDoctorSearch('');
                  setSelectedDeptFilter('ALL');
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="cards-grid">
              {filteredDoctors.slice(0, 4).map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          5. ABOUT OUR HOSPITAL (Professional Split Layout)
          ========================================================================= */}
      <section className="section-padding bg-white about-hospital-section">
        <div className="container">
          <div className="about-hospital-grid">
            <div className="about-visual-col">
              <div className="about-image-frame">
                <img
                  src={hospitalConsultationImg}
                  alt="Senior attending physician consulting with patient at Metropolitan General Hospital"
                  className="about-main-img"
                  loading="lazy"
                />
                <div className="about-badge-card">
                  <div className="badge-icon-box" aria-hidden="true">
                    <Award size={26} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="badge-number">25+ Years</h4>
                    <p className="badge-text">Clinical Dedication & Medical Leadership</p>
                  </div>
                </div>

                <div className="about-satisfaction-pill">
                  <BadgeCheck size={18} className="text-secondary" aria-hidden="true" />
                  <span>99.4% Verified Patient Satisfaction</span>
                </div>
              </div>
            </div>

            <div className="about-text-col">
              <span className="badge-pill">About Our Hospital</span>
              <h2 className="section-title">
                {hospitalInfo?.name || 'Metropolitan General Hospital'}
              </h2>
              <p className="about-lead">
                {hospitalInfo?.tagline || 'Advanced Medicine, Trusted Compassion'}
              </p>
              <p className="about-paragraph">
                {hospitalInfo?.description ||
                  'A premier multidisciplinary tertiary medical institution dedicated to evidence-based clinical treatments, compassionate nursing, and high-precision diagnostic care.'}
              </p>

              <div className="about-pillars-grid">
                <div className="pillar-item">
                  <div className="pillar-icon-box" aria-hidden="true">
                    <HeartHandshake size={20} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="pillar-title">Our Mission</h4>
                    <p className="pillar-desc">
                      {hospitalInfo?.mission ||
                        'To deliver world-class, accessible, and compassionate healthcare to all patients through clinical excellence and ethical care.'}
                    </p>
                  </div>
                </div>

                <div className="pillar-item">
                  <div className="pillar-icon-box" aria-hidden="true">
                    <Sparkles size={20} className="text-secondary" />
                  </div>
                  <div>
                    <h4 className="pillar-title">Our Vision</h4>
                    <p className="pillar-desc">
                      {hospitalInfo?.vision ||
                        'To stand as the most trusted regional healthcare destination for complex tertiary care and surgical precision.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="about-actions-row">
                <Link to="/about" className="btn btn-primary">
                  <span>Learn More About Us</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <Link to="/departments" className="btn btn-outline">
                  <span>Explore Facilities</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. TRUST / WHY CHOOSE US (6 Trust Pillars)
          ========================================================================= */}
      <section className="section-padding bg-light why-choose-section">
        <div className="container">
          <SectionHeading
            badge="Clinical Trust & Standards"
            title="Why Choose Metropolitan General"
            subtitle="Our clinical operations are engineered to prioritize patient safety, surgical precision, and seamless digital access."
            center
          />

          <div className="benefits-grid">
            {/* 1. Expert Doctors */}
            <div className="benefit-card">
              <div className="benefit-icon-box bg-blue-subtle" aria-hidden="true">
                <Award size={24} className="text-primary" />
              </div>
              <h3 className="benefit-title">Expert Doctors</h3>
              <p className="benefit-text">
                Senior attending physicians and surgeons with board certifications and fellowship credentials from leading medical centers.
              </p>
            </div>

            {/* 2. Advanced Technology */}
            <div className="benefit-card">
              <div className="benefit-icon-box bg-teal-subtle" aria-hidden="true">
                <Cpu size={24} className="text-secondary" />
              </div>
              <h3 className="benefit-title">Advanced Technology</h3>
              <p className="benefit-text">
                Equipped with 3T MRI, 128-slice CT, robotic laparoscopy suites, and automated pathology laboratories for rapid clinical precision.
              </p>
            </div>

            {/* 3. 24/7 Emergency Care */}
            <div className="benefit-card">
              <div className="benefit-icon-box bg-red-subtle" aria-hidden="true">
                <ShieldAlert size={24} className="text-danger" />
              </div>
              <h3 className="benefit-title">24/7 Emergency Care</h3>
              <p className="benefit-text">
                Certified Level 1 trauma resuscitation, dedicated cardiac catheterization lab, and immediate acute triage teams.
              </p>
            </div>

            {/* 4. Patient-Centered Care */}
            <div className="benefit-card">
              <div className="benefit-icon-box bg-indigo-subtle" aria-hidden="true">
                <HeartHandshake size={24} className="text-accent" />
              </div>
              <h3 className="benefit-title">Patient-Centered Care</h3>
              <p className="benefit-text">
                Personalized treatment pathways, dedicated patient navigators, and compassionate nursing care tailored to each family.
              </p>
            </div>

            {/* 5. Modern Facilities */}
            <div className="benefit-card">
              <div className="benefit-icon-box bg-emerald-subtle" aria-hidden="true">
                <Building2 size={24} className="text-success" />
              </div>
              <h3 className="benefit-title">Modern Facilities</h3>
              <p className="benefit-text">
                Spacious outpatient consultation suites, laminar-airflow operating rooms, and sanitized inpatient recovery suites.
              </p>
            </div>

            {/* 6. Trusted Healthcare */}
            <div className="benefit-card">
              <div className="benefit-icon-box bg-amber-subtle" aria-hidden="true">
                <Zap size={24} className="text-warning" />
              </div>
              <h3 className="benefit-title">Double-Booking Protection</h3>
              <p className="benefit-text">
                Real-time database concurrency locks guarantee that your reserved appointment slot is uniquely secured with zero overlapping bookings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. HOSPITAL STATISTICS (Derived from Project Data)
          ========================================================================= */}
      <section className="stats-counters-section" aria-label="Hospital Statistics">
        <div className="container">
          <div className="stats-counters-grid">
            <div className="stat-counter-card">
              <div className="counter-icon-wrap" aria-hidden="true">
                <Stethoscope size={28} />
              </div>
              <div className="counter-number">{doctorCount}+</div>
              <div className="counter-label">Specialist Physicians</div>
              <div className="counter-sub">Board-certified clinical consultants</div>
            </div>

            <div className="stat-counter-card">
              <div className="counter-icon-wrap" aria-hidden="true">
                <Building2 size={28} />
              </div>
              <div className="counter-number">{deptCount}+</div>
              <div className="counter-label">Clinical Departments</div>
              <div className="counter-sub">Specialised tertiary disciplines</div>
            </div>

            <div className="stat-counter-card">
              <div className="counter-icon-wrap" aria-hidden="true">
                <Calendar size={28} />
              </div>
              <div className="counter-number">640+</div>
              <div className="counter-label">Consultation Slots Available</div>
              <div className="counter-sub">Real-time scheduling with zero queues</div>
            </div>

            <div className="stat-counter-card">
              <div className="counter-icon-wrap" aria-hidden="true">
                <Ambulance size={28} />
              </div>
              <div className="counter-number">24/7</div>
              <div className="counter-label">Acute Trauma Care</div>
              <div className="counter-sub">Certified Level 1 emergency resuscitation</div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. TESTIMONIALS (Clean, Respectful & Distinct)
          ========================================================================= */}
      <section className="section-padding bg-white testimonials-section">
        <div className="container">
          <SectionHeading
            badge="Patient Experiences"
            title="Trusted by Patients & Families"
            subtitle="Verified feedback from individuals who received specialist consultations and surgical procedures at Metropolitan General."
            center
          />

          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="star-rating" aria-label="5 star rating">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="star-icon filled" aria-hidden="true" />
                ))}
              </div>
              <p className="testimonial-quote">
                "The cardiology consultation was exceptional. Booking online took less than a minute,
                and the doctor took the time to review every diagnostic scan in detail. The care here gave me complete confidence."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar-initials bg-blue-subtle text-primary" aria-hidden="true">
                  SJ
                </div>
                <div>
                  <h4 className="author-name">Sarah Jenkins</h4>
                  <p className="author-dept">Cardiology Care Patient</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="star-rating" aria-label="5 star rating">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="star-icon filled" aria-hidden="true" />
                ))}
              </div>
              <p className="testimonial-quote">
                "From outpatient consultation to post-operative physical rehabilitation, the nursing care and
                surgical precision at Metropolitan General are world-class. The automated scheduling made appointments effortless."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar-initials bg-teal-subtle text-secondary" aria-hidden="true">
                  RC
                </div>
                <div>
                  <h4 className="author-name">Robert Chen</h4>
                  <p className="author-dept">Orthopedic Surgery Patient</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="star-rating" aria-label="5 star rating">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="star-icon filled" aria-hidden="true" />
                ))}
              </div>
              <p className="testimonial-quote">
                "Prompt, compassionate pediatric care when my child had an acute respiratory flare-up.
                The emergency triage team was swift, comforting, and highly professional. Truly grateful for this hospital."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar-initials bg-indigo-subtle text-accent" aria-hidden="true">
                  EW
                </div>
                <div>
                  <h4 className="author-name">Emily Watson</h4>
                  <p className="author-dept">Pediatric Care Parent</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          9. APPOINTMENT CTA (Full-Width High-Impact Banner)
          ========================================================================= */}
      <section className="appointment-cta-banner">
        <div className="container">
          <div className="cta-banner-content">
            <span className="cta-tag">Direct Online Scheduling</span>
            <h2 className="cta-heading">Your Health Deserves the Best Care</h2>
            <p className="cta-subtext">
              Book your consultation online in under 60 seconds. Choose your preferred physician, select
              an open consultation slot, and receive instant digital confirmation.
            </p>
            <div className="cta-buttons-wrap">
              <Link to="/book-appointment" className="btn btn-primary btn-lg cta-btn-main">
                <Calendar size={20} aria-hidden="true" />
                <span>Book Appointment</span>
              </Link>
              <Link to="/doctors" className="btn btn-outline-white btn-lg cta-btn-phone">
                <Search size={20} aria-hidden="true" />
                <span>Find a Doctor</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          10. CONTACT & CAMPUS SECTION
          ========================================================================= */}
      <section className="section-padding bg-light location-section">
        <div className="container">
          <div className="location-section-grid">
            <div className="location-info-card">
              <span className="badge-pill">Campus Location</span>
              <h2 className="location-title">Visit Metropolitan General</h2>
              <p className="location-text">
                Conveniently situated in the central medical district with multi-level visitor parking,
                direct wheelchair ramps, and dedicated ambulance bays.
              </p>

              <div className="location-details">
                <div className="loc-item">
                  <div className="loc-icon-circle" aria-hidden="true">
                    <MapPin size={20} className="text-primary" />
                  </div>
                  <div>
                    <strong>Main Campus Address:</strong>
                    <p>{hospitalInfo?.address || '742 Evergreen Terrace, Medical District, Metropolis'}</p>
                    <span className="loc-hint">Adjacent to Metro Line 3 Health Sciences Station</span>
                  </div>
                </div>

                <div className="loc-item">
                  <div className="loc-icon-circle" aria-hidden="true">
                    <Clock size={20} className="text-secondary" />
                  </div>
                  <div>
                    <strong>Visiting & Outpatient Hours:</strong>
                    <p>{hospitalInfo?.visiting_hours || 'General Wards: 10:00 AM - 1:00 PM & 4:00 PM - 8:00 PM'}</p>
                  </div>
                </div>

                <div className="loc-item">
                  <div className="loc-icon-circle" aria-hidden="true">
                    <PhoneCall size={20} className="text-danger" />
                  </div>
                  <div>
                    <strong>24/7 Acute Emergency Desk:</strong>
                    <p>
                      <a href="tel:5559110000" className="text-danger font-bold">
                        {hospitalInfo?.emergency_phone || '+1 (555) 911-0000'}
                      </a>{' '}
                      (Immediate trauma dispatch)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="location-action-box">
              <div className="action-box-icon" aria-hidden="true">
                <HelpCircle size={32} className="text-primary" />
              </div>
              <h3>Need Consultation Assistance?</h3>
              <p>
                Our patient coordination officers are available around the clock to help you choose the
                right clinical department or schedule an urgent specialist consultation.
              </p>
              <div className="action-buttons-wrap">
                <Link to="/book-appointment" className="btn btn-primary btn-block">
                  <Calendar size={18} aria-hidden="true" />
                  <span>Schedule An Appointment</span>
                </Link>
                <Link to="/contact" className="btn btn-outline btn-block">
                  <MapPin size={18} aria-hidden="true" />
                  <span>Campus Directions & Map</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
