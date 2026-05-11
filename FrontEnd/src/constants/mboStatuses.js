/**
 * MBO Status Constants
 * Defines the full lifecycle of an MBO form across both phases.
 */
export const MBO_STATUSES = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  ACCOMPLISHMENT_DRAFT: 'accomplishment_draft',
  ACCOMPLISHMENT_SUBMITTED: 'accomplishment_submitted',
  FINAL_APPROVED: 'final_approved',
  FINAL_REJECTED: 'final_rejected',
  COMPLETE: 'complete',
  FROZEN: 'frozen',
};

/**
 * Status display labels for UI badges and text.
 */
export const MBO_STATUS_LABELS = {
  [MBO_STATUSES.DRAFT]: 'Draft',
  [MBO_STATUSES.SUBMITTED]: 'Submitted',
  [MBO_STATUSES.APPROVED]: 'P1 Approved',
  [MBO_STATUSES.REJECTED]: 'Action Required',
  [MBO_STATUSES.ACCOMPLISHMENT_DRAFT]: 'In Progress',
  [MBO_STATUSES.ACCOMPLISHMENT_SUBMITTED]: 'Pending Review',
  [MBO_STATUSES.FINAL_APPROVED]: 'Complete ✅',
  [MBO_STATUSES.FINAL_REJECTED]: 'Action Required',
  [MBO_STATUSES.COMPLETE]: 'Complete ✅',
  [MBO_STATUSES.FROZEN]: 'Frozen',
};
