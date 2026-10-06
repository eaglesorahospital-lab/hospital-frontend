import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  HeartPulse,
  Stethoscope,
  ArrowRight,
  Baby,
  Bone,
  Brain,
  ShieldAlert
} from 'lucide-react';

export default function DepartmentCard({ department }) {
  if (!department) return null;

  const docCount = department.doctor_count !== undefined ? department.doctor_count : department.doctors_count;
  const countBadge = docCount !== undefined ? `${docCount} Specialists` : 'Specialized Care';

  const name = department.name || '';
  const lowerName = name.toLowerCase();

  let IconComponent = Activity;
  let accentClass = 'accent-blue';

  if (lowerName.includes('cardio') || lowerName.includes('heart')) {
    IconComponent = HeartPulse;
    accentClass = 'accent-red';
  } else if (lowerName.includes('neuro') || lowerName.includes('brain')) {
    IconComponent = Activity;
    accentClass = 'accent-indigo';
  } else if (lowerName.includes('ortho') || lowerName.includes('bone') || lowerName.includes('joint')) {
    IconComponent = Activity;
    accentClass = 'accent-teal';
  } else if (lowerName.includes('pediatric') || lowerName.includes('child')) {
    IconComponent = Activity;
    accentClass = 'accent-amber';
  } else if (lowerName.includes('emergency') || lowerName.includes('trauma')) {
    IconComponent = ShieldAlert;
    accentClass = 'accent-red';
  } else {
    IconComponent = Stethoscope;
    accentClass = 'accent-blue';
  }

  return (
    <div className={`department-card ${accentClass}`}>
      <div className="dept-icon-wrapper" aria-hidden="true">
        <IconComponent size={26} className="dept-icon" />
      </div>

      <div className="dept-content-wrap">
        <h3 className="dept-title">{name}</h3>
        <p className="dept-desc">
          {department.description ||
            'Comprehensive clinical diagnoses, therapeutic treatments, and specialized consultation by attending physicians.'}
        </p>
      </div>

      <div className="dept-footer">
        <span className="dept-badge">{countBadge}</span>
        <Link
          to={`/doctors?department=${department.id}`}
          className="dept-link"
          aria-label={`Explore Doctors in ${name}`}
        >
          <span>Explore Doctors</span>
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
