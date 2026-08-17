import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Filter, ArrowUpDown, X } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import { ProductCard } from '../../components/product/ProductCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { SearchBar } from '../../components/ui/SearchBar';
import type { AdminProduct } from '../../types';

interface ExplorePageProps {
  onViewProduct?: (product: AdminProduct) => void;
  onBookProduct?: (product: AdminProduct) => void;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({
  onViewProduct,
  onBookProduct,
}) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, categories } = useProducts();

  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('cat') || 'All';

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedPriceBracket, setSelectedPriceBracket] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc'>('featured');

  useEffect(() => {
    if (queryParam) setSearchQuery(queryParam);
  }, [queryParam]);

  useEffect(() => {
    if (categoryParam) setSelectedCategory(categoryParam);
  }, [categoryParam]);

  const handleCategorySelect = (catName: string) => {
    setSelectedCategory(catName);
    const newParams = new URLSearchParams(searchParams);
    if (catName === 'All') {
      newParams.delete('cat');
    } else {
      newParams.set('cat', catName);
    }
    setSearchParams(newParams);
  };

  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Category filter
    if (selectedCategory && selectedCategory !== 'All') {
      list = list.filter((p: AdminProduct) => p.categoryName === selectedCategory);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p: AdminProduct) =>
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
      // featured
      list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return list;
  }, [products, selectedCategory, searchQuery, selectedPriceBracket, sortBy]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedPriceBracket('all');
    setSortBy('featured');
    setSearchParams({});
  };

  return (
    <div className="mx-auto max-w-[1920px] px-4 py-6 sm:px-6 md:px-8 lg:px-12 animate-fade-in pb-20 bg-[#FAF8F5] dark:bg-[#1B101F] text-[#34203C] dark:text-[#FAF8F5]">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#34203C] dark:text-[#FAF8F5]">
          Explore Decoration Packages
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#725D75] dark:text-[#C8B5C3]">
          Browse our collection of 180+ verified balloon decor and celebration experiences.
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 flex flex-col gap-4">
        {/* Search Input */}
        <SearchBar
          value={searchQuery}
          onChange={(val) => {
            setSearchQuery(val);
            const newParams = new URLSearchParams(searchParams);
            if (val) {
              newParams.set('q', val);
            } else {
              newParams.delete('q');
            }
            setSearchParams(newParams);
          }}
          placeholder="Filter by theme, occasion, color or keyword..."
        />

        {/* Category Pills Rail */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
          <button
            type="button"
            onClick={() => handleCategorySelect('All')}
            className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer border ${
              selectedCategory === 'All'
                ? 'border-[#34203C] bg-[#34203C] text-white dark:bg-[#C9BEAB] dark:text-[#1B101F] dark:border-[#C9BEAB]'
                : 'border-[#DDD5C7] bg-white text-[#725D75] hover:border-[#34203C] dark:bg-[#2D1C34] dark:border-[#483250] dark:text-[#FAF8F5]'
            }`}
          >
            All Categories ({products.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id || cat.name}
              type="button"
              onClick={() => handleCategorySelect(cat.name)}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer border ${
                selectedCategory === cat.name
                  ? 'border-[#34203C] bg-[#34203C] text-white dark:bg-[#C9BEAB] dark:text-[#1B101F] dark:border-[#C9BEAB]'
                  : 'border-[#DDD5C7] bg-white text-[#725D75] hover:border-[#34203C] dark:bg-[#2D1C34] dark:border-[#483250] dark:text-[#FAF8F5]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Secondary Filter Bar: Price Bracket & Sort By */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-b border-[#DDD5C7] py-3 dark:border-[#483250]">
          {/* Price Filters */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-[#34203C] dark:text-[#FAF8F5] flex items-center gap-1">
              <Filter size={13} /> Budget:
            </span>
            <button
              type="button"
              onClick={() => setSelectedPriceBracket('all')}
              className={`rounded-md px-2.5 py-1 font-medium transition cursor-pointer ${
                selectedPriceBracket === 'all'
                  ? 'bg-[#34203C] text-white dark:bg-[#C9BEAB] dark:text-[#1B101F]'
                  : 'bg-[#F5EFE6] text-[#725D75] hover:text-[#34203C] dark:bg-[#231528] dark:text-[#C8B5C3]'
              }`}
            >
              All Prices
            </button>
            <button
              type="button"
              onClick={() => setSelectedPriceBracket('under_3000')}
              className={`rounded-md px-2.5 py-1 font-medium transition cursor-pointer ${
                selectedPriceBracket === 'under_3000'
                  ? 'bg-[#34203C] text-white dark:bg-[#C9BEAB] dark:text-[#1B101F]'
                  : 'bg-[#F5EFE6] text-[#725D75] hover:text-[#34203C] dark:bg-[#231528] dark:text-[#C8B5C3]'
              }`}
            >
              Under ₹3,000
            </button>
            <button
              type="button"
              onClick={() => setSelectedPriceBracket('3000_6000')}
              className={`rounded-md px-2.5 py-1 font-medium transition cursor-pointer ${
                selectedPriceBracket === '3000_6000'
                  ? 'bg-[#34203C] text-white dark:bg-[#C9BEAB] dark:text-[#1B101F]'
                  : 'bg-[#F5EFE6] text-[#725D75] hover:text-[#34203C] dark:bg-[#231528] dark:text-[#C8B5C3]'
              }`}
            >
              ₹3,000 – ₹6,000
            </button>
            <button
              type="button"
              onClick={() => setSelectedPriceBracket('above_6000')}
              className={`rounded-md px-2.5 py-1 font-medium transition cursor-pointer ${
                selectedPriceBracket === 'above_6000'
                  ? 'bg-[#34203C] text-white dark:bg-[#C9BEAB] dark:text-[#1B101F]'
                  : 'bg-[#F5EFE6] text-[#725D75] hover:text-[#34203C] dark:bg-[#231528] dark:text-[#C8B5C3]'
              }`}
            >
              ₹6,000+
            </button>
          </div>

          {/* Sort Control */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#725D75] dark:text-[#A78A9F] flex items-center gap-1">
              <ArrowUpDown size={13} /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-md border border-[#DDD5C7] bg-white px-2.5 py-1 text-xs font-medium text-[#34203C] focus:border-[#34203C] focus:outline-none dark:bg-[#2D1C34] dark:border-[#483250] dark:text-[#FAF8F5]"
            >
              <option value="featured">Featured First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Count & Clear filter button */}
      <div className="mb-4 flex items-center justify-between text-xs text-[#6F6F6B] dark:text-[#A0A09C]">
        <span>Showing {filteredProducts.length} celebration package{filteredProducts.length === 1 ? '' : 's'}</span>
        {(searchQuery || selectedCategory !== 'All' || selectedPriceBracket !== 'all' || sortBy !== 'featured') && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="inline-flex items-center gap-1 font-semibold text-[#1C1C1C] dark:text-white hover:underline cursor-pointer"
          >
            <X size={13} /> Clear Filters
          </button>
        )}
      </div>

      {/* Product Catalog Grid */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          title="No packages found"
          description="We couldn't find any decoration experiences matching your selected filters."
          actionLabel="Clear All Filters"
          onAction={clearAllFilters}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product: AdminProduct) => (
            <div key={product._id} className="h-full">
              <ProductCard
                product={product}
                onViewDetails={onViewProduct || ((p) => navigate(`/product/${p._id}`))}
                onBook={onBookProduct || ((p) => navigate(`/booking/${p._id}`))}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
