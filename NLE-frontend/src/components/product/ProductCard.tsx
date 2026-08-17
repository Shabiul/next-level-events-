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
        'group relative flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-[24px] transition-all duration-500 hover:-translate-y-1.5 cursor-pointer w-full h-full select-none',
        'bg-[#34203C] border border-[#A78A9F]/25 text-[#FAF8F5]',
        'shadow-[0_12px_28px_-6px_rgba(52,32,60,0.35)] hover:shadow-[0_22px_45px_-8px_rgba(167,138,159,0.3)] hover:border-[#A78A9F]/60',
        isAI && 'w-full',
        className
      )}
    >
      {/* 1. Ambient Radial Glow Background Blobs */}
      <div
        className="pointer-events-none absolute -top-8 -right-8 h-40 w-40 rounded-full opacity-20 blur-[40px] transition-all duration-700 group-hover:scale-130 group-hover:opacity-40"
        style={{
          background: 'radial-gradient(circle, #A78A9F 0%, rgba(167,138,159,0) 70%)',
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-10 -left-10 h-44 w-44 rounded-full opacity-20 blur-[45px] transition-all duration-700 group-hover:scale-130 group-hover:opacity-35"
        style={{
          background: 'radial-gradient(circle, #725D75 0%, #483250 50%, rgba(52,32,60,0) 75%)',
        }}
      />

      {/* Interactive Mouse Tracking Spotlight */}
      {isHovered && (
        <div
          className="pointer-events-none absolute -inset-px opacity-30 transition-opacity duration-300 mix-blend-screen z-10"
          style={{
            background: `radial-gradient(200px circle at ${mousePos.x}px ${mousePos.y}px, rgba(167,138,159,0.3), rgba(72,50,80,0.15), transparent 70%)`,
          }}
        />
      )}

      {/* 2. Top Image Container with Smooth Gradient Mask */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#24132B]">
        <img
          src={
            product.image ||
            'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop&q=80'
          }
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
        />

        {/* Smooth Gradient Image Fade directly into Japanese Violet #34203C */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to bottom, transparent 30%, rgba(52, 32, 60, 0.4) 65%, rgba(52, 32, 60, 0.95) 90%, #34203C 100%)',
          }}
        />

        {/* Badge Overlay */}
        {!isAI && product.badge && (
          <span
            className={cn(
              'absolute left-2.5 top-2.5 z-20 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase shadow-xs backdrop-blur-md',
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
              'absolute right-2.5 top-2.5 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-[#34203C]/80 backdrop-blur-md border border-[#A78A9F]/30 shadow-xs transition-all duration-200 hover:bg-[#34203C] hover:scale-110 active:scale-90 cursor-pointer',
              wished ? 'text-rose-500' : 'text-[#C9BEAB] hover:text-rose-500'
            )}
            onClick={handleWishlistToggle}
            aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart size={14} fill={wished ? 'currentColor' : 'none'} />
          </button>
        )}

        {/* Category Tag pill */}
        {!isAI && product.categoryName && (
          <span className="absolute bottom-2 left-2.5 z-20 rounded-full bg-[#483250]/90 border border-[#725D75]/60 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#C9BEAB] backdrop-blur-xs">
            {product.categoryName}
          </span>
        )}
      </div>

      {/* 3. Product Details Content */}
      <div className="relative z-20 flex flex-1 flex-col justify-between p-4 -mt-2">
        <div>
          <h3 className="line-clamp-1 font-serif text-sm sm:text-[15px] font-bold text-[#FAF8F5] tracking-[0.03em] leading-snug group-hover:text-[#C9BEAB] transition-colors">
            {product.name}
          </h3>

          {product.description && (
            <p className="mt-1 line-clamp-1 text-xs font-light leading-relaxed text-[#DDD5C7]/80">
              {product.description}
            </p>
          )}
        </div>

        {/* 4. Price & Action Row */}
        <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-[#483250]/80">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold tracking-tight text-[#C9BEAB]">
                ₹{product.price?.toLocaleString('en-IN')}
              </span>
              {hasDiscount && (
                <span className="text-xs font-normal text-[#DDD5C7]/60 line-through">
                  ₹{product.originalPrice?.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            {discount > 0 && (
              <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-400">
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
            className="inline-flex items-center gap-1 rounded-full bg-[#C9BEAB] text-[#34203C] hover:bg-[#FAF8F5] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider shadow-sm transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
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
