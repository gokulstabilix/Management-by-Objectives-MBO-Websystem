// ──────────────────────────────────────────────
// Application-wide constants and enum maps
// ──────────────────────────────────────────────

/** User roles */
const ROLES = Object.freeze({
  ADMIN: 'admin',
  HR: 'hr',
  EMPLOYEE: 'employee',
});

const ROLE_VALUES = Object.values(ROLES);

/** Employee levels (ascending seniority) */
const LEVELS = Object.freeze({
  JUNIOR: 'junior',
  MID: 'mid',
  SENIOR: 'senior',
  LEAD: 'lead',
});

const LEVEL_VALUES = Object.values(LEVELS);

/** Numeric hierarchy for level comparison */
const LEVEL_HIERARCHY = Object.freeze({
  junior: 0,
  mid: 1,
  senior: 2,
  lead: 3,
});

/**
 * Valid mentor → mentee level pairings.
 * Key = mentor level, Value = array of levels they can mentor.
 */
const VALID_MENTOR_PAIRINGS = Object.freeze({
  lead: ['senior', 'mid', 'junior'],
  senior: ['mid', 'junior'],
  mid: ['junior'],
  junior: [],
});

/** MBO form statuses */
const MBO_STATUS = Object.freeze({
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  FROZEN: 'frozen',
});

const MBO_STATUS_VALUES = Object.values(MBO_STATUS);

/** State machine transition table */
const STATE_TRANSITIONS = Object.freeze({
  draft: { submit: 'submitted', freeze: 'frozen' },
  submitted: { approve: 'approved', reject: 'rejected', freeze: 'frozen' },
  rejected: { resubmit: 'submitted', freeze: 'frozen' },
  approved: {},   // terminal
  frozen: {},     // terminal
});

/** Which roles can perform which state-machine actions */
const ROLE_ACTIONS = Object.freeze({
  employee: ['submit', 'resubmit'],
  mentor: ['approve', 'reject'],
  system: ['freeze'],
});

/** Quarter statuses */
const QUARTER_STATUS = Object.freeze({
  OPEN: 'open',
  CLOSED: 'closed',
});

const QUARTER_STATUS_VALUES = Object.values(QUARTER_STATUS);

/** Notification types */
const NOTIFICATION_TYPES = Object.freeze({
  FORM_SUBMITTED: 'form_submitted',
  FORM_APPROVED: 'form_approved',
  FORM_REJECTED: 'form_rejected',
  QUARTER_OPENED: 'quarter_opened',
  QUARTER_CLOSED: 'quarter_closed',
});

const NOTIFICATION_TYPE_VALUES = Object.values(NOTIFICATION_TYPES);

/** Mentor-review decisions */
const REVIEW_DECISIONS = Object.freeze({
  APPROVE: 'approve',
  REJECT: 'reject',
});

const REVIEW_DECISION_VALUES = Object.values(REVIEW_DECISIONS);

module.exports = {
  ROLES,
  ROLE_VALUES,
  LEVELS,
  LEVEL_VALUES,
  LEVEL_HIERARCHY,
  VALID_MENTOR_PAIRINGS,
  MBO_STATUS,
  MBO_STATUS_VALUES,
  STATE_TRANSITIONS,
  ROLE_ACTIONS,
  QUARTER_STATUS,
  QUARTER_STATUS_VALUES,
  NOTIFICATION_TYPES,
  NOTIFICATION_TYPE_VALUES,
  REVIEW_DECISIONS,
  REVIEW_DECISION_VALUES,
};
