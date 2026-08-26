import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Search, Filter, ArrowUpDown, X, Home as HomeIcon, ChevronRight, Check } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import { SeoHead } from '../../components/layout/SeoHead';
import { EmptyState } from '../../components/ui/EmptyState';
import { ProductCard } from '../../components/product/ProductCard';
import { cn } from '../../utils/utils';
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

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p: AdminProduct) =>
          p.name.toLowerCase().includes(q) ||
          (p.categoryName && p.categoryName.toLowerCase().includes(q)) ||
          (p.subcategory && p.subcategory.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
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
        title="Explore Celebration Setups & Packages — TheDecorParty"
        description="Discover signature balloon arches, terrace cabanas, and bespoke birthday themes across Bengaluru."
      />

      <div className="relative min-h-screen bg-[#F9F6F2] dark:bg-[#120B16] text-[#2F2930] dark:text-[#FAF8F5] font-sans antialiased transition-colors pb-20 overflow-x-hidden">
        
        {/* ========================================================================= */}
        {/* 1. CINEMATIC LUXURY FULL-BLEED HERO SECTION WITH UNIFIED SEARCH ISLAND   */}
        {/* ========================================================================= */}
        <section className="relative w-full min-h-[520px] sm:min-h-[580px] lg:min-h-[620px] overflow-hidden flex flex-col justify-between items-center text-center pt-24 sm:pt-28 pb-8 sm:pb-10 px-4 sm:px-6 bg-[#1B101F]">
          {/* High-Resolution Landscape Backdrop with Scrim */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <img 
              src="/explore2.jpeg" 
              alt="TheDecorParty Celebration Setups" 
              className="w-full h-full object-cover object-center brightness-[0.75] contrast-[1.05] saturate-[1.1] transform-gpu scale-100 transition-all duration-700"
            />
            {/* Soft Ambient Vignette & Scrim Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1B101F] via-[#1B101F]/40 to-[#1B101F]/70 pointer-events-none" />
            <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/20 to-black/60 pointer-events-none" />
          </div>

          {/* Centered Editorial Hero Content */}
          <div className="relative z-10 max-w-4xl mx-auto w-full flex flex-col items-center justify-center text-center px-4 my-auto pt-6">
            {/* Small Eyebrow */}
            <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-black/50 border border-white/25 text-[#F9F6F2] text-[10px] sm:text-xs font-semibold uppercase tracking-[0.22em] backdrop-blur-md mb-3 shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-[#A78A9F]" />
              CURATED CELEBRATION EXPERIENCES
            </span>

            {/* Large Editorial Heading */}
            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-[56px] font-semibold text-[#F9F6F2] leading-[1.05] tracking-tight max-w-4xl drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]">
              Explore <span className="text-[#C9BEAB] italic font-medium tracking-normal">Themes</span> &amp; Setups
            </h1>

            {/* Short Supporting Text */}
            <p className="mt-2 max-w-xl text-xs sm:text-sm md:text-base text-[#F9F6F2]/90 font-sans font-light leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
              Discover signature balloon arches, terrace cabanas, and bespoke birthday themes styled across Bengaluru.
            </p>
          </div>

          {/* BOTTOM: Floating Frosted Glass Category & Search Island */}
          <div className="relative z-20 w-full max-w-6xl mx-auto px-2 sm:px-4 mt-6">
            {/* Top Category Mode Tabs */}
            <div className="flex items-center justify-start sm:justify-center gap-1.5 overflow-x-auto rounded-full bg-black/50 p-1 backdrop-blur-xl border border-white/20 shadow-xl max-w-full sm:max-w-max mx-auto mb-2.5 hide-scrollbar px-2">
              {categoryTabs.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategorySelect(cat)}
                  className={cn(
                    'rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all whitespace-nowrap cursor-pointer shrink-0',
                    selectedCategory === cat
                      ? 'bg-[#F9F6F2] text-[#1B101F] shadow-md font-bold scale-102'
                      : 'text-white/80 hover:text-white hover:bg-white/15'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Floating Frosted Glass Search Capsule Bar */}
            <div className="flex w-full flex-col overflow-hidden rounded-2xl bg-white/95 shadow-[0_20px_50px_rgba(0,0,0,0.35)] border border-white/60 backdrop-blur-2xl dark:bg-[#1B101F]/95 dark:border-white/15 lg:flex-row lg:items-center lg:rounded-full lg:p-1.5">
              
              {/* 1. Theme or Keyword Input */}
              <label className="flex flex-1 cursor-text flex-col gap-0.5 border-b border-[#725D75]/8 px-4 py-2 dark:border-white/10 lg:border-b-0 lg:px-4 lg:py-1 lg:rounded-full lg:hover:bg-[#725D75]/5 dark:lg:hover:bg-white/5 text-left">
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#2F2930] dark:text-[#C9BEAB]">
                  <Search size={13} className="text-[#725D75]" />
                  <span>Search Keyword</span>
                </span>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="e.g. Ring Arch, Cabana, Pastel..."
                    value={searchQuery}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSearchQuery(val);
                      const newParams = new URLSearchParams(searchParams);
                      if (val) {
                        newParams.set('q', val);
                      } else {
                        newParams.delete('q');
                      }
                      setSearchParams(newParams);
                    }}
                    className="w-full border-none bg-transparent p-0 text-xs font-medium text-[#2F2930] placeholder:text-[#746B72]/60 focus:outline-none dark:text-[#FAF8F5] dark:placeholder:text-[#A78A9F]/60"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        const newParams = new URLSearchParams(searchParams);
                        newParams.delete('q');
                        setSearchParams(newParams);
                      }}
                      className="text-[#2F2930]/60 dark:text-white/60 hover:text-red-500 cursor-pointer ml-1"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              </label>

              {/* 2. Search Submit Button */}
              <div className="p-1 lg:p-0">
                <button
                  type="button"
                  onClick={() => {
                    const gridEl = document.getElementById('products-grid');
                    if (gridEl) gridEl.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#725D75] hover:bg-[#A78A9F] dark:bg-[#C9BEAB] dark:text-[#1B101F] dark:hover:bg-white text-[#F9F6F2] px-8 py-3 text-xs font-medium tracking-wide shadow-sm transition-colors cursor-pointer lg:rounded-full"
                >
                  <Search size={14} />
                  <span>SEARCH</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. BREADCRUMB                                                            */}
        {/* ========================================================================= */}
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 max-w-[1720px] mx-auto pt-6">
          <nav className="flex items-center gap-1.5 text-xs font-medium text-[#746B72] dark:text-[#A78A9F]">
            <button type="button" onClick={() => navigate('/')} className="flex items-center gap-1 hover:text-[#725D75] cursor-pointer">
              <HomeIcon size={12} /> Home
            </button>
            <ChevronRight size={12} />
            <span className="text-[#2F2930] dark:text-[#FAF8F5] font-semibold">
              {selectedCategory === 'ALL' ? 'Shop' : selectedCategory.charAt(0) + selectedCategory.slice(1).toLowerCase()}
            </span>
          </nav>
        </div>

        {/* ========================================================================= */}
        {/* 3. SIDEBAR FILTERS + PRODUCT GRID                                        */}
        {/* ========================================================================= */}
        <section id="products-grid" className="relative z-20 w-full py-6 sm:py-8 px-4 sm:px-6 md:px-8 lg:px-12 max-w-[1720px] mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* ---- Sidebar: Filter By ---- */}
            <aside className="w-full lg:w-64 shrink-0">
              <div className="lg:sticky lg:top-28 rounded-xl border border-[#E4DCD2] bg-white dark:bg-[#1A1220] dark:border-[#483250] p-5 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-1.5 text-sm font-semibold text-[#725D75]">
                    <Filter size={14} /> Filter By
                  </h2>
                  {(searchQuery || selectedCategory !== 'ALL' || selectedPriceBracket !== 'all' || sortBy !== 'featured') && (
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="text-[11px] font-semibold text-[#A78A9F] hover:text-[#725D75] cursor-pointer"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Category */}
                <div className="flex flex-col gap-2.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-[#746B72] dark:text-[#A78A9F]">Category</span>
                  <div className="flex flex-col gap-1">
                    {categoryTabs.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => handleCategorySelect(cat)}
                        className={cn(
                          'flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition-colors cursor-pointer',
                          selectedCategory === cat
                            ? 'bg-[#725D75]/10 text-[#725D75] font-semibold'
                            : 'text-[#2F2930] dark:text-[#FAF8F5] hover:bg-[#F3EFE7] dark:hover:bg-white/5'
                        )}
                      >
                        <span
                          className={cn(
                            'flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border',
                            selectedCategory === cat ? 'border-[#725D75] bg-[#725D75]' : 'border-[#E4DCD2] dark:border-[#483250]'
                          )}
                        >
                          {selectedCategory === cat && <Check size={9} className="text-white" />}
                        </span>
                        <span className="line-clamp-1">{cat.charAt(0) + cat.slice(1).toLowerCase()}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-[#E4DCD2] dark:bg-[#483250]" />

                {/* Price */}
                <div className="flex flex-col gap-2.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-[#746B72] dark:text-[#A78A9F]">Price</span>
                  <div className="flex flex-col gap-1">
                    {PRICE_BRACKETS.map((bracket) => (
                      <button
                        key={bracket.value}
                        type="button"
                        onClick={() => setSelectedPriceBracket(bracket.value)}
                        className={cn(
                          'flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition-colors cursor-pointer',
                          selectedPriceBracket === bracket.value
                            ? 'bg-[#725D75]/10 text-[#725D75] font-semibold'
                            : 'text-[#2F2930] dark:text-[#FAF8F5] hover:bg-[#F3EFE7] dark:hover:bg-white/5'
                        )}
                      >
                        <span
                          className={cn(
                            'flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border',
                            selectedPriceBracket === bracket.value ? 'border-[#725D75] bg-[#725D75]' : 'border-[#E4DCD2] dark:border-[#483250]'
                          )}
                        >
                          {selectedPriceBracket === bracket.value && <Check size={9} className="text-white" />}
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
              <div className="w-full mb-6 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-semibold text-[#746B72] dark:text-[#A78A9F]">
                  Showing {filteredProducts.length} celebration package{filteredProducts.length === 1 ? '' : 's'}
                </span>
                <label className="flex items-center gap-2 text-xs font-medium text-[#2F2930] dark:text-[#FAF8F5]">
                  <span className="hidden sm:inline text-[#746B72] dark:text-[#A78A9F]">Sort by</span>
                  <div className="relative flex items-center">
                    <ArrowUpDown size={12} className="absolute left-3 text-[#725D75] pointer-events-none" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="appearance-none rounded-lg border border-[#E4DCD2] dark:border-[#483250] bg-white dark:bg-[#1A1220] pl-8 pr-4 py-2 text-xs font-semibold text-[#2F2930] dark:text-[#FAF8F5] focus:outline-none focus:border-[#A78A9F] cursor-pointer"
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </label>
              </div>

              {loading ? (
                <div className="py-24 flex flex-col items-center justify-center gap-3">
                  <div className="h-8 w-8 rounded-full border-2 border-[#725D75] dark:border-white border-t-transparent animate-spin" />
                  <span className="text-xs font-medium text-[#746B72] dark:text-[#FAF8F5]">
                    Loading celebration packages...
                  </span>
                </div>
              ) : filteredProducts.length === 0 ? (
                <EmptyState
                  title="No packages found"
                  description="We couldn't find any decoration experiences matching your selected filters."
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
