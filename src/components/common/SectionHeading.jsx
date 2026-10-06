import React from 'react';

export default function SectionHeading({
  badge,
  title,
  subtitle,
  center = false,
  action,
  className = ''
}) {
  return (
    <div className={`section-heading-wrapper ${center ? 'text-center' : ''} ${className}`}>
      <div className="section-heading-content">
        {badge && <span className="badge-pill">{badge}</span>}
        {title && <h2 className="section-title">{title}</h2>}
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="section-heading-action">{action}</div>}
    </div>
  );
}

