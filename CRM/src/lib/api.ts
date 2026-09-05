export function getApiBaseUrl(): string {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('crm_api_url');
      if (stored && stored.trim()) {
        return stored.trim().replace(/\/$/, '');
      }
    }
  } catch {
    // Ignore storage access errors
  }

  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim().replace(/\/$/, '');
  }

  if (import.meta.env.DEV) {
    return '';
  }

  return '';
}

export function setApiBaseUrl(url: string): void {
  try {
    if (typeof window !== 'undefined') {
      if (!url || !url.trim()) {
        localStorage.removeItem('crm_api_url');
      } else {
        localStorage.setItem('crm_api_url', url.trim().replace(/\/$/, ''));
      }
    }
  } catch {
    // Ignore storage access errors
  }
}

export function isBackendConfigured(): boolean {
  if (import.meta.env.DEV) return true;
  const base = getApiBaseUrl();
  return Boolean(base && /^https?:\/\//i.test(base));
}

export function getApiUrl(path: string): string {
  if (!path.startsWith('/')) {
    path = `/${path}`;
  }

  const base = getApiBaseUrl();

  if (import.meta.env.DEV && !base) {
    return path;
  }

  if (!base) {
    return path;
  }

  return `${base}${path}`;
}

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem('token');
  } catch {
    return null;
  }
}

function isOurApi(url: string): boolean {
  const base = getApiBaseUrl();
  if (url.startsWith('/api/') || url === '/api') return true;
  if (base && url.startsWith(`${base}/api`)) return true;
  return false;
}

/**
 * fetch() that attaches the bearer token to requests aimed at our own API
 * (never to third parties such as Cloudinary) and defaults JSON requests to
 * `Content-Type: application/json`. Use this for every authenticated call.
 */
export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const url = typeof input === 'string' ? input : input.toString();
  const token = getStoredToken();

  const headers: Record<string, string> = {
    ...(init.body && !(init.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
    ...((init.headers as Record<string, string>) || {}),
  };
  if (token && isOurApi(url) && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(input, { ...init, headers });

  // If response is 405 (Method Not Allowed) or returns HTML when expecting API JSON
  const contentType = response.headers.get('content-type') || '';
  if (response.status === 405 || (contentType.includes('text/html') && url.includes('/api/'))) {
    console.warn(
      `[CRM API Warning] Server returned ${response.status} (${contentType || 'non-JSON'}) from "${url}". ` +
      `Ensure VITE_API_URL is configured in your Vercel CRM Project Settings or set a custom API URL in the CRM settings.`
    );
  }

  return response;
}

