/**
 * permissions.js
 * ──────────────
 * Centralised, role-based permission helpers.
 *
 * All UI-level access decisions should flow through these functions so that
 * changes to business rules only need to be made in one place.
 *
 * ⚠️  Frontend checks are UX conveniences only.
 *     The backend enforces the same rules via the `authorize` middleware —
 *     these functions must stay in sync with backend role definitions.
 */

/** The canonical set of roles understood by the system. */
export const ROLES = {
  ADMIN: 'admin',
  HR: 'hr',
  EMPLOYEE: 'employee',
};

// ── Read permissions ──────────────────────────────────────────────────────────

/** Can view the Employee Directory (read list). */
export const canViewEmployees = (role) => [ROLES.ADMIN, ROLES.HR].includes(role);

/** Can view a specific employee profile. */
export const canViewEmployeeProfile = (role) => [ROLES.ADMIN, ROLES.HR].includes(role);

// ── Write permissions ─────────────────────────────────────────────────────────

/** Can create new employees. */
export const canCreateEmployee = (role) => [ROLES.ADMIN, ROLES.HR].includes(role);

/** Can edit employee details. */
export const canEditEmployee = (role) => [ROLES.ADMIN, ROLES.HR].includes(role);

/**
 * Can DELETE an employee.
 *
 * 🔒 Admin-only — mirrors: router.delete('/:id', authorize('admin'), ...)
 *    HR is explicitly excluded even though HR can perform other write operations.
 */
export const canDeleteEmployee = (role) => role === ROLES.ADMIN;

// ── Mentor-map permissions ────────────────────────────────────────────────────

/** Can assign / update mentor mappings. */
export const canManageMentorMap = (role) => role === ROLES.HR;

// ── Quarter permissions ───────────────────────────────────────────────────────

/** Can manage quarters (open/close). */
export const canManageQuarters = (role) => role === ROLES.ADMIN;
