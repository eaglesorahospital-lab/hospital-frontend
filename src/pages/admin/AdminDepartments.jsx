import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  Building,
  X,
  Phone,
  Clock,
} from 'lucide-react';
import { adminApi } from '../../api/admin';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';

export default function AdminDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    services: '',
    timings: 'Mon - Sat: 08:00 AM - 08:00 PM',
    contact: '+1 (800) 555-0100',
    is_active: true,
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Delete State
  const [deptToDelete, setDeptToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setError(null);
      const data = await adminApi.getDepartments();
      setDepartments(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(err.message || 'Failed to load hospital departments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingDept(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      services: 'Consultation, Diagnostics, In-patient Care',
      timings: 'Mon - Sat: 08:00 AM - 08:00 PM',
      contact: '+1 (800) 555-0100',
      is_active: true,
    });
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = (dept) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name || '',
      slug: dept.slug || '',
      description: dept.description || '',
      services: dept.services || '',
      timings: dept.timings || '',
      contact: dept.contact || '',
      is_active: dept.is_active ?? true,
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    if (!editingDept) {
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
      if (editingDept) {
        await adminApi.updateDepartment(editingDept.id, formData);
      } else {
        await adminApi.createDepartment(formData);
      }
      setShowModal(false);
      await fetchData();
    } catch (err) {
      setFormError(err.message || 'Failed to save department.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleStatus = async (dept) => {
    try {
      await adminApi.toggleDepartmentStatus(dept.id);
      await fetchData();
    } catch (err) {
      alert(`Could not toggle department status: ${err.message}`);
    }
  };

  const handleDelete = async () => {
    if (!deptToDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await adminApi.deleteDepartment(deptToDelete.id);
      setDeptToDelete(null);
      await fetchData();
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete department.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredDepts = departments.filter((d) => {
    const term = searchTerm.toLowerCase();
    return (
      (d.name || '').toLowerCase().includes(term) ||
      (d.description || '').toLowerCase().includes(term) ||
      (d.services || '').toLowerCase().includes(term)
    );
  });

  if (loading) {
    return <LoadingSpinner message="Loading hospital clinical departments..." />;
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
            Clinical Departments
          </h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', margin: '0.2rem 0 0' }}>
            Configure hospital units, operational service offerings, consulting hours, and departmental contacts.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Plus size={18} /> Add Department
        </button>
      </div>

      {/* Search Bar */}
      <div
        className="card"
        style={{
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          backgroundColor: '#ffffff',
          position: 'relative',
        }}
      >
        <Search
          size={18}
          style={{
            position: 'absolute',
            left: '2rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--gray-400)',
          }}
        />
        <input
          type="text"
          className="form-control"
          placeholder="Search clinical units by title, specialty service, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ paddingLeft: '2.5rem', width: '100%' }}
        />
      </div>

      {/* Departments Table */}
      <div className="card" style={{ padding: '1rem', backgroundColor: '#ffffff' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--gray-200)', textAlign: 'left', color: 'var(--gray-600)' }}>
                <th style={{ padding: '0.75rem 0.5rem' }}>Department Name</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Slug</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Hours & Timings</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Contact</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDepts.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-500)' }}>
                    No departments match your search term.
                  </td>
                </tr>
              ) : (
                filteredDepts.map((dept) => (
                  <tr key={dept.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--gray-900)' }}>{dept.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {dept.description || 'Clinical division'}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {dept.slug}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--gray-700)' }}>
                        <Clock size={14} /> {dept.timings || 'Mon - Sat: 08:00 - 20:00'}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--gray-700)' }}>
                        <Phone size={14} /> {dept.contact || 'Main Desk'}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      {dept.is_active ? (
                        <span className="badge badge-success">Active</span>
                      ) : (
                        <span className="badge badge-danger">Inactive</span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(dept)}
                          className="btn btn-outline btn-sm"
                          title={dept.is_active ? 'Deactivate Department' : 'Activate Department'}
                          style={{ padding: '0.3rem 0.5rem' }}
                        >
                          {dept.is_active ? <ToggleRight size={17} color="var(--success)" /> : <ToggleLeft size={17} color="var(--gray-400)" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(dept)}
                          className="btn btn-outline btn-sm"
                          title="Edit Department"
                          style={{ padding: '0.3rem 0.5rem' }}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeptToDelete(dept);
                            setDeleteError(null);
                          }}
                          className="btn btn-outline btn-sm"
                          title="Delete Department"
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
              maxWidth: 580,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '1.75rem',
              backgroundColor: '#ffffff',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                {editingDept ? 'Update Department' : 'Create Clinical Department'}
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
                <label className="form-label">Department Name *</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. Cardiology"
                  value={formData.name}
                  onChange={handleNameChange}
                />
              </div>

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
                <label className="form-label">Overview & Purpose</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Clinical mission, equipment, treatments offered..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Key Services Offered</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Angiography, Echocardiography, Cardiac Rehabilitation"
                  value={formData.services}
                  onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="form-label">Operating Timings</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Mon - Sat: 08:00 AM - 08:00 PM"
                    value={formData.timings}
                    onChange={(e) => setFormData({ ...formData, timings: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Direct Contact Phone</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="+1 (800) 555-0100"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="is_active_check"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <label htmlFor="is_active_check" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>
                  Department is currently active and accepting bookings
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-outline"
                  disabled={formSubmitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={formSubmitting}>
                  {formSubmitting ? 'Saving...' : editingDept ? 'Update Department' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deptToDelete && (
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
                Confirm Department Deletion
              </h3>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--gray-600)', lineHeight: 1.5, marginBottom: '1rem' }}>
              Are you sure you want to permanently delete <strong>{deptToDelete.name}</strong>?
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
                onClick={() => setDeptToDelete(null)}
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
                {deleting ? 'Deleting...' : 'Delete Department'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

