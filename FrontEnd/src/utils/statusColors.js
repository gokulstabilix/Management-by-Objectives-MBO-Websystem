/**
 * Status → Badge variant mapping for the extended MBO status machine.
 * Used by StatusBadge and list pages to render correct colors.
 */
export const STATUS_BADGE_MAP = {
  draft: { variant: 'default', label: 'Draft' },
  submitted: { variant: 'blue', label: 'Submitted' },
  approved: { variant: 'teal', label: 'P1 Approved' },
  rejected: { variant: 'danger', label: 'Action Required' },
  accomplishment_draft: { variant: 'warning', label: 'In Progress' },
  accomplishment_submitted: { variant: 'orange', label: 'Pending Review' },
  final_approved: { variant: 'success', label: 'Complete ✅' },
  final_rejected: { variant: 'danger', label: 'Action Required' },
  complete: { variant: 'success', label: 'Complete ✅' },
  frozen: { variant: 'purple', label: 'Frozen' },
  // Quarter statuses (kept for backward compat)
  Open: { variant: 'success', label: 'Open' },
  Closed: { variant: 'default', label: 'Closed' },
};

/**
 * Get status badge config from a raw status string.
 * Handles both lowercase backend values and capitalized display values.
 */
export const getStatusBadge = (status) => {
  if (!status) return { variant: 'default', label: status || 'Unknown' };

  // Try exact lowercase match first (backend value)
  if (STATUS_BADGE_MAP[status]) return STATUS_BADGE_MAP[status];

  // Try lowercase conversion
  const lower = status.toLowerCase();
  if (STATUS_BADGE_MAP[lower]) return STATUS_BADGE_MAP[lower];

  // Legacy capitalized match
  if (STATUS_BADGE_MAP[status]) return STATUS_BADGE_MAP[status];

  return { variant: 'default', label: status };
};
