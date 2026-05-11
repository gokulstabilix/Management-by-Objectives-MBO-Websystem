import { MBO_STATUSES } from '../constants/mboStatuses';

/**
 * Phase guard helper functions for the two-phase MBO flow.
 * These determine which parts of the form are editable based on status.
 */

/** Phase 1 is editable when form is in draft or rejected (P1 rejection). */
export const isPhase1Editable = (status) =>
  [MBO_STATUSES.DRAFT, MBO_STATUSES.REJECTED].includes(status);

/** Phase 2 unlocks after Phase 1 approval and stays unlocked for all subsequent states. */
export const isPhase2Unlocked = (status) =>
  [
    MBO_STATUSES.APPROVED,
    MBO_STATUSES.ACCOMPLISHMENT_DRAFT,
    MBO_STATUSES.ACCOMPLISHMENT_SUBMITTED,
    MBO_STATUSES.FINAL_APPROVED,
    MBO_STATUSES.FINAL_REJECTED,
    MBO_STATUSES.COMPLETE,
  ].includes(status);

/** Phase 2 fields are editable in accomplishment_draft or after final rejection. */
export const isPhase2Editable = (status) =>
  [MBO_STATUSES.ACCOMPLISHMENT_DRAFT, MBO_STATUSES.FINAL_REJECTED].includes(status);

/** Form is permanently locked after final approval or completion. */
export const isFinallyLocked = (status) =>
  [MBO_STATUSES.FINAL_APPROVED, MBO_STATUSES.COMPLETE].includes(status);

/** Mentor needs to review Phase 1 when status is 'submitted'. */
export const needsMentorPhase1Review = (status) =>
  status === MBO_STATUSES.SUBMITTED;

/** Mentor needs to review Phase 2 when status is 'accomplishment_submitted'. */
export const needsMentorPhase2Review = (status) =>
  status === MBO_STATUSES.ACCOMPLISHMENT_SUBMITTED;

/** Returns current phase number based on status. */
export const getCurrentPhase = (status) => {
  if ([MBO_STATUSES.DRAFT, MBO_STATUSES.SUBMITTED, MBO_STATUSES.REJECTED].includes(status)) return 1;
  if (isPhase2Unlocked(status)) return 2;
  return 1;
};
