import React, { useState, useEffect } from 'react';
import PageHero from '../components/common/PageHero';
import DepartmentCard from '../components/cards/DepartmentCard';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import { Search, Building2 } from 'lucide-react';
import { getDepartments } from '../services/api';

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDepartments();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load departments from API:', err);
      const msg = err.message
        ? `Unable to load clinical departments from server (${err.message}).`
        : 'Unable to load clinical departments from server.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredDepts = departments.filter(
    (d) =>
      d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="departments-page">
      <PageHero
        badge="Specialized Medicine"
        title="Clinical Departments"
        subtitle="Explore specialized clinics equipped with modern diagnostic and therapeutic infrastructure, staffed by attending consultants."
        breadcrumbs={[{ label: 'Departments' }]}
      />

      <section className="section-padding bg-light">
        <div className="container">
          <div className="filter-bar">
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon" aria-hidden="true" />
              <input
                type="text"
                className="form-input search-input"
                placeholder="Search departments by specialty or name..."
                value={searchTerm}
                aria-label="Search departments by specialty or name"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="btn-clear-search"
                  aria-label="Clear Search"
                  onClick={() => setSearchTerm('')}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <LoadingState message="Loading department catalog..." />
          ) : error ? (
            <ErrorState message={error} onRetry={loadData} />
          ) : filteredDepts.length === 0 ? (
            <EmptyState
              title="No departments found"
              message={`No clinical specialties matched "${searchTerm}".`}
              actionLabel="Clear Search"
              onAction={() => setSearchTerm('')}
            />
          ) : (
            <div className="cards-grid">
              {filteredDepts.map((dept) => (
                <DepartmentCard key={dept.id} department={dept} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
