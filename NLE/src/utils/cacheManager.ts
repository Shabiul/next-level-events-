/**
 * Cache & Deployment Version Management System
 * 
 * Prevents client devices from serving stale, corrupted, or partial cached catalog data
 * across updates. Synchronizes versioning with deployment cookies and localStorage.
 */

export const CURRENT_DEPLOY_VERSION = '2026.09.09.v2.5';
export const DEPLOY_VERSION_COOKIE_NAME = 'tdp_deploy_version';
export const STORED_DEPLOY_VERSION_KEY = 'tdp_cached_deploy_version';

// Catalog and display cache keys that must be purged when a new deployment is detected
export const CATALOG_CACHE_KEYS = [
  'tdp_cached_products',
  'tdp_cached_categories',
  'tdp_catalog_cache_time',
  'tdp_gallery_meta',
  'tdp_cached_addons',
  'tdp_cached_activities',
] as const;

// Temporary cache cookies to invalidate
export const CATALOG_CACHE_COOKIES = [
  'tdp_client_cached',
  'tdp_gallery_cached',
] as const;

/**
 * Retrieve a cookie value by name
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Write a cookie with secure defaults
 */
export function setCookie(name: string, value: string, maxAgeSeconds: number = 30 * 24 * 3600): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

/**
 * Delete a cookie by setting max-age to 0
 */
export function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

/**
 * Clears stale catalog cache from localStorage and temporary cookies.
 * Preserves user authentication (token, user profile, cart, language, theme).
 */
export function clearStaleCatalogCache(): void {
  if (typeof window === 'undefined') return;

  try {
    // Purge catalog-specific keys from localStorage
    CATALOG_CACHE_KEYS.forEach((key) => {
      localStorage.removeItem(key);
    });

    // Clear temporary cache cookies so server requests aren't suppressed
    CATALOG_CACHE_COOKIES.forEach((cookieName) => {
      deleteCookie(cookieName);
    });
  } catch (err) {
    console.warn('[CacheManager] Error clearing stale catalog cache:', err);
  }
}

export interface SyncResult {
  purged: boolean;
  reason?: 'new_deployment' | 'corrupt_partial_cache' | 'none';
  previousVersion?: string | null;
  currentVersion: string;
}

/**
 * Checks deployment version cookie and localStorage.
 * Only purges catalog data if a new deployment or update has occurred,
 * or if partial/corrupted data was previously stored on the client device.
 */
export function syncDeploymentCache(): SyncResult {
  if (typeof window === 'undefined') {
    return { purged: false, currentVersion: CURRENT_DEPLOY_VERSION, reason: 'none' };
  }

  try {
    // 1. Check if server supplied a deploy version cookie, or fall back to bundled version
    const serverCookieVersion = getCookie(DEPLOY_VERSION_COOKIE_NAME);
    const activeVersion = serverCookieVersion || CURRENT_DEPLOY_VERSION;

    // 2. Check client's currently recorded deploy version
    const storedVersion = localStorage.getItem(STORED_DEPLOY_VERSION_KEY);

    // 3. Detect new deployment rollout
    const isNewDeployment = !storedVersion || storedVersion !== activeVersion;

    // 4. Detect partial/corrupt display data from past testing (e.g. fewer than 15 products cached)
    let isCorruptOrPartial = false;
    const cachedProds = localStorage.getItem('tdp_cached_products');
    if (cachedProds) {
      try {
        const parsed = JSON.parse(cachedProds);
        if (!Array.isArray(parsed) || parsed.length < 15) {
          isCorruptOrPartial = true;
        }
      } catch {
        isCorruptOrPartial = true;
      }
    }

    if (isNewDeployment || isCorruptOrPartial) {
      const reason = isNewDeployment ? 'new_deployment' : 'corrupt_partial_cache';
      console.info(
        `[CacheManager] ${reason === 'new_deployment' ? 'New deployment detected' : 'Partial display cache detected'} (${storedVersion || 'none'} -> ${activeVersion}). Refreshing cached catalog data...`
      );

      // Purge catalog caches
      clearStaleCatalogCache();

      // Store updated version
      localStorage.setItem(STORED_DEPLOY_VERSION_KEY, activeVersion);
      setCookie(DEPLOY_VERSION_COOKIE_NAME, activeVersion, 30 * 24 * 3600);

      return {
        purged: true,
        reason,
        previousVersion: storedVersion,
        currentVersion: activeVersion,
      };
    }

    // Ensure cookie is in sync if missing
    if (!serverCookieVersion) {
      setCookie(DEPLOY_VERSION_COOKIE_NAME, activeVersion, 30 * 24 * 3600);
    }

    return { purged: false, currentVersion: activeVersion, reason: 'none' };
  } catch (err) {
    console.warn('[CacheManager] Deployment sync failed:', err);
    return { purged: false, currentVersion: CURRENT_DEPLOY_VERSION, reason: 'none' };
  }
}
