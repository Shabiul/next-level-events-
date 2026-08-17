import React, { useCallback, useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check, ChevronDown, ChevronUp, Share2, Heart, ShieldCheck, CheckCircle2, X, Zap, Lock, Palette, ArrowRight } from 'lucide-react';
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
import { ProductCard } from './ProductCard';
import { AddonsModule } from './AddonsModule';
import { getBadgeColorClass } from '../../utils/badges';

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

  const [localWished, setLocalWished] = useState<boolean | null>(null);
  const allImages = useMemo(() => [product.image, ...(product.moreImages || [])].filter(Boolean) as string[], [product]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [termsOpen, setTermsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [fullScreenModalOpen, setFullScreenModalOpen] = useState(false);
  const [fullScreenIdx, setFullScreenIdx] = useState(0);

  const [globalSelections, setGlobalSelections] = useState<{ addons: BookingAddonSnapshot[]; activities: BookingAddonSnapshot[] }>({ addons: [], activities: [] });
  const swipeTrackRef = useRef<HTMLDivElement>(null);

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
    <div className="mx-auto max-w-[1920px] px-4 py-6 sm:px-6 md:px-8 lg:px-12 animate-fade-in pb-24 sm:pb-12">
      {/* Top Header Actions */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <BackButton onClick={onBack} aria-label="Go back" />
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E8E7E3] bg-white text-[#1C1C1C] hover:bg-[#F4F3F0] transition-colors cursor-pointer dark:bg-[#1E1E1E] dark:border-[#2E2E2E] dark:text-white"
            onClick={handleShareClick}
            aria-label="Share package"
          >
            <Share2 size={16} />
          </button>
          <button
            type="button"
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full border border-[#E8E7E3] bg-white transition-colors cursor-pointer dark:bg-[#1E1E1E] dark:border-[#2E2E2E]',
              isWished ? 'text-rose-600 border-rose-200 bg-rose-50/50' : 'text-[#1C1C1C] hover:text-rose-600 hover:bg-[#F4F3F0] dark:text-white'
            )}
            onClick={handleToggleWishlist}
            aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart size={16} fill={isWished ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* Main Grid: Gallery on left, Details on right */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* Left: Photos and Thumbnails */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[#E8E7E3] bg-[#FAFAF8] shadow-card dark:bg-[#141414] dark:border-[#2E2E2E]">
            {/* View Fullscreen button */}
            <div className="absolute right-3.5 top-3.5 z-10">
              <button
                type="button"
                onClick={() => openFullScreen(activeIdx)}
                className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#1C1C1C] shadow-xs backdrop-blur-xs hover:bg-white transition-colors dark:bg-[#1E1E1E]/90 dark:text-white cursor-pointer"
              >
                <span>Full View</span>
              </button>
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
                  className="h-full w-full flex-shrink-0 snap-start flex items-center justify-center p-2"
                >
                  <img
                    src={img}
                    alt={`${product.name} ${i + 1}`}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    onClick={() => openFullScreen(i)}
                    className="max-h-full max-w-full w-auto object-contain mx-auto cursor-pointer"
                  />
                </div>
              ))}
            </div>

            {product.badge && (
              <span className={cn('absolute left-3.5 top-3.5 z-10 rounded-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-xs', getBadgeColorClass(product.badgeColor))}>
                {product.badge}
              </span>
            )}

            {allImages.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous"
                  className="absolute left-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#E8E7E3] bg-white/90 text-[#1C1C1C] shadow-xs backdrop-blur-xs disabled:opacity-30 cursor-pointer dark:bg-[#1E1E1E]/90 dark:border-[#2E2E2E] dark:text-white"
                  onClick={() => scrollToIdx(activeIdx - 1)}
                  disabled={activeIdx === 0}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  aria-label="Next"
                  className="absolute right-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#E8E7E3] bg-white/90 text-[#1C1C1C] shadow-xs backdrop-blur-xs disabled:opacity-30 cursor-pointer dark:bg-[#1E1E1E]/90 dark:border-[#2E2E2E] dark:text-white"
                  onClick={() => scrollToIdx(activeIdx + 1)}
                  disabled={activeIdx === allImages.length - 1}
                >
                  <ChevronRight size={16} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
              {allImages.map((img: string, i: number) => (
                <button
                  type="button"
                  key={i}
                  className={cn(
                    'h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border bg-white p-1 transition-all cursor-pointer dark:bg-[#1E1E1E]',
                    i === activeIdx
                      ? 'border-[#1C1C1C] ring-1 ring-[#1C1C1C] dark:border-white'
                      : 'border-[#E8E7E3] dark:border-[#2E2E2E] opacity-70 hover:opacity-100'
                  )}
                  onClick={() => scrollToIdx(i)}
                >
                  <img src={img} alt="" className="h-full w-full object-contain mx-auto" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Booking Summary & Details */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="rounded-2xl border border-[#E8E7E3] bg-white p-5 sm:p-6 shadow-card dark:bg-[#1E1E1E] dark:border-[#2E2E2E]">
            {/* Category Breadcrumb */}
            <div className="mb-2 flex items-center gap-1.5 text-xs text-[#6F6F6B] dark:text-[#A0A09C]">
              <span>{product.categoryName}</span>
              {product.subcategory && (
                <>
                  <span>/</span>
                  <span className="font-semibold text-[#1C1C1C] dark:text-white">{product.subcategory}</span>
                </>
              )}
            </div>

            <h1 className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1C1C] dark:text-white">
              {product.name}
            </h1>

            {/* Price Line */}
            <div className="mt-4 flex items-baseline gap-3 border-t border-[#E8E7E3] pt-4 dark:border-[#2E2E2E]">
              <span className="text-3xl font-bold text-[#1C1C1C] dark:text-white">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-base text-[#6F6F6B] line-through dark:text-[#70706C]">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
              {discount > 0 && (
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                  {discount}% OFF
                </span>
              )}
            </div>

            <p className="mt-1 text-xs text-[#6F6F6B] dark:text-[#A0A09C]">
              Includes on-site decorator setup, balloon artist labor &amp; teardown across Bengaluru.
            </p>

            {/* Description */}
            {product.description && (
              <div className="mt-4 border-t border-[#E8E7E3] pt-4 dark:border-[#2E2E2E]">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#6F6F6B] dark:text-[#A0A09C] mb-1.5">
                  About This Experience
                </h2>
                <p className="text-xs sm:text-sm text-[#1C1C1C] dark:text-neutral-200 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Service Promises */}
            <div className="mt-4 grid grid-cols-2 gap-2.5 border-t border-[#E8E7E3] pt-4 text-xs dark:border-[#2E2E2E]">
              <div className="flex items-center gap-2 text-[#1C1C1C] dark:text-neutral-200">
                <Zap size={14} className="text-[#1C1C1C] dark:text-white" />
                <span>Express 2-Hr Setup</span>
              </div>
              <div className="flex items-center gap-2 text-[#1C1C1C] dark:text-neutral-200">
                <Lock size={14} className="text-[#1C1C1C] dark:text-white" />
                <span>Instant Confirmation</span>
              </div>
              <div className="flex items-center gap-2 text-[#1C1C1C] dark:text-neutral-200">
                <Palette size={14} className="text-[#1C1C1C] dark:text-white" />
                <span>Theme Color Choice</span>
              </div>
              <div className="flex items-center gap-2 text-[#1C1C1C] dark:text-neutral-200">
                <ShieldCheck size={14} className="text-[#1C1C1C] dark:text-white" />
                <span>Zero Hidden Fees</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col gap-3">
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={() => handleBookNow('razorpay')}
                className="w-full justify-center rounded-xl text-sm font-semibold shadow-xs"
              >
                <span>Book Package Online</span>
                <ArrowRight size={16} />
              </Button>

              <button
                type="button"
                onClick={() => handleBookNow('whatsapp')}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-600 bg-emerald-50/50 py-3 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-100/60 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-700 cursor-pointer"
              >
                {WA_SVG}
                <span>Inquire &amp; Customize on WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Photo Modal */}
      {fullScreenModalOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-md animate-fade-in p-4"
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
            <img
              src={allImages[fullScreenIdx]}
              alt={product.name}
              className="max-h-[80vh] max-w-[90vw] object-contain mx-auto select-none"
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
        </div>
      )}

      {/* Sections: Inclusions, Add-ons, Terms, and Similar Products */}
      <div className="mt-10 flex flex-col gap-10">
        {/* Inclusions */}
        {product.inclusions?.length > 0 && (
          <div>
            <div className="mb-4 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-[#1C1C1C] dark:text-white" />
              <h2 className="font-editorial text-lg font-bold text-[#1C1C1C] dark:text-white">
                {t?.whats_included || "What's Included"}
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {product.inclusions.map((inc: string, i: number) => (
                <div key={i} className="flex items-center gap-2.5 rounded-lg border border-[#E8E7E3] bg-white dark:bg-[#1E1E1E] dark:border-[#2E2E2E] p-3 text-xs text-[#1C1C1C] dark:text-white shadow-card">
                  <Check size={14} className="text-[#1C1C1C] dark:text-white flex-shrink-0" />
                  <span>{inc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Global Add-ons & Activities Module */}
        <AddonsModule onSelectionChange={handleGlobalSelectionChange} />

        {/* Terms & Policies */}
        <div className="border-t border-[#E8E7E3] dark:border-[#2E2E2E] pt-6">
          <button
            type="button"
            className="flex w-full items-center justify-between py-2 text-left cursor-pointer"
            onClick={() => setTermsOpen((o: boolean) => !o)}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#1C1C1C] dark:text-white" />
              <h2 className="font-editorial text-base font-bold text-[#1C1C1C] dark:text-white">Cancellation &amp; Service Terms</h2>
            </div>
            {termsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {termsOpen && (
            <ol className="mt-3 flex flex-col gap-2 pl-4 text-xs text-[#6F6F6B] dark:text-[#A0A09C]">
              {TERMS.map((term: string, i: number) => (
                <li key={i} className="list-decimal">{term}</li>
              ))}
            </ol>
          )}
        </div>

        {/* Similar Packages Grid */}
        {similarProducts.length > 0 && (
          <section className="border-t border-[#E8E7E3] dark:border-[#2E2E2E] pt-10">
            <div className="mb-6">
              <h2 className="font-editorial text-xl font-bold tracking-tight text-[#1C1C1C] dark:text-white">
                Similar Celebration Experiences
              </h2>
              <p className="mt-0.5 text-xs text-[#6F6F6B] dark:text-[#A0A09C]">
                Explore related setups in {product.categoryName}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {similarProducts.slice(0, 8).map((simProduct: AdminProduct) => (
                <div key={simProduct._id} className="h-full">
                  <ProductCard
                    product={simProduct}
                    onViewDetails={() => navigate(`/product/${simProduct._id}`)}
                    onBook={() => onBook(simProduct, 'razorpay')}
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Sticky Mobile Booking Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#E8E7E3] bg-white/95 backdrop-blur-xs p-3 shadow-modal sm:hidden flex items-center justify-between gap-3 dark:bg-[#121212]/95 dark:border-[#2E2E2E]">
        <div>
          <div className="text-[10px] uppercase font-bold text-[#6F6F6B]">Total</div>
          <div className="text-base font-bold text-[#1C1C1C] dark:text-white">₹{totalPrice.toLocaleString('en-IN')}</div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleBookNow('whatsapp')}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
            aria-label="WhatsApp"
          >
            {WA_SVG}
          </button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => handleBookNow('razorpay')}
            className="rounded-lg text-xs"
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
  );
};
