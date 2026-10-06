import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import SectionHeading from '../components/common/SectionHeading';
import Button from '../components/common/Button';
import { Lock, User, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { loginUser } from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const successMsg = location.state?.successMessage || '';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      await loginUser(username, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="login-page section-padding">
      <div className="container max-w-md">
        <div className="login-card">
          <div className="login-icon-wrap">
            <Lock size={32} className="login-icon" />
          </div>

          <SectionHeading
            badge="Staff & Patient Portal"
            title="Account Login"
            subtitle="Access consultations, doctor schedules, and clinical administration."
            center
          />

          {successMsg && (
            <div className="alert alert-success" role="status">
              <CheckCircle2 size={18} />
              <span>{successMsg}</span>
            </div>
          )}

          {error && (
            <div className="alert alert-danger" role="alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label className="form-label">Username / Email: *</label>
              <div className="input-with-icon">
                <User size={18} className="field-icon" />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password: *</label>
              <div className="input-with-icon">
                <Lock size={18} className="field-icon" />
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" className="btn-block" loading={loading}>
              Sign In
            </Button>
          </form>

          <div className="auth-footer-link">
            <span>Don't have an account? </span>
            <Link to="/register" className="auth-link">
              Register
            </Link>
          </div>

          {/* Quick Fill Demo Credentials */}
          <div className="demo-credentials-box">
            <h4>Quick Demo Credentials:</h4>
            <div className="demo-btns-grid">
              <button
                type="button"
                className="btn-demo"
                onClick={() => handleQuickFill('admin_hospital', 'AdminPass123!')}
              >
                Hospital Admin
              </button>
              <button
                type="button"
                className="btn-demo"
                onClick={() => handleQuickFill('doctor_house', 'DoctorPass123!')}
              >
                Doctor (Dr. House)
              </button>
              <button
                type="button"
                className="btn-demo"
                onClick={() => handleQuickFill('staff_reception', 'StaffPass123!')}
              >
                Staff Reception
              </button>
              <button
                type="button"
                className="btn-demo"
                onClick={() => handleQuickFill('patient_john', 'PatientPass123!')}
              >
                Patient (John Doe)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

