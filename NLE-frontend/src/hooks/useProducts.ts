import { useState, useEffect, useMemo } from 'react';
import type { AdminProduct, AdminCategory } from '../types';
import { getApiUrl } from '../services/api.service';

export interface GroupedProducts {
  [categoryName: string]: AdminProduct[];
}

let memoryCategories: AdminCategory[] = [];
let memoryGrouped: GroupedProducts = {};
let memoryAllProducts: AdminProduct[] = [];

try {
  const savedCats = localStorage.getItem('tdp_cached_categories');
  if (savedCats) memoryCategories = JSON.parse(savedCats);
} catch {
  // ignore
}

export function useProducts() {
  const [grouped, setGrouped] = useState<GroupedProducts>(memoryGrouped);
  const [categories, setCategories] = useState<AdminCategory[]>(memoryCategories);
  const [products, setProducts] = useState<AdminProduct[]>(memoryAllProducts);
  const [loading, setLoading] = useState(memoryCategories.length === 0);

  useEffect(() => {
    Promise.all([
      fetch(getApiUrl('/api/products')).then(r => (r.ok ? r.json() : [])).catch(() => []),
      fetch(getApiUrl('/api/categories')).then(r => (r.ok ? r.json() : [])).catch(() => []),
    ])
      .then(([allProds, cats]: [AdminProduct[], AdminCategory[]]) => {
        if (Array.isArray(allProds)) {
          const active = allProds.filter(p => p?.active !== false);
          const groups: GroupedProducts = {};
          active.forEach(p => {
            const cat = p.categoryName || 'Other';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(p);
          });
          memoryGrouped = groups;
          memoryAllProducts = active;
          setGrouped(groups);
          setProducts(active);
        }

        if (Array.isArray(cats) && cats.length > 0) {
          const activeCats = cats.filter(c => c?.active !== false);
          memoryCategories = activeCats;
          setCategories(activeCats);
          try {
            localStorage.setItem('tdp_cached_categories', JSON.stringify(activeCats));
          } catch {
            // ignore
          }
        }
      })
      .catch(err => console.error('Failed to load data:', err))
      .finally(() => setLoading(false));
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
