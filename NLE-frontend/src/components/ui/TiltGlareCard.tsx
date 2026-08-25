import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '../../utils/utils';

export interface TiltGlareCardProps {
  step: string;
  title: string;
  desc: string;
  className?: string;
}

export const TiltGlareCard: React.FC<TiltGlareCardProps> = ({
  step,
  title,
  desc,
  className,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Raw mouse coordinates normalized from -0.5 to 0.5
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Pixel coordinates for the radial glare spotlight
  const [glarePos, setGlarePos] = useState({ x: 0, y: 0 });

  // Smooth spring physics for rotation
  const springConfig = { damping: 20, stiffness: 200, mass: 0.5 };
  const mouseXSpring = useSpring(x, springConfig);
  const mouseYSpring = useSpring(y, springConfig);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [12, -12]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-12, 12]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Normalize from -0.5 (left/top) to +0.5 (right/bottom)
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

  return (
    <div
      style={{ perspective: 1000 }}
      className={cn('w-full h-full select-none', className)}
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
        className={cn(
          'group relative flex flex-col justify-between rounded-2xl p-5 sm:py-6 sm:px-5 min-h-[220px] h-full overflow-hidden transition-shadow duration-500 cursor-pointer',
          'bg-[#8F6FC4] border border-[#8F6FC4]/20',
          'shadow-[0_12px_28px_-6px_rgba(52,32,60,0.35)] hover:shadow-[0_20px_45px_-8px_rgba(167,138,159,0.3)] hover:border-[#8F6FC4]/50'
        )}
      >
        {/* 1. Dynamic Radial Glare Spot that follows mouse on hover */}
        {isHovered && (
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300 z-10 mix-blend-screen"
            style={{
              background: `radial-gradient(220px circle at ${glarePos.x}px ${glarePos.y}px, rgba(167, 138, 159, 0.32), rgba(72, 50, 80, 0.15), transparent 75%)`,
            }}
          />
        )}

        {/* Subtle ambient corner gradient */}
        <div
          className="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full opacity-20 blur-[35px]"
          style={{
            background: 'radial-gradient(circle, #8F6FC4 0%, rgba(167,138,159,0) 70%)',
          }}
        />

        {/* 2. Elevated 3D Content (using translateZ for multi-plane depth) */}
        <div
          style={{ transform: 'translateZ(30px)', transformStyle: 'preserve-3d' }}
          className="relative z-20 flex flex-col justify-between h-full"
        >
          {/* Top Step Number Badge */}
          <div className="flex items-center justify-between mb-4">
            <span
              style={{ transform: 'translateZ(35px)' }}
              className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-[#A48ED0]/40 border border-[#8F6FC4]/50 text-[#C7B8E8] font-serif text-sm font-bold shadow-xs backdrop-blur-xs group-hover:bg-[#8F6FC4]/30 group-hover:border-[#C7B8E8]/60 group-hover:text-[#FAF8F5] transition-all duration-300"
            >
              {step}
            </span>

            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8F6FC4]/80">
              Step {step}
            </span>
          </div>

          {/* Title & Description */}
          <div>
            <h3
              style={{ transform: 'translateZ(25px)' }}
              className="font-serif text-base sm:text-lg font-bold uppercase tracking-[0.03em] leading-snug text-[#C7B8E8] mb-2 group-hover:text-[#FAF8F5] transition-colors"
            >
              {title}
            </h3>
            <p
              style={{ transform: 'translateZ(15px)' }}
              className="text-xs sm:text-[13px] font-light leading-relaxed text-[#F2EEFA]/85"
            >
              {desc}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TiltGlareCard;
