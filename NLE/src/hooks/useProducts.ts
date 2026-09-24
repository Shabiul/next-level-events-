import { useState, useMemo } from 'react';
import type { AdminProduct, AdminCategory } from '../types';
import { getApiUrl } from '../services/api.service';
import { DEFAULT_PRODUCTS, DEFAULT_CATEGORIES } from '../data/fallbackCatalog';
import { useLiveSync } from './useLiveSync';

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

  useLiveSync(async (force) => {
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
            const groups = buildGroups(active);
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
  }, ['products', 'categories']);

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
