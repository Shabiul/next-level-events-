import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { AdminProduct, Translations } from '../../types';
import { ProductCard } from './ProductCard';
import { cn } from '../../utils/utils';

export { ProductCard } from './ProductCard';

export interface ProductSliderProps {
  title: string;
  apiProducts: AdminProduct[];
  t?: Translations | Record<string, string>;
  onViewDetails: (product: AdminProduct) => void;
  onBook: (product: AdminProduct) => void;
  isLanding?: boolean;
  className?: string;
}

export const ProductSlider: React.FC<ProductSliderProps> = ({
  title,
  apiProducts,
  onViewDetails,
  onBook,
  isLanding = false,
  className = '',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const offset = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -offset : offset,
      behavior: 'smooth',
    });
  };

  if (!apiProducts || apiProducts.length === 0) return null;

  return (
    <div className={cn('py-4 sm:py-6 w-full', className)}>
      {/* Section Header */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h3 className="font-serif text-lg sm:text-xl md:text-2xl font-bold uppercase text-[#2F2930] dark:text-[#FAF8F5] tracking-[0.04em] leading-snug">
            {title}
          </h3>
          <p className="text-xs sm:text-[13px] font-normal text-[#746B72] dark:text-[#C8B5C3] tracking-normal mt-0.5">
            Verified decoration packages and bespoke celebration setups across Bengaluru.
          </p>
        </div>

        {/* Navigation Arrows */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => handleScroll('left')}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E4DCD2] bg-[#F9F6F2] text-[#2F2930] hover:bg-[#F9F6F2] hover:border-[#725D75] dark:bg-[#2D1C34] dark:border-[#483250] dark:text-[#FAF8F5] transition-all active:scale-95 cursor-pointer shadow-xs"
            aria-label="Scroll left"
          >
            <ChevronLeft size={17} />
          </button>
          <button
            type="button"
            onClick={() => handleScroll('right')}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E4DCD2] bg-[#F9F6F2] text-[#2F2930] hover:bg-[#F9F6F2] hover:border-[#725D75] dark:bg-[#2D1C34] dark:border-[#483250] dark:text-[#FAF8F5] transition-all active:scale-95 cursor-pointer shadow-xs"
            aria-label="Scroll right"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>

      {/* Scroll Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 pt-1 hide-scrollbar scroll-smooth snap-x snap-mandatory"
      >
        {apiProducts.map((product) => (
          <div
            key={product._id}
            className="w-[260px] sm:w-[280px] md:w-[310px] flex-shrink-0 snap-start"
          >
            <ProductCard
              product={product}
              onViewDetails={onViewDetails}
              onBook={onBook}
              isLanding={isLanding}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
