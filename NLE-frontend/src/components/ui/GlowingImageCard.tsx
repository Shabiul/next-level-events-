import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '../../utils/utils';

export interface GlowingImageCardProps {
  id?: string;
  image: string;
  imageAlt?: string;
  tag?: string;
  title: string;
  description: string;
  popularSetup?: string;
  specs?: string[];
  price: string;
  pricePrefix?: string;
  buttonText?: string;
  onSelect?: () => void;
  className?: string;
}

export const GlowingImageCard: React.FC<GlowingImageCardProps> = ({
  image,
  imageAlt = 'Celebration Package',
  tag,
  title,
  description,
  popularSetup,
  specs,
  price,
  pricePrefix = 'Starting At',
  buttonText = 'Explore',
  onSelect,
  className,
}) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      onClick={onSelect}
      className={cn(
        'group relative flex flex-col justify-between rounded-[28px] p-[1px] transition-all duration-500 hover:-translate-y-2 cursor-pointer select-none',
        'shadow-[0_16px_36px_rgba(0,0,0,0.4)] hover:shadow-[0_24px_55px_rgba(0,0,0,0.6)]',
        className
      )}
    >
      {/* 1. Animated Rotating Conic Gradient Border Beam (Identical to Package Section) */}
      <div className="pointer-events-none absolute inset-0 rounded-[28px] overflow-hidden">
        <motion.div
          className="absolute -inset-[100%] opacity-45 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, #483250 310deg, #A78A9F 340deg, #C9BEAB 360deg)',
          }}
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            repeat: Infinity,
            duration: 8,
            ease: 'linear',
          }}
        />
        {/* Subtle static border layer */}
        <div className="absolute inset-0 rounded-[28px] border border-[#A78A9F]/20 group-hover:border-[#C9BEAB]/40 transition-colors" />
      </div>

      {/* 2. Main Card Body Container */}
      <div className="relative z-10 flex h-full w-full flex-col justify-between rounded-[27px] bg-[#2B1630] p-4 sm:p-5 overflow-hidden text-[#FAF8F5]">
        {/* Ambient Radial Glow Blobs */}
        <div
          className="pointer-events-none absolute -top-10 -right-10 h-44 w-44 rounded-full opacity-20 blur-[45px] transition-all duration-700 group-hover:scale-135 group-hover:opacity-45"
          style={{
            background: 'radial-gradient(circle, #A78A9F 0%, rgba(167,138,159,0) 70%)',
          }}
        />
        <div
          className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full opacity-20 blur-[50px] transition-all duration-700 group-hover:scale-135 group-hover:opacity-40"
          style={{
            background: 'radial-gradient(circle, #725D75 0%, #483250 50%, rgba(52,32,60,0) 75%)',
          }}
        />

        {/* Interactive Mouse Tracking Spotlight */}
        {isHovered && (
          <div
            className="pointer-events-none absolute -inset-px opacity-30 transition-opacity duration-300 mix-blend-screen rounded-[inherit]"
            style={{
              background: `radial-gradient(240px circle at ${mousePos.x}px ${mousePos.y}px, rgba(201,190,171,0.22), rgba(167,138,159,0.12), transparent 70%)`,
            }}
          />
        )}

        {/* 3. Larger Image Frame Container (Aspect 4:3 for prominent, grand visual size) */}
        <div className="relative w-full aspect-[4/3] rounded-[20px] overflow-hidden bg-[#1E0F23] border border-white/10 shadow-inner shrink-0">
          <img
            src={image}
            alt={imageAlt || title}
            loading="lazy"
            className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108"
          />

          {/* Subtle vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />

          {/* Top-Left Category Tag Badge */}
          {tag && (
            <div className="absolute top-2.5 left-2.5 z-20">
              <span className="inline-flex items-center gap-1 rounded-full bg-black/50 border border-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#C9BEAB] backdrop-blur-md shadow-md">
                <Sparkles size={10} className="text-[#C9BEAB]" />
                <span>{tag}</span>
              </span>
            </div>
          )}
        </div>

        {/* 4. Content Area */}
        <div className="relative z-10 flex flex-col flex-1 justify-between text-left mt-4">
          <div>
            {/* Micro-specs / Metadata Chips Row */}
            {specs && specs.length > 0 ? (
              <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                {specs.map((spec, specIdx) => (
                  <span
                    key={specIdx}
                    className="inline-flex items-center gap-1 rounded-full bg-white/06 border border-white/12 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-medium text-[#FAF8F5]/90 backdrop-blur-xs"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            ) : popularSetup ? (
              <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/06 border border-white/12 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-medium text-[#C9BEAB] backdrop-blur-xs">
                  ✨ {popularSetup}
                </span>
              </div>
            ) : null}

            {/* Package Title in Serif Typography */}
            <h3 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-white group-hover:text-[#C9BEAB] transition-colors leading-snug mb-1.5 line-clamp-1">
              {title}
            </h3>

            {/* Description */}
            <p className="text-xs sm:text-[13px] font-light leading-relaxed text-[#DDD5C7]/80 line-clamp-3 mb-4">
              {description}
            </p>
          </div>

          {/* 5. Bottom Action Footer Row */}
          <div className="pt-3.5 border-t border-white/10 mt-auto flex items-center justify-between">
            <div>
              <span className="text-[9px] font-semibold uppercase tracking-wider text-[#A78A9F] block leading-none mb-1">
                {pricePrefix}
              </span>
              <span className="font-serif text-sm sm:text-base font-bold text-[#C9BEAB] leading-none">
                {price}
              </span>
            </div>

            {/* Action Link with Animated Arrow */}
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#C9BEAB] group-hover:text-[#FAF8F5] transition-colors cursor-pointer"
            >
              <span>{buttonText}</span>
              <ArrowRight
                size={13}
                className="transition-transform duration-300 group-hover:translate-x-1 text-[#C9BEAB] group-hover:text-[#FAF8F5]"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlowingImageCard;
