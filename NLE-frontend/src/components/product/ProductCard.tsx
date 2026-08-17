import React, { useState, useEffect } from 'react';
import { Heart, ArrowRight } from 'lucide-react';
import type { AdminProduct } from '../../types';
import { cn } from '../../utils/utils';
import { useAuth } from '../../hooks/useAuth';
import { getApiUrl } from '../../services/api.service';
import { getBadgeColorClass } from '../../utils/badges';
import { trackSelectItem, trackWishlistToggle } from '../../utils/analytics';

export interface ProductCardProps {
  product: AdminProduct;
  onViewDetails: (p: AdminProduct) => void;
  onBook?: (p: AdminProduct) => void;
  isAI?: boolean;
  isLanding?: boolean;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onViewDetails,
  onBook,
  isAI = false,
  className,
}) => {
  const [wished, setWished] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const auth = useAuth();

  useEffect(() => {
    setWished(Boolean(auth.user?.wishlist?.includes(product._id)));
  }, [auth.user?.wishlist, product._id]);

  const hasDiscount = Boolean(product.originalPrice && product.originalPrice > product.price);
  const discount = hasDiscount && product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleCardClick = () => {
    trackSelectItem(
      {
        item_id: product._id,
        item_name: product.name,
        item_category: product.categoryName,
        item_subcategory: product.subcategory,
        price: product.price,
      },
      product.categoryName
    );
    onViewDetails(product);
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !wished;
    setWished(next);
    trackWishlistToggle(next ? 'add' : 'remove', product._id, product.name);

    if (!auth.isLoggedIn) {
      auth.open('login');
      return;
    }

    try {
      await fetch(getApiUrl('/api/wishlist/toggle'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ productId: product._id }),
      });
      if (auth.user) {
        const currentWishlist = auth.user.wishlist || [];
        const updated = next
          ? [...currentWishlist, product._id]
          : currentWishlist.filter((id) => id !== product._id);
        auth.updateUser({ ...auth.user, wishlist: updated });
      }
    } catch {
      setWished(!next);
    }
  };

  return (
    <div
      data-card
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      onClick={handleCardClick}
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-[24px] transition-all duration-300 hover:-translate-y-1.5 cursor-pointer w-full h-full select-none',
        'bg-white dark:bg-[#201325] border border-[#EBE7DF] dark:border-[#38223E]',
        'shadow-[0_4px_20px_-4px_rgba(52,32,60,0.06)] hover:shadow-[0_16px_36px_-6px_rgba(52,32,60,0.14)] hover:border-[#C9BEAB]',
        isAI && 'w-full',
        className
      )}
    >
      {/* Interactive Mouse Tracking Spotlight */}
      {isHovered && (
        <div
          className="pointer-events-none absolute -inset-px opacity-25 transition-opacity duration-300 mix-blend-multiply dark:mix-blend-screen z-10"
          style={{
            background: `radial-gradient(220px circle at ${mousePos.x}px ${mousePos.y}px, rgba(167,138,159,0.2), transparent 70%)`,
          }}
        />
      )}

      {/* 1. Top Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F5EFE6] dark:bg-[#180E1C]">
        <img
          src={
            product.image ||
            'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop&q=80'
          }
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Soft bottom vignette for photo readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 opacity-60 group-hover:opacity-75 transition-opacity pointer-events-none" />

        {/* Badge Overlay */}
        {!isAI && product.badge && (
          <span
            className={cn(
              'absolute left-2.5 top-2.5 z-20 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider uppercase shadow-xs backdrop-blur-md',
              getBadgeColorClass(product.badgeColor)
            )}
          >
            {product.badge}
          </span>
        )}

        {/* Wishlist Button */}
        {!isAI && (
          <button
            type="button"
            className={cn(
              'absolute right-2.5 top-2.5 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/85 dark:bg-[#201325]/85 backdrop-blur-md border border-black/5 dark:border-white/10 shadow-xs transition-all duration-200 hover:bg-white hover:scale-110 active:scale-90 cursor-pointer',
              wished ? 'text-rose-500' : 'text-[#725D75] dark:text-[#C9BEAB] hover:text-rose-500'
            )}
            onClick={handleWishlistToggle}
            aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart size={14} fill={wished ? 'currentColor' : 'none'} />
          </button>
        )}

        {/* Category Tag Pill */}
        {!isAI && product.categoryName && (
          <span className="absolute bottom-2 left-2.5 z-20 rounded-full bg-white/90 dark:bg-black/80 border border-black/5 dark:border-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#34203C] dark:text-[#FAF8F5] shadow-xs backdrop-blur-md">
            {product.categoryName}
          </span>
        )}
      </div>

      {/* 2. Product Details Content */}
      <div className="relative z-20 flex flex-1 flex-col justify-between p-4 sm:p-4.5 text-left">
        <div>
          <h3 className="line-clamp-1 font-serif text-sm sm:text-[15px] font-bold text-[#2D1A33] dark:text-[#FAF8F5] tracking-[0.02em] leading-snug group-hover:text-[#A78A9F] transition-colors">
            {product.name}
          </h3>

          {product.description && (
            <p className="mt-1 line-clamp-1 text-xs font-light leading-relaxed text-[#725D75] dark:text-[#C8B5C3]">
              {product.description}
            </p>
          )}
        </div>

        {/* 3. Price & Action Row */}
        <div className="mt-3 flex items-center justify-between pt-3 border-t border-[#F0EBE1] dark:border-[#38223E]">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-base sm:text-lg font-bold tracking-tight text-[#2D1A33] dark:text-[#FAF8F5]">
                ₹{product.price?.toLocaleString('en-IN')}
              </span>
              {hasDiscount && (
                <span className="text-xs font-normal text-[#9B8B9E] line-through">
                  ₹{product.originalPrice?.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            {discount > 0 && (
              <span className="inline-block text-[10px] font-bold tracking-wider uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded mt-0.5">
                {discount}% OFF
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onBook) {
                onBook(product);
              } else {
                handleCardClick();
              }
            }}
            className="inline-flex items-center gap-1 rounded-full bg-[#FAF6F0] hover:bg-[#34203C] text-[#34203C] hover:text-white dark:bg-[#34203C] dark:hover:bg-[#C9BEAB] dark:text-white dark:hover:text-[#25172C] border border-[#DDD5C7] dark:border-[#483250] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:scale-103 active:scale-95 cursor-pointer shadow-xs"
          >
            <span>Book</span>
            <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
