import React from 'react';

export default function LoadingState({ message = 'Loading data from clinic servers...', fullPage = false }) {
  return (
    <div className={`loading-state-container ${fullPage ? 'full-page-loading' : ''}`}>
      <div className="medical-spinner" aria-label="Loading" />
      <p className="loading-message">{message}</p>
    </div>
  );
}

