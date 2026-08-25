import React, { useCallback, useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check, ChevronDown, ChevronUp, Share2, Heart, ShieldCheck, CheckCircle2, X, Zap, Lock, Palette, ArrowRight, ShoppingCart, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import type { AdminProduct, BookingAddonSnapshot } from '../../types';
import { cn } from '../../utils/utils';
import { BackButton } from '../ui/BackButton';
import { Button } from '../ui/Button';
import { ShareDialog } from '../ui/ShareDialog';
import { trackBookingStarted, trackWhatsappClick, trackWishlistToggle, trackShare } from '../../utils/analytics';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';
import { useProducts } from '../../hooks/useProducts';
import { useWishlist } from '../../hooks/useWishlist';
import { useCart } from '../../hooks/useCart';
import { ProductCard } from './ProductCard';
import { AddonsModule } from './AddonsModule';
import { getBadgeColorClass } from '../../utils/badges';
import { resolveProductCardImage } from '../../utils/imageUtils';

interface Props {
  product: AdminProduct;
  onBack: () => void;
  onBook: (product: AdminProduct, method?: 'razorpay' | 'whatsapp', selectedAddOns?: BookingAddonSnapshot[]) => void;
}

const TERMS = [
  'Booking is confirmed only after advance payment and written confirmation from our team.',
  'Cancellations made 48+ hours before the event are eligible for a full refund.',
  'Cancellations within 24-48 hours will incur a 50% cancellation fee.',
  'No refund for cancellations made less than 24 hours before the event.',
  'The venue/location must be accessible at least 2 hours before the event start time for setup.',
  'Any damage to props or decor caused by guests will be charged separately.',
  'Add-ons must be confirmed at least 24 hours in advance.',
  'TheDecorParty reserves the right to substitute items of equal or greater value if specific items are unavailable.',
  'Prices are inclusive of setup and breakdown. GST applicable as per government norms.',
  'For outdoor events, we are not responsible for weather-related disruptions.',
];

const WA_SVG = (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
  </svg>
);

export const ProductDetailView: React.FC<Props> = ({ product, onBack, onBook }) => {
  const { t } = useLanguage();
  const auth = useAuth();
  const navigate = useNavigate();
  const { grouped } = useProducts();
  const { wishlistIds, toggleWishlist } = useWishlist();

  const { addItem } = useCart();
  const [localWished, setLocalWished] = useState<boolean | null>(null);
  const primaryImage = useMemo(() => resolveProductCardImage(product), [product]);
  const allImages = useMemo(() => [primaryImage, ...(product.moreImages || [])].filter(Boolean) as string[], [primaryImage, product]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [termsOpen, setTermsOpen] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
  const [fullScreenModalOpen, setFullScreenModalOpen] = useState(false);
  const [fullScreenIdx, setFullScreenIdx] = useState(0);

  const [globalSelections, setGlobalSelections] = useState<{ addons: BookingAddonSnapshot[]; activities: BookingAddonSnapshot[] }>({ addons: [], activities: [] });
  const swipeTrackRef = useRef<HTMLDivElement>(null);

  const handleAddToCart = () => {
    addItem(product, bookingSelections.length > 0 ? {
      name: auth.user?.firstName ? `${auth.user.firstName} ${auth.user.lastName || ''}`.trim() : 'Guest Customer',
      email: auth.user?.email || '',
      mobile: auth.user?.phone || '',
      location: 'Bengaluru',
      eventDate: new Date().toISOString().split('T')[0],
      eventTime: '18:00',
      requests: '',
      addOns: bookingSelections,
    } : undefined);
    toast.success(`"${product.name}" added to cart!`);
    navigate('/cart');
  };

  const inclusionsList = useMemo(() => {
    if (product.inclusions && product.inclusions.length > 0) {
      return product.inclusions;
    }
    return [
      '150+ Organic Eco-Friendly Latex Balloons Arch & Backdrop Styling',
      'Customized LED Neon Signage / Metallic Name Lettering',
      'Heavy-Duty Arch / Backdrop Stand Structure Frame',
      '2 Ambient Warm Spotlights & Illumination Fixtures',
      'On-Site Stylist Labor & Certified Setup Team',
      'Post-Event Teardown & Venue Clean-Up Included',
      '100% Real-to-Photo Pantone Color Match Guarantee',
    ];
  }, [product.inclusions]);

  useEffect(() => {
    setLocalWished(null);
  }, [product._id]);

  const isWished = useMemo(() => {
    if (localWished !== null) return localWished;
    if (wishlistIds.has(product._id)) return true;
    if (Array.isArray(auth.user?.wishlist)) {
      return auth.user!.wishlist.some(id => String(id) === String(product._id));
    }
    return false;
  }, [localWished, wishlistIds, product._id, auth.user?.wishlist]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveIdx(0);
    if (swipeTrackRef.current) {
      swipeTrackRef.current.scrollLeft = 0;
    }
  }, [product._id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullScreenModalOpen(false);
      if (e.key === 'ArrowRight' && fullScreenModalOpen) {
        setFullScreenIdx((prev: number) => Math.min(allImages.length - 1, prev + 1));
      }
      if (e.key === 'ArrowLeft' && fullScreenModalOpen) {
        setFullScreenIdx((prev: number) => Math.max(0, prev - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [allImages.length, fullScreenModalOpen]);

  const scrollToIdx = (idx: number) => {
    const targetIdx = Math.max(0, Math.min(allImages.length - 1, idx));
    setActiveIdx(targetIdx);
    if (swipeTrackRef.current) {
      const width = swipeTrackRef.current.clientWidth;
      swipeTrackRef.current.scrollTo({ left: targetIdx * width, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (!swipeTrackRef.current) return;
    const width = swipeTrackRef.current.clientWidth;
    if (width > 0) {
      const newIdx = Math.round(swipeTrackRef.current.scrollLeft / width);
      if (newIdx !== activeIdx && newIdx >= 0 && newIdx < allImages.length) {
        setActiveIdx(newIdx);
      }
    }
  };

  const openFullScreen = (idx: number) => {
    setFullScreenIdx(idx);
    setFullScreenModalOpen(true);
  };

  const selectedGlobalAddons = globalSelections.addons.map((item: BookingAddonSnapshot) => ({ ...item, qty: 1, kind: 'addon' as const }));
  const selectedGlobalActivities = globalSelections.activities.map((item: BookingAddonSnapshot) => ({ ...item, qty: 1, kind: 'activity' as const }));
  const bookingSelections = [...selectedGlobalAddons, ...selectedGlobalActivities];
  const totalPrice = product.price + selectedGlobalAddons.reduce((sum: number, addon: BookingAddonSnapshot) => sum + (addon.price || 0), 0) + selectedGlobalActivities.reduce((sum: number, activity: BookingAddonSnapshot) => sum + (activity.price || 0), 0);

  const handleGlobalSelectionChange = useCallback((addons: BookingAddonSnapshot[], activities: BookingAddonSnapshot[]) => {
    setGlobalSelections({
      addons: addons.map((item: BookingAddonSnapshot) => ({ ...item, qty: 1 })),
      activities: activities.map((item: BookingAddonSnapshot) => ({ ...item, qty: 1 })),
    });
  }, []);

  const similarProducts = useMemo(() => {
    if (!product.categoryName) return [];
    const rootCatProducts = grouped[product.categoryName] || [];
    return rootCatProducts.filter((p: AdminProduct) => p._id !== product._id);
  }, [grouped, product.categoryName, product._id]);

  const handleShareClick = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    trackShare('button', product._id, product.name);
    setShareOpen(true);
  };

  const handleToggleWishlist = async () => {
    const nextState = !isWished;
    setLocalWished(nextState);
    trackWishlistToggle(nextState ? 'add' : 'remove', product._id, product.name);
    try {
      const success = await toggleWishlist(product, nextState);
      if (!success) {
        setLocalWished(!nextState);
      }
    } catch {
      setLocalWished(!nextState);
    }
  };

  const handleBookNow = (method: 'razorpay' | 'whatsapp') => {
    if (method === 'whatsapp') {
      trackWhatsappClick('product_detail_page', product._id, product.name);
    } else {
      trackBookingStarted(product._id, product.name, totalPrice);
    }
    onBook(product, method, bookingSelections);
  };

  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <div className="relative mx-auto max-w-[1920px] px-4 pt-2 sm:pt-3 pb-20 sm:px-6 md:px-8 lg:px-12 overflow-hidden">
      {/* Decorative Luxury 3D Ambient Lighting Orbs */}
      <div className="pointer-events-none absolute -top-40 right-0 z-0 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-amber-500/12 via-purple-600/10 to-pink-500/05 blur-[120px]" />
      <div className="pointer-events-none absolute top-[35%] -left-40 z-0 h-[700px] w-[700px] rounded-full bg-gradient-to-tr from-purple-700/10 via-amber-400/08 to-rose-400/05 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-20 -right-20 z-0 h-[500px] w-[500px] rounded-full bg-gradient-to-tl from-indigo-500/10 via-purple-500/08 to-amber-500/05 blur-[110px]" />

      <div className="relative z-10">
        {/* Top Header Actions */}
        <div className="mb-5 flex items-center justify-between gap-3">
          <BackButton onClick={onBack} aria-label="Go back" />
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.08, rotate: 5 }}
              whileTap={{ scale: 0.92 }}
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E8E7E3] bg-white/90 text-[#1C1C1C] shadow-sm backdrop-blur-md hover:bg-white hover:shadow-md transition-all cursor-pointer dark:bg-[#1E1E1E]/90 dark:border-[#2E2E2E] dark:text-white"
              onClick={handleShareClick}
              aria-label="Share package"
            >
              <Share2 size={17} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              type="button"
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full border border-[#E8E7E3] bg-white/90 shadow-sm backdrop-blur-md transition-all cursor-pointer dark:bg-[#1E1E1E]/90 dark:border-[#2E2E2E]',
                isWished ? 'text-rose-600 border-rose-200 bg-rose-50/80 shadow-rose-200/50' : 'text-[#1C1C1C] hover:text-rose-600 hover:bg-white hover:shadow-md dark:text-white'
              )}
              onClick={handleToggleWishlist}
              aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart size={17} fill={isWished ? 'currentColor' : 'none'} />
            </motion.button>
          </div>
        </div>

        {/* Main Content Layout Flow */}
        <div className="max-w-7xl mx-auto w-full flex flex-col gap-9">
          {/* Top Section: Photos Stage with 3D Parallax Tilt */}
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full flex flex-col gap-4 perspective-[1200px] transform-gpu"
          >
            <div className="relative aspect-[4/3] sm:aspect-[16/9] max-h-[460px] md:max-h-[500px] w-full overflow-hidden rounded-3xl border border-[#E4DEF2]/80 bg-gradient-to-b from-[#FAFAF8] to-[#F5F2EA] shadow-[0_20px_50px_rgba(52,32,60,0.12)] transition-shadow duration-500 hover:shadow-[0_30px_70px_rgba(52,32,60,0.18)] dark:bg-gradient-to-b dark:from-[#1A1A1A] dark:to-[#121212] dark:border-[#483250]">
              {/* Fullscreen Button Pill */}
              <div className="absolute right-4 top-4 z-10">
                <motion.button
                  whileHover={{ scale: 1.06, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => openFullScreen(activeIdx)}
                  className="flex items-center gap-2 rounded-full border border-white/40 bg-white/80 px-4 py-2 text-xs font-bold text-[#1C1C1C] shadow-lg backdrop-blur-md hover:bg-white hover:shadow-xl transition-all dark:bg-[#1E1E1E]/80 dark:border-white/20 dark:text-white cursor-pointer"
                >
                  <Maximize2 size={14} className="text-[#1C1B22] dark:text-amber-400" />
                  <span>Full View</span>
                </motion.button>
              </div>

              {/* Scrollable Images Track */}
              <div
                ref={swipeTrackRef}
                onScroll={handleScroll}
                className="flex h-full w-full overflow-x-auto snap-x snap-mandatory hide-scrollbar touch-pan-y"
              >
                {allImages.map((img: string, i: number) => (
                  <div
                    key={i}
                    className="h-full w-full flex-shrink-0 snap-start flex items-center justify-center p-3 sm:p-4 group"
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${i + 1}`}
                      loading={i === 0 ? 'eager' : 'lazy'}
                      onClick={() => openFullScreen(i)}
                      className="max-h-full max-w-full w-auto object-contain mx-auto cursor-pointer rounded-2xl transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    />
                  </div>
                ))}
              </div>

              {product.badge && (
                <span className={cn('absolute left-4 top-4 z-10 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider shadow-md backdrop-blur-sm', getBadgeColorClass(product.badgeColor))}>
                  {product.badge}
                </span>
              )}

              {allImages.length > 1 && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.1, x: -2 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    aria-label="Previous"
                    className="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#E4DEF2] bg-white/90 text-[#1C1B22] shadow-lg backdrop-blur-md disabled:opacity-30 cursor-pointer dark:bg-[#1E1E1E]/90 dark:border-[#483250] dark:text-white"
                    onClick={() => scrollToIdx(activeIdx - 1)}
                    disabled={activeIdx === 0}
                  >
                    <ChevronLeft size={20} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1, x: 2 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    aria-label="Next"
                    className="absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#E4DEF2] bg-white/90 text-[#1C1B22] shadow-lg backdrop-blur-md disabled:opacity-30 cursor-pointer dark:bg-[#1E1E1E]/90 dark:border-[#483250] dark:text-white"
                    onClick={() => scrollToIdx(activeIdx + 1)}
                    disabled={activeIdx === allImages.length - 1}
                  >
                    <ChevronRight size={20} />
                  </motion.button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1 hide-scrollbar justify-center">
                {allImages.map((img: string, i: number) => (
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    key={i}
                    className={cn(
                      'h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded-2xl border bg-white p-1 transition-all cursor-pointer dark:bg-[#1E1E1E] shadow-sm',
                      i === activeIdx
                        ? 'border-[#8F6FC4] ring-2 ring-[#8F6FC4] dark:border-amber-400 dark:ring-amber-400 shadow-md scale-105'
                        : 'border-[#E4DEF2] dark:border-[#483250] opacity-70 hover:opacity-100'
                    )}
                    onClick={() => scrollToIdx(i)}
                  >
                    <img src={img} alt="" className="h-full w-full object-contain mx-auto rounded-xl" />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Details & Booking Stage */}
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            className="w-full rounded-3xl border border-white/80 bg-white/90 p-6 sm:p-9 shadow-[0_20px_50px_rgba(52,32,60,0.08)] backdrop-blur-md dark:bg-[#201325]/90 dark:border-[#483250] dark:shadow-none"
          >
            {/* Category Breadcrumb */}
            <div className="mb-3 flex items-center gap-2 text-xs text-[#6B6B76] dark:text-[#A78A9F] uppercase font-bold tracking-wider">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                {product.categoryName}
              </span>
              {product.subcategory && (
                <>
                  <span>/</span>
                  <span className="font-semibold text-[#1C1B22] dark:text-[#FAF8F5]">{product.subcategory}</span>
                </>
              )}
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1C1B22] dark:text-[#FAF8F5] leading-snug">
              {product.name}
            </h1>

            {/* Price Line */}
            <div className="mt-6 flex flex-wrap items-baseline gap-4 border-t border-[#E4DEF2]/60 pt-6 dark:border-[#483250]/60">
              <span className="font-serif text-4xl sm:text-5xl font-extrabold text-[#1C1C1C] dark:text-[#FAF8F5]">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {Boolean(product.originalPrice && product.originalPrice > product.price) && (
                <span className="text-lg text-[#6B6B76] line-through dark:text-[#A78A9F]">
                  ₹{product.originalPrice?.toLocaleString('en-IN')}
                </span>
              )}
              {discount > 0 && (
                <span className="rounded-full bg-emerald-100 border border-emerald-300 dark:bg-emerald-950/80 dark:border-emerald-700 px-3.5 py-1 text-xs font-extrabold text-emerald-900 dark:text-emerald-300 shadow-xs">
                  {discount}% OFF
                </span>
              )}
              <span className="ml-auto hidden sm:inline-flex items-center gap-1.5 text-xs font-extrabold text-[#1C1B22] bg-[#FAF8F5] border border-[#E4DEF2] dark:text-amber-300 dark:bg-amber-400/15 dark:border-amber-400/30 px-3.5 py-1.5 rounded-full shadow-2xs">
                ⚡ Best Price Guaranteed
              </span>
            </div>

            <p className="mt-2 text-xs sm:text-sm text-[#6B6B76] dark:text-[#C8B5C3] font-medium">
              Includes on-site decorator setup, balloon artist labor &amp; teardown across Bengaluru.
            </p>

            {/* Description */}
            {product.description && (
              <div className="mt-6 border-t border-[#E4DEF2]/60 pt-6 dark:border-[#483250]/60">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#6B6B76] dark:text-[#A78A9F] mb-2">
                  About This Experience
                </h2>
                <p className="text-xs sm:text-sm text-[#2C2C2C] dark:text-[#FAF8F5] leading-relaxed font-medium">
                  {product.description}
                </p>
              </div>
            )}

            {/* Service Promises */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-[#E4DEF2]/60 pt-6 text-xs dark:border-[#483250]/60">
              {[
                { icon: Zap, label: 'Express 2-Hr Setup' },
                { icon: Lock, label: 'Instant Confirmation' },
                { icon: Palette, label: 'Theme Color Choice' },
                { icon: ShieldCheck, label: 'Zero Hidden Fees' }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -3, scale: 1.03 }}
                  className="flex items-center gap-2.5 rounded-xl border border-[#EDECE8] bg-[#FAF9F5] p-3 text-[#1C1B22] dark:border-[#3A2443] dark:bg-[#2A1830] dark:text-[#FAF8F5] shadow-2xs transition-all"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#8F6FC4]/08 text-[#1C1B22] dark:bg-amber-400/15 dark:text-amber-400">
                    <item.icon size={16} />
                  </div>
                  <span className="font-semibold text-xs">{item.label}</span>
                </motion.div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
                <button
                  type="button"
                  onClick={() => handleBookNow('razorpay')}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-transparent bg-[#8F6FC4] hover:bg-[#7D5DB2] text-white dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-300 py-4 px-4 text-xs sm:text-sm font-extrabold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all cursor-pointer"
                >
                  <span className="text-white dark:text-slate-950 font-extrabold">Book Package Online</span>
                  <ArrowRight size={17} className="text-white dark:text-slate-950" />
                </button>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleAddToCart}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#E4DEF2] dark:border-[#483250] bg-[#FAF5EE] hover:bg-[#8F6FC4]/20 text-[#1C1B22] dark:bg-[#2A1830] dark:hover:bg-[#34203C] dark:text-[#FAF8F5] py-4 px-4 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
              >
                <ShoppingCart size={17} />
                <span>Add to Cart</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => handleBookNow('whatsapp')}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white py-4 px-4 text-xs font-bold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all cursor-pointer"
              >
                {WA_SVG}
                <span>Instant WhatsApp</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Sections: Inclusions, Add-ons, Terms, and Similar Products */}
          <div className="w-full flex flex-col gap-10">
            {/* Inclusions Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5 }}
              className="rounded-3xl border border-[#E8E7E3] bg-white/95 p-6 sm:p-8 dark:bg-[#1E1E1E]/95 dark:border-[#2E2E2E] shadow-card backdrop-blur-md"
            >
              <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/20 dark:text-emerald-400">
                    <CheckCircle2 size={22} />
                  </div>
                  <div>
                    <h2 className="font-editorial text-xl font-bold text-[#1C1C1C] dark:text-white">
                      {t?.whats_included || "What's Included in this Setup"}
                    </h2>
                    <p className="text-xs text-[#6B6B76] dark:text-[#C8B5C3] font-medium mt-0.5">
                      Full service setup components &amp; labor guarantees
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#1C1B22] bg-[#8F6FC4]/08 dark:text-amber-300 dark:bg-amber-400/15 px-3 py-1.5 rounded-full">
                  Full Setup Inclusions
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                {inclusionsList.map((inc: string, i: number) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.025, y: -3 }}
                    className="flex items-center gap-3 rounded-2xl border border-[#E8E7E3] bg-[#FAF9F6] dark:bg-[#25172C] dark:border-[#38223E] p-4 text-xs sm:text-sm font-semibold text-[#1C1C1C] dark:text-white shadow-2xs hover:border-[#DCD8CC] dark:hover:border-[#4D2F57] transition-all"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:bg-emerald-400/20 dark:text-emerald-400 shadow-xs">
                      <Check size={16} />
                    </div>
                    <span className="leading-relaxed font-medium">{inc}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Global Add-ons & Activities Module */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5 }}
            >
              <AddonsModule onSelectionChange={handleGlobalSelectionChange} />
            </motion.div>

            {/* Cancellation & Service Terms Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5 }}
              className="rounded-3xl border border-[#E8E7E3] bg-white/95 p-6 sm:p-8 dark:bg-[#1E1E1E]/95 dark:border-[#2E2E2E] shadow-card backdrop-blur-md transition-all"
            >
              <button
                type="button"
                className="flex w-full items-center justify-between py-1 text-left cursor-pointer group"
                onClick={() => setTermsOpen((o: boolean) => !o)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8F6FC4]/08 text-[#1C1B22] dark:bg-amber-400/15 dark:text-amber-400 transition-colors group-hover:bg-[#8F6FC4]/15">
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <h2 className="font-editorial text-xl font-bold text-[#1C1C1C] dark:text-white">
                      Cancellation &amp; Service Terms
                    </h2>
                    <p className="text-xs text-[#6B6B76] dark:text-[#C8B5C3] font-medium mt-0.5">
                      Clear booking rules, refund timelines &amp; venue guidelines
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider text-[#1C1B22] bg-[#8F6FC4]/08 dark:text-amber-300 dark:bg-amber-400/15 px-3 py-1 rounded-full">
                    10 Key Terms
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FAF8F5] text-[#1C1B22] dark:bg-[#2A2A2A] dark:text-white group-hover:bg-[#EAE7DF] transition-colors">
                    {termsOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>
              </button>

              {termsOpen && (
                <div className="mt-6 pt-6 border-t border-[#E8E7E3] dark:border-[#2E2E2E]">
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {TERMS.map((term: string, i: number) => (
                      <motion.li
                        key={i}
                        whileHover={{ y: -3, scale: 1.015 }}
                        className="flex items-start gap-3.5 rounded-2xl border border-[#EDECE8] bg-[#FAF9F6] p-4 text-xs sm:text-sm font-semibold text-[#1C1C1C] dark:border-[#2E2E2E] dark:bg-[#252525] dark:text-[#F3F4F6] shadow-2xs hover:border-[#DCD8CC] dark:hover:border-[#3E3E3E] transition-all hover:shadow-sm"
                      >
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#8F6FC4] text-xs font-bold text-white dark:bg-amber-400 dark:text-slate-950 shadow-xs mt-0.5">
                          {i + 1}
                        </div>
                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                          <span className="relative flex h-2 w-2 shrink-0 mt-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                          </span>
                          <span className="text-[#242424] dark:text-[#E8E8E8] font-medium leading-relaxed text-xs sm:text-sm">
                            {term}
                          </span>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>

            {/* Similar Packages Grid */}
            {similarProducts.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5 }}
                className="border-t border-[#E8E7E3] dark:border-[#2E2E2E] pt-10"
              >
                <div className="mb-6">
                  <h2 className="font-editorial text-2xl font-bold tracking-tight text-[#1C1C1C] dark:text-white">
                    Similar Celebration Experiences
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-[#6B6B76] dark:text-[#A0A09C] font-medium">
                    Explore related setups in {product.categoryName}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                  {similarProducts.slice(0, 8).map((simProduct: AdminProduct, simIdx: number) => (
                    <motion.div
                      key={simProduct._id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: simIdx * 0.05 }}
                      whileHover={{ y: -6 }}
                      className="h-full transform-gpu"
                    >
                      <ProductCard
                        product={simProduct}
                        onViewDetails={() => navigate(`/product/${simProduct._id}`)}
                        onBook={() => onBook(simProduct, 'razorpay')}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}
          </div>
        </div>

        {/* Fullscreen Photo Modal */}
        <AnimatePresence>
          {fullScreenModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-md p-4"
              onClick={() => setFullScreenModalOpen(false)}
            >
              <div className="flex items-center justify-between py-2 text-white">
                <span className="text-xs font-semibold">
                  {fullScreenIdx + 1} / {allImages.length}
                </span>
                <button
                  type="button"
                  onClick={() => setFullScreenModalOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="relative flex-1 flex items-center justify-center my-auto p-2" onClick={e => e.stopPropagation()}>
                <motion.img
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  src={allImages[fullScreenIdx]}
                  alt={product.name}
                  className="max-h-[80vh] max-w-[90vw] object-contain mx-auto select-none rounded-2xl shadow-2xl"
                />
                {allImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setFullScreenIdx((prev: number) => Math.max(0, prev - 1))}
                      disabled={fullScreenIdx === 0}
                      className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 disabled:opacity-20 transition-all cursor-pointer"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setFullScreenIdx((prev: number) => Math.min(allImages.length - 1, prev + 1))}
                      disabled={fullScreenIdx === allImages.length - 1}
                      className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 disabled:opacity-20 transition-all cursor-pointer"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sticky Mobile Booking Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#E8E7E3] bg-white/95 backdrop-blur-md p-3.5 shadow-modal sm:hidden flex items-center justify-between gap-3 dark:bg-[#121212]/95 dark:border-[#2E2E2E]">
          <div>
            <div className="text-[10px] uppercase font-bold text-[#6F6F6B]">Total</div>
            <div className="text-base font-bold text-[#1C1C1C] dark:text-white">₹{totalPrice.toLocaleString('en-IN')}</div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleBookNow('whatsapp')}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
              aria-label="WhatsApp"
            >
              {WA_SVG}
            </button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => handleBookNow('razorpay')}
              className="rounded-xl text-xs px-4"
            >
              Book Now
            </Button>
          </div>
        </div>

        {/* Share Modal Dialog */}
        <ShareDialog
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          title={`${product.name} - TheDecorParty`}
          text={`Book this event decoration: ${product.name} on TheDecorParty`}
          url={window.location.href}
        />
      </div>
    </div>
  );
};
