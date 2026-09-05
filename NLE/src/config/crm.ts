/**
 * The admin console (CRM) is now a separate standalone app/deployment, not
 * a route on this site. Configure its URL via VITE_CRM_URL in production;
 * defaults to its local dev port.
 */
export const CRM_URL = import.meta.env.VITE_CRM_URL || 'http://localhost:3001';
