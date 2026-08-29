import { type CSSProperties } from 'react';
import { motion, type Transition } from 'framer-motion';

export interface BorderTrailProps {
  className?: string;
  size?: number;
  transition?: Transition;
  style?: CSSProperties;
}

export function BorderTrail({
  className = '',
  size = 100,
  transition = {
    repeat: Infinity,
    duration: 5,
    ease: 'linear',
  },
  style,
}: BorderTrailProps) {
  return (
    <div className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden">
      <motion.div
        className={`absolute rounded-full bg-[#FFF3E6] ${className}`}
        style={{
          width: size,
          height: size,
          offsetPath: 'rect(0 auto auto 0 round inherit)',
          boxShadow:
            '0px 0px 60px 30px rgba(255,243,230,0.5), 0 0 100px 60px rgba(56,25,50,0.5), 0 0 140px 90px rgba(56,25,50,0.5)',
          ...style,
        }}
        animate={{
          offsetDistance: ['0%', '100%'],
        }}
        transition={transition}
      />
    </div>
  );
}

export interface BorderTrailCard1Props {
  className?: string;
  trailSize?: number;
  duration?: number;
}

export function BorderTrailCard1({
  className = '',
  trailSize = 100,
  duration = 5,
}: BorderTrailCard1Props) {
  return (
    <div
      className={`relative flex h-[200px] w-[300px] flex-col items-center justify-center rounded-md bg-[#FFF3E6] px-5 py-2 dark:bg-[#381932] ${className}`}
    >
      {/* Continuous Animated Border Trail */}
      <BorderTrail
        size={trailSize}
        transition={{
          repeat: Infinity,
          duration: duration,
          ease: 'linear',
        }}
      />

      {/* Inner Content: Accessible Skeleton Loading Lines */}
      <div
        role="status"
        aria-label="Loading..."
        className="relative z-10 flex w-full flex-col items-start justify-center space-y-2 animate-pulse"
      >
        {/* Line 1: h-1 w-4 rounded-[4px] bg-[#381932] */}
        <div className="h-1 w-4 rounded-[4px] bg-[#381932]" />

        {/* Line 2: h-1 w-10 rounded-[4px] bg-[#381932] */}
        <div className="h-1 w-10 rounded-[4px] bg-[#381932]" />

        {/* Line 3: h-1 w-12 rounded-[4px] bg-[#381932] */}
        <div className="h-1 w-12 rounded-[4px] bg-[#381932]" />

        {/* Line 4: h-1 w-12 rounded-[4px] bg-[#381932] */}
        <div className="h-1 w-12 rounded-[4px] bg-[#381932]" />

        {/* Line 5: h-1 w-12 rounded-[4px] bg-[#381932] */}
        <div className="h-1 w-12 rounded-[4px] bg-[#381932]" />

        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}

export default BorderTrailCard1;
