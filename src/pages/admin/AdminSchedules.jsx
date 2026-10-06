import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Calendar,
  Clock,
  Coffee,
  X,
  User,
} from 'lucide-react';
import { adminApi } from '../../api/admin';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Monday' },
  { value: 1, label: 'Tuesday' },
  { value: 2, label: 'Wednesday' },
  { value: 3, label: 'Thursday' },
  { value: 4, label: 'Friday' },
  { value: 5, label: 'Saturday' },
  { value: 6, label: 'Sunday' },
];

export default function AdminSchedules() {
  const [activeTab, setActiveTab] = useState('templates'); // 'templates' | 'leaves' | 'overrides'
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [overrides, setOverrides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New Schedule Modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    doctor: '',
    day_of_week: 0,
    start_time: '09:00',
    end_time: '17:00',
    slot_duration: 30,
  });
  const [submittingSchedule, setSubmittingSchedule] = useState(false);
  const [scheduleError, setScheduleError] = useState(null);

  // Breaks Management Modal
  const [activeScheduleForBreaks, setActiveScheduleForBreaks] = useState(null);
  const [breaks, setBreaks] = useState([]);
  const [breakForm, setBreakForm] = useState({
    start_time: '13:00',
    end_time: '14:00',
    reason: 'Lunch Break',
  });
  const [submittingBreak, setSubmittingBreak] = useState(false);
  const [breakError, setBreakError] = useState(null);

  // Leave Modal
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    doctor: '',
    start_datetime: '',
    end_datetime: '',
    reason: 'Annual Leave',
  });
  const [submittingLeave, setSubmittingLeave] = useState(false);
  const [leaveError, setLeaveError] = useState(null);

  // Override Modal
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideForm, setOverrideForm] = useState({
    doctor: '',
    date: new Date().toISOString().split('T')[0],
    start_time: '09:00',
    end_time: '13:00',
    override_type: 'BLOCKED',
    reason: 'Emergency Surgery Coverage',
  });
  const [submittingOverride, setSubmittingOverride] = useState(false);
  const [overrideError, setOverrideError] = useState(null);

  const fetchInitialData = async () => {
    try {
      setError(null);
      const docs = await adminApi.getDoctors();
      const docsList = Array.isArray(docs) ? docs : docs.results || [];
      setDoctors(docsList);
      if (docsList.length > 0 && !selectedDoctor) {
        setSelectedDoctor(docsList[0].id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load doctors list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const loadTabData = async () => {
    if (!selectedDoctor) return;
    try {
      if (activeTab === 'templates') {
        const data = await adminApi.getSchedules({ doctor: selectedDoctor });
        setSchedules(Array.isArray(data) ? data : data.results || []);
      } else if (activeTab === 'leaves') {
        const data = await adminApi.getLeaves(selectedDoctor);
        setLeaves(Array.isArray(data) ? data : data.results || []);
      } else if (activeTab === 'overrides') {
        const data = await adminApi.getOverrides(selectedDoctor);
        setOverrides(Array.isArray(data) ? data : data.results || []);
      }
    } catch (err) {
      console.error('Failed to load tab data:', err);
    }
  };

  useEffect(() => {
    loadTabData();
  }, [selectedDoctor, activeTab]);

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    setSubmittingSchedule(true);
    setScheduleError(null);
    try {
      await adminApi.createSchedule({
        ...scheduleForm,
        doctor: selectedDoctor,
        day_of_week: parseInt(scheduleForm.day_of_week, 10),
        slot_duration: parseInt(scheduleForm.slot_duration, 10),
      });
      setShowScheduleModal(false);
      await loadTabData();
    } catch (err) {
      setScheduleError(err.message || 'Failed to create schedule.');
    } finally {
      setSubmittingSchedule(false);
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (!window.confirm('Delete this weekly schedule? Generated future slots may also be affected.')) return;
    try {
      await adminApi.deleteSchedule(id);
      await loadTabData();
    } catch (err) {
      alert(`Could not delete schedule: ${err.message}`);
    }
  };

  // Breaks handling
  const openBreaksModal = async (schedule) => {
    setActiveScheduleForBreaks(schedule);
    setBreakError(null);
    try {
      const data = await adminApi.getBreaks(schedule.id);
      setBreaks(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddBreak = async (e) => {
    e.preventDefault();
    setSubmittingBreak(true);
    setBreakError(null);
    try {
      await adminApi.createBreak({
        ...breakForm,
        schedule: activeScheduleForBreaks.id,
      });
      const data = await adminApi.getBreaks(activeScheduleForBreaks.id);
      setBreaks(Array.isArray(data) ? data : data.results || []);
      setBreakForm({ start_time: '13:00', end_time: '14:00', reason: 'Lunch Break' });
    } catch (err) {
      setBreakError(err.message || 'Failed to add break.');
    } finally {
      setSubmittingBreak(false);
    }
  };

  const handleDeleteBreak = async (id) => {
    try {
      await adminApi.deleteBreak(id);
      const data = await adminApi.getBreaks(activeScheduleForBreaks.id);
      setBreaks(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      alert(err.message);
    }
  };

  // Leave handling
  const handleCreateLeave = async (e) => {
    e.preventDefault();
    setSubmittingLeave(true);
    setLeaveError(null);
    try {
      await adminApi.createLeave({
        ...leaveForm,
        doctor: selectedDoctor,
      });
      setShowLeaveModal(false);
      await loadTabData();
    } catch (err) {
      setLeaveError(err.message || 'Failed to record leave.');
    } finally {
      setSubmittingLeave(false);
    }
  };

  const handleDeleteLeave = async (id) => {
    if (!window.confirm('Remove this leave record?')) return;
    try {
      await adminApi.deleteLeave(id);
      await loadTabData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Override handling
  const handleCreateOverride = async (e) => {
    e.preventDefault();
    setSubmittingOverride(true);
    setOverrideError(null);
    try {
      await adminApi.createOverride({
        ...overrideForm,
        doctor: selectedDoctor,
      });
      setShowOverrideModal(false);
      await loadTabData();
    } catch (err) {
      setOverrideError(err.message || 'Failed to save schedule override.');
    } finally {
      setSubmittingOverride(false);
    }
  };

  const handleDeleteOverride = async (id) => {
    if (!window.confirm('Remove this schedule override?')) return;
    try {
      await adminApi.deleteOverride(id);
      await loadTabData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading physician scheduling engine..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchInitialData} />;
  }

  const selectedDoctorObj = doctors.find((d) => String(d.id) === String(selectedDoctor));

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gray-900)', margin: 0 }}>
            Physician Rosters & Scheduling Engine
          </h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', margin: '0.2rem 0 0' }}>
            Configure weekly recurring templates, intra-day breaks, sanctioned leaves, and ad-hoc overrides.
          </p>
        </div>

        {/* Doctor Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 260 }}>
          <User size={18} style={{ color: 'var(--primary)' }} />
          <select
            className="form-control"
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            style={{ fontWeight: 600 }}
          >
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name} ({doc.department_name})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '2px solid var(--gray-200)',
          marginBottom: '1.5rem',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('templates')}
          style={{
            padding: '0.65rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'templates' ? '3px solid var(--primary)' : '3px solid transparent',
            fontWeight: activeTab === 'templates' ? 700 : 500,
            color: activeTab === 'templates' ? 'var(--primary)' : 'var(--gray-600)',
            cursor: 'pointer',
            fontSize: '0.95rem',
          }}
        >
          Weekly Recurring Templates
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('leaves')}
          style={{
            padding: '0.65rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'leaves' ? '3px solid var(--primary)' : '3px solid transparent',
            fontWeight: activeTab === 'leaves' ? 700 : 500,
            color: activeTab === 'leaves' ? 'var(--primary)' : 'var(--gray-600)',
            cursor: 'pointer',
            fontSize: '0.95rem',
          }}
        >
          Sanctioned Leaves
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('overrides')}
          style={{
            padding: '0.65rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'overrides' ? '3px solid var(--primary)' : '3px solid transparent',
            fontWeight: activeTab === 'overrides' ? 700 : 500,
            color: activeTab === 'overrides' ? 'var(--primary)' : 'var(--gray-600)',
            cursor: 'pointer',
            fontSize: '0.95rem',
          }}
        >
          Date-Specific Overrides
        </button>
      </div>

      {/* TAB 1: WEEKLY TEMPLATES */}
      {activeTab === 'templates' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--gray-600)' }}>
              Weekly roster for <strong>{selectedDoctorObj?.name || 'Selected Doctor'}</strong>
            </span>
            <button
              type="button"
              onClick={() => {
                setScheduleForm({
                  doctor: selectedDoctor,
                  day_of_week: 0,
                  start_time: '09:00',
                  end_time: '17:00',
                  slot_duration: selectedDoctorObj?.consultation_duration || 30,
                });
                setScheduleError(null);
                setShowScheduleModal(true);
              }}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Plus size={16} /> Add Weekly Schedule
            </button>
          </div>

          <div className="card" style={{ padding: '1rem', backgroundColor: '#ffffff' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--gray-200)', textAlign: 'left', color: 'var(--gray-600)' }}>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Day of Week</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Operating Hours</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Slot Duration</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Breaks</th>
                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-500)' }}>
                        No weekly schedules defined yet for this physician.
                      </td>
                    </tr>
                  ) : (
                    schedules.map((s) => {
                      const dayName = DAYS_OF_WEEK.find((d) => d.value === s.day_of_week)?.label || `Day ${s.day_of_week}`;
                      return (
                        <tr key={s.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                          <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: 'var(--gray-900)' }}>
                            {dayName}
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <Clock size={15} color="var(--primary)" />
                              {s.start_time?.slice(0, 5)} - {s.end_time?.slice(0, 5)}
                            </div>
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem' }}>{s.slot_duration} minutes</td>
                          <td style={{ padding: '0.75rem 0.5rem' }}>
                            <button
                              type="button"
                              onClick={() => openBreaksModal(s)}
                              className="btn btn-outline btn-sm"
                              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                            >
                              <Coffee size={14} /> Configure Breaks
                            </button>
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => handleDeleteSchedule(s.id)}
                              className="btn btn-outline btn-sm"
                              style={{ color: 'var(--danger)', padding: '0.25rem 0.5rem' }}
                              title="Delete Weekly Schedule"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LEAVES */}
      {activeTab === 'leaves' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--gray-600)' }}>
              Recorded leaves for <strong>{selectedDoctorObj?.name || 'Selected Doctor'}</strong>
            </span>
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                const todayStr = now.toISOString().slice(0, 16);
                setLeaveForm({
                  doctor: selectedDoctor,
                  start_datetime: todayStr,
                  end_datetime: todayStr,
                  reason: 'Annual Leave / Medical Conference',
                });
                setLeaveError(null);
                setShowLeaveModal(true);
              }}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Plus size={16} /> Sanction Leave
            </button>
          </div>

          <div className="card" style={{ padding: '1rem', backgroundColor: '#ffffff' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--gray-200)', textAlign: 'left', color: 'var(--gray-600)' }}>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Start Date & Time</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>End Date & Time</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Clinical Reason</th>
                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-500)' }}>
                        No upcoming or recorded leaves found for this physician.
                      </td>
                    </tr>
                  ) : (
                    leaves.map((l) => (
                      <tr key={l.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                        <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>
                          {new Date(l.start_datetime).toLocaleString()}
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>
                          {new Date(l.end_datetime).toLocaleString()}
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', color: 'var(--gray-600)' }}>
                          {l.reason || 'Medical / Personal Leave'}
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => handleDeleteLeave(l.id)}
                            className="btn btn-outline btn-sm"
                            style={{ color: 'var(--danger)', padding: '0.25rem 0.5rem' }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: OVERRIDES */}
      {activeTab === 'overrides' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--gray-600)' }}>
              Date-specific exceptions for <strong>{selectedDoctorObj?.name || 'Selected Doctor'}</strong>
            </span>
            <button
              type="button"
              onClick={() => {
                setOverrideForm({
                  doctor: selectedDoctor,
                  date: new Date().toISOString().split('T')[0],
                  start_time: '09:00',
                  end_time: '13:00',
                  override_type: 'BLOCKED',
                  reason: 'Special Clinical Shift / OT Coverage',
                });
                setOverrideError(null);
                setShowOverrideModal(true);
              }}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Plus size={16} /> Add Date Override
            </button>
          </div>

          <div className="card" style={{ padding: '1rem', backgroundColor: '#ffffff' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--gray-200)', textAlign: 'left', color: 'var(--gray-600)' }}>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Override Date</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Hours</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Type</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Reason</th>
                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {overrides.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-500)' }}>
                        No date-specific overrides recorded for this doctor.
                      </td>
                    </tr>
                  ) : (
                    overrides.map((o) => (
                      <tr key={o.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                        <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>{o.date}</td>
                        <td style={{ padding: '0.75rem 0.5rem' }}>
                          {o.start_time?.slice(0, 5)} - {o.end_time?.slice(0, 5)}
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem' }}>
                          {o.override_type === 'AVAILABLE' ? (
                            <span className="badge badge-success">Extra Available</span>
                          ) : (
                            <span className="badge badge-danger">Blocked Time</span>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', color: 'var(--gray-600)' }}>{o.reason || 'Operational'}</td>
                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => handleDeleteOverride(o.id)}
                            className="btn btn-outline btn-sm"
                            style={{ color: 'var(--danger)', padding: '0.25rem 0.5rem' }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CREATE WEEKLY SCHEDULE MODAL */}
      {showScheduleModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: 480, width: '100%', padding: '1.75rem', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Add Weekly Schedule Template</h3>
              <button type="button" onClick={() => setShowScheduleModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            {scheduleError && (
              <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {scheduleError}
              </div>
            )}

            <form onSubmit={handleCreateSchedule} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div>
                <label className="form-label">Day of Week *</label>
                <select
                  className="form-control"
                  value={scheduleForm.day_of_week}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, day_of_week: e.target.value })}
                >
                  {DAYS_OF_WEEK.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="form-label">Shift Start *</label>
                  <input
                    type="time"
                    required
                    className="form-control"
                    value={scheduleForm.start_time}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, start_time: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Shift End *</label>
                  <input
                    type="time"
                    required
                    className="form-control"
                    value={scheduleForm.end_time}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, end_time: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Slot Duration (Minutes) *</label>
                <input
                  type="number"
                  min="5"
                  max="240"
                  required
                  className="form-control"
                  value={scheduleForm.slot_duration}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, slot_duration: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowScheduleModal(false)} className="btn btn-outline" disabled={submittingSchedule}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submittingSchedule}>
                  {submittingSchedule ? 'Saving...' : 'Save Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIGURE BREAKS MODAL */}
      {activeScheduleForBreaks && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: 520, width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Configure Shift Breaks</h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                  Operating shift: {activeScheduleForBreaks.start_time?.slice(0, 5)} - {activeScheduleForBreaks.end_time?.slice(0, 5)}
                </p>
              </div>
              <button type="button" onClick={() => setActiveScheduleForBreaks(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            {breakError && (
              <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {breakError}
              </div>
            )}

            {/* List of existing breaks */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--gray-700)', marginBottom: '0.5rem' }}>Active Breaks</h4>
              {breaks.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>No breaks configured for this shift.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {breaks.map((b) => (
                    <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--radius-sm)' }}>
                      <div>
                        <strong>{b.start_time?.slice(0, 5)} - {b.end_time?.slice(0, 5)}</strong> ({b.reason || 'Break'})
                      </div>
                      <button type="button" onClick={() => handleDeleteBreak(b.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Break Form */}
            <form onSubmit={handleAddBreak} style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--gray-700)', margin: 0 }}>Add New Break</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="form-label">Break Start *</label>
                  <input
                    type="time"
                    required
                    className="form-control"
                    value={breakForm.start_time}
                    onChange={(e) => setBreakForm({ ...breakForm, start_time: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Break End *</label>
                  <input
                    type="time"
                    required
                    className="form-control"
                    value={breakForm.end_time}
                    onChange={(e) => setBreakForm({ ...breakForm, end_time: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="form-label">Reason</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Lunch / Patient Ward Round"
                  value={breakForm.reason}
                  onChange={(e) => setBreakForm({ ...breakForm, reason: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary btn-sm" disabled={submittingBreak}>
                  {submittingBreak ? 'Adding...' : '+ Add Break'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SANCTION LEAVE MODAL */}
      {showLeaveModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: 480, width: '100%', padding: '1.75rem', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Sanction Physician Leave</h3>
              <button type="button" onClick={() => setShowLeaveModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            {leaveError && (
              <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {leaveError}
              </div>
            )}

            <form onSubmit={handleCreateLeave} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div>
                <label className="form-label">Start Datetime *</label>
                <input
                  type="datetime-local"
                  required
                  className="form-control"
                  value={leaveForm.start_datetime}
                  onChange={(e) => setLeaveForm({ ...leaveForm, start_datetime: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">End Datetime *</label>
                <input
                  type="datetime-local"
                  required
                  className="form-control"
                  value={leaveForm.end_datetime}
                  onChange={(e) => setLeaveForm({ ...leaveForm, end_datetime: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Sanction Reason</label>
                <input
                  type="text"
                  className="form-control"
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowLeaveModal(false)} className="btn btn-outline" disabled={submittingLeave}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submittingLeave}>
                  {submittingLeave ? 'Submitting...' : 'Confirm Leave'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD DATE OVERRIDE MODAL */}
      {showOverrideModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: 480, width: '100%', padding: '1.75rem', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Add Date-Specific Override</h3>
              <button type="button" onClick={() => setShowOverrideModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            {overrideError && (
              <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {overrideError}
              </div>
            )}

            <form onSubmit={handleCreateOverride} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div>
                <label className="form-label">Date *</label>
                <input
                  type="date"
                  required
                  className="form-control"
                  value={overrideForm.date}
                  onChange={(e) => setOverrideForm({ ...overrideForm, date: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="form-label">Start Time *</label>
                  <input
                    type="time"
                    required
                    className="form-control"
                    value={overrideForm.start_time}
                    onChange={(e) => setOverrideForm({ ...overrideForm, start_time: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">End Time *</label>
                  <input
                    type="time"
                    required
                    className="form-control"
                    value={overrideForm.end_time}
                    onChange={(e) => setOverrideForm({ ...overrideForm, end_time: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Override Type *</label>
                <select
                  className="form-control"
                  value={overrideForm.override_type}
                  onChange={(e) => setOverrideForm({ ...overrideForm, override_type: e.target.value })}
                >
                  <option value="BLOCKED">Blocked (No Appointments)</option>
                  <option value="AVAILABLE">Available (Extra Shift)</option>
                </select>
              </div>

              <div>
                <label className="form-label">Reason</label>
                <input
                  type="text"
                  className="form-control"
                  value={overrideForm.reason}
                  onChange={(e) => setOverrideForm({ ...overrideForm, reason: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowOverrideModal(false)} className="btn btn-outline" disabled={submittingOverride}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submittingOverride}>
                  {submittingOverride ? 'Saving...' : 'Save Override'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

