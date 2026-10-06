import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

export default function ErrorState({
  title = 'Unable to Load Data',
  message = 'An unexpected error occurred while communicating with the hospital API.',
  onRetry
}) {
  return (
    <div className="error-state-card">
      <div className="error-state-icon-wrap">
        <AlertCircle size={36} className="error-state-icon" />
      </div>
      <h3 className="error-state-title">{title}</h3>
      <p className="error-state-text">{message}</p>
      {onRetry && (
        <Button variant="danger" size="sm" icon={RefreshCw} onClick={onRetry}>
          Retry Connection
        </Button>
      )}
    </div>
  );
}

