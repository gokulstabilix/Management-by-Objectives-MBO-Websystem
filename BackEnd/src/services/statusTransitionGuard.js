const { STATE_TRANSITIONS, ROLE_ACTIONS } = require('../config/constants');
const AppError = require('../utils/AppError');

/**
 * Validates whether a status transition is allowed for the given role.
 *
 * @param {string} currentStatus - Current form status
 * @param {string} action        - Requested action (submit, approve, reject, resubmit, freeze)
 * @param {string} actorRole     - 'employee' | 'mentor' | 'system'
 * @returns {{ allowed: boolean, nextStatus?: string, reason?: string }}
 */
function canTransition(currentStatus, action, actorRole) {
  // Check role is authorized for this action
  const allowedActions = ROLE_ACTIONS[actorRole];
  if (!allowedActions || !allowedActions.includes(action)) {
    return { allowed: false, reason: `Role '${actorRole}' cannot perform action '${action}'.` };
  }

  // Check the transition exists from current status
  const transitions = STATE_TRANSITIONS[currentStatus];
  if (!transitions || !transitions[action]) {
    return {
      allowed: false,
      reason: `Cannot '${action}' a form with status '${currentStatus}'.`,
    };
  }

  return { allowed: true, nextStatus: transitions[action] };
}

/**
 * Guard wrapper — throws AppError if transition is invalid.
 */
function assertTransition(currentStatus, action, actorRole) {
  const result = canTransition(currentStatus, action, actorRole);
  if (!result.allowed) {
    throw new AppError(result.reason, 400);
  }
  return result.nextStatus;
}

module.exports = { canTransition, assertTransition };
