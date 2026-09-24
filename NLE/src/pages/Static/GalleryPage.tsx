import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ArrowUpRight, ArrowRight, X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { SeoHead } from '../../components/layout/SeoHead';
import { useProducts } from '../../hooks/useProducts';
import { useGalleryImages } from '../../hooks/useGalleryImages';
import type { AdminProduct } from '../../types';
import {
  type GalleryCategory,
  normalizeToWebp,
  getImageDeduplicationKey,
  isRealPhoto,
  mapCategoryToFilter,
} from '../../data/galleryCuration';

export interface GalleryImageItem {
  id: string;
  title: string;
  category: GalleryCategory;
  serviceName: string;
  serviceRoute: string;
  image: string;
  tag: string;
  price?: string | number;
  description?: string;
  product?: AdminProduct;
}

/* Inline botanical sprig -- matches the Packages / About accent */
const Sprig: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 80 24" fill="none" className={className} aria-hidden="true">
    <path d="M2 12h44" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <path
      d="M46 12c6 0 10-4 12-9M46 12c6 0 10 4 12 9M46 12c7 0 12 0 16-3M46 12c7 0 12 0 16 3"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <circle cx="70" cy="12" r="2.4" fill="currentColor" />
  </svg>
);



const CATEGORIES: GalleryCategory[] = [
  'ALL',
  'BIRTHDAYS',
  'BALLOON DECOR',
  'BABY SHOWERS',
  'PROPOSALS',
  'WEDDINGS',
  'ANNIVERSARIES',
  'CUSTOM THEMES',
];


interface GalleryCardProps {
  item: GalleryImageItem;
  index: number;
  shouldLoad: boolean;
  onLoaded: (index: number) => void;
  onClick: () => void;
}

