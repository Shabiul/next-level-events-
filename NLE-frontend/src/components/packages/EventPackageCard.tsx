import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Crown, Sparkles, Wand2, Heart } from 'lucide-react';
import { cn } from '../../utils/utils';
import { CardImage } from '../ui/CardImage';
import { CATEGORY_META, PACKAGE_IMAGES, type EventPackage } from './eventPackages.data';

const BADGE_META = {
  'Most Popular': { icon: Sparkles, label: 'Popular', className: 'bg-[#381932] text-[#FFF3E6]' },
  Luxury: { icon: Crown, label: 'Luxury', className: 'bg-[#A78A9F] text-[#FFF3E6]' },
  Custom: { icon: Wand2, label: 'Custom', className: 'bg-[#381932] text-[#FFF3E6]' },
} as const;

export interface EventPackageCardProps {
  pkg: EventPackage;
  index?: number;
  onView: (pkg: EventPackage) => void;
  onBook: (pkg: EventPackage) => void;
  wished?: boolean;
  onToggleWishlist?: (pkg: EventPackage) => void;
  className?: string;
}

export const EventPackageCard: React.FC<EventPackageCardProps> = ({
  pkg,
  index = 0,
  onView,
  onBook,
  wished = false,
  onToggleWishlist,
  className,
}) => {
  const badgeMeta = pkg.badge ? BADGE_META[pkg.badge] : null;
  const BadgeIcon = badgeMeta?.icon;
  const shownCategories = pkg.categories.slice(0, 4);
  const extra = pkg.categories.length - shownCategories.length;
  const image = PACKAGE_IMAGES[pkg.id];

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.06 }}
      onClick={() => onView(pkg)}
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-[22px] border border-[#E6D7C5] bg-[#FFF3E6] shadow-[0_10px_30px_-20px_rgba(56,25,50,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_rgba(56,25,50,0.4)] cursor-pointer',
        className
      )}
    >
      {/* Event image -- full image, never cropped */}
      <div className="relative">
        <CardImage src={image} alt={pkg.name} ratio="aspect-[4/3]" />

        {badgeMeta && BadgeIcon && (
          <span
            className={cn(
              'absolute top-3 left-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm font-serif',
              badgeMeta.className
            )}
          >
            <BadgeIcon size={10} />
            {badgeMeta.label}
          </span>
        )}

        {onToggleWishlist && (
          <button
            type="button"
            aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(pkg);
            }}
            className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF3E6] text-[#381932] shadow-md transition-transform duration-200 hover:scale-110 active:scale-95 cursor-pointer"
          >
            <Heart size={14} fill={wished ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <h3 className="font-serif text-lg sm:text-xl font-bold uppercase tracking-tight text-[#381932] leading-[1.15] mb-2">
          {pkg.name}
        </h3>

        <div className="flex items-baseline gap-1.5 mb-3">
          <span className="font-serif text-2xl sm:text-[26px] font-bold text-[#381932] tracking-tight">
            {pkg.price}
          </span>
          <span className="text-[11px] text-[#381932]/60 font-medium">per package</span>
        </div>

        <p className="text-[13px] text-[#381932]/75 leading-relaxed line-clamp-2 mb-5">
          {pkg.description}
        </p>

        {/* Feature inclusions -- clean 2-column list */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 mb-5">
          {shownCategories.map((cat) => {
            const meta = CATEGORY_META[cat.key];
            return (
              <span key={cat.key} className="flex items-center gap-1.5 text-[11px] text-[#381932]/80">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#A78A9F]/20">
                  <Heart size={9} className="text-[#A78A9F] fill-[#A78A9F]" />
                </span>
                <span className="truncate">{cat.labelOverride || meta.label}</span>
              </span>
            );
          })}
          {extra > 0 && (
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#A78A9F]">
              +{extra} more
            </span>
          )}
        </div>

        <div className="mt-auto flex items-stretch gap-2.5 border-t border-[#E6D7C5] pt-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onView(pkg);
            }}
            className="flex-1 inline-flex items-center justify-center rounded-lg border border-[#381932] bg-[#FFF3E6] text-[#381932] hover:bg-[#A78A9F]/15 py-2.5 text-[11px] font-serif font-semibold uppercase tracking-wide transition-colors cursor-pointer"
          >
            View Details
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onBook(pkg);
            }}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#381932] hover:bg-[#483250] text-[#FFF3E6] py-2.5 text-[11px] font-serif font-semibold uppercase tracking-wide shadow-sm transition-colors cursor-pointer group/btn"
          >
            Book Now
            <ArrowRight size={12} className="transition-transform group-hover/btn:translate-x-0.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default EventPackageCard;
