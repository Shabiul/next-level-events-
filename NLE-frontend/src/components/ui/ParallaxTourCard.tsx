import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Heart } from 'lucide-react';
import { cn } from '../../utils/utils';

export interface ParallaxTourCardProps {
  id?: string;
  image: string;
  imageAlt?: string;
  subtitle?: string;
  title: string;
  price?: string;
  badge?: string;
  initialLiked?: boolean;
  onLikeToggle?: (isLiked: boolean) => void;
  onClick?: () => void;
  className?: string;
  aspectRatio?: 'aspect-[3/4]' | 'aspect-[4/5]' | 'aspect-[1/1]' | 'aspect-[9/16]' | string;
}

export const ParallaxTourCard: React.FC<ParallaxTourCardProps> = ({
  image,
  imageAlt = 'Tour destination',
  subtitle = 'PARIS',
  title = 'Tours France',
  price,
  badge,
  initialLiked = false,
  onLikeToggle,
  onClick,
  className = '',
  aspectRatio = 'aspect-[3/4]',
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [glarePos, setGlarePos] = useState({ x: 0, y: 0 });

  // Mouse coordinates normalized from -0.5 to 0.5
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth spring physics for silky 3D rotation
  const springConfig = { damping: 20, stiffness: 220, mass: 0.5 };
  const mouseXSpring = useSpring(x, springConfig);
  const mouseYSpring = useSpring(y, springConfig);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [14, -14]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-14, 14]);

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

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !isLiked;
    setIsLiked(nextState);
    if (onLikeToggle) {
      onLikeToggle(nextState);
    }
  };

  const formattedSubtitle = subtitle.startsWith('-') ? subtitle : `- ${subtitle.toUpperCase()} -`;

  return (
    <div
      style={{ perspective: 1200 }}
      className={cn('w-full select-none cursor-pointer', className)}
      onClick={onClick}
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
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className={cn(
          'group relative overflow-hidden rounded-[28px] sm:rounded-[32px] bg-[#725D75] border border-[#725D75]/25 text-[#F9F6F2]',
          'shadow-[0_16px_36px_rgba(52,32,60,0.4)] hover:shadow-[0_26px_60px_rgba(167,138,159,0.35)] hover:border-[#725D75]/65',
          'transition-shadow duration-500',
          aspectRatio
        )}
      >
        {/* =================================================================== */}
        {/* 1. BACKGROUND IMAGE WITH BRAND VIOLET GRADIENT BLEND                */}
        {/* =================================================================== */}
        <div className="absolute inset-0 overflow-hidden" style={{ transform: 'translateZ(0px)' }}>
          <img
            src={image}
            alt={imageAlt || title}
            loading="lazy"
            className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
          />

          {/* Vignette Overlay */}
          <div className="absolute inset-0 bg-black/15 pointer-events-none" />

          {/* Gentle, non-opaque gradient so the full image remains clear */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(to top, rgba(30, 15, 35, 0.75) 0%, rgba(0, 0, 0, 0.2) 45%, transparent 100%)',
            }}
          />
        </div>

        {/* =================================================================== */}
        {/* 2. DYNAMIC SPECULAR RADIAL GLARE REFLECTION                         */}
        {/* =================================================================== */}
        {isHovered && (
          <div
            className="pointer-events-none absolute -inset-px rounded-[inherit] transition-opacity duration-300 z-20 mix-blend-screen"
            style={{
              transform: 'translateZ(15px)',
              background: `radial-gradient(280px circle at ${glarePos.x}px ${glarePos.y}px, rgba(167, 138, 159, 0.4), rgba(72, 50, 80, 0.15), transparent 75%)`,
            }}
          />
        )}

        {/* =================================================================== */}
        {/* 3. TOP ACTION BAR (Brand Frosted Heart & Category Badge)           */}
        {/* =================================================================== */}
        <div
          style={{ transform: 'translateZ(40px)', transformStyle: 'preserve-3d' }}
          className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none"
        >
          {badge ? (
            <span className="pointer-events-auto inline-flex items-center rounded-full bg-[#725D75]/80 border border-[#725D75]/40 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#A78A9F] backdrop-blur-md shadow-md">
              {badge}
            </span>
          ) : (
            <div />
          )}

          {/* Frosted Glass Heart Button in Japanese Violet / Radiant Lilac */}
          <motion.button
            type="button"
            aria-label="Save to favorites"
            onClick={handleLike}
            whileTap={{ scale: 0.85 }}
            animate={{ scale: isLiked ? [1, 1.25, 1] : 1 }}
            transition={{ duration: 0.3 }}
            className={cn(
              'pointer-events-auto flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full',
              'bg-[#725D75]/80 hover:bg-[#483250] border border-[#725D75]/40 backdrop-blur-md shadow-lg',
              'text-[#F9F6F2] transition-colors duration-200 cursor-pointer'
            )}
          >
            <Heart
              size={18}
              className={cn(
                'transition-all duration-200',
                isLiked ? 'fill-rose-400 text-rose-400 scale-110' : 'text-[#A78A9F] hover:text-[#F9F6F2]'
              )}
            />
          </motion.button>
        </div>

        {/* =================================================================== */}
        {/* 4. BOTTOM CONTENT (Subtitle in Lilac, Title in Cream/Khaki)         */}
        {/* =================================================================== */}
        <div
          style={{ transform: 'translateZ(35px)', transformStyle: 'preserve-3d' }}
          className="absolute bottom-5 left-5 right-5 z-30 text-left pointer-events-none"
        >
          {/* Subtitle / Category with dashes in Radiant Lilac */}
          {subtitle && (
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-[#A78A9F] drop-shadow-sm mb-1.5 font-sans">
              {formattedSubtitle}
            </p>
          )}

          {/* Main Title */}
          <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#F9F6F2] drop-shadow-md leading-tight group-hover:text-[#A78A9F] transition-colors">
            {title}
          </h3>

          {/* Optional Price Pill in Khaki Shell */}
          {price && (
            <div className="mt-2.5 flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-[#483250]/90 border border-[#725D75]/40 px-3 py-1 text-xs font-bold text-[#A78A9F] backdrop-blur-md">
                {price}
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ParallaxTourCard;
