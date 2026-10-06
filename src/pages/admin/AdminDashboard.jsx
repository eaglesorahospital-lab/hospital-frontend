import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Users,
  Building,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Bell,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { adminApi } from '../../api/admin';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const [statsData, apptData] = await Promise.all([
        adminApi.getStats(),
        adminApi.getAppointments(),
      ]);
      setStats(statsData);
      setRecentAppointments(Array.isArray(apptData) ? apptData.slice(0, 6) : (apptData.results || []).slice(0, 6));
    } catch (err) {
      setError(err.message || 'Failed to load clinical operational data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="badge badge-success">Confirmed</span>;
      case 'COMPLETED':
        return <span className="badge badge-primary">Completed</span>;
      case 'CHECKED_IN':
        return <span className="badge badge-primary" style={{ backgroundColor: '#0284c7', color: '#fff' }}>Checked In</span>;
      case 'REQUESTED':
        return <span className="badge badge-warning">Requested</span>;
      case 'CANCELLED':
        return <span className="badge badge-danger">Cancelled</span>;
      case 'NO_SHOW':
        return <span className="badge badge-danger" style={{ backgroundColor: '#64748b', color: '#fff' }}>No Show</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  if (loading) {
    return <LoadingSpinner message="Aggregating clinical operational metrics..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchDashboardData} />;
  }

  return (
    <div>
      {/* Dashboard Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gray-900)', margin: 0 }}>
            Operational Command Center
          </h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', margin: '0.2rem 0 0' }}>
            Real-time synchronization across departments, medical staff schedules, and patient visits.
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn btn-outline btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Syncing...' : 'Sync Live Metrics'}
        </button>
      </div>

      {/* Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        {/* Today's Appointments */}
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                Today's Appointments
              </span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--gray-900)', marginTop: '0.25rem' }}>
                {stats?.today_appointments ?? 0}
              </div>
            </div>
            <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(14, 116, 144, 0.1)', color: 'var(--primary)' }}>
              <Calendar size={22} />
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--gray-600)', marginTop: '0.5rem' }}>
            Upcoming: <strong>{stats?.upcoming_appointments ?? 0}</strong>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                Pending / Requested
              </span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#b45309', marginTop: '0.25rem' }}>
                {stats?.pending_appointments ?? 0}
              </div>
            </div>
            <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#d97706' }}>
              <Clock size={22} />
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--gray-600)', marginTop: '0.5rem' }}>
            Awaiting triage or confirmation
          </div>
        </div>

        {/* Completed */}
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                Completed Visits
              </span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#047857', marginTop: '0.25rem' }}>
                {stats?.completed_appointments ?? 0}
              </div>
            </div>
            <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <CheckCircle size={22} />
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--gray-600)', marginTop: '0.5rem' }}>
            Cancelled: <strong>{stats?.cancelled_appointments ?? 0}</strong>
          </div>
        </div>

        {/* Doctors Active */}
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #6366f1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                Medical Specialists
              </span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--gray-900)', marginTop: '0.25rem' }}>
                {stats?.active_doctors ?? 0}
                <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--gray-400)' }}> / {stats?.total_doctors ?? 0}</span>
              </div>
            </div>
            <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
              <Users size={22} />
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--gray-600)', marginTop: '0.5rem' }}>
            Active practicing doctors
          </div>
        </div>

        {/* Departments Active */}
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #0284c7' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                Clinical Departments
              </span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--gray-900)', marginTop: '0.25rem' }}>
                {stats?.active_departments ?? 0}
                <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--gray-400)' }}> / {stats?.total_departments ?? 0}</span>
              </div>
            </div>
            <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(2, 132, 199, 0.1)', color: '#0284c7' }}>
              <Building size={22} />
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--gray-600)', marginTop: '0.5rem' }}>
            Active operational units
          </div>
        </div>

        {/* Notifications Dispatch */}
        <Link to="/admin/notifications" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #8b5cf6', height: '100%', cursor: 'pointer', transition: 'box-shadow var(--transition-fast)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                  Notification Queue
                </span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--gray-900)', marginTop: '0.25rem' }}>
                  {stats?.sent_notifications ?? 0}
                </div>
              </div>
              <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                <Bell size={22} />
              </div>
            </div>
            <div style={{ fontSize: '0.8rem', color: (stats?.failed_notifications > 0) ? 'var(--danger)' : 'var(--gray-600)', marginTop: '0.5rem' }}>
              Failures: <strong>{stats?.failed_notifications ?? 0}</strong> • <span style={{ color: 'var(--primary)', fontWeight: 600 }}>View Log &rarr;</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Actions Panel */}
      <div
        className="card"
        style={{
          padding: '1.5rem',
          marginBottom: '2rem',
          backgroundColor: '#ffffff',
        }}
      >
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '1rem' }}>
          Quick Operational Workflows
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {(user?.role === 'SUPER_ADMIN' || user?.role === 'HOSPITAL_ADMIN') && (
            <>
              <Link to="/admin/doctors" className="btn btn-outline btn-sm">
                + Add / Manage Doctor
              </Link>
              <Link to="/admin/departments" className="btn btn-outline btn-sm">
                + Configure Departments
              </Link>
              <Link to="/admin/audit-logs" className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <ShieldAlert size={15} /> Review Audit Logs
              </Link>
            </>
          )}
          <Link to="/admin/schedules" className="btn btn-outline btn-sm">
            Set Weekly Rosters
          </Link>
          <Link to="/admin/appointments" className="btn btn-primary btn-sm">
            Manage Appointments & Visits
          </Link>
          <Link to="/admin/notifications" className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Bell size={15} /> Notification Logs
          </Link>
        </div>
      </div>

      {/* Recent Appointments Table */}
      <div className="card" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-900)', margin: 0 }}>
            Recent Clinical Visits
          </h3>
          <Link
            to="/admin/appointments"
            style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none' }}
          >
            View all appointments <ArrowRight size={15} />
          </Link>
        </div>

        {recentAppointments.length === 0 ? (
          <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>
            No recent appointments found in the system.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--gray-200)', textAlign: 'left', color: 'var(--gray-600)' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Ref #</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Patient</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Doctor</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Date & Time</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentAppointments.map((appt) => (
                  <tr key={appt.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: 'var(--primary)' }}>
                      {appt.reference}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>
                        {appt.patient_name || appt.patient_name_snapshot || 'Patient'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                        {appt.patient_email || ''}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <div style={{ fontWeight: 600 }}>{appt.doctor_name || appt.doctor_name_snapshot}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                        {appt.department_name || appt.department_name_snapshot}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <div>{appt.scheduled_date}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                        {appt.start_time?.slice(0, 5)} - {appt.end_time?.slice(0, 5)}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      {getStatusBadge(appt.status)}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                      <Link to="/admin/appointments" className="btn btn-outline btn-sm" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

