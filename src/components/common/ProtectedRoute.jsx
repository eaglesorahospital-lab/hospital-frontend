import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ children, requiredRoles = [] }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullPage message="Verifying authentication session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRoles.length > 0 && !requiredRoles.includes(user?.role)) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '500px', margin: '0 auto', padding: '2.5rem' }}>
          <h2 style={{ color: 'var(--danger)', marginBottom: '0.75rem' }}>Access Restricted</h2>
          <p style={{ color: 'var(--gray-600)', marginBottom: '1.5rem' }}>
            You do not possess the required permissions to access this clinical dashboard.
          </p>
          <a href="/" className="btn btn-primary btn-sm">
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  return children;
}

