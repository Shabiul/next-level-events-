export const DEFAULT_API_BASE_URL = 'https://the-decor-party.vercel.app';

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

  // When deployed to Vercel or any live host without an explicit VITE_API_URL:
  // Default to the production backend server so requests don't hit the SPA index.html
  return DEFAULT_API_BASE_URL;
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

export interface SafeJsonResponse<T> {
  data: T | null;
  error: string | null;
  isHtml: boolean;
  ok: boolean;
  status: number;
}

/**
 * Safely extracts JSON from a Response without crashing on HTML doctypes
 * or non-JSON payloads.
 */
export async function parseJsonSafe<T = any>(response: Response): Promise<SafeJsonResponse<T>> {
  const status = response.status;
  const ok = response.ok;
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('text/html')) {
    return {
      data: null,
      error: 'Server returned HTML instead of API data. The backend endpoint may not be responding.',
      isHtml: true,
      ok: false,
      status,
    };
  }

  try {
    const raw = await response.text();
    if (!raw || !raw.trim()) {
      return {
        data: null,
        error: ok ? null : `Server returned status ${status}`,
        isHtml: false,
        ok,
        status,
      };
    }

    if (raw.trim().startsWith('<')) {
      return {
        data: null,
        error: 'Server returned HTML document instead of JSON.',
        isHtml: true,
        ok: false,
        status,
      };
    }

    const data = JSON.parse(raw) as T;
    const err = !ok
      ? (data as any)?.message || (data as any)?.error || (data as any)?.msg || `Server returned status ${status}`
      : null;

    return {
      data,
      error: err,
      isHtml: false,
      ok,
      status,
    };
  } catch (parseErr: any) {
    return {
      data: null,
      error: parseErr?.message || 'Invalid JSON response from server',
      isHtml: false,
      ok: false,
      status,
    };
  }
}
