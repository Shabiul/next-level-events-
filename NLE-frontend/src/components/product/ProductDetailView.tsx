import React, { useCallback, useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check, Share2, Heart, ShieldCheck, CheckCircle2, X, Zap, Lock, Palette, ArrowRight, ShoppingCart, Maximize2, Truck, RotateCcw, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import type { AdminProduct, BookingAddonSnapshot } from '../../types';
import { cn } from '../../utils/utils';
import { BackButton } from '../ui/BackButton';
import { Button } from '../ui/Button';
import { ShareDialog } from '../ui/ShareDialog';
import { trackBookingStarted, trackWhatsappClick, trackWishlistToggle, trackShare } from '../../utils/analytics';
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
  'The Decor Party reserves the right to substitute items of equal or greater value if specific items are unavailable.',
  'Prices are inclusive of setup and breakdown. GST applicable as per government norms.',
  'For outdoor events, we are not responsible for weather-related disruptions.',
];

const SHIPPING_POLICY = [
  'On-site setup is completed by our decor team at your venue across Bengaluru — no physical shipping involved for setups.',
  'Setup crew arrives 2-3 hours before the event start time; exact slot is confirmed a day prior.',
  'For product-only / DIY kit orders, dispatch happens within 24-48 hours via a tracked courier partner.',
  'Same-day express slots are available for select pin codes when booked before 12 PM.',
  'Delivery to venues outside Bengaluru city limits may attract a travel & logistics surcharge.',
];

const RETURN_POLICY = [
  'Being a customised event service, completed setups are not returnable.',
  'If an item in your inclusions is damaged or missing on arrival, report it within 1 hour of setup for an on-site replacement or pro-rata refund.',
  'DIY kit orders can be returned unused, in original packaging, within 3 days of delivery.',
  'Approved refunds are processed to the original payment method within 5-7 business days.',
  'Add-on services cancelled at least 24 hours before the event are fully refundable.',
];

const PRIVACY_POLICY = [
  'We collect only the details needed to plan and deliver your booking — name, contact number, event address and date.',
  'Payment is processed through PCI-DSS compliant gateways; we never store your full card details.',
  'Your event photos are used for portfolio or marketing only with your explicit consent.',
  'We do not sell or rent your personal information to third parties.',
  'You can request deletion of your account data anytime by writing to support.',
];

type PolicyKey = 'inclusions' | 'cancellation' | 'shipping' | 'return' | 'privacy';

const WA_SVG = (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
  </svg>
);

