import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/utils';

export interface GradientBoldCardProps {
  children: React.ReactNode;
  className?: string;
  popular?: boolean;
  glowColors?: {
    gold?: string;
    rose?: string;
    violet?: string;
  };
}

export const GradientBoldCard: React.FC<GradientBoldCardProps> = ({
  children,
  className,
  popular = false,
  glowColors = {
    gold: '#381932',
    rose: '#381932',
    violet: '#381932',
  },
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
      className={cn(
        'group relative flex flex-col justify-between rounded-[28px] p-[1px] transition-all duration-500 hover:-translate-y-2 select-none',
        popular
          ? 'shadow-[0_20px_50px_-10px_rgba(56,25,50,0.45),0_0_25px_rgba(56,25,50,0.25)]'
          : 'shadow-[0_16px_36px_-6px_rgba(56,25,50,0.4)] hover:shadow-[0_24px_50px_-8px_rgba(56,25,50,0.22)]',
        className
      )}
    >
      {/* 1. Animated Gradient Border Beam (Perimeter Stroke) */}
      <div className="pointer-events-none absolute inset-0 rounded-[28px] overflow-hidden">
        {/* Continuous rotating conic gradient border using champagne gold & lilac */}
        <motion.div
          className="absolute -inset-[100%] opacity-40 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `conic-gradient(from 0deg, transparent 0deg, transparent 270deg, ${glowColors.violet} 310deg, ${glowColors.rose} 340deg, ${glowColors.gold} 360deg)`,
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
        <div className="absolute inset-0 rounded-[28px] border border-[#381932]/20 group-hover:border-[#381932]/40 transition-colors" />
      </div>

      {/* 2. Main Card Body Container */}
      <div className="relative z-10 flex h-full w-full flex-col justify-between rounded-[27px] bg-gradient-to-b from-[#381932] via-[#381932] to-[#381932] p-5 sm:p-6 overflow-hidden backdrop-blur-xl text-[#FFF3E6]">
        
        {/* 3. Ambient Inner Glows (Dynamic Radial Blur Blobs) */}
        {/* Top-Right Champagne Gold Ambient Blob */}
        <div
          className="pointer-events-none absolute -top-12 -right-12 h-52 w-52 rounded-full opacity-20 blur-[55px] transition-all duration-700 group-hover:scale-130 group-hover:opacity-45"
          style={{
            background: `radial-gradient(circle, ${glowColors.gold} 0%, rgba(56,25,50,0) 70%)`,
          }}
        />

        {/* Bottom-Left Radiant Lilac Ambient Blob */}
        <div
          className="pointer-events-none absolute -bottom-16 -left-16 h-60 w-60 rounded-full opacity-25 blur-[65px] transition-all duration-700 group-hover:scale-130 group-hover:opacity-50"
          style={{
            background: `radial-gradient(circle, ${glowColors.rose} 0%, ${glowColors.violet} 50%, rgba(56,25,50,0) 75%)`,
          }}
        />

        {/* Interactive Mouse-Tracking Radial Light Follower */}
        {isHovered && (
          <div
            className="pointer-events-none absolute -inset-px opacity-30 transition-opacity duration-300 mix-blend-screen"
            style={{
              background: `radial-gradient(280px circle at ${mousePos.x}px ${mousePos.y}px, rgba(56,25,50,0.22), rgba(56,25,50,0.12), transparent 70%)`,
            }}
          />
        )}

        {/* Card Content */}
        <div className="relative z-20 flex flex-col justify-between h-full">
          {children}
        </div>
      </div>
    </div>
  );
};

export default GradientBoldCard;
