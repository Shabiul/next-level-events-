import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Heart, ArrowRight } from 'lucide-react';
import type { AdminProduct } from '../../types';
import { cn } from '../../utils/utils';
import { useAuth } from '../../hooks/useAuth';
import { getApiUrl } from '../../services/api.service';
import { trackSelectItem, trackWishlistToggle } from '../../utils/analytics';

export interface ProductCardProps {
  product: AdminProduct;
  onViewDetails: (p: AdminProduct) => void;
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
  className,
  aspectRatio = 'aspect-[3/4]',
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [wished, setWished] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [glarePos, setGlarePos] = useState({ x: 0, y: 0 });
  const auth = useAuth();

  // Mouse tilt spring coordinates
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springConfig = { damping: 20, stiffness: 220, mass: 0.5 };
  const mouseXSpring = useSpring(x, springConfig);
  const mouseYSpring = useSpring(y, springConfig);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-10, 10]);

  useEffect(() => {
    setWished(Boolean(auth.user?.wishlist?.includes(product._id)));
  }, [auth.user?.wishlist, product._id]);

  const hasDiscount = Boolean(product.originalPrice && product.originalPrice > product.price);
  const discount = hasDiscount && product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / rect.width - 0.5;
    const yPct = mouseY / rect.height - 0.5;

    x.set(xPct);
    y.set(yPct);
    setGlarePos({ x: mouseX, y: mouseY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
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

  const subtitleText = (product.subcategory || product.categoryName || 'DECORATION').toUpperCase();
  const formattedSubtitle = `- ${subtitleText} -`;

  return (
    <div
      style={{ perspective: 1200 }}
      className={cn('w-full select-none cursor-pointer', className)}
      onClick={handleCardClick}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className={cn(
          'group relative overflow-hidden rounded-[26px] sm:rounded-[30px] bg-[#1E1122] text-[#FAF8F5]',
          'border border-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.25)] hover:shadow-[0_24px_50px_rgba(0,0,0,0.45)] hover:border-white/25',
          'transition-shadow duration-500 w-full',
          aspectRatio
        )}
      >
        {/* =================================================================== */}
        {/* 1. FULL-BLEED BACKGROUND IMAGE WITH CLEAN GRADIENT VIGNETTE        */}
        {/* =================================================================== */}
        <div className="absolute inset-0 overflow-hidden" style={{ transform: 'translateZ(0px)' }}>
          <img
            src={
              product.image ||
              'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=700&auto=format&fit=crop&q=85'
            }
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108"
          />

          {/* Vignette Overlay */}
          <div className="absolute inset-0 bg-black/10 pointer-events-none" />

          {/* Clean Dark Gradient Overlay for optimal text readability */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(to top, rgba(15, 8, 18, 0.92) 0%, rgba(20, 10, 24, 0.55) 45%, rgba(0, 0, 0, 0.08) 80%, transparent 100%)',
            }}
          />
        </div>

        {/* =================================================================== */}
        {/* 2. SPECULAR RADIAL GLARE REFLECTION                                 */}
        {/* =================================================================== */}
        {isHovered && (
          <div
            className="pointer-events-none absolute -inset-px rounded-[inherit] transition-opacity duration-300 z-20 mix-blend-screen"
            style={{
              transform: 'translateZ(15px)',
              background: `radial-gradient(280px circle at ${glarePos.x}px ${glarePos.y}px, rgba(255, 255, 255, 0.25), rgba(201, 190, 171, 0.1), transparent 75%)`,
            }}
          />
        )}

        {/* =================================================================== */}
        {/* 3. TOP ACTION BAR (Badges & Frosted Glass Heart Button)             */}
        {/* =================================================================== */}
        <div
          style={{ transform: 'translateZ(40px)', transformStyle: 'preserve-3d' }}
          className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none"
        >
          {/* Badge or Discount Tag */}
          <div className="flex items-center gap-1.5">
            {!isAI && product.badge && (
              <span className="pointer-events-auto inline-flex items-center rounded-full bg-[#C9BEAB] text-[#25172C] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider shadow-md backdrop-blur-md">
                {product.badge}
              </span>
            )}
            {!isAI && discount > 0 && (
              <span className="pointer-events-auto inline-flex items-center rounded-full bg-emerald-500/90 text-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-md backdrop-blur-md">
                {discount}% OFF
              </span>
            )}
          </div>

          {/* 21st.dev Style Frosted Glass Heart Button */}
          {!isAI && (
            <motion.button
              type="button"
              aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
              onClick={handleWishlistToggle}
              whileTap={{ scale: 0.85 }}
              animate={{ scale: wished ? [1, 1.25, 1] : 1 }}
              transition={{ duration: 0.3 }}
              className={cn(
                'pointer-events-auto flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full',
                'bg-white/20 hover:bg-white/35 border border-white/30 backdrop-blur-md shadow-lg',
                'text-white transition-colors duration-200 cursor-pointer'
              )}
            >
              <Heart
                size={18}
                className={cn(
                  'transition-all duration-200',
                  wished ? 'fill-rose-400 text-rose-400 scale-110' : 'text-white/90 hover:text-white'
                )}
              />
            </motion.button>
          )}
        </div>

        {/* =================================================================== */}
        {/* 4. BOTTOM CONTENT (Subtitle Eyebrow, Big Bold Title, Price & Book) */}
        {/* =================================================================== */}
        <div
          style={{ transform: 'translateZ(35px)', transformStyle: 'preserve-3d' }}
          className="absolute bottom-4 sm:bottom-5 left-4 sm:left-5 right-4 sm:right-5 z-30 text-left pointer-events-none"
        >
          {/* Eyebrow: - CATEGORY / SUBCATEGORY - */}
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-[#DDD5C7] drop-shadow-sm mb-1 font-sans">
            {formattedSubtitle}
          </p>

          {/* Main Title (Big & Bold exactly like 21st.dev) */}
          <h3 className="font-serif text-xl sm:text-2xl md:text-[26px] font-bold tracking-tight text-white drop-shadow-md leading-tight line-clamp-1 group-hover:text-[#C9BEAB] transition-colors">
            {product.name}
          </h3>

          {/* Price & Action Row */}
          <div className="mt-2.5 sm:mt-3 flex items-center justify-between gap-2 pointer-events-auto">
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#FAF8F5] drop-shadow-sm">
                ₹{product.price?.toLocaleString('en-IN')}
              </span>
              {hasDiscount && (
                <span className="text-xs font-normal text-white/60 line-through">
                  ₹{product.originalPrice?.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {/* Clean Book CTA Pill */}
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
              className="inline-flex items-center gap-1.5 rounded-full bg-white/95 hover:bg-white text-[#34203C] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer backdrop-blur-sm"
            >
              <span>Book</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProductCard;
