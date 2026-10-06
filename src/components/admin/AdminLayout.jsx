import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  UserCheck,
  Building,
  CalendarDays,
  CalendarCheck2,
  Bell,
  ShieldAlert,
  ArrowLeft,
  Shield,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const { user } = useAuth();
  const role = user?.role;
  const isSuperOrAdmin = role === 'SUPER_ADMIN' || role === 'HOSPITAL_ADMIN' || !role;
  const isStaff = role === 'STAFF' || !role;
  const isDoctor = role === 'DOCTOR' || !role;

  const navItemStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '0.65rem 1rem',
    borderRadius: 'var(--radius-md)',
    fontWeight: 600,
    fontSize: '0.9rem',
    color: isActive ? '#ffffff' : 'var(--gray-700)',
    backgroundColor: isActive ? 'var(--primary)' : 'transparent',
    textDecoration: 'none',
    transition: 'all var(--transition-fast)',
  });

  return (
    <div style={{ backgroundColor: 'var(--gray-50)', minHeight: 'calc(100vh - 120px)', padding: '1.5rem 0 3rem' }}>
      <div className="container">
        {/* Admin Header Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            backgroundColor: '#ffffff',
            padding: '1.25rem 1.5rem',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--gray-200)',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(14, 116, 144, 0.12)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Shield size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gray-900)', margin: 0 }}>
                  Hospital Management Operations
                </h1>
                <span className="badge badge-primary" style={{ textTransform: 'uppercase', fontSize: '0.72rem' }}>
                  {role?.replace('_', ' ') || 'CLINICAL ADMIN'}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--gray-500)' }}>
                Authenticated Operator: <strong>{user?.username || 'admin_hospital'}</strong> ({user?.email || 'admin@metropolitan-health.org'})
              </p>
            </div>
          </div>

          <Link
            to="/"
            className="btn btn-outline btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <ArrowLeft size={16} /> Return to Public Portal
          </Link>
        </div>

        {/* Sub-Navigation Tabs */}
        <nav
          aria-label="Admin Navigation"
          style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
            backgroundColor: '#ffffff',
            padding: '0.5rem',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--gray-200)',
            marginBottom: '1.5rem',
          }}
        >
          <NavLink to="/admin" end style={navItemStyle}>
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>

          {isSuperOrAdmin && (
            <>
              <NavLink to="/admin/doctors" style={navItemStyle}>
                <UserCheck size={18} />
                Doctors
              </NavLink>
              <NavLink to="/admin/departments" style={navItemStyle}>
                <Building size={18} />
                Departments
              </NavLink>
            </>
          )}

          {(isSuperOrAdmin || isStaff || isDoctor) && (
            <>
              <NavLink to="/admin/schedules" style={navItemStyle}>
                <CalendarDays size={18} />
                Schedules
              </NavLink>
              <NavLink to="/admin/appointments" style={navItemStyle}>
                <CalendarCheck2 size={18} />
                Appointments
              </NavLink>
              <NavLink to="/admin/patients" style={navItemStyle}>
                <Users size={18} />
                Patients
              </NavLink>
            </>
          )}

          {(isSuperOrAdmin || isStaff) && (
            <NavLink to="/admin/notifications" style={navItemStyle}>
              <Bell size={18} />
              Notifications
            </NavLink>
          )}

          {isSuperOrAdmin && (
            <NavLink to="/admin/audit" style={navItemStyle}>
              <ShieldAlert size={18} />
              Audit Logs
            </NavLink>
          )}
        </nav>

        {/* Child Page Render */}
        <Outlet />
      </div>
    </div>
  );
}

