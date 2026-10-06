import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  X,
  Clock,
  Terminal,
  RefreshCw,
} from 'lucide-react';
import { adminApi } from '../../api/admin';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Selected Log for Inspector
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    try {
      setError(null);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (actionFilter) params.action = actionFilter;
      if (entityFilter) params.entity = entityFilter;
      if (statusFilter) params.status = statusFilter;

      const data = await adminApi.getAuditLogs(params);
      setLogs(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(err.message || 'Failed to retrieve compliance audit logs.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, entityFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchLogs();
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLogs();
  };

  const getActionBadge = (action) => {
    if (action.includes('CREATE') || action.includes('LOGIN')) {
      return <span className="badge badge-success">{action}</span>;
    }
    if (action.includes('CANCEL') || action.includes('DELETE') || action.includes('LOGOUT')) {
      return <span className="badge badge-danger">{action}</span>;
    }
    if (action.includes('RESCHEDULE') || action.includes('ROLE_CHANGE') || action.includes('UPDATE')) {
      return <span className="badge badge-warning">{action}</span>;
    }
    return <span className="badge badge-primary">{action}</span>;
  };

  if (loading && !refreshing) {
    return <LoadingSpinner message="Auditing immutable access and clinical records..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchLogs} />;
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gray-900)', margin: 0 }}>
            System Audit Trails & Compliance Log
          </h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', margin: '0.2rem 0 0' }}>
            Append-only tamper-resistant ledger capturing administrative mutations, role revisions, and operational events.
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
          {refreshing ? 'Refreshing...' : 'Refresh Logs'}
        </button>
      </div>

      {/* Filter Bar */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          marginBottom: '1.5rem',
          backgroundColor: '#ffffff',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.85rem',
          alignItems: 'center',
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search actor, object ID, details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.2rem' }}
          />
        </form>

        <div>
          <select
            className="form-control"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <option value="">All Actions</option>
            <option value="APPOINTMENT_CREATE">APPOINTMENT_CREATE</option>
            <option value="APPOINTMENT_CANCEL">APPOINTMENT_CANCEL</option>
            <option value="APPOINTMENT_RESCHEDULE">APPOINTMENT_RESCHEDULE</option>
            <option value="APPOINTMENT_STATUS_CHANGE">APPOINTMENT_STATUS_CHANGE</option>
            <option value="DOCTOR_CREATE">DOCTOR_CREATE</option>
            <option value="DOCTOR_UPDATE">DOCTOR_UPDATE</option>
            <option value="DOCTOR_STATUS_TOGGLE">DOCTOR_STATUS_TOGGLE</option>
            <option value="DOCTOR_DELETE">DOCTOR_DELETE</option>
            <option value="DEPARTMENT_CREATE">DEPARTMENT_CREATE</option>
            <option value="DEPARTMENT_STATUS_TOGGLE">DEPARTMENT_STATUS_TOGGLE</option>
            <option value="USER_LOGIN">USER_LOGIN</option>
            <option value="USER_LOGOUT">USER_LOGOUT</option>
            <option value="ROLE_CHANGE">ROLE_CHANGE</option>
            <option value="USER_STATUS_CHANGE">USER_STATUS_CHANGE</option>
          </select>
        </div>

        <div>
          <select
            className="form-control"
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
          >
            <option value="">All Entities</option>
            <option value="Appointment">Appointment</option>
            <option value="Doctor">Doctor</option>
            <option value="Department">Department</option>
            <option value="DoctorSchedule">DoctorSchedule</option>
            <option value="User">User</option>
          </select>
        </div>

        <div>
          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="FAILED">FAILED</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="card" style={{ padding: '1rem', backgroundColor: '#ffffff' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--gray-200)', textAlign: 'left', color: 'var(--gray-600)' }}>
                <th style={{ padding: '0.75rem 0.5rem' }}>Timestamp</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Operator</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Action</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Entity</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Target ID</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Client IP</th>
                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Inspect</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--gray-500)' }}>
                    No audit records match your query.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                    <td style={{ padding: '0.75rem 0.5rem', whiteSpace: 'nowrap', color: 'var(--gray-600)' }}>
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--gray-900)' }}>
                        {log.actor_username || 'Anonymous'}
                      </div>
                      <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                        {log.actor_role || 'PUBLIC'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      {getActionBadge(log.action)}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>
                      {log.entity}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', fontFamily: 'monospace' }}>
                      {log.object_id || '—'}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      {log.status === 'SUCCESS' ? (
                        <span style={{ color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 700 }}>
                          <CheckCircle size={14} /> OK
                        </span>
                      ) : (
                        <span style={{ color: 'var(--danger)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 700 }}>
                          <XCircle size={14} /> FAILED
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', fontFamily: 'monospace', color: 'var(--gray-500)' }}>
                      {log.ip_address || '—'}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedLog(log)}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        <Eye size={13} /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Detail Inspector Modal */}
      {selectedLog && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: 650, width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Terminal size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                  Audit Event #{selectedLog.id} Detail
                </h3>
              </div>
              <button type="button" onClick={() => setSelectedLog(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
              <div>
                <strong>Action:</strong> {selectedLog.action}
              </div>
              <div>
                <strong>Status:</strong> {selectedLog.status}
              </div>
              <div>
                <strong>Entity:</strong> {selectedLog.entity} (ID: {selectedLog.object_id || 'N/A'})
              </div>
              <div>
                <strong>Timestamp:</strong> {new Date(selectedLog.created_at).toISOString()}
              </div>
              <div>
                <strong>Operator:</strong> {selectedLog.actor_username || 'Anonymous'} ({selectedLog.actor_role})
              </div>
              <div>
                <strong>IP Address:</strong> {selectedLog.ip_address}
              </div>
            </div>

            {selectedLog.user_agent && (
              <div style={{ marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--gray-600)' }}>
                <strong>User Agent:</strong>
                <div style={{ backgroundColor: 'var(--gray-50)', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)', wordBreak: 'break-all', marginTop: '0.2rem' }}>
                  {selectedLog.user_agent}
                </div>
              </div>
            )}

            <div>
              <strong style={{ fontSize: '0.85rem' }}>Sanitized Audit Event Payload:</strong>
              <pre
                style={{
                  backgroundColor: '#0f172a',
                  color: '#38bdf8',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8rem',
                  overflowX: 'auto',
                  marginTop: '0.35rem',
                  fontFamily: 'Consolas, monospace',
                }}
              >
                {JSON.stringify(selectedLog.details, null, 2)}
              </pre>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setSelectedLog(null)} className="btn btn-outline btn-sm">
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

