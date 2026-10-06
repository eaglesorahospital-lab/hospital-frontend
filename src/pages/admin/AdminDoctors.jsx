import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  CheckCircle,
  X,
  Stethoscope,
} from 'lucide-react';
import { adminApi } from '../../api/admin';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    department: '',
    qualification: '',
    experience: 5,
    bio: '',
    areas_of_expertise: '',
    consultation_type: 'IN_PERSON',
    consultation_duration: 30,
    room: '',
    status: 'ACTIVE',
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Delete State
  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setError(null);
      const [docsData, deptsData] = await Promise.all([
        adminApi.getDoctors(),
        adminApi.getDepartments(),
      ]);
      setDoctors(Array.isArray(docsData) ? docsData : docsData.results || []);
      setDepartments(Array.isArray(deptsData) ? deptsData : deptsData.results || []);
    } catch (err) {
      setError(err.message || 'Failed to load doctors and departments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingDoctor(null);
    setFormData({
      name: '',
      slug: '',
      department: departments[0]?.id || '',
      qualification: 'MBBS, MD',
      experience: 5,
      bio: '',
      areas_of_expertise: '',
      consultation_type: 'IN_PERSON',
      consultation_duration: 30,
      room: 'Room 101',
      status: 'ACTIVE',
    });
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = (doc) => {
    setEditingDoctor(doc);
    setFormData({
      name: doc.name || '',
      slug: doc.slug || '',
      department: doc.department || '',
      qualification: doc.qualification || '',
      experience: doc.experience || 0,
      bio: doc.bio || '',
      areas_of_expertise: doc.areas_of_expertise || '',
      consultation_type: doc.consultation_type || 'IN_PERSON',
      consultation_duration: doc.consultation_duration || 30,
      room: doc.room || '',
      status: doc.status || 'ACTIVE',
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    if (!editingDoctor) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setFormData((prev) => ({ ...prev, name: val, slug: generatedSlug }));
    } else {
      setFormData((prev) => ({ ...prev, name: val }));
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    try {
      if (editingDoctor) {
        await adminApi.updateDoctor(editingDoctor.id, formData);
      } else {
        await adminApi.createDoctor(formData);
      }
      setShowModal(false);
      await fetchData();
    } catch (err) {
      setFormError(err.message || 'Failed to save doctor details.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleStatus = async (doc) => {
    try {
      await adminApi.toggleDoctorStatus(doc.id);
      await fetchData();
    } catch (err) {
      alert(`Could not toggle status: ${err.message}`);
    }
  };

  const handleDelete = async () => {
    if (!doctorToDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await adminApi.deleteDoctor(doctorToDelete.id);
      setDoctorToDelete(null);
      await fetchData();
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete doctor.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      (doc.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.areas_of_expertise || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.qualification || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = !selectedDept || String(doc.department) === String(selectedDept);
    return matchesSearch && matchesDept;
  });

  if (loading) {
    return <LoadingSpinner message="Loading medical staff directory..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchData} />;
  }

  return (
    <div>
      {/* Header and Add Button */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gray-900)', margin: 0 }}>
            Medical Staff & Doctor Management
          </h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', margin: '0.2rem 0 0' }}>
            Maintain physician profiles, clinical specializations, consultation parameters, and operational statuses.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Plus size={18} /> Add New Doctor
        </button>
      </div>

      {/* Filters Bar */}
      <div
        className="card"
        style={{
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          backgroundColor: '#ffffff',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div style={{ flex: '1 1 240px', position: 'relative' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--gray-400)',
            }}
          />
          <input
            type="text"
            className="form-control"
            placeholder="Search physician by name, specialty, or credentials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.4rem', width: '100%' }}
          />
        </div>

        <div style={{ minWidth: 200 }}>
          <select
            className="form-control"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Doctors Table */}
      <div className="card" style={{ padding: '1rem', backgroundColor: '#ffffff' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--gray-200)', textAlign: 'left', color: 'var(--gray-600)' }}>
                <th style={{ padding: '0.75rem 0.5rem' }}>Physician</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Department</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Experience</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Consultation</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Room</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDoctors.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-500)' }}>
                    No doctors match the specified filter criteria.
                  </td>
                </tr>
              ) : (
                filteredDoctors.map((doc) => (
                  <tr key={doc.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--gray-900)' }}>{doc.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{doc.qualification}</div>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span className="badge badge-primary">{doc.department_name}</span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>{doc.experience} years</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <div>{doc.consultation_type?.replace('_', ' ')}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                        {doc.consultation_duration} mins
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>{doc.room || 'General OPD'}</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      {doc.status === 'ACTIVE' ? (
                        <span className="badge badge-success">Active</span>
                      ) : (
                        <span className="badge badge-danger">Inactive</span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(doc)}
                          className="btn btn-outline btn-sm"
                          title={doc.status === 'ACTIVE' ? 'Deactivate Doctor' : 'Activate Doctor'}
                          style={{ padding: '0.3rem 0.5rem' }}
                        >
                          {doc.status === 'ACTIVE' ? <ToggleRight size={17} color="var(--success)" /> : <ToggleLeft size={17} color="var(--gray-400)" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(doc)}
                          className="btn btn-outline btn-sm"
                          title="Edit Profile"
                          style={{ padding: '0.3rem 0.5rem' }}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDoctorToDelete(doc);
                            setDeleteError(null);
                          }}
                          className="btn btn-outline btn-sm"
                          title="Delete Doctor"
                          style={{ padding: '0.3rem 0.5rem', color: 'var(--danger)' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: 620,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '1.75rem',
              backgroundColor: '#ffffff',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                {editingDoctor ? 'Update Physician Profile' : 'Register New Medical Specialist'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div
                style={{
                  padding: '0.75rem',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: 'var(--danger)',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                }}
              >
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmitForm} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div>
                <label className="form-label">Full Name & Title *</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. Dr. Emily Watson"
                  value={formData.name}
                  onChange={handleNameChange}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="form-label">URL Slug *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Department *</label>
                  <select
                    required
                    className="form-control"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="form-label">Medical Qualifications *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. MBBS, MD (Cardiology), FACC"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Experience (Years) *</label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    required
                    className="form-control"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value, 10) || 0 })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="form-label">Consultation Mode</label>
                  <select
                    className="form-control"
                    value={formData.consultation_type}
                    onChange={(e) => setFormData({ ...formData, consultation_type: e.target.value })}
                  >
                    <option value="IN_PERSON">In Person</option>
                    <option value="ONLINE">Online</option>
                    <option value="BOTH">Both</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Duration (Mins)</label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    className="form-control"
                    value={formData.consultation_duration}
                    onChange={(e) =>
                      setFormData({ ...formData, consultation_duration: parseInt(e.target.value, 10) || 30 })
                    }
                  />
                </div>
                <div>
                  <label className="form-label">Consultation Room</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. OPD 204"
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Areas of Expertise</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Interventional Cardiology, Heart Failure, Arrhythmia"
                  value={formData.areas_of_expertise}
                  onChange={(e) => setFormData({ ...formData, areas_of_expertise: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Professional Biography</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Clinical background, publications, fellowships, and clinical interests..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-outline"
                  disabled={formSubmitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={formSubmitting}>
                  {formSubmitting ? 'Saving...' : editingDoctor ? 'Update Physician' : 'Create Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {doctorToDelete && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: 480,
              width: '100%',
              padding: '1.75rem',
              backgroundColor: '#ffffff',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: 'var(--danger)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AlertTriangle size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--gray-900)' }}>
                Confirm Doctor Deletion
              </h3>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--gray-600)', lineHeight: 1.5, marginBottom: '1rem' }}>
              Are you sure you want to permanently remove <strong>Dr. {doctorToDelete.name}</strong>?
            </p>

            {deleteError && (
              <div
                style={{
                  padding: '0.75rem',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: 'var(--danger)',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                }}
              >
                {deleteError}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setDoctorToDelete(null)}
                className="btn btn-outline"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="btn btn-danger"
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Doctor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

