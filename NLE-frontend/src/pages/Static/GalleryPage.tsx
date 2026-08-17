import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowUpRight,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from 'lucide-react';
import { SeoHead } from '../../components/layout/SeoHead';

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
  aspectClass?: string; // Optional helper class for varying heights
}

// Curated collection using all suitable images from the project's asset repository
export const GALLERY_COLLECTION: GalleryImageItem[] = [
  {
    id: 'gal-01',
    title: 'TheDecorParty Signature Purple Milestone Suite',
    category: 'BIRTHDAYS',
    image: '/about-purple-decor.png',
    tag: 'Signature Milestone',
  },
  {
    id: 'gal-02',
    title: 'Pastel Lilac Ring Arch & Custom Neon',
    category: 'BALLOON DECOR',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=900&auto=format&fit=crop&q=85',
    tag: 'Pastel Garlands',
  },
  {
    id: 'gal-03',
    title: 'Rooftop Candlelight Cabana & Fairy Lights',
    category: 'ANNIVERSARIES',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&auto=format&fit=crop&q=85',
    tag: 'Rooftop Dining',
  },
  {
    id: 'gal-04',
    title: 'Grand 4FT Marry Me Illuminated Letters',
    category: 'PROPOSALS',
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=900&auto=format&fit=crop&q=85',
    tag: 'Grand Proposal',
  },
  {
    id: 'gal-05',
    title: 'Bespoke Celebration Atmosphere & Ambient Lighting',
    category: 'CUSTOM THEMES',
    image: '/about-aesthetic.png',
    tag: 'Atmosphere Styling',
  },
  {
    id: 'gal-06',
    title: 'Teddy Bear & Clouds Baby Welcome Cradle',
    category: 'BABY SHOWERS',
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=900&auto=format&fit=crop&q=85',
    tag: 'Baby Shower',
  },
  {
    id: 'gal-07',
    title: 'Traditional Marigold Drapes & Haldi Canopy',
    category: 'WEDDINGS',
    image: 'https://images.unsplash.com/photo-1602631985686-1bb0e6a8696e?w=900&auto=format&fit=crop&q=85',
    tag: 'Haldi & Mehendi',
  },
  {
    id: 'gal-08',
    title: 'Metallic Chrome Backdrop Arch Architecture',
    category: 'BALLOON DECOR',
    image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=900&auto=format&fit=crop&q=85',
    tag: 'Chrome Ring Arch',
  },
  {
    id: 'gal-09',
    title: 'Luxe Thoughtful Celebration Backdrop',
    category: 'CUSTOM THEMES',
    image: '/about-purple-banner.png',
    tag: 'Editorial Suite',
  },
  {
    id: 'gal-10',
    title: 'Bohemian Pampas Grass Wedding Canopy',
    category: 'WEDDINGS',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=900&auto=format&fit=crop&q=85',
    tag: 'Boho Luxe',
  },
  {
    id: 'gal-11',
    title: 'Grand Floral Entrance Tunnel Installation',
    category: 'WEDDINGS',
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=900&auto=format&fit=crop&q=85',
    tag: 'Floral Tunnel',
  },
  {
    id: 'gal-12',
    title: 'Fairy Light Romance & Candlelit Bedroom Suite',
    category: 'ANNIVERSARIES',
    image: 'https://images.unsplash.com/photo-1518049362265-d5b2a6467637?w=900&auto=format&fit=crop&q=85',
    tag: 'Rose Petals & Candles',
  },
  {
    id: 'gal-13',
    title: 'Artisanal Kids Theme Birthday Wonderland',
    category: 'BIRTHDAYS',
    image: 'https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=900&auto=format&fit=crop&q=85',
    tag: 'Kids Wonder',
  },
  {
    id: 'gal-14',
    title: 'Pastel Cascades & Balloon Bouquets',
    category: 'BALLOON DECOR',
    image: 'https://images.unsplash.com/photo-1567696153798-9111f9cd3d0d?w=900&auto=format&fit=crop&q=85',
    tag: 'Organic Garlands',
  },
  {
    id: 'gal-15',
    title: 'LED Name Neon Glow Birthday Setup',
    category: 'BIRTHDAYS',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&auto=format&fit=crop&q=85',
    tag: 'Custom Neon Glow',
  },
  {
    id: 'gal-16',
    title: 'Intimate In-Room Candlelight Dining Setup',
    category: 'ANNIVERSARIES',
    image: 'https://images.unsplash.com/photo-1564758563-83dcea87e075?w=900&auto=format&fit=crop&q=85',
    tag: 'Romantic Dining',
  },
  {
    id: 'gal-17',
    title: 'Poolside Candlelight & Luxury Garden Experience',
    category: 'CUSTOM THEMES',
    image: 'https://images.unsplash.com/photo-1551966775-a4ddc8df052b?w=900&auto=format&fit=crop&q=85',
    tag: 'Poolside Chic',
  },
  {
    id: 'gal-18',
    title: 'Surprise Midnight Box & Celebration Hamper',
    category: 'PROPOSALS',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=900&auto=format&fit=crop&q=85',
    tag: 'Surprise Hamper',
  },
  {
    id: 'gal-19',
    title: 'Luxury Keepsake Gift Box Styling',
    category: 'CUSTOM THEMES',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&auto=format&fit=crop&q=85',
    tag: 'Luxury Keepsake',
  },
  {
    id: 'gal-20',
    title: 'Fresh Botanical Floral Arch Arrangement',
    category: 'BABY SHOWERS',
    image: 'https://images.unsplash.com/photo-1487530811015-780e0ba2b009?w=900&auto=format&fit=crop&q=85',
    tag: 'Botanical Florals',
  },
];

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

