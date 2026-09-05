import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AdminCategory } from '../types';
import { useProducts } from './useProducts';
import {
  buildServiceIndex,
  searchServices,
  resolveEntryRoute,
  type SearchEntry,
} from '../utils/serviceSearch';

/**
 * Shared service-search behaviour used by the header search and the landing
 * hero search: live suggestions from the same index, arrow-key navigation, and
 * "go to the matched service, or fall back to a full /explore query".
 */
export function useServiceSearch(fallbackCategories: AdminCategory[] = []) {
  const navigate = useNavigate();
  const { products, categories: liveCategories } = useProducts();
  const [query, setQuery] = useState('');
  const [activeSuggestion, setActiveSuggestion] = useState(-1);

  const index = useMemo(
    () =>
      buildServiceIndex(
        liveCategories && liveCategories.length ? liveCategories : fallbackCategories,
        products
      ),
    [liveCategories, fallbackCategories, products]
  );

  const suggestions = useMemo(
    () => (query.trim().length >= 2 ? searchServices(query, index) : []),
    [query, index]
  );

  useEffect(() => {
    setActiveSuggestion(-1);
  }, [query]);

  const goToEntry = (entry: SearchEntry) => {
    setQuery('');
    navigate(resolveEntryRoute(entry));
  };

  const runSearch = () => {
    // An explicit arrow-key selection wins; otherwise prefer the first
    // category / sub-category match (so "anniversary" opens the Anniversary
    // category page rather than an empty /explore query), then any match.
    const pick =
      activeSuggestion >= 0
        ? suggestions[activeSuggestion]
        : suggestions.find((s) => s.kind === 'category' || s.kind === 'subcategory') ||
          suggestions[0];
    if (pick) {
      goToEntry(pick);
      return;
    }
    const q = query.trim();
    setQuery('');
    navigate(q ? `/explore?q=${encodeURIComponent(q)}` : '/explore');
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      runSearch();
      return;
    }
    if (!suggestions.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    }
  };

  return {
    query,
    setQuery,
    suggestions,
    activeSuggestion,
    setActiveSuggestion,
    onKeyDown,
    goToEntry,
    runSearch,
  };
}
