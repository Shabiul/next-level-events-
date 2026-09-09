// Image URL resolver and resilient fallback handler for the CRM
// Automatically routes root-relative images (e.g. "/cabana.jpg") to the customer
// site origin (port 3000 in dev) or API server (port 5000), with auto-healing
// fallbacks so broken image icons never appear.

const rawSiteUrl = (import.meta.env.VITE_SITE_URL || '').trim();
const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim();

// Automatically sanitize: if it points to obsolete 5173 or is empty, use port 3000 in dev
const SITE_URL = (!rawSiteUrl || rawSiteUrl.includes(':5173'))
  ? 'http://localhost:3000'
  : rawSiteUrl.replace(/\/$/, '');

const API_URL = (rawApiUrl || 'http://localhost:5000').replace(/\/$/, '');

export function resolveImageUrl(src: string | undefined | null): string {
  if (!src) return '';
  if (/^(https?:)?\/\//i.test(src)) return src;
  const path = src.startsWith('/') ? src : `/${src}`;
  return `${SITE_URL}${path}`;
}

export function handleImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackSrc?: string
): void {
  const img = e.currentTarget;
  const currentSrc = img.src;

  // Prevent infinite retry loops
  const retryCount = Number(img.dataset.retries || 0);
  if (retryCount >= 3) {
    // Ultimate fallback: SVG placeholder
    img.src =
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300" fill="#FFF3E6">
          <rect width="400" height="300" fill="#FFF3E6" stroke="#381932" stroke-width="1"/>
          <circle cx="200" cy="130" r="35" fill="#381932" opacity="0.12"/>
          <path d="M185 140l10-15 10 12 15-20 20 28H160z" fill="#381932" opacity="0.35"/>
          <text x="50%" y="205" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#381932" opacity="0.6" letter-spacing="1">EVENT PACKAGE</text>
        </svg>
      `);
    return;
  }
  img.dataset.retries = String(retryCount + 1);

  // Step 0: If URL points to obsolete port 5173, immediately remap to port 3000
  if (currentSrc.includes(':5173')) {
    img.src = currentSrc.replace(':5173', ':3000');
    return;
  }

  // Step 1: If URL is on SITE_URL, try API_URL (backend server directly)
  if (SITE_URL && currentSrc.startsWith(SITE_URL) && SITE_URL !== API_URL) {
    img.src = currentSrc.replace(SITE_URL, API_URL);
    return;
  }
  if (currentSrc.includes(':3000')) {
    img.src = currentSrc.replace(':3000', ':5000');
    return;
  }

  // Step 2: Try alternate format (.webp <-> .jpg)
  if (currentSrc.endsWith('.webp')) {
    img.src = currentSrc.replace(/\.webp$/i, '.jpg');
    return;
  }
  if (/\.(jpe?g)$/i.test(currentSrc)) {
    img.src = currentSrc.replace(/\.(jpe?g)$/i, '.webp');
    return;
  }

  // Step 3: Explicit fallback image if provided
  if (fallbackSrc && currentSrc !== fallbackSrc) {
    img.src = fallbackSrc;
    return;
  }

  // Step 4: Final SVG placeholder
  img.src =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300" fill="#FFF3E6">
        <rect width="400" height="300" fill="#FFF3E6" stroke="#381932" stroke-width="1"/>
        <circle cx="200" cy="130" r="35" fill="#381932" opacity="0.12"/>
        <path d="M185 140l10-15 10 12 15-20 20 28H160z" fill="#381932" opacity="0.35"/>
        <text x="50%" y="205" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#381932" opacity="0.6" letter-spacing="1">EVENT PACKAGE</text>
      </svg>
    `);
}
