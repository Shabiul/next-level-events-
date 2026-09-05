/**
 * The customer site wires these into GA4; the admin console is internal-only
 * and doesn't need analytics, so these are no-ops kept only so the admin
 * view components (moved over unmodified) don't need edits.
 */
export function trackAdminAction(..._args: unknown[]) {}
export function trackLogin(..._args: unknown[]) {}
export function trackSignup(..._args: unknown[]) {}
