import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ message = 'Loading...', size = 32, fullPage = false }) {
  const content = (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem',
        gap: '0.75rem',
      }}
    >
      <Loader2
        size={size}
        className="animate-spin"
        style={{ color: 'var(--primary)' }}
        aria-hidden="true"
      />
      <span style={{ color: 'var(--gray-600)', fontSize: '0.95rem', fontWeight: 500 }}>
        {message}
      </span>
      <span className="sr-only" style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', border: 0 }}>
        Loading
      </span>
    </div>
  );

  if (fullPage) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {content}
      </div>
    );
  }

  return content;
}

