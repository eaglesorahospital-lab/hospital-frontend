import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PageHero from '../components/common/PageHero';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import Button from '../components/common/Button';
import { Calendar, Clock, Stethoscope, CheckCircle2 } from 'lucide-react';
import { getDoctors, getDoctorAvailability } from '../services/api';
import { formatTime, formatDate } from '../utils/formatters';

export default function Availability() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(searchParams.get('doctor') || '');

  // Default to tomorrow's date formatted as YYYY-MM-DD
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState(searchParams.get('date') || defaultDateStr);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load doctors list on mount
  useEffect(() => {
    async function loadDoctorList() {
      try {
        const data = await getDoctors();
        setDoctors(data);
        if (!selectedDoctorId && data.length > 0) {
          setSelectedDoctorId(String(data[0].id));
        }
      } catch (err) {
        setError('Failed to load doctors list.');
      } finally {
        setInitialLoading(false);
      }
    }
    loadDoctorList();
  }, []);

  // Fetch slots whenever selected doctor or date changes
  useEffect(() => {
    if (!selectedDoctorId || !selectedDate) return;

    async function fetchSlots() {
      try {
        setLoading(true);
        setError(null);
        const data = await getDoctorAvailability(selectedDoctorId, selectedDate);
        setSlots(data);
      } catch (err) {
        setError('Unable to load consultation availability for this date.');
      } finally {
        setLoading(false);
      }
    }

    fetchSlots();
  }, [selectedDoctorId, selectedDate]);

  const handleBookSlot = (slot) => {
    navigate(`/book-appointment?doctor=${selectedDoctorId}&date=${selectedDate}&slot=${slot.id}`);
  };

  const selectedDoctorObj = doctors.find((d) => String(d.id) === String(selectedDoctorId));

  return (
    <div className="availability-page">
      <PageHero
        badge="Live Clinic Schedules"
        title="Check Doctor Availability"
        subtitle="Select a specialist physician and preferred consultation date to inspect real-time available appointment slots."
        breadcrumbs={[{ label: 'Availability' }]}
      />

      <section className="section-padding bg-light">
        <div className="container">
          {/* Doctor & Date Selection Controls Card */}
          <div className="availability-controls-card">
            <div className="control-group">
              <label className="form-label">
                <Stethoscope size={16} aria-hidden="true" />
                <span>Select Specialist:</span>
              </label>
              <select
                className="form-input form-select"
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                disabled={initialLoading}
                aria-label="Select Specialist"
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name.startsWith('Dr.') ? d.name : `Dr. ${d.name}`} (
                    {d.department?.name || d.department_name || 'Specialist'})
                  </option>
                ))}
              </select>
            </div>

            <div className="control-group">
              <label className="form-label">
                <Calendar size={16} aria-hidden="true" />
                <span>Consultation Date:</span>
              </label>
              <input
                type="date"
                className="form-input"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                aria-label="Consultation Date"
              />
            </div>
          </div>

          {/* Slots Presentation Grid */}
          <div className="slots-results-card">
            <div className="results-header">
              <div>
                <h3>Available Consultation Slots</h3>
                {selectedDoctorObj && (
                  <span className="results-subtitle">
                    {selectedDoctorObj.name} • {formatDate(selectedDate)}
                  </span>
                )}
              </div>
            </div>

            {loading ? (
              <LoadingState message="Checking clinic slot calendar..." />
            ) : error ? (
              <ErrorState message={error} onRetry={() => setSelectedDate(selectedDate)} />
            ) : slots.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="No Available Slots"
                message="No consultation slots are open for this physician on the selected date. Please choose another date or physician."
              />
            ) : (
              <div className="slots-grid">
                {slots.map((slot) => {
                  const isAvailable = slot.status === 'AVAILABLE' || !slot.status;
                  return (
                    <div
                      key={slot.id}
                      className={`slot-item ${isAvailable ? 'slot-open' : 'slot-booked'}`}
                    >
                      <div className="slot-time-box">
                        <Clock size={16} aria-hidden="true" />
                        <span>
                          {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                        </span>
                      </div>
                      {isAvailable ? (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleBookSlot(slot)}
                          aria-label={`Book slot ${formatTime(slot.start_time)}`}
                        >
                          Book Slot
                        </Button>
                      ) : (
                        <span className="badge-booked">Booked</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
