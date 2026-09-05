const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '');

export function getApiUrl(path: string): string {
  if (!path.startsWith('/')) {
    path = `/${path}`;
  }

  if (import.meta.env.DEV) {
    return path;
  }

  if (!API_BASE_URL) {
    return path;
  }

  return `${API_BASE_URL}${path}`;
}

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem('token');
  } catch {
    return null;
  }
}

function isOurApi(url: string): boolean {
  if (url.startsWith('/api/') || url === '/api') return true;
  if (API_BASE_URL && url.startsWith(`${API_BASE_URL}/api`)) return true;
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

  return fetch(input, { ...init, headers });
}
