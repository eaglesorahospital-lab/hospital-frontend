import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SectionHeading from '../components/common/SectionHeading';
import Button from '../components/common/Button';
import { User, Mail, Phone, Lock, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { registerPatient } from '../services/api';

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirm: '',
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const errs = {};

    if (!formData.name.trim()) {
      errs.name = 'Full name is required.';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        errs.email = 'Please enter a valid email address.';
      }
    }

    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required.';
    }

    if (!formData.password) {
      errs.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      errs.password = 'Password must be at least 8 characters long.';
    }

    if (!formData.password_confirm) {
      errs.password_confirm = 'Please confirm your password.';
    } else if (formData.password !== formData.password_confirm) {
      errs.password_confirm = 'Passwords do not match.';
    }

    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear inline error on change
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent duplicate submissions

    setApiError('');
    setSuccessMsg('');

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
        password_confirm: formData.password_confirm,
      };

      await registerPatient(payload);

      setSuccessMsg('Account created successfully! Redirecting to login...');

      // Redirect user to the Login page with success context
      setTimeout(() => {
        navigate('/login', {
          state: {
            successMessage: 'Registration successful! Please sign in with your email and password.',
          },
        });
      }, 1500);
    } catch (err) {
      console.error('Registration failed:', err);

      if (err.data && typeof err.data === 'object') {
        const fieldErrors = {};
        const generalErrors = [];

        for (const [key, val] of Object.entries(err.data)) {
          const msg = Array.isArray(val) ? val.join(' ') : String(val);
          if (['name', 'email', 'phone', 'password', 'password_confirm'].includes(key)) {
            fieldErrors[key] = msg;
          } else {
            generalErrors.push(msg);
          }
        }

        setErrors(fieldErrors);
        if (generalErrors.length > 0) {
          setApiError(generalErrors.join(' '));
        } else if (Object.keys(fieldErrors).length === 0) {
          setApiError(err.message || 'Registration failed. Please check your information.');
        }
      } else {
        setApiError(err.message || 'Unable to register at this time. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page section-padding">
      <div className="container max-w-md">
        <div className="login-card">
          <div className="login-icon-wrap">
            <UserPlus size={32} className="login-icon" />
          </div>

          <SectionHeading
            badge="Patient Portal"
            title="Create an Account"
            subtitle="Register as a new patient to book consultations and manage your appointments."
            center
          />

          {apiError && (
            <div className="alert alert-danger" role="alert">
              <AlertCircle size={18} />
              <span>{apiError}</span>
            </div>
          )}

          {successMsg && (
            <div className="alert alert-success" role="status">
              <CheckCircle2 size={18} />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="login-form" noValidate>
            <div className="form-group">
              <label htmlFor="reg-name" className="form-label">
                Full Name: *
              </label>
              <div className="input-with-icon">
                <User size={18} className="field-icon" aria-hidden="true" />
                <input
                  id="reg-name"
                  name="name"
                  type="text"
                  className={`form-input ${errors.name ? 'input-error' : ''}`}
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  aria-invalid={Boolean(errors.name)}
                />
              </div>
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="reg-email" className="form-label">
                Email Address: *
              </label>
              <div className="input-with-icon">
                <Mail size={18} className="field-icon" aria-hidden="true" />
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  className={`form-input ${errors.email ? 'input-error' : ''}`}
                  placeholder="e.g. patient@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  aria-invalid={Boolean(errors.email)}
                />
              </div>
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="reg-phone" className="form-label">
                Phone Number: *
              </label>
              <div className="input-with-icon">
                <Phone size={18} className="field-icon" aria-hidden="true" />
                <input
                  id="reg-phone"
                  name="phone"
                  type="tel"
                  className={`form-input ${errors.phone ? 'input-error' : ''}`}
                  placeholder="e.g. (555) 019-2831"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  aria-invalid={Boolean(errors.phone)}
                />
              </div>
              {errors.phone && <span className="field-error">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="reg-password" className="form-label">
                Password: *
              </label>
              <div className="input-with-icon">
                <Lock size={18} className="field-icon" aria-hidden="true" />
                <input
                  id="reg-password"
                  name="password"
                  type="password"
                  className={`form-input ${errors.password ? 'input-error' : ''}`}
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  aria-invalid={Boolean(errors.password)}
                />
              </div>
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="reg-password-confirm" className="form-label">
                Confirm Password: *
              </label>
              <div className="input-with-icon">
                <Lock size={18} className="field-icon" aria-hidden="true" />
                <input
                  id="reg-password-confirm"
                  name="password_confirm"
                  type="password"
                  className={`form-input ${errors.password_confirm ? 'input-error' : ''}`}
                  placeholder="Re-enter your password"
                  value={formData.password_confirm}
                  onChange={handleChange}
                  required
                  aria-invalid={Boolean(errors.password_confirm)}
                />
              </div>
              {errors.password_confirm && <span className="field-error">{errors.password_confirm}</span>}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="btn-block"
              loading={loading}
              disabled={loading}
            >
              Register
            </Button>
          </form>

          <div className="auth-footer-link">
            <span>Already have an account? </span>
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
