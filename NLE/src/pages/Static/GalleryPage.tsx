import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ArrowUpRight, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { SeoHead } from '../../components/layout/SeoHead';
import { useProducts } from '../../hooks/useProducts';
import {
  BIRTHDAY,
  ANNIVERSARY,
  DINNERS,
  MOST_BOOKED,
  HERO_SLIDES,
  CAT_ICONS,
} from '../../data';
import { SERVICE_GALLERY_IMAGES } from '../../data/servicesData';

export type GalleryCategory =
  | 'ALL'
  | 'BIRTHDAYS'
  | 'BALLOON DECOR'
  | 'BABY SHOWERS'
  | 'PROPOSALS'
  | 'WEDDINGS'
  | 'ANNIVERSARIES'
  | 'CUSTOM THEMES';

export interface GalleryImageItem {
  id: string;
  title: string;
  category: GalleryCategory;
  image: string;
  tag: string;
  price?: string | number;
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

// The gallery is built from the same public/ photo library that feeds the
// Services section (SERVICE_GALLERY_IMAGES), grouped into the gallery's
// filter buckets, plus three signature brand shots. Real photography only.
const THEME_TO_GALLERY: Record<string, { category: GalleryCategory; tag: string }> = {
  'birthdays': { category: 'BIRTHDAYS', tag: 'Birthday Decor' },
  '1st birthday designs': { category: 'BIRTHDAYS', tag: '1st Birthday' },
  'boy theme': { category: 'BIRTHDAYS', tag: 'Kids Theme' },
  'kids activities': { category: 'BIRTHDAYS', tag: 'Kids Activities' },
  'baby showers': { category: 'BABY SHOWERS', tag: 'Baby Shower' },
  'welcome baby': { category: 'BABY SHOWERS', tag: 'Welcome Baby' },
  'naming ceremonies': { category: 'BABY SHOWERS', tag: 'Naming Ceremony' },
  'annaprashan': { category: 'BABY SHOWERS', tag: 'Annaprashan' },
  'terrace proposals': { category: 'PROPOSALS', tag: 'Terrace Proposal' },
  'heart arch setup': { category: 'PROPOSALS', tag: 'Heart Arch' },
  'candlelight pathway': { category: 'PROPOSALS', tag: 'Candlelight Pathway' },
  'proposal setup': { category: 'PROPOSALS', tag: 'Proposal Setup' },
  'pre & post wedding': { category: 'WEDDINGS', tag: 'Pre & Post Wedding' },
  'groom-to-be': { category: 'WEDDINGS', tag: 'Groom-to-Be' },
  'bride-to-be': { category: 'WEDDINGS', tag: 'Bride-to-Be' },
  'national festivals': { category: 'WEDDINGS', tag: 'Festival Decor' },
  'anniversary celebrations': { category: 'ANNIVERSARIES', tag: 'Anniversary' },
  'cabana setups': { category: 'ANNIVERSARIES', tag: 'Cabana Nights' },
  'simple wall decors': { category: 'CUSTOM THEMES', tag: 'Simple Wall Decor' },
  'gift hampers': { category: 'CUSTOM THEMES', tag: 'Gift Hampers' },
  'return gifts': { category: 'CUSTOM THEMES', tag: 'Return Gifts' },
  'flower bouquets': { category: 'CUSTOM THEMES', tag: 'Flower Bouquets' },
  'customised cakes': { category: 'CUSTOM THEMES', tag: 'Customised Cakes' },
  'opening decors': { category: 'CUSTOM THEMES', tag: 'Opening Decor' },
  'graduation': { category: 'CUSTOM THEMES', tag: 'Graduation' },
  'bike & car deliveries': { category: 'CUSTOM THEMES', tag: 'Bike & Car Surprise' },
  'car boot surprises': { category: 'CUSTOM THEMES', tag: 'Car Boot Surprise' },
  'live eateries / catering': { category: 'CUSTOM THEMES', tag: 'Live Eateries' },
};

function buildBaseCollection(): GalleryImageItem[] {
  const seen = new Set<string>();
  const out: GalleryImageItem[] = [
    { id: 'gal-brand-1', title: 'Signature Purple Milestone Suite', category: 'CUSTOM THEMES', image: '/about-purple-decor.jpg', tag: 'Signature Milestone' },
    { id: 'gal-brand-2', title: 'Bespoke Celebration Atmosphere', category: 'CUSTOM THEMES', image: '/about-aesthetic.jpg', tag: 'Atmosphere Styling' },
    { id: 'gal-brand-3', title: 'Luxe Editorial Celebration Backdrop', category: 'CUSTOM THEMES', image: '/about-purple-banner.jpg', tag: 'Editorial Suite' },
  ];
  out.forEach((i) => seen.add(i.image));

  for (const [theme, meta] of Object.entries(THEME_TO_GALLERY)) {
    const images = SERVICE_GALLERY_IMAGES[theme] || [];
    images.forEach((image, idx) => {
      if (seen.has(image)) return;
      seen.add(image);
      out.push({
        id: `gal-${theme.replace(/[^a-z0-9]/g, '')}-${idx}`,
        title: `${meta.tag} ${idx + 1}`,
        category: meta.category,
        image,
        tag: meta.tag,
      });
    });
  }
  return out;
}

export const BASE_GALLERY_COLLECTION: GalleryImageItem[] = buildBaseCollection();

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

const isRealPhoto = (url?: string): url is string =>
  !!url && !/unsplash\.com|placehold|via\.placeholder|dummyimage/i.test(url);

const mapCategoryToFilter = (catName?: string, name?: string): GalleryCategory => {
  const c = (catName || '').toLowerCase();
  const n = (name || '').toLowerCase();

  if (c.includes('birthday') || n.includes('birthday') || n.includes('bday') || n.includes('kids')) return 'BIRTHDAYS';
  if (c.includes('balloon') || n.includes('balloon') || n.includes('arch') || n.includes('garland') || n.includes('ring')) return 'BALLOON DECOR';
  if (c.includes('baby') || n.includes('baby') || n.includes('cradle') || n.includes('shower') || n.includes('welcome baby')) return 'BABY SHOWERS';
  if (c.includes('proposal') || n.includes('proposal') || n.includes('marry me') || n.includes('rose day')) return 'PROPOSALS';
  if (c.includes('wedding') || n.includes('wedding') || n.includes('haldi') || n.includes('mehendi') || n.includes('sangeet') || c.includes('festival')) return 'WEDDINGS';
  if (c.includes('anniversary') || n.includes('anniversary') || c.includes('romantic') || n.includes('cabana') || n.includes('candlelight') || c.includes('dinner')) return 'ANNIVERSARIES';
  return 'CUSTOM THEMES';
};

interface GalleryCardProps {
  item: GalleryImageItem;
  index: number;
  onClick: () => void;
}

const GalleryCard: React.FC<GalleryCardProps> = ({ item, index, onClick }) => (
  <div className="break-inside-avoid w-full mb-4 sm:mb-5 select-none">
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.45, delay: (index % 10) * 0.03, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      className="group relative block w-full cursor-pointer overflow-hidden rounded-[20px] border border-[#E6D7C5] bg-[#FFF3E6] text-left shadow-[0_12px_34px_-24px_rgba(56,25,50,0.4)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_54px_-26px_rgba(56,25,50,0.45)]"
    >
      <img
        src={item.image}
        alt={item.title}
        loading="lazy"
        className="w-full h-auto object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.04]"
      />

      {/* Caption overlay */}
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-[#25101f]/88 via-[#381932]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 p-4">
        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1 text-[10px] font-poppins font-semibold uppercase tracking-[0.14em] text-[#C8B5C3]">
              <Heart size={10} className="fill-[#C8B5C3] text-[#C8B5C3]" />
              {item.tag}
            </span>
            <p className="font-serif text-[13px] font-bold uppercase tracking-tight text-[#FFF3E6] leading-tight line-clamp-2 mt-0.5">
              {item.title}
            </p>
            {item.price && (
              <span className="text-[11px] font-semibold text-[#FFF3E6]/90">{item.price}</span>
            )}
          </div>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFF3E6] text-[#381932] shadow-md transition-transform duration-300 group-hover:scale-110">
            <ArrowUpRight size={14} />
          </span>
        </div>
      </div>
    </motion.button>
  </div>
);

export const GalleryPage: React.FC = () => {
  const { products } = useProducts();
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>('ALL');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const allImages = useMemo(() => {
    const list: GalleryImageItem[] = [...BASE_GALLERY_COLLECTION];
    const seenUrls = new Set(list.map((item) => item.image));

    const push = (item: GalleryImageItem) => {
      if (!isRealPhoto(item.image) || seenUrls.has(item.image)) return;
      seenUrls.add(item.image);
      list.push(item);
    };

    const staticPackageSets = [
      { items: BIRTHDAY, cat: 'BIRTHDAYS' as GalleryCategory, defaultTag: 'Birthday Package' },
      { items: ANNIVERSARY, cat: 'ANNIVERSARIES' as GalleryCategory, defaultTag: 'Anniversary Package' },
      { items: DINNERS, cat: 'ANNIVERSARIES' as GalleryCategory, defaultTag: 'Candlelight Dinner' },
      { items: MOST_BOOKED, cat: 'CUSTOM THEMES' as GalleryCategory, defaultTag: 'Most Booked' },
    ];

    staticPackageSets.forEach(({ items, cat, defaultTag }) => {
      items.forEach((p, idx) => {
        push({
          id: `static-pkg-${cat}-${idx}`,
          title: p.title,
          category: mapCategoryToFilter(cat, p.title),
          image: p.img,
          tag: p.badge || defaultTag,
          price: p.price,
        });
      });
    });

    HERO_SLIDES.forEach((slide, idx) => {
      push({
        id: `hero-slide-${idx}`,
        title: slide.headline.replace('\n', ' '),
        category: mapCategoryToFilter(slide.chip, slide.headline),
        image: slide.img,
        tag: slide.chip,
      });
    });

    CAT_ICONS.forEach((icon, idx) => {
      push({
        id: `cat-icon-${idx}`,
        title: icon.label.replace('\n', ' '),
        category: mapCategoryToFilter(icon.label, icon.label),
        image: icon.img,
        tag: 'Curated Category',
      });
    });

    if (Array.isArray(products) && products.length > 0) {
      products.forEach((p) => {
        const cat = mapCategoryToFilter(p.categoryName, p.name);
        const price = p.price ? `₹${p.price.toLocaleString('en-IN')}` : undefined;

        push({
          id: `pkg-${p._id}-main`,
          title: p.name,
          category: cat,
          image: p.image,
          tag: p.badge || p.subcategory || p.categoryName || 'Celebration Package',
          price,
        });

        if (Array.isArray(p.moreImages)) {
          p.moreImages.forEach((imgUrl, idx) => {
            push({
              id: `pkg-${p._id}-more-${idx}`,
              title: `${p.name} — Detail View ${idx + 2}`,
              category: cat,
              image: imgUrl,
              tag: p.badge || p.categoryName || 'Gallery Showcase',
              price,
            });
          });
        }
      });
    }

    return list;
  }, [products]);

  const filteredImages = useMemo(() => {
    return activeCategory === 'ALL'
      ? allImages
      : allImages.filter((item) => item.category === activeCategory);
  }, [activeCategory, allImages]);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const showPrev = useCallback(() => {
    setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredImages.length - 1));
  }, [filteredImages.length]);

  const showNext = useCallback(() => {
    setLightboxIndex((prev) =>
      prev !== null && prev < filteredImages.length - 1 ? prev + 1 : 0
    );
  }, [filteredImages.length]);

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
        title="Celebration Gallery — The Decor Party | Real Events & Package Inspirations"
        description="A curated board of real celebrations, balloon decor installations, milestone birthdays, and romantic setups styled across Bengaluru."
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
              className="font-script text-xl sm:text-2xl text-[#A78A9F]"
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
        {/* 3. MASONRY GRID                                                 */}
        {/* =============================================================== */}
        <section className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-12 pb-20 sm:pb-28">
          <motion.div
            layout
            className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 sm:gap-5"
          >
            <AnimatePresence>
              {filteredImages.map((item, index) => (
                <GalleryCard
                  key={item.id}
                  item={item}
                  index={index}
                  onClick={() => openLightbox(index)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </section>

        {/* =============================================================== */}
        {/* 4. LIGHTBOX                                                     */}
        {/* =============================================================== */}
        <AnimatePresence>
          {lightboxIndex !== null && filteredImages[lightboxIndex] && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[999999] flex items-center justify-center bg-[#25101f]/94 backdrop-blur-xl p-4 sm:p-6"
              onClick={closeLightbox}
            >
              <div
                className="absolute top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-6 flex items-center justify-between z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#FFF3E6]/10 border border-[#FFF3E6]/15 px-3 py-1 text-xs font-semibold text-[#FFF3E6]">
                    {lightboxIndex + 1} / {filteredImages.length}
                  </span>
                  <span className="rounded-full bg-[#A78A9F]/30 border border-[#A78A9F]/40 px-3 py-1 text-[11px] font-serif font-bold uppercase tracking-wide text-[#FFF3E6]">
                    {filteredImages[lightboxIndex].category}
                  </span>
                </div>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={closeLightbox}
                  className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-[#FFF3E6]/10 hover:bg-[#FFF3E6]/20 text-[#FFF3E6] border border-[#FFF3E6]/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  <X size={20} />
                </button>
              </div>

              <button
                type="button"
                aria-label="Previous"
                onClick={(e) => {
                  e.stopPropagation();
                  showPrev();
                }}
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-[#FFF3E6]/10 hover:bg-[#FFF3E6]/20 text-[#FFF3E6] border border-[#FFF3E6]/20 backdrop-blur-md transition-all cursor-pointer hover:scale-105 active:scale-95 z-10"
              >
                <ChevronLeft size={24} />
              </button>

              <motion.div
                key={filteredImages[lightboxIndex].id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="relative max-h-[85vh] max-w-[90vw] flex flex-col items-center"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={filteredImages[lightboxIndex].image}
                  alt={filteredImages[lightboxIndex].title}
                  className="max-h-[78vh] max-w-[88vw] w-auto h-auto object-contain rounded-2xl sm:rounded-3xl shadow-2xl"
                />
                <div className="mt-3 flex items-center gap-2 rounded-full bg-[#381932]/70 backdrop-blur-md border border-[#FFF3E6]/15 px-4 py-1.5 text-xs text-[#FFF3E6]">
                  <span className="font-serif font-semibold uppercase tracking-tight">
                    {filteredImages[lightboxIndex].title}
                  </span>
                  <span className="text-[#C8B5C3]">• {filteredImages[lightboxIndex].tag}</span>
                  {filteredImages[lightboxIndex].price && (
                    <span className="text-[#FFF3E6] font-bold ml-1">
                      ({filteredImages[lightboxIndex].price})
                    </span>
                  )}
                </div>
              </motion.div>

              <button
                type="button"
                aria-label="Next"
                onClick={(e) => {
                  e.stopPropagation();
                  showNext();
                }}
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-[#FFF3E6]/10 hover:bg-[#FFF3E6]/20 text-[#FFF3E6] border border-[#FFF3E6]/20 backdrop-blur-md transition-all cursor-pointer hover:scale-105 active:scale-95 z-10"
              >
                <ChevronRight size={24} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default GalleryPage;
