import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowUpRight, Heart, Sparkles } from 'lucide-react';
import { cn } from '../../utils/utils';

export interface AutoLayoutCardProps {
  id?: string;
  name: string;
  image?: string;
  icon?: string;
  tag?: string;
  subtitle?: string;
  price?: string;
  setupsCount?: string | number;
  onSelect: () => void;
  className?: string;
}

export const AutoLayoutCard: React.FC<AutoLayoutCardProps> = ({
  name,
  image,
  icon,
  tag = 'FEATURED',
  subtitle = 'Handcrafted Setup',
  price = 'From ₹1,999',
  setupsCount = '18+ Setups',
  onSelect,
  className = '',
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [glarePos, setGlarePos] = useState({ x: 0, y: 0 });

  // 3D Parallax Tilt coordinates normalized from -0.5 to 0.5
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 22, stiffness: 240, mass: 0.5 };
  const mouseXSpring = useSpring(x, springConfig);
  const mouseYSpring = useSpring(y, springConfig);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-8, 8]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / rect.width - 0.5;
    const yPct = mouseY / rect.height - 0.5;

    x.set(xPct);
    y.set(yPct);
    setGlarePos({ x: mouseX, y: mouseY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  const displayImage =
    image ||
    'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&fit=crop&q=80';

  return (
    <div
      style={{ perspective: 1200 }}
      className={cn('w-full h-full select-none cursor-pointer', className)}
      onClick={onSelect}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        whileHover={{ y: -6, scale: 1.01 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className={cn(
          'group relative flex flex-col justify-between overflow-hidden',
          'rounded-[24px] sm:rounded-[26px] bg-[#381932] border border-[#381932]/15 dark:border-[#381932]/25',
          'shadow-[0_12px_32px_rgba(56,25,50,0.3)] hover:shadow-[0_22px_50px_rgba(56,25,50,0.5)] hover:border-[#FFF3E6]/30 dark:hover:border-[#381932]/60',
          'aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/3] min-h-[290px] sm:min-h-[310px] w-full',
          'transition-all duration-500'
        )}
      >
        {/* =================================================================== */}
        {/* 1. FULL-BLEED BACKGROUND IMAGE WITH CLEAR VISIBILITY                */}
        {/* =================================================================== */}
        <div className="absolute inset-0 overflow-hidden" style={{ transform: 'translateZ(0px)' }}>
          {displayImage ? (
            <img
              src={displayImage}
              alt={name}
              loading="lazy"
              className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#381932] to-[#381932] text-6xl text-[#381932]">
              {icon || '🎉'}
            </div>
          )}

          {/* Gentle, non-opaque gradient so the full image remains crystal clear */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(to top, rgba(56,25,50,0.4) 0%, rgba(56,25,50,0.08) 60%, transparent 100%)',
            }}
          />
        </div>

        {/* Dynamic Specular Glare Reflection on Hover */}
        {isHovered && (
          <div
            className="pointer-events-none absolute -inset-px rounded-[inherit] transition-opacity duration-300 z-10 mix-blend-screen"
            style={{
              transform: 'translateZ(10px)',
              background: `radial-gradient(240px circle at ${glarePos.x}px ${glarePos.y}px, rgba(255,243,230,0.22), rgba(56,25,50,0.1), transparent 75%)`,
            }}
          />
        )}

        {/* =================================================================== */}
        {/* 2. TOP ACTION & BADGE BAR (Heart Icon for Saving)                   */}
        {/* =================================================================== */}
        <div
          style={{ transform: 'translateZ(30px)', transformStyle: 'preserve-3d' }}
          className="relative z-20 flex items-center justify-between p-3 sm:p-3.5 pointer-events-none"
        >
          {/* Top Left Badge Pill */}
          {tag && (
            <span className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full bg-[#381932]/60 hover:bg-[#381932]/85 border border-[#381932]/25 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#FFF3E6] backdrop-blur-md shadow-md transition-colors">
              <Sparkles size={10} className="text-[#A78A9F]" />
              <span className="drop-shadow-xs">{tag}</span>
            </span>
          )}

          {/* Top Right Save / Heart Pill (Always uses Heart icon) */}
          <button
            type="button"
            aria-label="Save category"
            onClick={(e) => {
              e.stopPropagation();
              setIsSaved(!isSaved);
            }}
            className="pointer-events-auto flex h-7.5 w-7.5 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-[#381932]/60 hover:bg-[#381932]/85 border border-[#381932]/25 backdrop-blur-md text-[#FFF3E6] transition-all hover:scale-110 active:scale-95 shadow-md ml-auto cursor-pointer"
          >
            <Heart
              size={13}
              className={cn(
                'transition-all duration-200',
                isSaved ? 'fill-[#381932] text-[#381932] scale-110' : 'text-[#FFF3E6]'
              )}
            />
          </button>
        </div>

        {/* =================================================================== */}
        {/* 3. BOTTOM COMPACT FROSTED GLASS DOCK (Clean, Refined Typography)   */}
        {/* =================================================================== */}
        <div
          style={{ transform: 'translateZ(35px)', transformStyle: 'preserve-3d' }}
          className="relative z-20 m-2 sm:m-2.5 p-2.5 sm:p-3 rounded-[15px] sm:rounded-[17px] bg-[#381932]/40 backdrop-blur-md border border-[#381932]/20 dark:border-[#381932]/35 shadow-[0_6px_24px_rgba(56,25,50,0.3)] text-left transition-all duration-300 group-hover:bg-[#381932]/55 group-hover:border-[#FFF3E6]/30"
        >
          {/* Category Title in Clean Serif Typography */}
          <h3 className="font-serif text-[15px] sm:text-base md:text-[17px] font-bold text-[#FFF3E6] drop-shadow-[0_1px_3px_rgba(56,25,50,0.85)] tracking-wide leading-snug group-hover:text-[#381932] transition-colors line-clamp-1 mb-0.5">
            {name}
          </h3>

          {/* Subtitle / Description */}
          <p className="text-[11px] sm:text-xs font-normal text-[#FFF3E6]/85 drop-shadow-[0_1px_2px_rgba(56,25,50,0.85)] line-clamp-1 mb-2 leading-tight">
            {subtitle || `${setupsCount} setups available`}
          </p>

          {/* Bottom Row: Price on Left & "VIEW SETUPS ↗" Button on Right */}
          <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-[#381932]/15">
            <div>
              <span className="text-[9px] font-semibold uppercase tracking-wider text-[#FFF3E6]/80 drop-shadow-xs block leading-none mb-0.5">
                Starting
              </span>
              <span className="font-serif text-xs sm:text-[13px] md:text-sm font-bold text-[#381932] drop-shadow-[0_1px_2px_rgba(56,25,50,0.85)] leading-none">
                {price}
              </span>
            </div>

            {/* Signature "View Setups ↗" Pill Button */}
            <button
              type="button"
              className="shrink-0 inline-flex items-center gap-1 rounded-full bg-[#381932] hover:bg-[#FFF3E6] text-[#381932] font-bold text-[10px] sm:text-[11px] uppercase tracking-wider px-2.5 py-1 sm:px-3 sm:py-1 shadow-sm transition-all duration-300 group-hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>View Setups</span>
              <ArrowUpRight
                size={11}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AutoLayoutCard;