export const ProductDetailView: React.FC<Props> = ({ product, onBack, onBook }) => {
  const auth = useAuth();
  const navigate = useNavigate();
  const { grouped } = useProducts();
  const { wishlistIds, toggleWishlist } = useWishlist();

  const { addItem } = useCart();
  const [localWished, setLocalWished] = useState<boolean | null>(null);
  const primaryImage = useMemo(() => resolveProductCardImage(product), [product]);
  const allImages = useMemo(() => [primaryImage, ...(product.moreImages || [])].filter(Boolean) as string[], [primaryImage, product]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [openPolicies, setOpenPolicies] = useState<Set<PolicyKey>>(new Set());

  const togglePolicy = useCallback((key: PolicyKey) => {
    setOpenPolicies((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);
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
      'Customised LED Neon Signage / Metallic Name Lettering',
      'Heavy-Duty Arch / Backdrop Stand Structure Frame',
      '2 Ambient Warm Spotlights & Illumination Fixtures',
      'On-Site Stylist Labor & Certified Setup Team',
      'Post-Event Teardown & Venue Clean-Up Included',
      '100% Real-to-Photo Pantone Color Match Guarantee',
    ];
  }, [product.inclusions]);

  const POLICY_TABS: { key: PolicyKey; label: string; icon: typeof FileText }[] = [
    { key: 'inclusions', label: 'Inclusions', icon: CheckCircle2 },
    { key: 'cancellation', label: 'Cancellation Policy', icon: X },
    { key: 'shipping', label: 'Shipping Policy', icon: Truck },
    { key: 'return', label: 'Return & Refund Policy', icon: RotateCcw },
    { key: 'privacy', label: 'Privacy Policy', icon: Lock },
  ];

  const policyBody: Record<PolicyKey, { blurb: string; items: string[] }> = {
    inclusions: { blurb: 'Everything included in this setup — components, labor & guarantees.', items: inclusionsList },
    cancellation: { blurb: 'Booking rules, refund timelines & venue guidelines.', items: TERMS },
    shipping: { blurb: 'How and when your setup or kit reaches you.', items: SHIPPING_POLICY },
    return: { blurb: 'When returns and refunds apply.', items: RETURN_POLICY },
    privacy: { blurb: 'How we handle your personal information.', items: PRIVACY_POLICY },
  };

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
      <div className="pointer-events-none absolute -top-40 right-0 z-0 h-[600px] w-[600px] rounded-full bg-[#A78A9F]/15 blur-[120px]" />
      <div className="pointer-events-none absolute top-[35%] -left-40 z-0 h-[700px] w-[700px] rounded-full bg-[#A78A9F]/15 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-20 -right-20 z-0 h-[500px] w-[500px] rounded-full bg-[#A78A9F]/15 blur-[110px]" />

      <div className="relative z-10">
        {/* Top Header Actions */}
        <div className="mb-5 flex items-center justify-between gap-3">
          <BackButton onClick={onBack} aria-label="Go back" />
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.08, rotate: 5 }}
              whileTap={{ scale: 0.92 }}
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#381932]/30 bg-[#FFF3E6]/90 text-[#381932] shadow-sm backdrop-blur-md hover:bg-[#FFF3E6] hover:shadow-md transition-all cursor-pointer dark:bg-[#381932]/90 dark:border-[#381932] dark:text-[#FFF3E6]"
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
                'flex h-10 w-10 items-center justify-center rounded-full border border-[#381932]/30 bg-[#FFF3E6]/90 shadow-sm backdrop-blur-md transition-all cursor-pointer dark:bg-[#381932]/90 dark:border-[#381932]',
                isWished ? 'text-[#381932] border-[#381932] bg-[#FFF3E6]/80 shadow-[#381932]/50' : 'text-[#381932] hover:text-[#381932] hover:bg-[#FFF3E6] hover:shadow-md dark:text-[#FFF3E6]'
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
            <div className="relative aspect-[4/3] sm:aspect-[16/9] max-h-[460px] md:max-h-[500px] w-full overflow-hidden rounded-3xl border border-[#381932]/80 bg-gradient-to-b from-[#FFF3E6] to-[#FFF3E6] shadow-[0_20px_50px_rgba(56,25,50,0.12)] transition-shadow duration-500 hover:shadow-[0_30px_70px_rgba(56,25,50,0.18)] dark:bg-gradient-to-b dark:from-[#381932] dark:to-[#381932] dark:border-[#381932]">
              {/* Fullscreen Button Pill */}
              <div className="absolute right-4 top-4 z-10">
                <motion.button
                  whileHover={{ scale: 1.06, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => openFullScreen(activeIdx)}
                  className="flex items-center gap-2 rounded-full border border-[#381932]/40 bg-[#FFF3E6]/80 px-4 py-2 text-xs font-bold text-[#381932] shadow-lg backdrop-blur-md hover:bg-[#FFF3E6] hover:shadow-xl transition-all dark:bg-[#381932]/80 dark:border-[#FFF3E6]/20 dark:text-[#FFF3E6] cursor-pointer"
                >
                  <Maximize2 size={14} className="text-[#381932] dark:text-[#FFF3E6]" />
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
                    className="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#381932]/30 bg-[#FFF3E6]/90 text-[#381932] shadow-lg backdrop-blur-md disabled:opacity-30 cursor-pointer dark:bg-[#381932]/90 dark:border-[#381932] dark:text-[#FFF3E6]"
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
                    className="absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#381932]/30 bg-[#FFF3E6]/90 text-[#381932] shadow-lg backdrop-blur-md disabled:opacity-30 cursor-pointer dark:bg-[#381932]/90 dark:border-[#381932] dark:text-[#FFF3E6]"
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
                      'h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded-2xl border bg-[#FFF3E6] p-1 transition-all cursor-pointer dark:bg-[#381932] shadow-sm',
                      i === activeIdx
                        ? 'border-[#381932] ring-2 ring-[#381932] dark:border-[#FFF3E6] dark:ring-[#FFF3E6] shadow-md scale-105'
                        : 'border-[#381932]/30 dark:border-[#381932] opacity-70 hover:opacity-100'
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
            className="w-full rounded-3xl border border-[#381932]/80 bg-[#FFF3E6]/90 p-6 sm:p-9 shadow-[0_20px_50px_rgba(56,25,50,0.08)] backdrop-blur-md dark:bg-[#381932]/90 dark:border-[#381932] dark:shadow-none"
          >
            {/* Category Breadcrumb */}
            <div className="mb-3 flex items-center gap-2 text-xs text-[#381932] dark:text-[#381932] uppercase font-bold tracking-wider">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#381932] animate-pulse" />
                {product.categoryName}
              </span>
              {product.subcategory && (
                <>
                  <span>/</span>
                  <span className="font-semibold text-[#381932] dark:text-[#FFF3E6]">{product.subcategory}</span>
                </>
              )}
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#381932] dark:text-[#FFF3E6] leading-snug">
              {product.name}
            </h1>

            {/* Price Line */}
            <div className="mt-6 flex flex-wrap items-baseline gap-4 border-t border-[#381932]/60 pt-6 dark:border-[#381932]/60">
              <span className="font-serif text-4xl sm:text-5xl font-extrabold text-[#381932] dark:text-[#FFF3E6]">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {Boolean(product.originalPrice && product.originalPrice > product.price) && (
                <span className="text-lg text-[#381932] line-through dark:text-[#381932]">
                  ₹{product.originalPrice?.toLocaleString('en-IN')}
                </span>
              )}
              {discount > 0 && (
                <span className="rounded-full bg-[#FFF3E6] border border-[#381932] dark:bg-[#381932]/80 dark:border-[#381932] px-3.5 py-1 text-xs font-extrabold text-[#381932] dark:text-[#381932] shadow-xs">
                  {discount}% OFF
                </span>
              )}
              <span className="ml-auto hidden sm:inline-flex items-center gap-1.5 text-xs font-extrabold text-[#381932] bg-[#FFF3E6] border border-[#381932]/30 dark:text-[#FFF3E6] dark:bg-[#FFF3E6]/15 dark:border-[#FFF3E6]/30 px-3.5 py-1.5 rounded-full shadow-2xs">
                ⚡ Best Price Guaranteed
              </span>
            </div>

            <p className="mt-2 text-xs sm:text-sm text-[#381932] dark:text-[#FFF3E6] font-medium">
              Includes on-site decorator setup, balloon artist labor &amp; teardown across Bengaluru.
            </p>

            {/* Description */}
            {product.description && (
              <div className="mt-6 border-t border-[#381932]/60 pt-6 dark:border-[#381932]/60">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#381932] dark:text-[#381932] mb-2">
                  About This Experience
                </h2>
                <p className="text-xs sm:text-sm text-[#381932] dark:text-[#FFF3E6] leading-relaxed font-medium">
                  {product.description}
                </p>
              </div>
            )}

            {/* Service Promises */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-[#381932]/60 pt-6 text-xs dark:border-[#381932]/60">
              {[
                { icon: Zap, label: 'Express Setup' },
                { icon: Lock, label: 'Instant Confirmation' },
                { icon: Palette, label: 'Theme Color Choice' },
                { icon: ShieldCheck, label: 'Zero Hidden Fees' }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -3, scale: 1.03 }}
                  className="flex items-center gap-2.5 rounded-xl border border-[#381932]/30 bg-[#FFF3E6] p-3 text-[#381932] dark:border-[#381932] dark:bg-[#381932] dark:text-[#FFF3E6] shadow-2xs transition-all"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#A78A9F]/15 text-[#381932] dark:bg-[#FFF3E6]/15 dark:text-[#FFF3E6]">
                    <item.icon size={16} />
                  </div>
                  <span className="font-semibold text-xs">{item.label}</span>
                </motion.div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
                <button
                  type="button"
                  onClick={() => handleBookNow('razorpay')}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-transparent bg-[#381932] hover:opacity-90 text-[#FFF3E6] dark:bg-[#FFF3E6] dark:text-[#381932] dark:hover:bg-[#FFF3E6] py-3.5 px-4 text-xs sm:text-sm font-medium tracking-wide shadow-sm transition-colors cursor-pointer"
                >
                  <span className="font-medium">Book Package Online</span>
                  <ArrowRight size={17} />
                </button>
              </motion.div>

              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleAddToCart}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#381932] bg-transparent hover:bg-[#A78A9F]/18 text-[#381932] dark:bg-[#381932] dark:hover:bg-[#381932] dark:text-[#FFF3E6] py-3.5 px-4 text-xs sm:text-sm font-medium tracking-wide transition-colors cursor-pointer"
              >
                <ShoppingCart size={17} />
                <span>Add to Cart</span>
              </motion.button>

              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => handleBookNow('whatsapp')}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#381932] hover:opacity-90 text-[#FFF3E6] py-3.5 px-4 text-xs sm:text-sm font-medium tracking-wide shadow-sm transition-colors cursor-pointer"
              >
                {WA_SVG}
                <span>Instant WhatsApp</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Sections: Policies, Add-ons, and Similar Products */}
          <div className="w-full flex flex-col gap-10">
            {/* Compact Policy Tabs -- click a word to expand its full section below */}
            <div className="rounded-2xl border border-[#381932]/30 bg-[#FFF3E6]/95 px-3 py-3 sm:px-5 dark:bg-[#381932]/95 dark:border-[#381932] shadow-card backdrop-blur-md">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-2 sm:gap-x-4">
                {POLICY_TABS.map((tab) => {
                  const isOpen = openPolicies.has(tab.key);
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => togglePolicy(tab.key)}
                      aria-expanded={isOpen}
                      className={cn(
                        'inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs sm:text-[13px] font-bold tracking-wide transition-colors cursor-pointer',
                        isOpen
                          ? 'bg-[#381932] text-[#FFF3E6] dark:bg-[#FFF3E6] dark:text-[#381932]'
                          : 'text-[#381932] hover:bg-[#A78A9F]/18 dark:text-[#FFF3E6] dark:hover:bg-[#FFF3E6]/10'
                      )}
                    >
                      <tab.icon size={15} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Expanded Policy Panels -- large, full-width */}
            <AnimatePresence initial={false}>
              {POLICY_TABS.filter((tab) => openPolicies.has(tab.key)).map((tab) => {
                const body = policyBody[tab.key];
                const isInclusions = tab.key === 'inclusions';
                return (
                  <motion.div
                    key={tab.key}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-3xl border border-[#381932]/30 bg-[#FFF3E6]/95 p-6 sm:p-8 dark:bg-[#381932]/95 dark:border-[#381932] shadow-card backdrop-blur-md">
                      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-xl',
                            isInclusions
                              ? 'bg-[#A78A9F]/15 text-[#381932] dark:bg-[#381932]/20 dark:text-[#381932]'
                              : 'bg-[#A78A9F]/15 text-[#381932] dark:bg-[#FFF3E6]/15 dark:text-[#FFF3E6]'
                          )}>
                            <tab.icon size={22} />
                          </div>
                          <div>
                            <h2 className="font-editorial text-xl font-bold text-[#381932] dark:text-[#FFF3E6]">
                              {tab.label}
                            </h2>
                            <p className="text-xs text-[#381932] dark:text-[#FFF3E6] font-medium mt-0.5">
                              {body.blurb}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => togglePolicy(tab.key)}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#381932]/30 text-[#381932] hover:bg-[#FFF3E6] dark:border-[#381932] dark:text-[#FFF3E6] dark:hover:bg-[#381932] transition-colors cursor-pointer"
                          aria-label={`Close ${tab.label}`}
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                        {body.items.map((line, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-3 rounded-2xl border border-[#381932]/30 bg-[#FFF3E6] dark:bg-[#381932] dark:border-[#381932] p-4 text-xs sm:text-sm text-[#381932] dark:text-[#FFF3E6]"
                          >
                            <div className={cn(
                              'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold',
                              isInclusions
                                ? 'bg-[#A78A9F]/20 text-[#381932] dark:bg-[#381932]/20 dark:text-[#381932]'
                                : 'bg-[#381932] text-[#FFF3E6] dark:bg-[#FFF3E6] dark:text-[#381932]'
                            )}>
                              {isInclusions ? <Check size={14} /> : i + 1}
                            </div>
                            <span className="leading-relaxed font-medium">{line}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Global Add-ons & Activities Module -- always visible */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5 }}
            >
              <AddonsModule onSelectionChange={handleGlobalSelectionChange} themeCategory={product.categoryName} />
            </motion.div>

            {/* Similar Packages Grid */}
            {similarProducts.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5 }}
                className="border-t border-[#381932]/30 dark:border-[#381932] pt-10"
              >
                <div className="mb-6">
                  <h2 className="font-editorial text-2xl font-bold tracking-tight text-[#381932] dark:text-[#FFF3E6]">
                    Similar Celebration Experiences
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-[#381932] dark:text-[#381932] font-medium">
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
              className="fixed inset-0 z-50 flex flex-col bg-[#381932]/95 backdrop-blur-md p-4"
              onClick={() => setFullScreenModalOpen(false)}
            >
              <div className="flex items-center justify-between py-2 text-[#FFF3E6]">
                <span className="text-xs font-semibold">
                  {fullScreenIdx + 1} / {allImages.length}
                </span>
                <button
                  type="button"
                  onClick={() => setFullScreenModalOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFF3E6]/10 text-[#FFF3E6] hover:bg-[#FFF3E6]/20 transition-all cursor-pointer"
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
                      className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF3E6]/15 text-[#FFF3E6] hover:bg-[#FFF3E6]/25 disabled:opacity-20 transition-all cursor-pointer"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setFullScreenIdx((prev: number) => Math.min(allImages.length - 1, prev + 1))}
                      disabled={fullScreenIdx === allImages.length - 1}
                      className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF3E6]/15 text-[#FFF3E6] hover:bg-[#FFF3E6]/25 disabled:opacity-20 transition-all cursor-pointer"
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
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#381932]/30 bg-[#FFF3E6]/95 backdrop-blur-md p-3.5 shadow-modal sm:hidden flex items-center justify-between gap-3 dark:bg-[#381932]/95 dark:border-[#381932]">
          <div>
            <div className="text-[10px] uppercase font-bold text-[#381932]">Total</div>
            <div className="text-base font-bold text-[#381932] dark:text-[#FFF3E6]">₹{totalPrice.toLocaleString('en-IN')}</div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleBookNow('whatsapp')}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#381932] bg-[#FFF3E6] text-[#381932] dark:bg-[#381932]/40 dark:text-[#381932]"
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
          title={`${product.name} - The Decor Party`}
          text={`Book this event decoration: ${product.name} on The Decor Party`}
          url={window.location.href}
        />
      </div>
    </div>
  );
};
