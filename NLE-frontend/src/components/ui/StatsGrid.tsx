import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Sparkles, Star, Clock, ShieldCheck } from 'lucide-react';
import { AnimatedNumber } from '@/components/core/animated-number';

export interface MetricItem {
  id: string;
  value: number;
  decimalPlaces?: number;
  suffix: string;
  label: string;
  icon: React.ElementType;
  description?: string;
}

const STATS_DATA: MetricItem[] = [
  {
    id: 'celebrations',
    value: 2450,
    decimalPlaces: 0,
    suffix: '+',
    label: 'Parties Styled in Bengaluru',
    icon: Sparkles,
  },
  {
    id: 'satisfaction',
    value: 4.9,
    decimalPlaces: 1,
    suffix: '★',
    label: 'Verified 5-Star Reviews',
    icon: Star,
  },
  {
    id: 'buffer',
    value: 60,
    decimalPlaces: 0,
    suffix: ' Mins',
    label: 'Guaranteed Setup Buffer',
    icon: Clock,
  },
  {
    id: 'network',
    value: 50,
    decimalPlaces: 0,
    suffix: '+',
    label: 'Background-Verified Artists',
    icon: ShieldCheck,
  },
];

interface StatsGridProps {
  className?: string;
  items?: MetricItem[];
}

export const StatsGrid: React.FC<StatsGridProps> = ({
  className = '',
  items = STATS_DATA,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-50px' });

  return (
    <section
      ref={containerRef}
      className={`relative w-full py-10 sm:py-14 bg-[#381932] text-[#FFF3E6] overflow-hidden border-y border-[#381932]/50 ${className}`}
    >
      {/* Subtle luxury ambient glows matching locked palette */}
      <div className="absolute -top-24 left-1/4 w-80 h-80 rounded-full bg-[#A78A9F]/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 right-1/4 w-80 h-80 rounded-full bg-[#381932]/30 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group relative rounded-2xl bg-[#381932]/80 border border-[#381932]/20 p-6 backdrop-blur-md hover:border-[#381932]/40 hover:bg-[#381932]/40 transition-all duration-300 shadow-xl flex flex-col justify-between"
              >
                {/* Top Row: Icon & Accents */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-[#381932]/50 border border-[#381932]/30 flex items-center justify-center text-[#381932] group-hover:text-[#381932] group-hover:border-[#381932]/40 transition-all duration-300">
                    <IconComponent className="w-5 h-5 fill-[#381932]/15 stroke-[#381932] group-hover:stroke-[#381932] transition-colors" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#381932]/80 bg-[#381932]/40 px-2.5 py-1 rounded-full border border-[#381932]/15">
                    Metric
                  </span>
                </div>

                {/* Counter & Suffix */}
                <div className="flex items-baseline gap-1 my-1">
                  <AnimatedNumber
                    className="inline-flex items-center font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[#381932]"
                    springOptions={{
                      bounce: 0,
                      duration: 2000,
                    }}
                    decimalPlaces={item.decimalPlaces || 0}
                    value={item.value}
                  />
                  <span className="font-serif text-2xl sm:text-3xl font-semibold text-[#381932]">
                    {item.suffix}
                  </span>
                </div>

                {/* Sub-label */}
                <p className="text-xs sm:text-[13px] font-medium text-[#381932] group-hover:text-[#FFF3E6] transition-colors mt-2">
                  {item.label}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsGrid;
