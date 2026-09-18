import { useState, useEffect, useMemo } from 'react';
import type { AdminProduct, AdminCategory } from '../types';
import { getApiUrl } from '../services/api.service';
import { DEFAULT_PRODUCTS, DEFAULT_CATEGORIES } from '../data/fallbackCatalog';

export interface GroupedProducts {
  [categoryName: string]: AdminProduct[];
}

const buildGroups = (list: AdminProduct[]): GroupedProducts => {
  const groups: GroupedProducts = {};
  list.forEach((p: AdminProduct) => {
    const cat = p.categoryName || 'Other';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(p);
  });
  return groups;
};

let memoryCategories: AdminCategory[] = DEFAULT_CATEGORIES;
let memoryAllProducts: AdminProduct[] = DEFAULT_PRODUCTS;
let memoryGrouped: GroupedProducts = buildGroups(DEFAULT_PRODUCTS);

const PRODUCTS_CACHE_KEY = 'tdp_cached_products';
const CATEGORIES_CACHE_KEY = 'tdp_cached_categories';
const CACHE_TIME_KEY = 'tdp_catalog_cache_time';

import { syncDeploymentCache, setCookie } from '../utils/cacheManager';

// Synchronize deployment version from cookie/storage before initializing state
syncDeploymentCache();

try {
  const savedCats = localStorage.getItem(CATEGORIES_CACHE_KEY);
  if (savedCats) {
    const parsedCats = JSON.parse(savedCats);
    if (Array.isArray(parsedCats) && parsedCats.length > 0) {
      memoryCategories = parsedCats;
    }
  }

  const savedProds = localStorage.getItem(PRODUCTS_CACHE_KEY);
  if (savedProds) {
    const parsed = JSON.parse(savedProds);
    // Ensure cache has a substantial catalog (at least 15 products) to avoid partial display lock-in
    if (Array.isArray(parsed) && parsed.length >= 15) {
      memoryAllProducts = parsed;
      memoryGrouped = buildGroups(parsed);
    }
  }
} catch {
  // ignore storage failures or JSON issues
}

export function useProducts() {
  const [grouped, setGrouped] = useState<GroupedProducts>(memoryGrouped);
  const [categories, setCategories] = useState<AdminCategory[]>(memoryCategories);
  const [products, setProducts] = useState<AdminProduct[]>(memoryAllProducts);
  const [loading, setLoading] = useState(memoryAllProducts.length === 0);

  useEffect(() => {
    let lastKnownVersion = 0;

    const fetchCatalog = async (force = false) => {
      try {
        const cacheBuster = force ? `?_t=${Date.now()}` : '';
        const [allProds, cats]: [AdminProduct[], AdminCategory[]] = await Promise.all([
          fetch(getApiUrl(`/api/products${cacheBuster}`), { cache: 'no-store' })
            .then((r) => (r.ok ? r.json() : []))
            .catch(() => []),
          fetch(getApiUrl(`/api/categories${cacheBuster}`), { cache: 'no-store' })
            .then((r) => (r.ok ? r.json() : []))
            .catch(() => []),
        ]);

        if (Array.isArray(allProds) && allProds.length > 0) {
          const active = allProds.filter((p) => p?.active !== false);
          if (active.length > 0) {
            const groups: GroupedProducts = {};
            active.forEach((p) => {
              const cat = p.categoryName || 'Other';
              if (!groups[cat]) groups[cat] = [];
              groups[cat].push(p);
            });
            memoryGrouped = groups;
            memoryAllProducts = active;
            setGrouped(groups);
            setProducts(active);

            try {
              localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(active));
              localStorage.setItem(CACHE_TIME_KEY, String(Date.now()));
              setCookie('tdp_client_cached', '1', 900);
            } catch {
              // ignore storage errors
            }
          }
        }

        if (Array.isArray(cats) && cats.length > 0) {
          const activeCats = cats.filter((c) => c?.active !== false);
          if (activeCats.length > 0) {
            memoryCategories = activeCats;
            setCategories(activeCats);
            try {
              localStorage.setItem(CATEGORIES_CACHE_KEY, JSON.stringify(activeCats));
            } catch {
              // ignore storage errors
            }
          }
        }

        if (force) {
          window.dispatchEvent(new CustomEvent('tdp_catalog_invalidate'));
        }
      } catch (err) {
        console.warn('[useProducts] Failed to revalidate catalog:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();

    // 1. Real-time Live Sync via Server-Sent Events (SSE)
    let eventSource: EventSource | null = null;
    try {
      const sseUrl = getApiUrl('/api/catalog/live');
      eventSource = new EventSource(sseUrl);

      eventSource.addEventListener('init', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          if (data?.version) lastKnownVersion = Number(data.version);
        } catch {}
      });

      eventSource.addEventListener('catalog_updated', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          if (data?.version) lastKnownVersion = Number(data.version);
        } catch {}
        fetchCatalog(true);
      });

      let sseErrorCount = 0;
      eventSource.onerror = () => {
        sseErrorCount++;
        if (sseErrorCount > 2) {
          eventSource?.close();
          eventSource = null;
        }
      };
    } catch {
      // ignore
    }

    // 2. Cross-tab synchronization via BroadcastChannel
    let broadcastChannel: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        broadcastChannel = new BroadcastChannel('tdp_catalog_sync');
        broadcastChannel.onmessage = (event) => {
          if (event?.data?.type === 'CATALOG_UPDATED') {
            fetchCatalog(true);
          }
        };
      } catch {}
    }

    // 3. Revalidate catalog on tab focus / visibility change with version check
    const checkVersionAndRevalidate = async () => {
      if (document.visibilityState !== 'visible') return;
      try {
        const res = await fetch(getApiUrl(`/api/catalog/version?_t=${Date.now()}`), { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json?.version && Number(json.version) !== lastKnownVersion) {
            lastKnownVersion = Number(json.version);
            fetchCatalog(true);
            return;
          }
        }
      } catch {}
      fetchCatalog(false);
    };

    window.addEventListener('focus', checkVersionAndRevalidate);
    document.addEventListener('visibilitychange', checkVersionAndRevalidate);
    window.addEventListener('tdp_catalog_invalidate', () => fetchCatalog(false));

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (broadcastChannel) {
        broadcastChannel.close();
      }
      window.removeEventListener('focus', checkVersionAndRevalidate);
      document.removeEventListener('visibilitychange', checkVersionAndRevalidate);
      window.removeEventListener('tdp_catalog_invalidate', () => fetchCatalog(false));
    };
  }, []);

  const featuredProducts = useMemo(() => products.filter(p => p.featured), [products]);
  const popularProducts = useMemo(() => products.slice(0, 10), [products]);
  const birthdayProducts = useMemo(
    () => products.filter(p => p.categoryName?.toLowerCase().includes('birthday')),
    [products]
  );
  const romanticProducts = useMemo(
    () => products.filter(p =>
      p.categoryName?.toLowerCase().includes('anniversary') ||
      p.categoryName?.toLowerCase().includes('romantic') ||
      p.categoryName?.toLowerCase().includes('canopy') ||
      p.categoryName?.toLowerCase().includes('cabana')
    ),
    [products]
  );

  return {
    products,
    grouped,
    categories,
    loading,
    featuredProducts,
    popularProducts,
    birthdayProducts,
    romanticProducts,
  };
}
