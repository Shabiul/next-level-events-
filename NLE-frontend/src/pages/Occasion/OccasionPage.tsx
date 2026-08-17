import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Share2, Sparkles } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import { ProductCard } from '../../components/product/ProductCard';
import { SearchBar } from '../../components/ui/SearchBar';
import { EmptyState } from '../../components/ui/EmptyState';
import { BackButton } from '../../components/ui/BackButton';
import { ShareDialog } from '../../components/ui/ShareDialog';
import { SeoHead } from '../../components/layout/SeoHead';
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
    <>
      <SeoHead
        title={`${decodedSubcategory ? `${decodedSubcategory} — ` : ''}${decodedCategory} Decorations | TheDecorParty`}
        description={`Explore handcrafted ${decodedCategory} decoration setups, backdrops, and balloon styling in Bengaluru.`}
      />

      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#1B101F] text-[#34203C] dark:text-[#FAF8F5] transition-colors pb-24">
        <div className="mx-auto max-w-[1720px] px-4 py-6 sm:px-6 md:px-8 lg:px-12 animate-fade-in">
          
          {/* Top Bar */}
          <div className="mb-6 flex items-center justify-between gap-3">
            <BackButton onClick={() => navigate(-1)} aria-label="Go back" />
            <button
              type="button"
              onClick={() => setShareOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#DDD5C7] dark:border-[#483250] bg-white dark:bg-[#201325] px-3.5 py-1.5 text-xs font-semibold text-[#34203C] dark:text-[#FAF8F5] hover:bg-[#FAF6F0] dark:hover:bg-[#2F1D35] transition-colors cursor-pointer shadow-xs"
            >
              <Share2 size={13} />
              <span>Share</span>
            </button>
          </div>

          {/* Header Banner */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#725D75] dark:text-[#A78A9F] mb-2 font-medium tracking-wide">
              <span className="cursor-pointer hover:text-[#34203C] dark:hover:text-white transition-colors" onClick={() => navigate('/explore')}>
                All Categories
              </span>
              <span>/</span>
              <span className="font-semibold text-[#34203C] dark:text-[#FAF8F5]">{decodedCategory}</span>
              {decodedSubcategory && (
                <>
                  <span>/</span>
                  <span className="font-bold text-[#34203C] dark:text-white">{decodedSubcategory}</span>
                </>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-normal tracking-tight text-[#34203C] dark:text-[#FAF8F5] uppercase">
                {decodedSubcategory ? `${decodedSubcategory}` : decodedCategory}{' '}
                <span className="font-serif italic text-[#725D75] dark:text-[#C9BEAB] lowercase">
                  setups
                </span>
              </h1>

              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#725D75] dark:text-[#C9BEAB]">
                <Sparkles size={12} className="text-[#A78A9F]" />
                <span>{categoryProducts.length} Packages Available</span>
              </div>
            </div>

            <p className="mt-1 text-xs sm:text-sm md:text-base text-[#725D75] dark:text-[#C8B5C3] font-light max-w-2xl">
              Handcrafted balloon decorations, backdrops, and personalized milestone themes designed for {decodedCategory}.
            </p>
          </div>

          {/* Subcategory Pills Rail */}
          {subcategories.length > 0 && (
            <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                type="button"
                onClick={() => handleSubcategorySelect('__all__')}
                className={`whitespace-nowrap rounded-full px-4 sm:px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer border shadow-xs ${
                  !decodedSubcategory || decodedSubcategory === '__all__'
                    ? 'border-[#34203C] bg-[#34203C] text-[#FAF8F5] dark:bg-[#C9BEAB] dark:text-[#25172C] dark:border-[#C9BEAB]'
                    : 'border-[#DDD5C7] bg-[#FAF6F0] text-[#725D75] hover:bg-[#FAF8F5] hover:border-[#34203C] hover:text-[#34203C] dark:bg-[#201325] dark:border-[#483250] dark:text-[#C8B5C3]'
                }`}
              >
                All {decodedCategory}
              </button>
              {subcategories.map((sub) => (
                <button
                  key={sub.name}
                  type="button"
                  onClick={() => handleSubcategorySelect(sub.name)}
                  className={`whitespace-nowrap rounded-full px-4 sm:px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer border shadow-xs ${
                    decodedSubcategory === sub.name
                      ? 'border-[#34203C] bg-[#34203C] text-[#FAF8F5] dark:bg-[#C9BEAB] dark:text-[#25172C] dark:border-[#C9BEAB]'
                      : 'border-[#DDD5C7] bg-[#FAF6F0] text-[#725D75] hover:bg-[#FAF8F5] hover:border-[#34203C] hover:text-[#34203C] dark:bg-[#201325] dark:border-[#483250] dark:text-[#C8B5C3]'
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          )}

          {/* Search within Category */}
          <div className="mb-8">
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
              description={`No decoration experiences found matching your search in ${decodedSubcategory || decodedCategory}.`}
              actionLabel="Explore All Packages"
              onAction={() => navigate('/explore')}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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
      </div>
    </>
  );
};

export default OccasionPage;
