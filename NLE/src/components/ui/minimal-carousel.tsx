import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreHorizontal, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* --- Types --- */
export interface CarouselCard {
  id: string;
  title: string;
  value: string;
  color: string;
  icon: React.ElementType;
  description?: string;
}

export interface MinimalCarouselProps {
  cards: CarouselCard[];
  onGuaranteeClick?: (card: CarouselCard) => void;
  onLearnMoreClick?: (card: CarouselCard) => void;
  onCopyClick?: (card: CarouselCard) => void;
  onCustomizeClick?: (card: CarouselCard) => void;
  className?: string;
}

export const MinimalCarousel: React.FC<MinimalCarouselProps> = ({
  cards,
  onGuaranteeClick,
  onLearnMoreClick,
  onCopyClick,
  onCustomizeClick,
  className = '',
}) => {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeCard = cards.find((c) => c.id === activeId);
  const secondaryCards = cards.filter((c) => c.id !== activeId);

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) setActiveId(null);
  };

  return (
    <div className={`w-full flex items-center justify-center bg-transparent select-none font-sans ${className}`}>
      <div
        className="w-full flex flex-col items-center justify-center px-2 sm:px-4"
        onClick={handleBackgroundClick}
      >
        {/* Centered Stage Container */}
        <div className="w-full max-w-2xl">
          <motion.div layout className="flex flex-col gap-4">

            {/* ========================================================================= */}
            {/* 1. EXPANDED ACTIVE CARD                                                   */}
            {/* ========================================================================= */}
            <AnimatePresence mode="popLayout">
              {activeCard && (
                <motion.div
                  key={activeCard.id}
                  layoutId={activeCard.id}
                  className={`relative flex w-full flex-col justify-between
                             rounded-[28px] sm:rounded-[32px] border p-6 sm:p-8 text-[#FFF3E6] shadow-2xl
                             ${activeCard.color}
                             min-h-[220px] sm:min-h-[240px]`}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                >
                  {/* Top Row: Icon & View Guarantee Pill */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-[#381932]/20 border border-[#381932]/30 text-[#381932] shrink-0">
                      <activeCard.icon size={30} className="sm:w-8 sm:h-8 text-[#381932]" />
                    </div>

                    <motion.button
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onGuaranteeClick) {
                          onGuaranteeClick(activeCard);
                        } else if (onCopyClick) {
                          onCopyClick(activeCard);
                        } else {
                          navigate('/explore');
                        }
                      }}
                      className="flex items-center gap-1.5 rounded-full bg-[#381932]/20 text-[#381932] border border-[#381932]/40
                                 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-bold uppercase tracking-wider backdrop-blur-md 
                                 hover:bg-[#381932]/30 hover:border-[#381932]/60 transition-all cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 size={14} className="text-[#381932]" />
                      <span>View Guarantee</span>
                    </motion.button>
                  </div>

                  {/* Bottom Row: Title, Sub-value, & Learn More Button */}
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-6">
                    <div className="overflow-hidden mr-2">
                      <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#381932] leading-tight truncate">
                        {activeCard.title}
                      </h3>
                      <p className="text-sm sm:text-base font-semibold text-[#381932] tracking-wide mt-1">
                        {activeCard.value}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onLearnMoreClick) {
                          onLearnMoreClick(activeCard);
                        } else if (onCustomizeClick) {
                          onCustomizeClick(activeCard);
                        } else {
                          navigate('/explore');
                        }
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#381932] text-[#381932] hover:opacity-90
                                 px-5 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-bold uppercase tracking-wider backdrop-blur-md 
                                 shadow-md hover:scale-103 active:scale-95 transition-all shrink-0 cursor-pointer"
                    >
                      <span>Learn More →</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ========================================================================= */}
            {/* 2. GRID LAYOUT (grid-cols-2 md:grid-cols-3 or 3-column strip)             */}
            {/* ========================================================================= */}
            <motion.div
              layout
              className={`grid gap-3 sm:gap-4 transition-all duration-500 ${
                activeId ? 'grid-cols-3' : 'grid-cols-2 md:grid-cols-3'
              }`}
            >
              {(activeId ? secondaryCards : cards).map((card) => (
                <motion.div
                  key={card.id}
                  layoutId={card.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveId(card.id);
                  }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  className={`group relative flex flex-col justify-between cursor-pointer
                             rounded-2xl sm:rounded-3xl border p-4 sm:p-5 text-[#FFF3E6] shadow-lg
                             ${card.color}
                             hover:scale-102 hover:border-[#381932]/50 transition-all duration-300
                             ${activeId ? 'h-28 sm:h-32' : 'h-36 sm:h-40'}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="text-[#381932] group-hover:scale-110 transition-transform">
                      <card.icon size={activeId ? 22 : 28} className="shrink-0 text-[#381932]" />
                    </div>
                    <div className="rounded-full border border-[#381932]/20 bg-[#FFF3E6]/10 p-1 sm:p-1.5 group-hover:bg-[#381932]/30 transition-colors">
                      <MoreHorizontal size={15} className="text-[#FFF3E6]" />
                    </div>
                  </div>

                  <div className="mt-2 overflow-hidden">
                    <h4
                      className={`font-serif ${
                        activeId ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'
                      } font-bold text-[#381932] truncate leading-tight group-hover:text-[#FFF3E6] transition-colors`}
                    >
                      {card.title}
                    </h4>
                    <p
                      className={`${
                        activeId ? 'text-[11px] sm:text-xs' : 'text-xs sm:text-sm'
                      } font-medium text-[#381932] truncate mt-0.5`}
                    >
                      {card.value}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MinimalCarousel;
