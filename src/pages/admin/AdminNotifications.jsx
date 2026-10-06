import React, { useState, useEffect } from 'react';
import {
  Bell,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Mail,
  AlertTriangle,
  X,
} from 'lucide-react';
import { adminApi } from '../../api/admin';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Selected Notification for Detail Modal
  const [selectedNotif, setSelectedNotif] = useState(null);

  const fetchNotifications = async () => {
    try {
      setError(null);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.notification_type = typeFilter;

      const data = await adminApi.getNotifications(params);
      setNotifications(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(err.message || 'Failed to retrieve notification records.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [statusFilter, typeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchNotifications();
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SENT':
        return <span className="badge badge-success">Delivered</span>;
      case 'QUEUED':
        return <span className="badge badge-warning">Queued</span>;
      case 'FAILED':
        return <span className="badge badge-danger">Failed</span>;
      default:
        return <span className="badge badge-gray">{status}</span>;
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'BOOKING_CONFIRMED':
        return <span className="badge badge-success">Booking Confirmed</span>;
      case 'BOOKING_CANCELLED':
        return <span className="badge badge-danger">Booking Cancelled</span>;
      case 'BOOKING_RESCHEDULED':
        return <span className="badge badge-warning">Rescheduled</span>;
      case 'REMINDER_24H':
        return <span className="badge badge-primary">24h Reminder</span>;
      default:
        return <span className="badge badge-gray">{type}</span>;
    }
  };

  if (loading && !refreshing) {
    return <LoadingSpinner message="Retrieving asynchronous notification logs..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchNotifications} />;
  }

  const sentCount = notifications.filter((n) => n.status === 'SENT').length;
  const queuedCount = notifications.filter((n) => n.status === 'QUEUED').length;
  const failedCount = notifications.filter((n) => n.status === 'FAILED').length;

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gray-900)', margin: 0 }}>
            Notification Queue & Delivery Logs
          </h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', margin: '0.2rem 0 0' }}>
            Real-time tracking of patient booking confirmations, cancellations, schedule updates, and automated reminders.
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

      {/* Summary Pills */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div className="card" style={{ padding: '1rem', borderLeft: '4px solid var(--success)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase' }}>
            Delivered Notifications
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.25rem' }}>
            {sentCount}
          </div>
        </div>
        <div className="card" style={{ padding: '1rem', borderLeft: '4px solid var(--warning)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase' }}>
            Queued in Celery / Broker
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--warning)', marginTop: '0.25rem' }}>
            {queuedCount}
          </div>
        </div>
        <div className="card" style={{ padding: '1rem', borderLeft: '4px solid var(--danger)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase' }}>
            Failed Dispatches
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--danger)', marginTop: '0.25rem' }}>
            {failedCount}
          </div>
        </div>
      </div>

      {/* Search and Filters Card */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          marginBottom: '1.5rem',
          backgroundColor: '#ffffff',
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ flex: '1 1 240px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
            <input
              type="text"
              className="input"
              style={{ paddingLeft: '2.2rem', fontSize: '0.875rem' }}
              placeholder="Search by recipient, subject, reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <select
              className="select"
              style={{ fontSize: '0.875rem', minWidth: '150px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="SENT">Delivered (SENT)</option>
              <option value="QUEUED">Queued (QUEUED)</option>
              <option value="FAILED">Failed (FAILED)</option>
            </select>

            <select
              className="select"
              style={{ fontSize: '0.875rem', minWidth: '180px' }}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Event Types</option>
              <option value="BOOKING_CONFIRMED">Booking Confirmed</option>
              <option value="BOOKING_CANCELLED">Booking Cancelled</option>
              <option value="BOOKING_RESCHEDULED">Rescheduled</option>
              <option value="REMINDER_24H">24h Reminder</option>
            </select>

            <button type="submit" className="btn btn-primary btn-sm">
              Search
            </button>

            {(searchTerm || statusFilter || typeFilter) && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setTypeFilter('');
                }}
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Notifications Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', backgroundColor: '#ffffff' }}>
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--gray-500)' }}>
            <Mail size={38} style={{ margin: '0 auto 0.75rem', color: 'var(--gray-400)', opacity: 0.6 }} />
            <h4 style={{ fontSize: '1.1rem', color: 'var(--gray-800)', margin: '0 0 0.35rem' }}>No Notifications Found</h4>
            <p style={{ margin: 0, fontSize: '0.875rem' }}>
              No notification dispatches match the selected search criteria or filters.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--gray-50)', borderBottom: '2px solid var(--gray-200)', textAlign: 'left', color: 'var(--gray-600)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Created At</th>
                  <th style={{ padding: '0.75rem 0.75rem' }}>Recipient</th>
                  <th style={{ padding: '0.75rem 0.75rem' }}>Event Type</th>
                  <th style={{ padding: '0.75rem 0.75rem' }}>Subject</th>
                  <th style={{ padding: '0.75rem 0.75rem' }}>Appt Ref</th>
                  <th style={{ padding: '0.75rem 0.75rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((notif) => (
                  <tr key={notif.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                    <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap', color: 'var(--gray-500)', fontSize: '0.8rem' }}>
                      {notif.created_at ? new Date(notif.created_at).toLocaleString() : 'N/A'}
                    </td>
                    <td style={{ padding: '0.75rem 0.75rem', fontWeight: 600, color: 'var(--gray-900)' }}>
                      {notif.recipient}
                    </td>
                    <td style={{ padding: '0.75rem 0.75rem' }}>
                      {getTypeBadge(notif.notification_type)}
                    </td>
                    <td style={{ padding: '0.75rem 0.75rem', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {notif.subject}
                    </td>
                    <td style={{ padding: '0.75rem 0.75rem', fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary)' }}>
                      {notif.appointment_reference || '—'}
                    </td>
                    <td style={{ padding: '0.75rem 0.75rem' }}>
                      {getStatusBadge(notif.status)}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedNotif(notif)}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        <Eye size={13} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Notification Inspection Modal */}
      {selectedNotif && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setSelectedNotif(null)}
        >
          <div
            className="card"
            style={{
              maxWidth: 620,
              width: '100%',
              backgroundColor: '#ffffff',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-xl)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gray-900)', margin: '0 0 0.25rem' }}>
                  Notification Dispatch Details
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                  ID: #{selectedNotif.id} • Channel: {selectedNotif.channel}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNotif(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-500)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--gray-100)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--gray-500)' }}>Recipient:</span>
                <strong>{selectedNotif.recipient}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--gray-100)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--gray-500)' }}>Subject:</span>
                <strong>{selectedNotif.subject}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--gray-100)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--gray-500)' }}>Status:</span>
                <div>{getStatusBadge(selectedNotif.status)}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--gray-100)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--gray-500)' }}>Attempts Count:</span>
                <span>{selectedNotif.attempt_count ?? 1}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--gray-100)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--gray-500)' }}>Dispatched At:</span>
                <span>{selectedNotif.sent_at ? new Date(selectedNotif.sent_at).toLocaleString() : 'Pending or Offline'}</span>
              </div>

              {selectedNotif.message_body && (
                <div style={{ marginTop: '0.5rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, color: 'var(--gray-700)', marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                    Message Content:
                  </label>
                  <pre
                    style={{
                      backgroundColor: 'var(--gray-50)',
                      border: '1px solid var(--gray-200)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.85rem',
                      fontSize: '0.8rem',
                      color: 'var(--gray-800)',
                      whiteSpace: 'pre-wrap',
                      maxHeight: '200px',
                      overflowY: 'auto',
                    }}
                  >
                    {selectedNotif.message_body}
                  </pre>
                </div>
              )}
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setSelectedNotif(null)}
                className="btn btn-outline btn-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

