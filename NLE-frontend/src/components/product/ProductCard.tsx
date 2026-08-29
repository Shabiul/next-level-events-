import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ArrowRight, MapPin, ShoppingBag } from 'lucide-react';
import { toast } from 'react-toastify';
import type { AdminProduct } from '../../types';
import { cn } from '../../utils/utils';
import { useAuth } from '../../hooks/useAuth';
import { useWishlist } from '../../hooks/useWishlist';
import { useCart } from '../../hooks/useCart';
import { trackSelectItem, trackWishlistToggle } from '../../utils/analytics';

const SUPPORT_PHONE = '917022058460';

const WA_SVG = (
  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.105 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
  </svg>
);

import { resolveProductCardImage } from '../../utils/imageUtils';
import { CardImage } from '../ui/CardImage';

export interface ProductCardProps {
  product: AdminProduct;
  onViewDetails?: (p: AdminProduct) => void;
  onBook?: (p: AdminProduct) => void;
  isAI?: boolean;
  isLanding?: boolean;
  className?: string;
  aspectRatio?: string;
  /** Trimmed card: no description blurb, actions are just View Details + WhatsApp.
   * Used on the Services / theme pages. */
  minimal?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onViewDetails,
  onBook,
  isAI = false,
  isLanding = false,
  className,
  minimal = false,
}) => {
  const navigate = useNavigate();
  const auth = useAuth();
  const { isWished, toggleWishlist } = useWishlist();
  const { addItem } = useCart();

  const wished =
    isWished(product._id) || Boolean(auth.user?.wishlist?.some((id) => String(id) === String(product._id)));

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
    if (!auth.isLoggedIn) {
      auth.open('login');
      return;
    }
    const next = !wished;
    trackWishlistToggle(next ? 'add' : 'remove', product._id, product.name);
    await toggleWishlist(product, next);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product);
    toast.success(`"${product.name}" added to cart`);
  };

  const handleBookNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBook) {
      onBook(product);
    } else {
      navigate(`/booking/${product._id}`, { state: { product, preferredMethod: 'razorpay' } });
    }
  };

  const openWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `Hi The Decor Party! I'm interested in customising the "${product.name}" package. Can you share availability and details?`;
    const url = `https://wa.me/${SUPPORT_PHONE}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const tagLabel = product.subcategory || product.categoryName || 'Bengaluru Setup';

  const cardImage = resolveProductCardImage(product, isLanding);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'group relative flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-[#E6D7C5] bg-[#FFF3E6] text-[#381932]',
        'shadow-[0_10px_30px_-20px_rgba(56,25,50,0.35)] transition-all duration-300',
        'hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_rgba(56,25,50,0.4)]',
        'text-left select-none cursor-pointer',
        className
      )}
      onClick={handleCardClick}
    >
      {/* Top Image Showcase -- full image, never cropped (badge + wishlist heart overlay only) */}
      <div className="relative">
        <CardImage src={cardImage} alt={product.name} ratio="aspect-[4/3]" />

        {/* Top Badges & Wishlist */}
        <div className="absolute top-3 left-3 right-3 z-20 flex items-start justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 pointer-events-auto">
            {!isAI && product.badge && (
              <span className="rounded-full bg-[#381932] text-[#FFF3E6] px-2.5 py-1 text-[10px] font-serif font-bold uppercase tracking-wider shadow-sm">
                {product.badge}
              </span>
            )}
            {!isAI && discount > 0 && (
              <span className="rounded-full bg-[#A78A9F] text-[#FFF3E6] px-2.5 py-1 text-[10px] font-serif font-bold uppercase tracking-wider shadow-sm">
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
              className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF3E6] text-[#381932] shadow-md transition-transform duration-200 hover:scale-110 active:scale-95 cursor-pointer"
            >
              <Heart size={14} fill={wished ? 'currentColor' : 'none'} />
            </motion.button>
          )}
        </div>
      </div>

      {/* Body -- fixed-height blocks (tag / title / blurb) keep every card in a
          row the same height so the action buttons always line up cleanly. */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Category / Location Tag */}
        <div className="flex items-center gap-1 text-[10px] font-serif font-bold uppercase tracking-wider text-[#A78A9F] mb-1.5">
          <MapPin size={11} className="shrink-0" />
          <span className="truncate">{tagLabel}</span>
        </div>

        {minimal ? (
          /* Services card: the price sits alongside the theme name */
          <div className="flex items-start justify-between gap-3 min-h-[2.3em]">
            <h3 className="flex-1 font-serif text-base sm:text-lg font-bold uppercase tracking-tight text-[#381932] leading-[1.15] line-clamp-2">
              {product.name}
            </h3>
            <div className="shrink-0 text-right">
              <div className="font-serif text-xl sm:text-2xl font-bold text-[#381932] tracking-tight leading-none whitespace-nowrap">
                ₹{product.price?.toLocaleString('en-IN')}
              </div>
              {hasDiscount && (
                <div className="mt-1 text-[11px] font-normal text-[#381932]/45 line-through whitespace-nowrap">
                  ₹{product.originalPrice?.toLocaleString('en-IN')}
                </div>
              )}
              <div className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#381932]/45">starting</div>
            </div>
          </div>
        ) : (
          <>
            {/* Title -- always reserves two lines */}
            <h3 className="font-serif text-lg sm:text-xl font-bold uppercase tracking-tight text-[#381932] leading-[1.15] line-clamp-2 min-h-[2.3em] mb-1.5">
              {product.name}
            </h3>

            {/* Short blurb -- always reserves two lines */}
            <p className="text-xs leading-relaxed text-[#381932]/60 line-clamp-2 min-h-[2.5em] mb-3">
              {product.description?.trim() ||
                `Curated ${String(tagLabel).toLowerCase()} styling — on-site setup, balloon work & teardown across Bengaluru.`}
            </p>

            {/* Price */}
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-2xl sm:text-[26px] font-bold text-[#381932] tracking-tight">
                ₹{product.price?.toLocaleString('en-IN')}
              </span>
              {hasDiscount && (
                <span className="text-xs font-normal text-[#381932]/50 line-through">
                  ₹{product.originalPrice?.toLocaleString('en-IN')}
                </span>
              )}
              <span className="ml-0.5 text-[11px] font-medium text-[#381932]/55">starting</span>
            </div>
          </>
        )}

        {/* Actions -- 2x2, each with its own colour:
            View Details (sand) · Book Now (mauve) · Add to Cart (plum) · WhatsApp (green) */}
        <div className="mt-auto pt-4 grid grid-cols-2 gap-2 border-t border-[#E6D7C5]">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            className="inline-flex items-center justify-center rounded-lg bg-[#EFE3D3] hover:bg-[#E4D2BC] text-[#381932] py-2 text-[11px] font-serif font-semibold uppercase tracking-wide shadow-sm transition-colors cursor-pointer"
          >
            View Details
          </button>

          <button
            type="button"
            onClick={handleBookNow}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#A78A9F] hover:bg-[#8C6E84] text-[#FFF3E6] py-2 text-[11px] font-serif font-semibold uppercase tracking-wide shadow-sm transition-colors cursor-pointer group/btn"
          >
            Book Now
            <ArrowRight size={12} className="transition-transform group-hover/btn:translate-x-0.5" />
          </button>

          <button
            type="button"
            onClick={handleAddToCart}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#381932] hover:bg-[#4A2542] text-[#FFF3E6] py-2 text-[11px] font-serif font-semibold uppercase tracking-wide shadow-sm transition-colors cursor-pointer"
          >
            <ShoppingBag size={12} />
            Add to Cart
          </button>

          <button
            type="button"
            onClick={openWhatsApp}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#1FA855] hover:bg-[#178446] text-white py-2 text-[11px] font-serif font-semibold uppercase tracking-wide shadow-sm transition-colors cursor-pointer"
          >
            {WA_SVG}
            <span>WhatsApp</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
