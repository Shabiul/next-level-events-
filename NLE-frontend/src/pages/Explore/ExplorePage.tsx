import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, ArrowUpDown, Home as HomeIcon, ChevronRight, Check, X } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import { SeoHead } from '../../components/layout/SeoHead';
import { EmptyState } from '../../components/ui/EmptyState';
import { ProductCard } from '../../components/product/ProductCard';
import { cn } from '../../utils/utils';
import { productMatchesQuery, expandQuery, EMPTY_SEARCH_HINT } from '../../utils/serviceSearch';
import type { AdminProduct } from '../../types';

interface ExplorePageProps {
  onViewProduct?: (product: AdminProduct) => void;
  onBookProduct?: (product: AdminProduct) => void;
}

const PRESET_CATEGORIES = [
  'ALL',
  'BIRTHDAY',
  'ROMANTIC',
  'BABY SHOWER',
  'HALDI & TRADITIONAL',
  'PROPOSAL',
];

const PRICE_BRACKETS: { value: string; label: string }[] = [
  { value: 'all', label: 'All Price Ranges' },
  { value: 'under_3000', label: 'Under ₹3,000' },
  { value: '3000_6000', label: '₹3,000 – ₹6,000' },
  { value: 'above_6000', label: '₹6,000 & Above' },
];

