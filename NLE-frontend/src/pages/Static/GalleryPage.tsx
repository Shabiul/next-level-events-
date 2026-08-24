import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  Sparkles,
  ArrowUpRight,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from 'lucide-react';
import { cn } from '../../utils/utils';
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

// Curated base collection using all suitable images from the project's asset repository
export const BASE_GALLERY_COLLECTION: GalleryImageItem[] = [
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

interface InteractiveGalleryCardProps {
  item: GalleryImageItem;
  onClick: () => void;
}

const InteractiveGalleryCard: React.FC<InteractiveGalleryCardProps> = ({ item, onClick }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // 3D Parallax Tilt motion values with smooth spring physics
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const tiltSpringConfig = { damping: 30, stiffness: 180, mass: 0.6 };
  const mouseXSpring = useSpring(x, tiltSpringConfig);
  const mouseYSpring = useSpring(y, tiltSpringConfig);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-6, 6]);

  // Smooth magnet cursor spring follower coordinates
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const cursorSpringConfig = { damping: 28, stiffness: 220 };
  const badgeX = useSpring(cursorX, cursorSpringConfig);
  const badgeY = useSpring(cursorY, cursorSpringConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const posX = e.clientX - rect.left;
    const posY = e.clientY - rect.top;

    const xPct = posX / rect.width - 0.5;
    const yPct = posY / rect.height - 0.5;

    x.set(xPct);
    y.set(yPct);
    cursorX.set(posX);
    cursorY.set(posY);
    setMousePos({ x: posX, y: posY });
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const posX = e.clientX - rect.left;
      const posY = e.clientY - rect.top;
      cursorX.set(posX);
      cursorY.set(posY);
      setMousePos({ x: posX, y: posY });
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <div style={{ perspective: 1200 }} className="break-inside-avoid w-full mb-3.5 sm:mb-4 select-none">
      <motion.div
        ref={cardRef}
        layout
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        whileHover={{ y: -5, scale: 1.015 }}
        transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        className={cn(
          'group relative cursor-pointer overflow-hidden rounded-2xl sm:rounded-3xl',
          'border border-[#DDD5C7]/70 dark:border-[#483250]/70 bg-[#FAF8F5] dark:bg-[#25172C]',
          'shadow-sm hover:shadow-2xl hover:border-[#C9BEAB] dark:hover:border-[#A78A9F]',
          'transition-all duration-500 ease-out p-[1px]'
        )}
      >
        {/* 1. Animated Conic Gradient Border Beam */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl sm:rounded-3xl overflow-hidden">
          <motion.div
            className="absolute -inset-[100%] opacity-0 group-hover:opacity-75 transition-opacity duration-700"
            style={{
              background:
                'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, #483250 310deg, #A78A9F 340deg, #C9BEAB 360deg)',
            }}
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              repeat: Infinity,
              duration: 9,
              ease: 'linear',
            }}
          />
        </div>

        {/* 2. Main Card Content Inner Body */}
        <div className="relative z-10 w-full h-full rounded-[inherit] overflow-hidden bg-[#FAF8F5] dark:bg-[#201325]">
          {/* Natural aspect ratio image with smooth zoom */}
          <img
            src={item.image}
            alt={item.title}
            loading="lazy"
            className="w-full h-auto object-cover object-center transition-transform duration-700 ease-out group-hover:scale-104"
          />

          {/* 3. Follow-Cursor Radial Spotlight Glare Effect */}
          <div
            className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-screen"
            style={{
              background: `radial-gradient(320px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.28), rgba(201,190,171,0.15), transparent 70%)`,
            }}
          />

          {/* 4. Smooth Spring Follower Magnet Cursor Badge */}
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-none absolute z-30 hidden sm:flex items-center gap-1.5 rounded-full bg-[#34203C]/90 text-[#FAF8F5] dark:bg-[#FAF8F5]/92 dark:text-[#34203C] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider shadow-2xl backdrop-blur-md border border-white/20"
              style={{
                x: badgeX,
                y: badgeY,
                translateX: '-50%',
                translateY: '-50%',
              }}
            >
              <Maximize2 size={12} />
              <span>View</span>
            </motion.div>
          )}

          {/* 5. Soft Elegant Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-between p-3.5 sm:p-4">
            {/* Top Right Action Icon (Mobile fallback) */}
            <div className="self-end sm:hidden flex h-7 w-7 items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20">
              <Maximize2 size={13} />
            </div>

            <div />

            {/* Bottom Label, Tag & Arrow */}
            <div className="flex items-end justify-between gap-2 pt-6">
              <div className="flex flex-col gap-0.5">
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#C9BEAB]">
                  <Sparkles size={11} className="text-[#C9BEAB]" />
                  <span>{item.tag}</span>
                </span>
                <p className="text-xs sm:text-sm font-serif font-semibold text-white leading-tight line-clamp-2">
                  {item.title}
                </p>
                {item.price && (
                  <span className="text-[11px] font-semibold text-[#DDD5C7]/90">
                    {item.price}
                  </span>
                )}
              </div>
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-[#FAF8F5] text-[#34203C] shadow-md group-hover:scale-110 group-hover:bg-[#C9BEAB] transition-all duration-300">
                <ArrowUpRight size={14} />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const GalleryPage: React.FC = () => {
  const { products } = useProducts();
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>('ALL');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Combine Base Collection, Package Catalog and Products Data dynamically
  const allImages = useMemo(() => {
    const list: GalleryImageItem[] = [...BASE_GALLERY_COLLECTION];
    const seenUrls = new Set(list.map((item) => item.image));

    // 1. Static Package Collections from Data
    const staticPackageSets = [
      { items: BIRTHDAY, cat: 'BIRTHDAYS' as GalleryCategory, defaultTag: 'Birthday Package' },
      { items: ANNIVERSARY, cat: 'ANNIVERSARIES' as GalleryCategory, defaultTag: 'Anniversary Package' },
      { items: DINNERS, cat: 'ANNIVERSARIES' as GalleryCategory, defaultTag: 'Candlelight Dinner' },
      { items: MOST_BOOKED, cat: 'CUSTOM THEMES' as GalleryCategory, defaultTag: 'Most Booked' },
    ];

    staticPackageSets.forEach(({ items, cat, defaultTag }) => {
      items.forEach((p, idx) => {
        if (p.img && !seenUrls.has(p.img)) {
          seenUrls.add(p.img);
          list.push({
            id: `static-pkg-${cat}-${idx}`,
            title: p.title,
            category: mapCategoryToFilter(cat, p.title),
            image: p.img,
            tag: p.badge || defaultTag,
            price: p.price,
          });
        }
      });
    });

    // 2. Hero and Category icon packages
    HERO_SLIDES.forEach((slide, idx) => {
      if (slide.img && !seenUrls.has(slide.img)) {
        seenUrls.add(slide.img);
        list.push({
          id: `hero-slide-${idx}`,
          title: slide.headline.replace('\n', ' '),
          category: mapCategoryToFilter(slide.chip, slide.headline),
          image: slide.img,
          tag: slide.chip,
        });
      }
    });

    CAT_ICONS.forEach((icon, idx) => {
      if (icon.img && !seenUrls.has(icon.img)) {
        seenUrls.add(icon.img);
        list.push({
          id: `cat-icon-${idx}`,
          title: icon.label.replace('\n', ' '),
          category: mapCategoryToFilter(icon.label, icon.label),
          image: icon.img,
          tag: 'Curated Category',
        });
      }
    });

    // 3. Live Dynamic Products / Packages from Backend API & Database
    if (Array.isArray(products) && products.length > 0) {
      products.forEach((p) => {
        const cat = mapCategoryToFilter(p.categoryName, p.name);

        // Main package image
        if (p.image && !seenUrls.has(p.image)) {
          seenUrls.add(p.image);
          list.push({
            id: `pkg-${p._id}-main`,
            title: p.name,
            category: cat,
            image: p.image,
            tag: p.badge || p.subcategory || p.categoryName || 'Celebration Package',
            price: p.price ? `₹${p.price.toLocaleString('en-IN')}` : undefined,
          });
        }

        // Additional package gallery photos
        if (Array.isArray(p.moreImages)) {
          p.moreImages.forEach((imgUrl, idx) => {
            if (imgUrl && !seenUrls.has(imgUrl)) {
              seenUrls.add(imgUrl);
              list.push({
                id: `pkg-${p._id}-more-${idx}`,
                title: `${p.name} — Detail View ${idx + 2}`,
                category: cat,
                image: imgUrl,
                tag: p.badge || p.categoryName || 'Gallery Showcase',
                price: p.price ? `₹${p.price.toLocaleString('en-IN')}` : undefined,
              });
            }
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
        title="Celebration Gallery — TheDecorParty | Real Events & Package Inspirations"
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
              const count =
                cat === 'ALL'
                  ? allImages.length
                  : allImages.filter((item) => item.category === cat).length;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat);
                  }}
                  className={`relative shrink-0 rounded-full px-4 sm:px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#34203C] text-[#FAF8F5] dark:bg-[#C9BEAB] dark:text-[#25172C] shadow-md scale-103'
                      : 'bg-[#34203C]/06 text-[#725D75] hover:bg-[#34203C]/12 hover:text-[#34203C] dark:bg-white/06 dark:text-[#C8B5C3] dark:hover:bg-white/12 dark:hover:text-white'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black'
                        : 'bg-[#34203C]/10 dark:bg-white/10 text-[#725D75] dark:text-[#DDD5C7]'
                    }`}
                  >
                    {count}
                  </span>
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
                <InteractiveGalleryCard
                  key={item.id}
                  item={item}
                  onClick={() => openLightbox(index)}
                />
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
                  {filteredImages[lightboxIndex].price && (
                    <span className="text-white font-bold ml-1">
                      ({filteredImages[lightboxIndex].price})
                    </span>
                  )}
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
