import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../../hooks/useWishlist';
import { ProductCard } from '../../components/product/ProductCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import type { AdminProduct } from '../../types';

export const WishlistPage: React.FC = () => {
  const navigate = useNavigate();
  const { wishlist, count } = useWishlist();

  return (
    <div className="mx-auto max-w-[1920px] px-4 py-6 sm:px-6 md:px-8 lg:px-12 animate-fade-in pb-20">
      <div className="mb-6 flex items-baseline justify-between border-b border-[#E8E7E3] pb-4 dark:border-[#2E2E2E]">
        <div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1C1C] dark:text-white">
            Saved Experiences
          </h1>
          <p className="text-xs sm:text-sm text-[#6F6F6B] dark:text-[#A0A09C] mt-0.5">
            {count} {count === 1 ? 'package' : 'packages'} saved for upcoming celebrations
          </p>
        </div>

        {count > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/explore')}
            className="rounded-full text-xs"
          >
            <span>Explore More</span>
          </Button>
        )}
      </div>

      {count === 0 ? (
        <div className="py-16 text-center">
          <EmptyState
            title="Your wishlist is empty"
            description="Explore our curated decoration packages and tap the heart icon to save your favorites."
            actionLabel="Discover Celebrations"
            onAction={() => navigate('/explore')}
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {wishlist.map((product: AdminProduct) => (
            <div key={product._id} className="h-full">
              <ProductCard
                product={product}
                onViewDetails={() => navigate(`/product/${product._id}`)}
                onBook={() => navigate(`/booking/${product._id}`)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
