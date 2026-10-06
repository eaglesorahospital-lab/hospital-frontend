export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  try {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    const date = new Date(dateString + 'T00:00:00');
    return isNaN(date.getTime()) ? dateString : date.toLocaleDateString('en-US', options);
  } catch {
    return dateString;
  }
}

export function formatTime(timeString) {
  if (!timeString) return 'N/A';
  try {
    const [hours, minutes] = timeString.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHours = h % 12 || 12;
    return `${formattedHours}:${minutes} ${ampm}`;
  } catch {
    return timeString;
  }
}

export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return 'Free';
  const num = Number(amount);
  return isNaN(num) ? amount : `$${num.toFixed(2)}`;
}

export function getStatusBadge(status) {
  const map = {
    CONFIRMED: { label: 'Confirmed', className: 'badge-confirmed' },
    REQUESTED: { label: 'Requested', className: 'badge-warning' },
    CHECKED_IN: { label: 'Checked In', className: 'badge-info' },
    COMPLETED: { label: 'Completed', className: 'badge-success' },
    CANCELLED: { label: 'Cancelled', className: 'badge-danger' },
    RESCHEDULED: { label: 'Rescheduled', className: 'badge-purple' },
    NO_SHOW: { label: 'No Show', className: 'badge-neutral' }
  };
  return map[status] || { label: status || 'Unknown', className: 'badge-neutral' };
}

