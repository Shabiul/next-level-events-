import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ArrowRight, MapPin } from 'lucide-react';
import type { AdminProduct } from '../../types';
import { cn } from '../../utils/utils';
import { useAuth } from '../../hooks/useAuth';
import { getApiUrl } from '../../services/api.service';
import { trackSelectItem, trackWishlistToggle } from '../../utils/analytics';

const SUPPORT_PHONE = '917022058460';

const WA_SVG = (
  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.105 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
  </svg>
);

import { resolveProductCardImage, resolveProductImagePosition } from '../../utils/imageUtils';

export interface ProductCardProps {
  product: AdminProduct;
  onViewDetails?: (p: AdminProduct) => void;
  onBook?: (p: AdminProduct) => void;
  isAI?: boolean;
  isLanding?: boolean;
  className?: string;
  aspectRatio?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onViewDetails,
  onBook,
  isAI = false,
  isLanding = false,
  className,
}) => {
  const navigate = useNavigate();
  const [wished, setWished] = useState(false);
  const auth = useAuth();

  useEffect(() => {
    setWished(Boolean(auth.user?.wishlist?.includes(product._id)));
  }, [auth.user?.wishlist, product._id]);

  const hasDiscount = Boolean(product.originalPrice && product.originalPrice > product.price);
  const discount = hasDiscount && product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

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
    if (onViewDetails) {
      onViewDetails(product);
    } else {
      navigate(`/product/${product._id}`, { state: { product } });
    }
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

  const openWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `Hi TheDecorParty! I'm interested in customizing the "${product.name}" package. Can you share availability and details?`;
    const url = `https://wa.me/${SUPPORT_PHONE}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const tagLabel = product.subcategory || product.categoryName || 'Bengaluru Setup';
  const highlightInclusion = Array.isArray(product.inclusions) && product.inclusions[0]
    ? product.inclusions[0]
    : 'Includes on-site decorator setup, balloon arch styling & warm ambient spotlights.';

  const cardImage = resolveProductCardImage(product, isLanding);
  const imagePosition = resolveProductImagePosition(product);

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'group flex flex-col justify-between rounded-2xl border border-[#E4DEF2] dark:border-[#483250] bg-white dark:bg-[#201325] text-[#1C1B22] dark:text-[#FAF8F5] overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 text-left select-none cursor-pointer w-full h-full',
        className
      )}
      onClick={handleCardClick}
    >
      {/* Top Image Showcase -- clean product shot, no text overlay (badge + wishlist heart only) */}
      <div>
        <div className="relative w-full h-[220px] sm:h-[240px] overflow-hidden bg-[#8F6FC4]/10">
          <img
            src={cardImage}
            alt={product.name}
            loading="lazy"
            className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108 ${imagePosition}`}
          />

          {/* Top Badges & Wishlist */}
          <div className="absolute top-3.5 left-3.5 right-3.5 z-20 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-1.5 pointer-events-auto">
              {!isAI && product.badge && (
                <span className="rounded-full bg-[#8F6FC4] text-white px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider shadow-md">
                  {product.badge}
                </span>
              )}
              {!isAI && discount > 0 && (
                <span className="rounded-full bg-emerald-600 text-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-md">
                  {discount}% OFF
                </span>
              )}
            </div>

            {!isAI && (
              <motion.button
                type="button"
                aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
                onClick={handleWishlistToggle}
                whileTap={{ scale: 0.85 }}
                animate={{ scale: wished ? [1, 1.25, 1] : 1 }}
                className={cn(
                  'pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full',
                  'bg-white/90 hover:bg-white border border-[#E4DEF2] backdrop-blur-md shadow-md',
                  'text-[#1C1B22] transition-colors duration-200 cursor-pointer'
                )}
              >
                <Heart
                  size={16}
                  className={cn(
                    'transition-all duration-200',
                    wished ? 'fill-rose-500 text-rose-500 scale-110' : 'text-[#1C1B22]/70 hover:text-[#1C1B22]'
                  )}
                />
              </motion.button>
            )}
          </div>
        </div>

        {/* Card Content Body */}
        <div className="p-5 sm:p-6 flex flex-col">
          {/* Category / Location Tag */}
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#8F6FC4] mb-1.5">
            <MapPin size={11} className="shrink-0" />
            <span>{tagLabel}</span>
          </div>

          {/* Title */}
          <h3 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#1C1B22] dark:text-white leading-tight line-clamp-1 mb-1.5">
            {product.name}
          </h3>

          {/* Description Paragraph */}
          <p className="text-xs text-[#6B6B76] dark:text-[#C8B5C3] font-light leading-relaxed line-clamp-2 min-h-[36px]">
            {product.description ||
              'Complete turnkey celebration setup styled with customized props, balloon architecture, and fairy lighting.'}
          </p>

          {/* Inner Highlight Box with Star */}
          <div className="mt-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#2A1830] p-3 border border-[#E4DEF2]/60 dark:border-[#483250]/60 flex items-start gap-2 text-xs text-[#1C1B22] dark:text-neutral-200">
            <span className="text-[#8F6FC4] text-sm shrink-0 font-bold">★</span>
            <span className="text-[11px] font-medium leading-relaxed line-clamp-2">
              {highlightInclusion}
            </span>
          </div>
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="px-5 sm:px-6 pb-6 pt-0 flex flex-col gap-3">
        <div className="flex items-center justify-between border-t border-[#E4DEF2]/50 dark:border-[#483250]/50 pt-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B76] dark:text-[#A78A9F] block">
              Starting Price
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-lg sm:text-xl font-bold text-[#1C1B22] dark:text-[#FAF8F5]">
                ₹{product.price?.toLocaleString('en-IN')}
              </span>
              {hasDiscount && (
                <span className="text-xs font-normal text-[#6B6B76]/60 line-through">
                  ₹{product.originalPrice?.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#1C1B22] dark:text-[#C9BEAB] hover:text-[#8F6FC4] group/btn cursor-pointer"
          >
            <span>VIEW DETAILS</span>
            <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onBook) {
                onBook(product);
              } else {
                navigate(`/booking/${product._id}`, { state: { product, preferredMethod: 'razorpay' } });
              }
            }}
            className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-[#8F6FC4] dark:bg-[#C9BEAB] text-white dark:text-[#25172C] py-2.5 text-[11px] font-bold uppercase tracking-wider shadow-sm hover:bg-[#7D5DB2] dark:hover:bg-white transition-colors cursor-pointer"
          >
            <span>BOOK NOW</span>
            <ArrowRight size={12} />
          </button>

          <button
            type="button"
            onClick={openWhatsApp}
            className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-emerald-600/50 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 py-2.5 text-[11px] font-bold uppercase tracking-wider hover:bg-emerald-100/60 transition-colors cursor-pointer"
          >
            {WA_SVG}
            <span>WHATSAPP</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
