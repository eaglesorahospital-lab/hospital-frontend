import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageHero from '../components/common/PageHero';
import DoctorCard from '../components/cards/DoctorCard';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import { Search, Filter, Stethoscope } from 'lucide-react';
import { getDoctors, getDepartments } from '../services/api';

export default function Doctors() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialDept = searchParams.get('department') || '';

  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState(initialDept);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [deptList, docList] = await Promise.all([
        getDepartments(),
        getDoctors({ department: selectedDept }),
      ]);
      setDepartments(Array.isArray(deptList) ? deptList : []);
      setDoctors(Array.isArray(docList) ? docList : []);
    } catch (err) {
      setError('Unable to load doctors directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDept]);

  const handleDeptChange = (e) => {
    const val = e.target.value;
    setSelectedDept(val);
    if (val) {
      setSearchParams({ department: val });
    } else {
      setSearchParams({});
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    const matchName = doc.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSpec = doc.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchName || matchSpec;
  });

  return (
    <div className="doctors-page">
      <PageHero
        badge="Physicians & Specialists"
        title="Doctor Directory"
        subtitle="Select a specialist physician, view academic qualifications, verified clinical experience, and real-time consultation availability."
        breadcrumbs={[{ label: 'Doctors' }]}
      />

      <section className="section-padding bg-light">
        <div className="container">
          {/* Filter & Search Bar */}
          <div className="filter-bar-dual">
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon" aria-hidden="true" />
              <input
                type="text"
                className="form-input search-input"
                placeholder="Search by physician name or clinical specialty..."
                value={searchTerm}
                aria-label="Search by physician name or clinical specialty"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="btn-clear-search"
                  aria-label="Clear Search Input"
                  onClick={() => setSearchTerm('')}
                >
                  ✕
                </button>
              )}
            </div>

            <div className="select-wrapper">
              <Filter size={18} className="select-icon" aria-hidden="true" />
              <select
                className="form-input form-select"
                value={selectedDept}
                onChange={handleDeptChange}
                aria-label="Filter by clinical department"
              >
                <option value="">All Clinical Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <LoadingState message="Fetching physician records..." />
          ) : error ? (
            <ErrorState message={error} onRetry={loadData} />
          ) : filteredDoctors.length === 0 ? (
            <EmptyState
              title="No doctors found"
              message="No physician records matched your search filters."
              actionLabel="Reset Filters"
              onAction={() => {
                setSelectedDept('');
                setSearchTerm('');
                setSearchParams({});
              }}
            />
          ) : (
            <div className="cards-grid">
              {filteredDoctors.map((doc) => (
                <DoctorCard key={doc.id} doctor={doc} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
