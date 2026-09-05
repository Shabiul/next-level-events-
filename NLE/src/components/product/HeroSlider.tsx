import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHeroSlider } from '../../hooks/useHeroSlider';
import { cn } from '../../utils/utils';

export const HeroSlider: React.FC = () => {
  const { index, go, next, prev, slides } = useHeroSlider();
  const touchX = useRef(0);
  const [animKey, setAnimKey] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => { next(); setAnimKey(k => k + 1); };
  const handlePrev = () => { prev(); setAnimKey(k => k + 1); };
  const handleGo = (i: number) => { go(i); setAnimKey(k => k + 1); };

  return (
    <div className="relative w-full">
      {/* Hero Container with 92vh viewport scale */}
      <div
        className="relative w-full overflow-hidden bg-[#381932] min-h-[90vh] lg:min-h-[94vh] flex items-center justify-center"
        onTouchStart={e => { touchX.current = e.touches[0].clientX; }}
        onTouchEnd={e => {
          const dx = touchX.current - e.changedTouches[0].clientX;
          if (Math.abs(dx) > 40) {
            if (dx > 0) handleNext(); else handlePrev();
          }
        }}
      >
        {/* Slides Track */}
        <div
          className="flex h-full w-full transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((slide, i) => (
            <div
              key={i}
              className="relative flex min-w-full h-full min-h-[90vh] lg:min-h-[94vh] items-center justify-center overflow-hidden text-center pt-24 pb-36 sm:pt-28 sm:pb-40 lg:pt-32 lg:pb-48 px-4 sm:px-8"
            >
              {/* Background Video Media */}
              <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 h-full w-full object-cover object-center pointer-events-none scale-102 transition-transform duration-1000"
              >
                <source src="/landing page.mp4" type="video/mp4" />
              </video>

              {/* Luxury Vignette & Soft Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#381932] via-[#381932]/55 to-[#381932]/30 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#381932]/70 via-transparent to-[#381932]/65 pointer-events-none" />
              <div className="absolute inset-0 bg-radial from-transparent via-[#381932]/20 to-[#381932]/60 pointer-events-none" />

              {/* Centered Content Container */}
              <div
                key={animKey}
                className="relative z-10 max-w-7xl mx-auto flex flex-col items-center text-center gap-4 sm:gap-5 px-4 mt-4"
              >
                {/* Eyebrow */}
                <div
                  className="inline-flex items-center gap-2 rounded-full border border-[#381932]/30 bg-[#381932]/35 px-4 py-1.5 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.24em] text-[#FFF3E6] backdrop-blur-md"
                  style={{ animation: 'fadeIn 0.35s ease both' }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#381932] animate-pulse" />
                  <span>{slide.chip || 'CELEBRATIONS, BEAUTIFULLY CURATED'}</span>
                </div>

                {/* H1 Primary Page Headline: Editorial Playfair Display with Great Vibes Accent */}
                <h1
                  className="font-serif text-balance text-4xl sm:text-6xl md:text-7xl lg:text-[76px] xl:text-[84px] leading-[1.04] tracking-tight text-[#FFF3E6] font-normal max-w-7xl mx-auto"
                  style={{
                    textShadow: '0 4px 30px rgba(56,25,50,0.85)',
                    animation: 'fadeInUp 0.4s ease 0.05s both',
                  }}
                >
                  {i === 0 ? (
                    <>
                      Celebrations,<br className="hidden sm:inline" />
                      Thoughtfully{' '}
                      <span className="font-heading text-[#381932] lowercase text-[1.05em] font-medium tracking-normal italic ml-1">
                        Designed.
                      </span>
                    </>
                  ) : (
                    slide.headline
                  )}
                </h1>

                {/* Supporting Subtitle */}
                <p
                  className="max-w-2xl text-balance text-xs sm:text-sm md:text-base leading-relaxed text-[#FFF3E6]/95 font-light"
                  style={{
                    textShadow: '0 2px 12px rgba(56,25,50,0.6)',
                    animation: 'fadeInUp 0.4s ease 0.12s both',
                  }}
                >
                  {slide.sub || 'From dreamy décor to memorable experiences — we create celebrations that feel personal, beautiful, and effortlessly unforgettable.'}
                </p>

                {/* Dual CTAs */}
                <div
                  className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-2 sm:mt-3"
                  style={{ animation: 'fadeInUp 0.4s ease 0.18s both' }}
                >
                  <button
                    type="button"
                    onClick={() => navigate('/explore')}
                    className="inline-flex items-center gap-2 rounded-full bg-[#381932] text-[#381932] hover:opacity-90 px-7 py-3.5 text-xs font-bold uppercase tracking-wider shadow-lg hover:shadow-xl hover:scale-104 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>Plan Your Celebration</span>
                    <ArrowRight size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('signature-collections');
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        navigate('/explore');
                      }
                    }}
                    className="group inline-flex items-center gap-1.5 rounded-full border border-[#381932]/30 bg-[#FFF3E6]/[0.08] hover:bg-[#FFF3E6]/[0.18] hover:border-[#FFF3E6]/50 px-6 py-3.5 text-xs font-medium uppercase tracking-wider text-[#FFF3E6] transition-all backdrop-blur-sm cursor-pointer"
                  >
                    <span>Explore Our Work</span>
                    <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Left Navigation Arrow */}
        <button
          type="button"
          aria-label="Previous slide"
          onClick={handlePrev}
          className="absolute left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#381932]/60 text-[#FFF3E6] backdrop-blur-xs border border-[#381932]/30 transition-all hover:opacity-90 hover:scale-105 active:scale-90 cursor-pointer sm:left-6 sm:h-11 sm:w-11"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Right Navigation Arrow */}
        <button
          type="button"
          aria-label="Next slide"
          onClick={handleNext}
          className="absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#381932]/60 text-[#FFF3E6] backdrop-blur-xs border border-[#381932]/30 transition-all hover:opacity-90 hover:scale-105 active:scale-90 cursor-pointer sm:right-6 sm:h-11 sm:w-11"
        >
          <ChevronRight size={20} />
        </button>

        {/* Pagination Indicators */}
        <div className="absolute bottom-28 sm:bottom-32 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => handleGo(i)}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300 cursor-pointer',
                i === index
                  ? 'w-6 bg-[#381932]'
                  : 'w-1.5 bg-[#FFF3E6]/50 hover:bg-[#FFF3E6]/80'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
