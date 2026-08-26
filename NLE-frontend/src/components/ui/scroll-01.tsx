import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export interface Scroll01Item {
  num?: string;
  categoryTag?: string;
  badge?: string;
  title: string;
  desc?: string;
  description?: string;
  whyUsPoints?: string[];
  metrics?: string[];
  media: string;
  imageBadge?: string;
  ctaText?: string;
  ctaLink?: string;
}

export interface Scroll01Props {
  items: Scroll01Item[];
  className?: string;
}

export const Scroll01: React.FC<Scroll01Props> = ({ items, className = '' }) => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll Progress Tracking for the pinned showcase
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Calculate active index based on scroll position
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (!items.length) return;
    const count = items.length;
    // Map 0 -> 1 into 0 -> count - 1
    const rawIndex = Math.floor(latest * count);
    const clampedIndex = Math.min(count - 1, Math.max(0, rawIndex));
    setActiveIndex(clampedIndex);
  });

  const progressPercentage = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  const activeItem = items[activeIndex] || items[0];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
  };

  const handleSelect = (index: number) => {
    setActiveIndex(index);
  };

  return (
    // Tall scroll container to give generous scroll distance for the 6 steps
    <div
      ref={containerRef}
      className={`relative w-full h-[320vh] overflow-visible ${className}`}
    >
      {/* Sticky Screen Viewport Wrapper */}
      <div className="sticky top-20 sm:top-24 w-full min-h-[calc(100vh-100px)] flex flex-col justify-center py-6 px-4 sm:px-6 lg:px-8 z-10">
        <div className="w-full max-w-7xl mx-auto">
          
          {/* ========================================================================= */}
          {/* 1. SECTION HEADER (From Reference Screenshot)                             */}
          {/* ========================================================================= */}
          <div className="text-center mb-6 sm:mb-8">
            <p className="flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-[0.24em] text-[#746B72] dark:text-[#A78A9F] mb-2">
              <span className="h-px w-8 bg-[#A78A9F]/40 dark:bg-[#A78A9F]/40" />
              The TheDecorParty Standard
              <span className="h-px w-8 bg-[#A78A9F]/40 dark:bg-[#A78A9F]/40" />
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[44px] font-normal uppercase tracking-tight text-[#2F2930] dark:text-[#FAF8F5] leading-tight">
              Why Choose TheDecorParty?
            </h2>
            <p className="text-xs sm:text-sm md:text-[15px] font-light leading-relaxed text-[#746B72] dark:text-[#C8B5C3] mt-2 max-w-xl mx-auto">
              Uncompromising craftsmanship, punctual master stylists, and 100% picture-accurate execution.
            </p>
          </div>

          {/* ========================================================================= */}
          {/* 2. PILL NAVIGATION & PROGRESS BAR                                        */}
          {/* ========================================================================= */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
              {/* Pillar Tabs Row */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                {items.map((item, idx) => {
                  const isActive = activeIndex === idx;
                  return (
                    <button
                      key={item.num || idx}
                      type="button"
                      onClick={() => handleSelect(idx)}
                      className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-xs ${
                        isActive
                          ? 'bg-[#725D75] text-[#2F2930] shadow-md scale-103'
                          : 'bg-[#483250]/70 hover:bg-[#483250] text-[#E4DCD2]/80 hover:text-[#F9F6F2] border border-[#725D75]/20'
                      }`}
                    >
                      <span>{item.categoryTag || item.badge || `0${idx + 1}`}</span>
                    </button>
                  );
                })}
              </div>

              {/* Counter & Arrow Nav Controls */}
              <div className="flex items-center gap-2 ml-auto">
                <span className="px-3 py-1.5 rounded-full bg-[#483250] border border-[#725D75]/25 text-xs font-serif font-bold text-[#F9F6F2]">
                  {`0${activeIndex + 1}`} / {`0${items.length}`}
                </span>
                <div className="flex items-center rounded-full bg-[#483250] border border-[#725D75]/25 p-0.5">
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Previous Standard"
                    className="p-1.5 rounded-full hover:bg-white/10 text-[#F9F6F2] transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Next Standard"
                    className="p-1.5 rounded-full hover:bg-white/10 text-[#F9F6F2] transition-colors cursor-pointer"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Moving Scroll Progress Bar Underneath Tabs */}
            <div className="w-full h-1 rounded-full bg-[#E4DCD2]/40 dark:bg-[#483250] overflow-hidden">
              <motion.div
                style={{ width: progressPercentage }}
                className="h-full bg-gradient-to-r from-[#725D75] via-[#C9BEAB] to-[#725D75] rounded-full"
              />
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. MAIN SHOWCASE CARD (Single Sticky Showcase)                            */}
          {/* ========================================================================= */}
          <div className="rounded-[32px] bg-[#725D75] border border-[#725D75]/30 p-6 sm:p-8 lg:p-10 shadow-2xl text-[#F9F6F2] relative overflow-hidden">
            {/* Ambient Lighting */}
            <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#725D75]/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#C9BEAB]/10 blur-3xl" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
              
              {/* LEFT HALF: Contained Image Frame */}
              <div className="lg:col-span-5 relative w-full aspect-[4/3] sm:aspect-[16/11] lg:aspect-auto lg:h-[400px] rounded-2xl overflow-hidden bg-[#24132B] border border-[#725D75]/20 shadow-xl">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeItem.media}
                    src={activeItem.media}
                    alt={activeItem.title}
                    initial={{ opacity: 0, scale: 1.06 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0 h-full w-full object-cover object-center"
                  />
                </AnimatePresence>

                {/* Subtle vignette gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#725D75]/90 via-transparent to-black/30 pointer-events-none" />

                {/* Bottom Left Badge */}
                <div className="absolute bottom-4 left-4 z-10">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-black/65 border border-white/20 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#A78A9F] backdrop-blur-md shadow-md">
                    <Sparkles size={11} className="text-[#A78A9F]" />
                    <span>{activeItem.imageBadge || activeItem.badge || 'Bengaluru Standard'}</span>
                  </span>
                </div>

                {/* Bottom Right Location Tag */}
                <div className="absolute bottom-4 right-4 z-10">
                  <span className="inline-flex items-center rounded-full bg-black/65 border border-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#F9F6F2] backdrop-blur-md">
                    BENGALURU
                  </span>
                </div>
              </div>

              {/* RIGHT HALF: Content Information Box */}
              <div className="lg:col-span-7 flex flex-col justify-between h-full">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeItem.title}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col"
                  >
                    {/* Top Tag Row */}
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#725D75]">
                        {activeItem.categoryTag || activeItem.badge}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#A78A9F]">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Guaranteed Standard
                      </span>
                    </div>

                    {/* Headline in Khaki Shell */}
                    <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold uppercase text-[#F9F6F2] leading-tight mb-4">
                      {activeItem.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs sm:text-sm md:text-[15px] font-light text-[#E4DCD2]/95 leading-relaxed mb-6">
                      {activeItem.desc || activeItem.description}
                    </p>

                    {/* Inclusions Checklist Box */}
                    {activeItem.whyUsPoints && activeItem.whyUsPoints.length > 0 && (
                      <div className="rounded-2xl bg-[#483250] border border-[#725D75]/25 p-4 sm:p-5 mb-6">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#725D75] mb-3 flex items-center gap-1.5">
                          <Sparkles size={12} className="text-[#A78A9F]" />
                          Why Choose TheDecorParty
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {activeItem.whyUsPoints.map((pt, pIdx) => (
                            <div key={pIdx} className="flex items-start gap-2.5 text-xs font-light text-[#F9F6F2]/90 leading-snug">
                              <CheckCircle2 size={15} className="text-[#A78A9F] shrink-0 mt-0.5" />
                              <span>{pt}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Bottom Row: Metrics & CTA Button */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#725D75]/20">
                      <div className="flex flex-wrap items-center gap-2">
                        {activeItem.metrics?.map((m, mIdx) => (
                          <span
                            key={mIdx}
                            className="inline-flex items-center rounded-full bg-[#483250] border border-[#A78A9F]/40 px-3.5 py-1 text-[11px] font-semibold text-[#A78A9F]"
                          >
                            {m}
                          </span>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate(activeItem.ctaLink || '/explore')}
                        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A78A9F] hover:text-[#F9F6F2] transition-colors cursor-pointer group"
                      >
                        <span>{activeItem.ctaText || 'EXPLORE BIRTHDAY SETUPS →'}</span>
                        <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Scroll01;
