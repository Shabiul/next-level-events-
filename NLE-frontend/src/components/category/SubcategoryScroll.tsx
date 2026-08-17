import React, { useState, useMemo } from 'react';
import { Share2 } from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';
import { BackButton } from '../ui/BackButton';
import { SearchBar } from '../ui/SearchBar';
import { useLanguage } from '../../hooks/useLanguage';

interface SubcategoryScrollProps {
  categoryName: string;
  subcategories: { name: string; image: string }[];
  onBack: () => void;
  onSelectSubcategory: (name: string) => void;
  onViewAll: () => void;
  onShare?: () => void;
}

export const SubcategoryScroll: React.FC<SubcategoryScrollProps> = ({
  categoryName,
  subcategories,
  onBack,
  onSelectSubcategory,
  onViewAll,
  onShare,
}) => {
  const { t } = useLanguage();
  const [filterText, setFilterText] = useState('');

  const filteredSubcategories = useMemo(() => {
    if (!filterText.trim()) return subcategories;
    const query = filterText.toLowerCase();
    return subcategories.filter(sub => sub.name.toLowerCase().includes(query));
  }, [subcategories, filterText]);

  return (
    <section className="mx-auto max-w-[1920px] px-4 py-6 sm:px-6 md:px-8 lg:px-12 animate-fade-in">
      {/* Top Navigation Bar */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <BackButton onClick={onBack} aria-label="Go back" />
        {onShare && (
          <button
            type="button"
            onClick={onShare}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#DDD5C7] bg-[#FAF8F5] px-3.5 py-1.5 text-xs font-semibold text-[#34203C] hover:bg-[#F5EFE6] dark:bg-[#2D1C34] dark:border-[#483250] dark:text-[#FAF8F5] transition-colors cursor-pointer"
            aria-label="Share category"
          >
            <Share2 size={13} />
            <span>Share</span>
          </button>
        )}
      </div>

      {/* Header */}
      <div className="mb-5">
        <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#34203C] dark:text-[#FAF8F5]">
          {categoryName}
        </h1>
        <p className="mt-1 max-w-md text-xs sm:text-sm text-[#725D75] dark:text-[#C8B5C3]">
          Browse curated subcategories and design setups for {categoryName}.
        </p>
      </div>

      {/* Search / Filter Input */}
      {subcategories.length > 0 && (
        <div className="mb-6">
          <SearchBar
            value={filterText}
            onChange={setFilterText}
            category={categoryName}
            placeholder={`Filter ${categoryName} themes...`}
          />
        </div>
      )}

      {/* Subcategory Grid */}
      {filteredSubcategories.length === 0 ? (
        <EmptyState
          title={filterText ? `No subcategories matching "${filterText}"` : (t?.no_subcategories || 'No subcategories yet')}
          description={filterText ? 'Try adjusting your search keywords.' : undefined}
          actionLabel={filterText ? 'Clear filter' : (t?.view_all_packages || 'View All Packages')}
          onAction={filterText ? () => setFilterText('') : onViewAll}
        />
      ) : (
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filteredSubcategories.map((sub, i) => (
            <button
              key={sub.name}
              onClick={() => onSelectSubcategory(sub.name)}
              className="group relative flex flex-col overflow-hidden rounded-[20px] border border-[#DDD5C7]/70 bg-[#FAF8F5] shadow-xs transition-all duration-200 hover:border-[#34203C] dark:bg-[#2D1C34] dark:border-[#483250] dark:hover:border-[#C9BEAB] hover:shadow-md active:scale-95 text-left cursor-pointer"
              style={{
                animation: 'fadeIn 0.3s ease both',
                animationDelay: `${i * 30}ms`,
              }}
            >
              {/* Image */}
              <div className="aspect-[4/3] w-full overflow-hidden bg-[#F4F3F0] relative dark:bg-[#141414]">
                <img
                  src={sub.image}
                  alt={sub.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <span className="line-clamp-2 text-xs font-semibold text-white leading-snug">
                    {sub.name}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
};