export const GalleryPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>('ALL');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredImages =
    activeCategory === 'ALL'
      ? GALLERY_COLLECTION
      : GALLERY_COLLECTION.filter((item) => item.category === activeCategory);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const showPrev = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) =>
      prev !== null && prev > 0 ? prev - 1 : filteredImages.length - 1
    );
  }, [lightboxIndex, filteredImages.length]);

  const showNext = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) =>
      prev !== null && prev < filteredImages.length - 1 ? prev + 1 : 0
    );
  }, [lightboxIndex, filteredImages.length]);

  // Keyboard navigation for Lightbox
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
        title="Celebration Gallery — TheDecorParty | Real Events & Decor Inspiration"
        description="A curated Pinterest-style board of real celebrations, balloon decor installations, milestone birthdays, and romantic setups styled across Bengaluru."
      />

      <div className="flex flex-col w-full bg-[#FAF8F5] dark:bg-[#1B101F] text-[#34203C] dark:text-[#FAF8F5] font-sans antialiased transition-colors min-h-screen">
        
        {/* ========================================================================= */}
        {/* 1. GALLERY HERO                                                           */}
        {/* ========================================================================= */}
        <section
          data-nav-theme="light"
          className="relative w-full pt-12 sm:pt-16 md:pt-20 pb-8 sm:pb-12 px-4 sm:px-6 md:px-8 lg:px-12 max-w-[1720px] mx-auto text-center"
        >
          {/* Ambient Glows */}
          <div className="absolute top-10 left-1/3 w-80 h-80 rounded-full bg-[#A78A9F]/12 blur-3xl pointer-events-none -z-10" />
          <div className="absolute top-32 right-1/4 w-80 h-80 rounded-full bg-[#C9BEAB]/15 blur-3xl pointer-events-none -z-10" />

          <div className="max-w-3xl mx-auto flex flex-col items-center">
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#34203C]/06 dark:bg-white/10 border border-[#34203C]/10 dark:border-white/15 text-xs font-bold uppercase tracking-[0.22em] text-[#725D75] dark:text-[#C9BEAB] mb-4 sm:mb-6"
            >
              <Sparkles size={13} className="text-[#A78A9F]" />
              <span>REAL CELEBRATIONS</span>
            </motion.div>

            {/* H1 */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-normal tracking-tight text-[#34203C] dark:text-[#FAF8F5] leading-[1.12] mb-5 uppercase"
            >
              A little inspiration{' '}
              <span className="font-serif italic text-[#725D75] dark:text-[#C9BEAB] block sm:inline lowercase">
                for your next celebration.
              </span>
            </motion.h1>

            {/* Text */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm sm:text-base md:text-lg font-light leading-relaxed text-[#725D75] dark:text-[#C8B5C3] max-w-xl"
            >
              A collection of celebrations, details and beautiful spaces created by TheDecorParty.
            </motion.p>
          </div>

          {/* ========================================================================= */}
          {/* 2. CATEGORY FILTERS (Segmented Scrollable Bar)                           */}
          {/* ========================================================================= */}
          <div className="mt-8 sm:mt-12 flex items-center justify-start sm:justify-center overflow-x-auto pb-3 sm:pb-0 scrollbar-none gap-2 px-2 max-w-full">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat);
                  }}
                  className={`relative shrink-0 rounded-full px-4 sm:px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-[#34203C] text-[#FAF8F5] dark:bg-[#C9BEAB] dark:text-[#25172C] shadow-md scale-103'
                      : 'bg-[#34203C]/06 text-[#725D75] hover:bg-[#34203C]/12 hover:text-[#34203C] dark:bg-white/06 dark:text-[#C8B5C3] dark:hover:bg-white/12 dark:hover:text-white'
                  }`}
                >
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. PINTEREST RESPONSIVE MASONRY GRID                                      */}
        {/* ========================================================================= */}
        <section className="w-full max-w-[1720px] mx-auto px-3 sm:px-6 md:px-8 lg:px-12 pb-20 sm:pb-28">
          <motion.div
            layout
            className="columns-2 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-3.5 sm:gap-4 space-y-3.5 sm:space-y-4"
          >
            <AnimatePresence>
              {filteredImages.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  className="break-inside-avoid group relative cursor-pointer overflow-hidden rounded-2xl sm:rounded-3xl border border-[#DDD5C7]/70 dark:border-[#483250]/70 bg-[#FAF8F5] dark:bg-[#25172C] shadow-sm hover:shadow-xl transition-all duration-300"
                  onClick={() => openLightbox(index)}
                >
                  {/* Image with natural aspect ratio */}
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-auto object-cover object-center transition-transform duration-700 ease-out group-hover:scale-103"
                  />

                  {/* Soft Elegant Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3 sm:p-4">
                    {/* Top Right Action Icon */}
                    <div className="self-end flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20">
                      <Maximize2 size={13} />
                    </div>

                    {/* Bottom Label & Category */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#C9BEAB]">
                          {item.tag}
                        </span>
                        <p className="text-xs sm:text-sm font-serif font-semibold text-white leading-tight line-clamp-1">
                          {item.title}
                        </p>
                      </div>
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FAF8F5] text-[#34203C]">
                        <ArrowUpRight size={12} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </section>

        {/* ========================================================================= */}
        {/* 4. FULL-SCREEN LIGHTBOX MODAL                                             */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {lightboxIndex !== null && filteredImages[lightboxIndex] && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/92 backdrop-blur-2xl p-4 sm:p-6"
              onClick={closeLightbox}
            >
              {/* Top Controls Bar */}
              <div
                className="absolute top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-6 flex items-center justify-between z-10 pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Counter & Category */}
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-white/10 backdrop-blur-md border border-white/15 px-3 py-1 text-xs font-semibold text-white">
                    {lightboxIndex + 1} / {filteredImages.length}
                  </span>
                  <span className="rounded-full bg-[#C9BEAB]/25 border border-[#C9BEAB]/40 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#C9BEAB]">
                    {filteredImages[lightboxIndex].category}
                  </span>
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  aria-label="Close Lightbox"
                  onClick={closeLightbox}
                  className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Previous Button */}
              <button
                type="button"
                aria-label="Previous Image"
                onClick={(e) => {
                  e.stopPropagation();
                  showPrev();
                }}
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 flex h-11 w-11 sm:h-13 sm:w-13 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all cursor-pointer hover:scale-105 active:scale-95 z-10"
              >
                <ChevronLeft size={24} />
              </button>

              {/* Main Image Container */}
              <motion.div
                key={filteredImages[lightboxIndex].id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="relative max-h-[85vh] max-w-[90vw] overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col items-center"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={filteredImages[lightboxIndex].image}
                  alt={filteredImages[lightboxIndex].title}
                  className="max-h-[78vh] max-w-[88vw] w-auto h-auto object-contain rounded-2xl sm:rounded-3xl"
                />

                {/* Bottom Caption Pill */}
                <div className="mt-3 flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-md border border-white/15 px-4 py-1.5 text-xs text-white">
                  <span className="font-serif font-medium">{filteredImages[lightboxIndex].title}</span>
                  <span className="text-[#C9BEAB]">• {filteredImages[lightboxIndex].tag}</span>
                </div>
              </motion.div>

              {/* Next Button */}
              <button
                type="button"
                aria-label="Next Image"
                onClick={(e) => {
                  e.stopPropagation();
                  showNext();
                }}
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 flex h-11 w-11 sm:h-13 sm:w-13 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all cursor-pointer hover:scale-105 active:scale-95 z-10"
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
