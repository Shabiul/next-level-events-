// Some legacy-seeded products/categories store their image as a root-relative
// path (e.g. "/cabana.jpg") meaning "this site's own /public folder" -- correct
// when rendered on the customer site (same origin), but the CRM is a
// different origin entirely, so those paths resolved to crm.thedecorparty.com
// and 404'd, showing up as broken images. Resolve them against the customer
// site's origin instead; anything already absolute (http(s):// or //) is left
// untouched.
const SITE_URL = (import.meta.env.VITE_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

export function resolveImageUrl(src: string | undefined | null): string {
  if (!src) return '';
  if (/^(https?:)?\/\//i.test(src)) return src;
  return `${SITE_URL}${src.startsWith('/') ? '' : '/'}${src}`;
}