const GalleryCard: React.FC<GalleryCardProps> = ({ item, index, shouldLoad, onLoaded, onClick }) => {
  const [src, setSrc] = useState<string>(item.image);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hasReportedDone, setHasReportedDone] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Sync state if item.image changes
  useEffect(() => {
    setSrc(item.image);
    setImageLoaded(false);
    setHasReportedDone(false);
  }, [item.image]);

  const handleDone = useCallback(() => {
    if (hasReportedDone) return;
    setHasReportedDone(true);
    onLoaded(index);
  }, [hasReportedDone, onLoaded, index]);

  // Check if image is already cached/complete once shouldLoad is true
  useEffect(() => {
    if (!shouldLoad || imageLoaded || hasReportedDone) return;
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      setImageLoaded(true);
      handleDone();
    }
  }, [shouldLoad, imageLoaded, hasReportedDone, handleDone]);

  // Safety timer: if network stalls for >1000ms, unlock next image anyway so queue never hangs
  useEffect(() => {
    if (!shouldLoad || imageLoaded || hasReportedDone) return;
    const timer = setTimeout(() => {
      handleDone();
    }, 1000);
    return () => clearTimeout(timer);
  }, [shouldLoad, imageLoaded, hasReportedDone, handleDone]);

  return (
    <div className="w-full select-none">
      <motion.button
        type="button"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: (index % 10) * 0.02, ease: [0.22, 1, 0.36, 1] }}
        onClick={onClick}
        className="group relative block w-full cursor-pointer overflow-hidden rounded-[20px] border border-[#E6D7C5] bg-[#FFF3E6] text-left shadow-[0_12px_34px_-24px_rgba(56,25,50,0.4)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_54px_-26px_rgba(56,25,50,0.45)]"
      >
        <div className="relative w-full aspect-[4/5] overflow-hidden bg-[#E6D7C5]/25">
          {!imageLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
              <div className="absolute inset-0 bg-gradient-to-r from-[#E6D7C5]/15 via-[#FFF3E6]/40 to-[#E6D7C5]/15 animate-pulse" />
              <div className="relative z-10 flex flex-col items-center gap-1.5 opacity-35">
                <Sparkles size={16} className="text-[#381932]" />
                <span className="text-[10px] font-serif uppercase tracking-widest text-[#381932]">
                  {item.tag || 'Setup'} #{index + 1}
                </span>
              </div>
            </div>
          )}

          {shouldLoad && (
            <img
              ref={imgRef}
              src={src}
              alt={item.title}
              decoding="async"
              onLoad={() => {
                setImageLoaded(true);
                handleDone();
              }}
              onError={() => {
                if (src.endsWith('.webp')) {
                  setSrc(src.replace(/\.webp$/i, '.jpg'));
                } else {
                  handleDone();
                }
              }}
              className={`w-full h-full object-cover object-center transition-all duration-500 ease-out group-hover:scale-[1.04] ${
                imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.02]'
              }`}
            />
          )}

          {/* Caption overlay */}
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-[#25101f]/90 via-[#381932]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
            <div className="flex items-end justify-between gap-2">
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1 text-[10px] font-poppins font-semibold uppercase tracking-[0.14em] text-[#C8B5C3]">
                  <Heart size={10} className="fill-[#C8B5C3] text-[#C8B5C3]" />
                  {item.serviceName || item.tag}
                </span>
                <p className="font-serif text-[13px] font-bold uppercase tracking-tight text-[#FFF3E6] leading-tight line-clamp-2 mt-0.5">
                  {item.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {item.price && (
                    <span className="text-[11px] font-semibold text-[#FFF3E6]/90">{item.price}</span>
                  )}
                  <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-[#FFF3E6] bg-[#381932]/80 px-2 py-0.5 rounded-full border border-[#FFF3E6]/20">
                    View Details ↗
                  </span>
                </div>
              </div>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFF3E6] text-[#381932] shadow-md transition-transform duration-300 group-hover:scale-110">
                <ArrowUpRight size={14} />
              </span>
            </div>
          </div>
        </div>
      </motion.button>
    </div>
  );
};

export const GalleryPage: React.FC = () => {
  const navigate = useNavigate();
  const { products } = useProducts();
  const { galleryImages: adminGalleryImages } = useGalleryImages();
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>('ALL');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const handleBookImage = (item: GalleryImageItem) => {
    const matchedProduct = products.find(
      (p) =>
        p._id === item.id ||
        (item.id && item.id.startsWith(`pkg-${p._id}`)) ||
        p.name.toLowerCase() === item.title.toLowerCase() ||
        normalizeToWebp(p.image) === item.image
    );

    const bookingProduct: AdminProduct = matchedProduct || item.product || {
      _id: item.id,
      name: item.title,
      categoryId: (item.serviceName || item.category).toLowerCase().replace(/\s+/g, '-'),
      categoryName: item.serviceName || item.tag || item.category,
      subcategory: item.tag,
      price:
        typeof item.price === 'number'
          ? item.price
          : typeof item.price === 'string'
            ? parseInt(item.price.replace(/[^0-9]/g, ''), 10) || 4999
            : 4999,
      description: item.description || `${item.title} — Premium surprise and celebration decoration package styled in Bengaluru with 100% picture-match guarantee.`,
      image: item.image,
      moreImages: [],
      badgeColor: 'purple',
      rating: 5,
      reviewCount: 18,
      inclusions: ['Premium balloon styling', 'Fairy lights & ambient backdrop', 'On-site setup by master stylist'],
      addOns: [],
      active: true,
      featured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    navigate(`/booking/${bookingProduct._id}`, {
      state: { product: bookingProduct, preferredMethod: 'razorpay' },
    });
  };

  const allImages = useMemo(() => {
    const list: GalleryImageItem[] = [];
    const seenUrls = new Set<string>();
    const seenKeys = new Set<string>();

    const pushItem = (item: GalleryImageItem) => {
      if (!isRealPhoto(item.image)) return;
      const webpUrl = normalizeToWebp(item.image);
      const key = getImageDeduplicationKey(webpUrl);
      const urlLower = webpUrl.toLowerCase();

      if (!key || seenUrls.has(urlLower) || seenKeys.has(key)) return;
      seenUrls.add(urlLower);
      seenKeys.add(key);

      list.push({ ...item, image: webpUrl });
    };

    // 1. Live Admin Products
    if (Array.isArray(products) && products.length > 0) {
      products.forEach((p) => {
        const cat = mapCategoryToFilter(p.categoryName, p.name);
        const price = p.price ? `₹${p.price.toLocaleString('en-IN')}` : undefined;
        const serviceName = p.categoryName || p.subcategory || 'Birthdays';
        const serviceRoute = `/services/${encodeURIComponent(serviceName)}`;

        pushItem({
          id: `pkg-${p._id}-main`,
          title: p.name,
          category: cat,
          serviceName,
          serviceRoute,
          image: p.image,
          tag: p.badge || p.subcategory || p.categoryName || 'Celebration Package',
          price,
          description: p.description,
          product: p,
        });

        if (Array.isArray(p.moreImages)) {
          p.moreImages.forEach((imgUrl, idx) => {
            pushItem({
              id: `pkg-${p._id}-more-${idx}`,
              title: `${p.name} — Detail View ${idx + 2}`,
              category: cat,
              serviceName,
              serviceRoute,
              image: imgUrl,
              tag: p.badge || p.categoryName || 'Gallery Showcase',
              price,
              description: p.description,
              product: p,
            });
          });
        }
      });
    }

    // 2. Admin-managed gallery images (added/removed/reordered from the CRM
    // Gallery tab). Ranked by the CRM's own order -- these lead the grid,
    // ahead of the legacy curated sequence below, since the CRM is now the
    // live source of truth for what's freshly added.
    const crmRankMap = new Map<string, number>();
    let crmRank = 0;
    adminGalleryImages.forEach((g) => {
      if (g.active === false) return;
      crmRankMap.set(`crm-gallery-${g._id}`, crmRank++);
    });

    adminGalleryImages.forEach((g) => {
      if (g.active === false) return;
      const serviceName = g.category || 'Birthdays';
      pushItem({
        id: `crm-gallery-${g._id}`,
        title: g.title || 'Celebration Setup',
        category: mapCategoryToFilter(g.category, g.title),
        serviceName,
        serviceRoute: `/services/${encodeURIComponent(serviceName)}`,
        image: g.imageUrl,
        tag: g.category || 'Gallery',
      });
    });

    // Sort items: CRM-managed images lead in the CRM's own order; everything
    // else (live product images) follows in whatever order they arrived.
    const rankOf = (item: GalleryImageItem): number => crmRankMap.get(item.id) ?? crmRankMap.size;

    list.sort((a, b) => {
      const rankA = rankOf(a);
      const rankB = rankOf(b);

      if (rankA !== rankB) {
        return rankA - rankB;
      }
      return 0;
    });

    return list;
  }, [products, adminGalleryImages]);

  // Caching metadata & cookie for server load reduction
  useEffect(() => {
    if (allImages.length > 0) {
      try {
        sessionStorage.setItem(
          'tdp_gallery_meta',
          JSON.stringify({ count: allImages.length, timestamp: Date.now() })
        );
        document.cookie = 'tdp_gallery_cached=1; path=/; max-age=86400; SameSite=Lax';
      } catch {
        // ignore
      }
    }
  }, [allImages.length]);

  const filteredImages = useMemo(() => {
    return activeCategory === 'ALL'
      ? allImages
      : allImages.filter((item) => item.category === activeCategory);
  }, [activeCategory, allImages]);

  // Progressive sequential loading (30 images initial batch & 50% scroll trigger)
  const PAGE_SIZE = 30;
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const halfwaySentinelRef = useRef<HTMLDivElement>(null);
  const gridContainerRef = useRef<HTMLElement>(null);

  // Progressive loading: first 30 images load immediately, then subsequent images come in queue view
  const [loadedUpToIndex, setLoadedUpToIndex] = useState<number>(PAGE_SIZE);

  const handleImageLoaded = useCallback((cardIndex: number) => {
    setLoadedUpToIndex((prev) => Math.max(prev, cardIndex + 1));
  }, []);

  // Reset pagination and queue when category filter changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    setLoadedUpToIndex(PAGE_SIZE);
    setLoadingMore(false);
  }, [activeCategory]);

  const visibleImages = useMemo(() => {
    return filteredImages.slice(0, visibleCount);
  }, [filteredImages, visibleCount]);

  const hasMore = visibleCount < filteredImages.length;

  const loadMore = useCallback(() => {
    if (loadingMore || visibleCount >= filteredImages.length) return;
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredImages.length));
      setLoadingMore(false);
    }, 120);
  }, [loadingMore, visibleCount, filteredImages.length]);

  // 1. Observer for halfway sentinel: triggers as soon as user scrolls past 50% of the loaded images
  useEffect(() => {
    const el = halfwaySentinelRef.current;
    if (!el || loadingMore || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '150px 0px 150px 0px', threshold: 0.01 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore, loadingMore, hasMore, visibleCount]);

  // 2. Observer for bottom sentinel
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || loadingMore || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore, loadingMore, hasMore]);

  // 3. Scroll progress fallback: trigger when scrolled past 50% of current grid height
  useEffect(() => {
    if (loadingMore || !hasMore) return;
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const grid = gridContainerRef.current;
        if (!grid || loadingMore || !hasMore) return;
        const rect = grid.getBoundingClientRect();
        const scrolledPastTop = window.innerHeight - rect.top;
        if (rect.height > 0 && scrolledPastTop / rect.height >= 0.5) {
          loadMore();
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore, loadingMore, hasMore]);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const showPrev = useCallback(() => {
    setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredImages.length - 1));
  }, [filteredImages.length]);

  const showNext = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null) return 0;
      const next = prev < filteredImages.length - 1 ? prev + 1 : 0;
      if (next >= visibleCount) {
        setVisibleCount((c) => Math.min(c + PAGE_SIZE, filteredImages.length));
      }
      return next;
    });
  }, [filteredImages.length, visibleCount]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, showPrev, showNext]);

  return (
    <>
      <SeoHead
        title="Celebration Gallery — The Decor Party Bangalore | Real Decor Photos & Setups"
        description="A curated board of real celebrations, balloon decor installations, milestone birthdays, and romantic setups styled across Bengaluru with 100% picture-match guarantee."
        keywords={[
          'party decoration photos bangalore',
          'balloon decoration gallery bengaluru',
          'event decor portfolio bangalore',
          'birthday decoration real photos',
        ]}
        image="https://thedecorparty.com/about-purple-decor.jpg"
        url="https://thedecorparty.com/gallery"
        schema={[
          {
            '@type': 'ImageGallery',
            name: 'The Decor Party Bangalore Celebration Gallery',
            description: 'Curated real celebration decor photos and balloon installations across Bangalore.',
            url: 'https://thedecorparty.com/gallery',
          },
        ]}
        breadcrumbs={[
          { name: 'Home', item: '/' },
          { name: 'Gallery', item: '/gallery' },
        ]}
      />

      <div className="flex flex-col w-full bg-[#FFF3E6] text-[#381932] font-poppins antialiased min-h-screen">
        {/* =============================================================== */}
        {/* 1. HERO                                                         */}
        {/* =============================================================== */}
        <section
          data-nav-theme="light"
          className="relative w-full pt-12 sm:pt-16 pb-8 sm:pb-10 px-4 sm:px-6 lg:px-12 max-w-[1720px] mx-auto text-center"
        >
          <div className="max-w-3xl mx-auto flex flex-col items-center">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 text-[11px] font-poppins font-semibold uppercase tracking-[0.2em] text-[#A78A9F] mb-4"
            >
              <Sprig className="w-14 h-5 text-[#A78A9F]" />
              Real Celebrations
              <Sprig className="w-14 h-5 text-[#A78A9F] -scale-x-100" />
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif text-3xl sm:text-4xl lg:text-[46px] font-bold uppercase tracking-tight text-[#381932] leading-[1.05] mb-3 [text-wrap:balance]"
            >
              A Little Inspiration for Your{' '}
              <span className="text-[#A78A9F]">Next Celebration</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-sans font-medium text-base sm:text-lg text-[#A78A9F] mt-2"
            >
              details &amp; beautiful spaces, styled by The Decor Party
            </motion.p>
          </div>

          {/* 2. FILTERS */}
          <div className="mt-8 sm:mt-10 flex items-center justify-start sm:justify-center overflow-x-auto pb-2 scrollbar-none gap-2.5 px-1 max-w-full">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              const count =
                cat === 'ALL'
                  ? allImages.length
                  : allImages.filter((item) => item.category === cat).length;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`relative shrink-0 rounded-full border px-4 sm:px-5 py-2 text-[11px] font-serif font-semibold uppercase tracking-wide transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'border-[#381932] bg-[#381932] text-[#FFF3E6] shadow-sm'
                      : 'border-[#E6D7C5] bg-[#FFF3E6] text-[#381932] hover:border-[#A78A9F]'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`rounded-full px-1.5 text-[10px] font-bold ${
                      isActive ? 'bg-[#FFF3E6]/20 text-[#FFF3E6]' : 'bg-[#A78A9F]/15 text-[#381932]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* =============================================================== */}
        {/* 3. FIXED POSITION GRID & SEQUENTIAL QUEUE                        */}
        {/* =============================================================== */}
        <section
          ref={gridContainerRef}
          className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-12 pb-20 sm:pb-28"
        >
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
            {visibleImages.map((item, index) => {
              const isHalfway = index === Math.max(0, Math.floor(visibleImages.length * 0.5) - 1);
              return (
                <React.Fragment key={item.id}>
                  <GalleryCard
                    item={item}
                    index={index}
                    shouldLoad={index < PAGE_SIZE || index <= loadedUpToIndex}
                    onLoaded={handleImageLoaded}
                    onClick={() => openLightbox(index)}
                  />
                  {isHalfway && (
                    <div
                      ref={halfwaySentinelRef}
                      data-halfway-sentinel={visibleImages.length}
                      className="col-span-full h-px w-full opacity-0 pointer-events-none -my-px"
                      aria-hidden="true"
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Infinite Scroll Sentinel & Counter */}
          <div ref={sentinelRef} className="w-full py-10 flex flex-col items-center justify-center">
            {hasMore ? (
              <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-[#381932]/5 border border-[#381932]/10 backdrop-blur-sm text-xs font-serif font-bold uppercase tracking-wider text-[#381932]">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A78A9F] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#381932]"></span>
                </span>
                <span>Loading more setups ({visibleImages.length} of {filteredImages.length})</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5 text-center text-xs font-serif uppercase tracking-widest text-[#A78A9F]">
                <span>Showing all {filteredImages.length} real celebration setups</span>
                <span className="text-[10px] lowercase font-sans font-normal opacity-70">100% picture-match guarantee across bangalore</span>
              </div>
            )}
          </div>
        </section>

        {/* =============================================================== */}
        {/* 4. ENLARGED LIGHTBOX VIEW                                        */}
        {/* =============================================================== */}
        <AnimatePresence>
          {lightboxIndex !== null && filteredImages[lightboxIndex] && (() => {
            const current = filteredImages[lightboxIndex];
            return (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[999999] flex items-center justify-center bg-[#25101f]/95 backdrop-blur-2xl p-4 sm:p-6 overflow-y-auto"
                onClick={closeLightbox}
              >
                {/* Header Bar */}
                <div
                  className="absolute top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-6 flex items-center justify-between z-20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded-full bg-[#FFF3E6]/10 border border-[#FFF3E6]/15 px-3 py-1 text-xs font-semibold text-[#FFF3E6]">
                      {lightboxIndex + 1} / {filteredImages.length}
                    </span>
                    <span className="rounded-full bg-[#A78A9F]/30 border border-[#A78A9F]/40 px-3 py-1 text-[11px] font-serif font-bold uppercase tracking-wide text-[#FFF3E6]">
                      {current.category}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(current.serviceRoute);
                      }}
                      className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#FFF3E6]/15 hover:bg-[#FFF3E6]/25 border border-[#FFF3E6]/20 px-3 py-1 text-[11px] font-serif font-bold uppercase tracking-wide text-[#FFF3E6] transition-colors cursor-pointer"
                    >
                      <Sparkles size={11} className="text-[#E6D7C5]" />
                      <span>Service: {current.serviceName}</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    aria-label="Close"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeLightbox();
                    }}
                    className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-[#FFF3E6]/10 hover:bg-[#FFF3E6]/20 text-[#FFF3E6] border border-[#FFF3E6]/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Left Arrow */}
                <button
                  type="button"
                  aria-label="Previous"
                  onClick={(e) => {
                    e.stopPropagation();
                    showPrev();
                  }}
                  className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-[#FFF3E6]/10 hover:bg-[#FFF3E6]/20 text-[#FFF3E6] border border-[#FFF3E6]/20 backdrop-blur-md transition-all cursor-pointer hover:scale-105 active:scale-95 z-20"
                >
                  <ChevronLeft size={24} />
                </button>

                {/* Center Content */}
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25 }}
                  className="relative max-h-[90vh] max-w-[92vw] flex flex-col items-center justify-center z-10 my-auto pt-10 sm:pt-12 pb-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Enlarged Image */}
                  <img
                    src={current.image}
                    alt={current.title}
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.src.endsWith('.webp')) {
                        target.src = target.src.replace(/\.webp$/i, '.jpg');
                      }
                    }}
                    className="max-h-[58vh] sm:max-h-[64vh] max-w-[88vw] w-auto h-auto object-contain rounded-2xl sm:rounded-3xl shadow-2xl border border-[#FFF3E6]/15"
                  />

                  {/* Info & Redirection Card */}
                  <div className="w-full max-w-xl mt-3 sm:mt-4 rounded-2xl bg-[#381932]/95 backdrop-blur-xl border border-[#FFF3E6]/20 p-4 sm:p-5 shadow-2xl text-[#FFF3E6]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(current.serviceRoute);
                          }}
                          className="inline-flex items-center gap-1.5 text-[11px] font-serif font-bold uppercase tracking-wider text-[#C8B5C3] hover:text-[#FFF3E6] transition-colors cursor-pointer group"
                        >
                          <Sparkles size={12} className="text-[#E6D7C5]" />
                          <span>{current.serviceName}</span>
                          <span className="text-[#C8B5C3]/70 group-hover:translate-x-0.5 transition-transform">→</span>
                        </button>
                        <h2
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(current.serviceRoute);
                          }}
                          className="font-serif text-base sm:text-lg font-bold uppercase tracking-tight text-[#FFF3E6] hover:text-[#E6D7C5] transition-colors cursor-pointer leading-snug mt-0.5 line-clamp-2"
                        >
                          {current.title}
                        </h2>
                      </div>
                      {current.price && (
                        <div className="text-right shrink-0">
                          <span className="text-[10px] uppercase font-serif tracking-wider text-[#C8B5C3] block">Starting from</span>
                          <span className="text-base sm:text-lg font-bold text-[#FFF3E6]">{current.price}</span>
                        </div>
                      )}
                    </div>

                    {current.description && (
                      <p className="text-xs text-[#FFF3E6]/80 mt-2 line-clamp-2 leading-relaxed font-sans">
                        {current.description}
                      </p>
                    )}

                    <div className="mt-3.5 pt-3 border-t border-[#FFF3E6]/15 flex items-center gap-2 sm:gap-3">
                      {/* Designated Service Redirection Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(current.serviceRoute);
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-[#FFF3E6] text-[#381932] px-4 sm:px-6 py-2.5 text-xs font-serif font-bold uppercase tracking-wider shadow-lg hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                      >
                        <span>Explore {current.serviceName} Service</span>
                        <ArrowUpRight size={14} />
                      </button>

                      {/* Quick Book Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookImage(current);
                        }}
                        className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#FFF3E6]/30 bg-white/10 hover:bg-white/20 text-[#FFF3E6] px-4 sm:px-5 py-2.5 text-xs font-serif font-bold uppercase tracking-wider transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <span>Book Setup</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* Right Arrow */}
                <button
                  type="button"
                  aria-label="Next"
                  onClick={(e) => {
                    e.stopPropagation();
                    showNext();
                  }}
                  className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-[#FFF3E6]/10 hover:bg-[#FFF3E6]/20 text-[#FFF3E6] border border-[#FFF3E6]/20 backdrop-blur-md transition-all cursor-pointer hover:scale-105 active:scale-95 z-20"
                >
                  <ChevronRight size={24} />
                </button>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>
    </>
  );
};

export default GalleryPage;

