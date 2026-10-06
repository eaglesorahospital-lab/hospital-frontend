import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function PageHero({
  badge,
  title,
  subtitle,
  breadcrumbs = [],
  actions = null,
}) {
  return (
    <div className="page-hero-banner">
      <div className="container page-hero-content">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="page-breadcrumbs" aria-label="Breadcrumb">
            <Link to="/" className="breadcrumb-item">Home</Link>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight size={14} className="breadcrumb-sep" aria-hidden="true" />
                {crumb.to ? (
                  <Link to={crumb.to} className="breadcrumb-item">{crumb.label}</Link>
                ) : (
                  <span className="breadcrumb-item active" aria-current="page">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        {badge && (
          <div className="page-hero-badge-wrap">
            <span className="page-hero-badge">{badge}</span>
          </div>
        )}

        <h1 className="page-hero-title">{title}</h1>
        {subtitle && <p className="page-hero-subtitle">{subtitle}</p>}

        {actions && <div className="page-hero-actions">{actions}</div>}
      </div>
    </div>
  );
}
