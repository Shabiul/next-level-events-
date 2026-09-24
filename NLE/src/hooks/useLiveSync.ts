import { useEffect, useRef } from 'react';
import { getApiUrl } from '../services/api.service';

/**
 * Shared revalidation plumbing behind every "keep this fresh" hook
 * (useProducts, useGalleryImages, useSiteSettings each hand-rolled an
 * identical copy of this): subscribes to the site-wide catalog SSE channel
 * + BroadcastChannel for cross-tab sync + focus/visibility, and calls
 * `revalidate(force)` whenever any of them fire. Each hook still owns its
 * own fetch/parse/cache logic (they differ -- useProducts fetches two
 * endpoints and groups them, others fetch one and cache differently), just
 * not the wiring that decides *when* to re-fetch.
 */
export function useLiveSync(revalidate: (force: boolean) => void): void {
  const revalidateRef = useRef(revalidate);
  revalidateRef.current = revalidate;

  useEffect(() => {
    revalidateRef.current(false);

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(getApiUrl('/api/catalog/live'));
      eventSource.addEventListener('catalog_updated', () => revalidateRef.current(true));
      let errorCount = 0;
      eventSource.onerror = () => {
        errorCount++;
        if (errorCount > 2) {
          eventSource?.close();
          eventSource = null;
        }
      };
    } catch {
      // ignore
    }

    let broadcastChannel: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        broadcastChannel = new BroadcastChannel('tdp_catalog_sync');
        broadcastChannel.onmessage = (event) => {
          if (event?.data?.type === 'CATALOG_UPDATED') revalidateRef.current(true);
        };
      } catch {
        // ignore
      }
    }

    const revalidateOnFocus = () => {
      if (document.visibilityState === 'visible') revalidateRef.current(true);
    };
    window.addEventListener('focus', revalidateOnFocus);
    document.addEventListener('visibilitychange', revalidateOnFocus);
    window.addEventListener('tdp_catalog_invalidate', revalidateOnFocus);

    return () => {
      eventSource?.close();
      broadcastChannel?.close();
      window.removeEventListener('focus', revalidateOnFocus);
      document.removeEventListener('visibilitychange', revalidateOnFocus);
      window.removeEventListener('tdp_catalog_invalidate', revalidateOnFocus);
    };
  }, []);
}