const SORT_OPTIONS: { value: 'featured' | 'price_asc' | 'price_desc'; label: string }[] = [
  { value: 'featured', label: 'Featured First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

const FilterChip: React.FC<{ label: string; onClear: () => void }> = ({ label, onClear }) => (
  <button
    type="button"
    onClick={onClear}
    className="inline-flex items-center gap-1.5 rounded-full border border-[#381932]/20 bg-[#A78A9F]/12 pl-3 pr-2 py-1 text-[11px] font-semibold text-[#381932] hover:bg-[#A78A9F]/20 transition-colors cursor-pointer"
  >
    {label}
    <X size={11} strokeWidth={2.5} className="text-[#381932]/60" />
  </button>
);

export const ExplorePage: React.FC<ExplorePageProps> = ({
  onViewProduct,
  onBookProduct,
}) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, categories, loading } = useProducts();

  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('cat') || 'ALL';

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam.toUpperCase());
  const [selectedPriceBracket, setSelectedPriceBracket] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc'>('featured');

  useEffect(() => {
    if (queryParam !== searchQuery) setSearchQuery(queryParam);
  }, [queryParam]);

  useEffect(() => {
    if (categoryParam) setSelectedCategory(categoryParam.toUpperCase());
  }, [categoryParam]);

  // Dynamically build category tabs from DB + presets
  const categoryTabs = useMemo(() => {
    if (!categories || categories.length === 0) return PRESET_CATEGORIES;

    const dbNames = categories.map((c) => (c.name || '').trim().toUpperCase()).filter(Boolean);
    const combined = Array.from(new Set(['ALL', ...PRESET_CATEGORIES.slice(1), ...dbNames]));
    return combined;
  }, [categories]);

  const handleCategorySelect = (catName: string) => {
    const uppercaseCat = catName.toUpperCase();
    setSelectedCategory(uppercaseCat);
    const newParams = new URLSearchParams(searchParams);
    if (uppercaseCat === 'ALL') {
      newParams.delete('cat');
    } else {
      newParams.set('cat', uppercaseCat);
    }
    setSearchParams(newParams);
  };

  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Robust Smart Category & Synonym Filter
    if (selectedCategory && selectedCategory !== 'ALL') {
      const target = selectedCategory.toLowerCase();
      list = list.filter((p: AdminProduct) => {
        const cat = (p.categoryName || '').toLowerCase();
        const sub = (p.subcategory || '').toLowerCase();
        const name = (p.name || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();

        // 1. Exact or substring match
        if (cat.includes(target) || sub.includes(target) || name.includes(target) || desc.includes(target)) {
          return true;
        }

        // 2. Smart synonym matching
        if (target.includes('birthday')) {
          return cat.includes('birthday') || name.includes('birthday') || sub.includes('birthday');
        }
        if (target.includes('romantic')) {
          return (
            cat.includes('romantic') ||
            cat.includes('anniversary') ||
            name.includes('romantic') ||
            name.includes('candlelight') ||
            name.includes('cabana') ||
            name.includes('anniversary')
          );
        }
        if (target.includes('baby shower') || target.includes('baby')) {
          return (
            cat.includes('baby') ||
            cat.includes('cradle') ||
            name.includes('baby') ||
            name.includes('shower') ||
            name.includes('welcome baby')
          );
        }
        if (target.includes('haldi') || target.includes('traditional') || target.includes('festive')) {
          return (
            cat.includes('haldi') ||
            cat.includes('traditional') ||
            cat.includes('festiv') ||
            name.includes('haldi') ||
            name.includes('marigold') ||
            cat.includes('wedding')
          );
        }
        if (target.includes('proposal')) {
          return (
            cat.includes('proposal') ||
            name.includes('proposal') ||
            name.includes('marry me') ||
            name.includes('ring')
          );
        }

        return false;
      });
    }

    // Search query filter -- partial, case-insensitive, synonym / plural aware
    if (searchQuery.trim()) {
      list = list.filter((p: AdminProduct) => productMatchesQuery(p, searchQuery));
    }

    // Price bracket filter
    if (selectedPriceBracket === 'under_3000') {
      list = list.filter((p: AdminProduct) => p.price < 3000);
    } else if (selectedPriceBracket === '3000_6000') {
      list = list.filter((p: AdminProduct) => p.price >= 3000 && p.price <= 6000);
    } else if (selectedPriceBracket === 'above_6000') {
      list = list.filter((p: AdminProduct) => p.price > 6000);
    }

    // Sort order
    if (sortBy === 'price_asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (searchQuery.trim()) {
      // Default sort with an active search -> most relevant first
      const terms = expandQuery(searchQuery);
      const rank = (p: AdminProduct) => {
        const name = (p.name || '').toLowerCase();
        const meta = `${p.categoryName || ''} ${p.subcategory || ''}`.toLowerCase();
        if (terms.some((t) => name.startsWith(t))) return 0;
        if (terms.some((t) => name.includes(t))) return 1;
        if (terms.some((t) => meta.includes(t))) return 2;
        return 3;
      };
      list.sort((a, b) => rank(a) - rank(b) || (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    } else {
      list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return list;
  }, [products, selectedCategory, searchQuery, selectedPriceBracket, sortBy]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedPriceBracket('all');
    setSortBy('featured');
    setSearchParams({});
  };

  const handleBook = (p: AdminProduct) => {
    if (onBookProduct) {
      onBookProduct(p);
    } else {
      navigate(`/booking/${p._id}`, { state: { product: p, preferredMethod: 'razorpay' } });
    }
  };

  const handleView = (p: AdminProduct) => {
    if (onViewProduct) {
      onViewProduct(p);
    } else {
      navigate(`/product/${p._id}`, { state: { product: p } });
    }
  };

  return (
    <>
      <SeoHead
        title="Explore Celebration Setups & Packages — The Decor Party"
        description="Discover signature balloon arches, terrace cabanas, and bespoke birthday themes across Bengaluru."
      />

      {/* No overflow-* here: any value other than `visible` (clip included) turns
          this into a scroll container and kills position: sticky on the filter
          card below. Horizontal bleed is already clipped by #root / body. */}
      <div className="relative min-h-screen bg-[#FFF3E6] dark:bg-[#381932] text-[#381932] dark:text-[#FFF3E6] font-sans antialiased transition-colors pb-20">
        
        {/* ========================================================================= */}
        {/* 1. EDITORIAL HERO -- matches the landing-page heading treatment          */}
        {/* ========================================================================= */}
        <section className="relative w-full min-h-[56vh] sm:min-h-[62vh] overflow-hidden flex items-center bg-[#381932]">
          {/* Landscape backdrop */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <img
              src="/explore2.jpeg"
              alt="The Decor Party celebration setups"
              className="w-full h-full object-cover object-center brightness-[0.85] saturate-[1.05]"
            />
            {/* Plum scrims -- left for the copy, base for the transition into the page */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#381932]/92 via-[#381932]/45 to-[#381932]/10" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#381932]/85 via-transparent to-[#381932]/25" />
          </div>

          {/* Left-aligned editorial content */}
          <div className="relative z-10 w-full max-w-[1720px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 pt-24 pb-16">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-3 text-[#FFF3E6] text-[10px] sm:text-xs font-serif font-semibold uppercase tracking-[0.28em]">
                <span className="h-px w-8 sm:w-12 bg-[#A78A9F]" />
                Curated Celebration Experiences
              </span>

              <h1 className="mt-4 font-serif text-[2.4rem] leading-[1.06] sm:text-5xl md:text-6xl lg:text-[3.9rem] font-semibold uppercase text-[#FFF3E6] tracking-tight drop-shadow-[0_4px_24px_rgba(56,25,50,0.85)]">
                Explore{' '}
                <span className="font-script lowercase normal-case font-normal tracking-normal text-[#A78A9F] text-[1.2em] leading-[0.95] align-baseline drop-shadow-[0_2px_20px_rgba(56,25,50,0.7)]">
                  Themes
                </span>{' '}
                &amp; Setups
              </h1>

              <p className="mt-5 max-w-md text-sm sm:text-base text-[#FFF3E6]/90 font-sans font-light leading-relaxed drop-shadow-[0_2px_10px_rgba(56,25,50,0.85)]">
                Discover signature balloon arches, terrace cabanas, and bespoke birthday themes styled across Bengaluru.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. BREADCRUMB                                                            */}
        {/* ========================================================================= */}
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 max-w-[1720px] mx-auto pt-6">
          <nav className="flex items-center gap-1.5 text-xs font-medium text-[#381932] dark:text-[#381932]">
            <button type="button" onClick={() => navigate('/')} className="flex items-center gap-1 hover:text-[#381932] cursor-pointer">
              <HomeIcon size={12} /> Home
            </button>
            <ChevronRight size={12} />
            <span className="text-[#381932] dark:text-[#FFF3E6] font-semibold">
              {selectedCategory === 'ALL' ? 'Shop' : selectedCategory.charAt(0) + selectedCategory.slice(1).toLowerCase()}
            </span>
          </nav>
        </div>

        {/* ========================================================================= */}
        {/* 3. SIDEBAR FILTERS + PRODUCT GRID                                        */}
        {/* ========================================================================= */}
        <section id="products-grid" className="relative z-20 w-full py-6 sm:py-8 px-4 sm:px-6 md:px-8 lg:px-12 max-w-[1720px] mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* ---- Sidebar: Filter By ----
                 Sticks below the header and never grows taller than the
                 viewport: the card itself scrolls internally so every filter
                 stays reachable while the product grid scrolls past. */}
            <aside className="w-full lg:w-64 shrink-0">
              <div className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto rounded-2xl border border-[#381932]/15 bg-[#FFF3E6] dark:bg-[#381932] dark:border-[#381932] p-5 flex flex-col gap-6 shadow-[0_1px_3px_rgba(56,25,50,0.08)] [scrollbar-width:thin] [scrollbar-color:rgba(56,25,50,0.2)_transparent]">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-1.5 text-sm font-semibold text-[#381932]">
                    <Filter size={14} /> Filter By
                  </h2>
                  {(searchQuery || selectedCategory !== 'ALL' || selectedPriceBracket !== 'all' || sortBy !== 'featured') && (
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="text-[11px] font-semibold text-[#A78A9F] hover:text-[#381932] transition-colors cursor-pointer"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Category */}
                <div className="flex flex-col gap-2.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-[#A78A9F] dark:text-[#381932]">Category</span>
                  <div className="flex flex-col gap-1">
                    {categoryTabs.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => handleCategorySelect(cat)}
                        className={cn(
                          'flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition-colors cursor-pointer',
                          selectedCategory === cat
                            ? 'bg-[#A78A9F]/15 text-[#381932] font-semibold'
                            : 'text-[#381932] dark:text-[#FFF3E6] hover:bg-[#FFF3E6] dark:hover:bg-[#FFF3E6]/5'
                        )}
                      >
                        <span
                          className={cn(
                            'flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border',
                            selectedCategory === cat ? 'border-[#381932] bg-[#381932]' : 'border-[#381932]/30 dark:border-[#381932]'
                          )}
                        >
                          {selectedCategory === cat && <Check size={9} className="text-[#FFF3E6]" />}
                        </span>
                        <span className="line-clamp-1">{cat.charAt(0) + cat.slice(1).toLowerCase()}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-[#381932]/12 dark:bg-[#FFF3E6]/15" />

                {/* Price */}
                <div className="flex flex-col gap-2.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-[#A78A9F] dark:text-[#381932]">Price</span>
                  <div className="flex flex-col gap-1">
                    {PRICE_BRACKETS.map((bracket) => (
                      <button
                        key={bracket.value}
                        type="button"
                        onClick={() => setSelectedPriceBracket(bracket.value)}
                        className={cn(
                          'flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition-colors cursor-pointer',
                          selectedPriceBracket === bracket.value
                            ? 'bg-[#A78A9F]/15 text-[#381932] font-semibold'
                            : 'text-[#381932] dark:text-[#FFF3E6] hover:bg-[#FFF3E6] dark:hover:bg-[#FFF3E6]/5'
                        )}
                      >
                        <span
                          className={cn(
                            'flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border',
                            selectedPriceBracket === bracket.value ? 'border-[#381932] bg-[#381932]' : 'border-[#381932]/30 dark:border-[#381932]'
                          )}
                        >
                          {selectedPriceBracket === bracket.value && <Check size={9} className="text-[#FFF3E6]" />}
                        </span>
                        {bracket.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* ---- Main: Sort bar + Grid ---- */}
            <div className="flex-1 min-w-0">
              <div className="w-full mb-5 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#381932]/12">
                <span className="text-sm font-semibold text-[#381932] dark:text-[#FFF3E6]">
                  {filteredProducts.length} celebration package{filteredProducts.length === 1 ? '' : 's'}
                  <span className="ml-1 font-normal text-[#381932]/55 dark:text-[#FFF3E6]/55">
                    {selectedCategory === 'ALL' ? 'across every theme' : `in ${selectedCategory.charAt(0) + selectedCategory.slice(1).toLowerCase()}`}
                  </span>
                </span>
                <label className="flex items-center gap-2 text-xs font-medium text-[#381932] dark:text-[#FFF3E6]">
                  <span className="hidden sm:inline text-[#381932]/60 dark:text-[#FFF3E6]/60">Sort by</span>
                  <div className="relative flex items-center">
                    <ArrowUpDown size={12} className="absolute left-3 text-[#381932]/70 pointer-events-none" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="appearance-none rounded-lg border border-[#381932]/20 dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] pl-8 pr-8 py-2 text-xs font-semibold text-[#381932] dark:text-[#FFF3E6] focus:outline-none focus:border-[#381932] cursor-pointer hover:border-[#381932]/40 transition-colors"
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <ChevronRight size={12} className="absolute right-2.5 rotate-90 text-[#381932]/60 pointer-events-none" />
                  </div>
                </label>
              </div>

              {/* Active filter chips */}
              {(searchQuery.trim() || selectedCategory !== 'ALL' || selectedPriceBracket !== 'all') && (
                <div className="mb-5 flex flex-wrap items-center gap-2">
                  {searchQuery.trim() && (
                    <FilterChip label={`“${searchQuery.trim()}”`} onClear={() => { setSearchQuery(''); const p = new URLSearchParams(searchParams); p.delete('q'); setSearchParams(p); }} />
                  )}
                  {selectedCategory !== 'ALL' && (
                    <FilterChip label={selectedCategory.charAt(0) + selectedCategory.slice(1).toLowerCase()} onClear={() => handleCategorySelect('ALL')} />
                  )}
                  {selectedPriceBracket !== 'all' && (
                    <FilterChip
                      label={PRICE_BRACKETS.find((b) => b.value === selectedPriceBracket)?.label || 'Price'}
                      onClear={() => setSelectedPriceBracket('all')}
                    />
                  )}
                </div>
              )}

              {loading ? (
                <div className="py-24 flex flex-col items-center justify-center gap-3">
                  <div className="h-8 w-8 rounded-full border-2 border-[#381932] dark:border-[#FFF3E6] border-t-transparent animate-spin" />
                  <span className="text-xs font-medium text-[#381932] dark:text-[#FFF3E6]">
                    Loading celebration packages...
                  </span>
                </div>
              ) : filteredProducts.length === 0 ? (
                <EmptyState
                  title={
                    searchQuery.trim()
                      ? `No celebrations found for “${searchQuery.trim()}”`
                      : 'No packages found'
                  }
                  description={
                    searchQuery.trim()
                      ? EMPTY_SEARCH_HINT
                      : "We couldn't find any decoration experiences matching your selected filters."
                  }
                  actionLabel="Clear All Filters"
                  onAction={clearAllFilters}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
                  {filteredProducts.map((p, idx) => (
                    <motion.div
                      key={p._id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: (idx % 3) * 0.08 }}
                      className="h-full"
                    >
                      <ProductCard
                        product={p}
                        onViewDetails={handleView}
                        onBook={handleBook}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ExplorePage;
