import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Share2 } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import { ProductCard } from '../../components/product/ProductCard';
import { SearchBar } from '../../components/ui/SearchBar';
import { EmptyState } from '../../components/ui/EmptyState';
import { BackButton } from '../../components/ui/BackButton';
import { ShareDialog } from '../../components/ui/ShareDialog';
import type { AdminProduct } from '../../types';

interface OccasionPageProps {
  onViewProduct?: (product: AdminProduct) => void;
  onBookProduct?: (product: AdminProduct) => void;
}

export const OccasionPage: React.FC<OccasionPageProps> = ({
  onViewProduct,
  onBookProduct,
}) => {
  const { categoryName, subcategoryName } = useParams<{ categoryName: string; subcategoryName?: string }>();
  const navigate = useNavigate();
  const { categories, products, grouped } = useProducts();

  const [searchQuery, setSearchQuery] = useState('');
  const [shareOpen, setShareOpen] = useState(false);

  const decodedCategory = categoryName ? decodeURIComponent(categoryName) : '';
  const decodedSubcategory = subcategoryName ? decodeURIComponent(subcategoryName) : '';

  // Find category object
  const currentCategory = useMemo(() => {
    return categories.find(c => c.name.toLowerCase() === decodedCategory.toLowerCase());
  }, [categories, decodedCategory]);

  const subcategories = useMemo(() => {
    if (!currentCategory?.subcategories) return [];
    return currentCategory.subcategories.filter(
      (s): s is { name: string; image: string } => typeof s === 'object' && s !== null
    );
  }, [currentCategory]);

  // Packages in this category / subcategory
  const categoryProducts = useMemo(() => {
    const list = grouped[decodedCategory] || products.filter((p: AdminProduct) => p.categoryName === decodedCategory);

    let filtered = list;
    if (decodedSubcategory && decodedSubcategory !== '__all__') {
      filtered = filtered.filter((p: AdminProduct) => p.subcategory?.toLowerCase() === decodedSubcategory.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((p: AdminProduct) =>
        p.name.toLowerCase().includes(q) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    return filtered;
  }, [grouped, products, decodedCategory, decodedSubcategory, searchQuery]);

  const handleSubcategorySelect = (subName: string) => {
    if (subName === '__all__') {
      navigate(`/category/${encodeURIComponent(decodedCategory)}`);
    } else {
      navigate(`/category/${encodeURIComponent(decodedCategory)}/${encodeURIComponent(subName)}`);
    }
  };

  if (!decodedCategory) {
    return (
      <div className="mx-auto max-w-[1920px] px-4 py-12 text-center">
        <EmptyState
          title="Category not specified"
          actionLabel="Go to Explore"
          onAction={() => navigate('/explore')}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1920px] px-4 py-6 sm:px-6 md:px-8 lg:px-12 animate-fade-in pb-20">
      {/* Top Bar */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <BackButton onClick={() => navigate(-1)} aria-label="Go back" />
        <button
          type="button"
          onClick={() => setShareOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#E8E7E3] bg-white px-3 py-1.5 text-xs font-semibold text-[#1C1C1C] hover:bg-[#F4F3F0] dark:bg-[#1E1E1E] dark:border-[#2E2E2E] dark:text-white transition-colors cursor-pointer"
        >
          <Share2 size={13} />
          <span>Share</span>
        </button>
      </div>

      {/* Header Banner */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#6F6F6B] dark:text-[#A0A09C] mb-1">
          <span className="cursor-pointer hover:underline" onClick={() => navigate('/explore')}>
            Categories
          </span>
          <span>/</span>
          <span className="font-semibold text-[#1C1C1C] dark:text-white">{decodedCategory}</span>
          {decodedSubcategory && (
            <>
              <span>/</span>
              <span className="font-bold text-[#1C1C1C] dark:text-white">{decodedSubcategory}</span>
            </>
          )}
        </div>

        <h1 className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1C1C1C] dark:text-white">
          {decodedSubcategory ? `${decodedSubcategory} in ${decodedCategory}` : decodedCategory}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#6F6F6B] dark:text-[#A0A09C]">
          Handcrafted balloon decorations and milestone setups for {decodedCategory}.
        </p>
      </div>

      {/* Subcategory Pills Rail */}
      {subcategories.length > 0 && (
        <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
          <button
            type="button"
            onClick={() => handleSubcategorySelect('__all__')}
            className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer border ${
              !decodedSubcategory || decodedSubcategory === '__all__'
                ? 'border-[#1C1C1C] bg-[#1C1C1C] text-white dark:bg-white dark:text-black dark:border-white'
                : 'border-[#E8E7E3] bg-white text-[#6F6F6B] hover:border-[#1C1C1C] dark:bg-[#1E1E1E] dark:border-[#2E2E2E] dark:text-[#A0A09C]'
            }`}
          >
            All {decodedCategory}
          </button>
          {subcategories.map((sub) => (
            <button
              key={sub.name}
              type="button"
              onClick={() => handleSubcategorySelect(sub.name)}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer border ${
                decodedSubcategory === sub.name
                  ? 'border-[#1C1C1C] bg-[#1C1C1C] text-white dark:bg-white dark:text-black dark:border-white'
                  : 'border-[#E8E7E3] bg-white text-[#6F6F6B] hover:border-[#1C1C1C] dark:bg-[#1E1E1E] dark:border-[#2E2E2E] dark:text-[#A0A09C]'
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>
      )}

      {/* Search within Category */}
      <div className="mb-6">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          category={decodedCategory}
          subcategory={decodedSubcategory}
          placeholder={`Search in ${decodedCategory}...`}
        />
      </div>

      {/* Product Grid */}
      {categoryProducts.length === 0 ? (
        <EmptyState
          title="No packages found"
          description={`No decoration experiences found in ${decodedSubcategory || decodedCategory}.`}
          actionLabel="Explore All Packages"
          onAction={() => navigate('/explore')}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categoryProducts.map((product: AdminProduct) => (
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

      {/* Share Dialog */}
      <ShareDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        title={`${decodedCategory} Decorations - TheDecorParty`}
        text={`Check out ${decodedCategory} decoration experiences on TheDecorParty`}
        url={window.location.href}
      />
    </div>
  );
};
