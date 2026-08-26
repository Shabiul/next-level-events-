import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Crown, Sparkles, Wand2 } from 'lucide-react';
import { cn } from '../../utils/utils';
import { CATEGORY_META, type EventPackage } from './eventPackages.data';

const BADGE_META = {
  'Most Popular': {
    icon: Sparkles,
    className: 'bg-[#725D75] text-white border-[#725D75]/60',
  },
  Luxury: {
    icon: Crown,
    className: 'bg-gradient-to-r from-[#C9BEAB] to-[#A69882] text-white border-[#C9BEAB]/60',
  },
  Custom: {
    icon: Wand2,
    className: 'bg-[#725D75] text-white border-[#2F2930]/60',
  },
} as const;

export interface EventPackageCardProps {
  pkg: EventPackage;
  index?: number;
  onView: (pkg: EventPackage) => void;
  onBook: (pkg: EventPackage) => void;
  className?: string;
}

export const EventPackageCard: React.FC<EventPackageCardProps> = ({
  pkg,
  index = 0,
  onView,
  onBook,
  className,
}) => {
  const badgeMeta = pkg.badge ? BADGE_META[pkg.badge] : null;
  const BadgeIcon = badgeMeta?.icon;
  const shownCategories = pkg.categories.slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.07 }}
      className={cn(
        'group relative flex h-full flex-col rounded-[28px] border bg-white p-6 sm:p-7 shadow-[0_2px_16px_-4px_rgba(52,32,60,0.08)] transition-all duration-400 hover:-translate-y-1.5 hover:shadow-[0_20px_45px_-12px_rgba(143,111,196,0.28)] cursor-pointer',
        pkg.badge ? 'border-[#C9BEAB]' : 'border-[#E4DCD2]',
        className
      )}
      onClick={() => onView(pkg)}
    >
      {/* Decorative header band */}
      <div className="relative -mx-6 -mt-6 sm:-mx-7 sm:-mt-7 mb-5 h-24 rounded-t-xl overflow-hidden bg-[#F3EFE7] border-b border-[#E4DCD2]">
        <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-[#725D75]/20 blur-2xl" />
        <div className="absolute -bottom-8 -left-4 h-20 w-20 rounded-full bg-[#C9BEAB]/15 blur-2xl" />
        <Sparkles size={16} className="absolute bottom-3 left-6 text-[#725D75]/40" />
        <Sparkles size={11} className="absolute top-4 right-16 text-[#C9BEAB]/50" />

        {badgeMeta && BadgeIcon && (
          <span
            className={cn(
              'absolute top-3 right-3 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider shadow-md',
              badgeMeta.className
            )}
          >
            <BadgeIcon size={11} />
            {pkg.badge}
          </span>
        )}
      </div>

      {/* Name + price */}
      <h3 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#2F2930] leading-snug mb-1.5">
        {pkg.name}
      </h3>
      <div className="flex items-baseline gap-1.5 mb-3">
        <span className="font-serif text-2xl sm:text-[28px] font-bold text-[#725D75] tracking-tight">
          {pkg.price}
        </span>
        <span className="text-[11px] text-[#746B72] font-medium">/ package</span>
      </div>

      {/* Description */}
      <p className="text-xs text-[#746B72] font-light leading-relaxed line-clamp-2 mb-4">
        {pkg.description}
      </p>

      {/* Category chips */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        {shownCategories.map((cat) => {
          const meta = CATEGORY_META[cat.key];
          const Icon = meta.icon;
          return (
            <span
              key={cat.key}
              className="inline-flex items-center gap-1 rounded-full bg-[#F9F6F2] border border-[#E4DCD2] px-2.5 py-1 text-[10px] font-semibold text-[#746B72]"
            >
              <Icon size={11} className="text-[#725D75] shrink-0" />
              {cat.labelOverride || meta.label}
            </span>
          );
        })}
        {pkg.categories.length > 4 && (
          <span className="inline-flex items-center rounded-full bg-[#F9F6F2] border border-[#E4DCD2] px-2.5 py-1 text-[10px] font-semibold text-[#725D75]">
            +{pkg.categories.length - 4} more
          </span>
        )}
      </div>

      {/* CTAs */}
      <div className="mt-auto flex items-center gap-2.5 pt-4 border-t border-[#E4DCD2]/70">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onView(pkg);
          }}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full border border-[#725D75]/40 text-[#725D75] hover:bg-[#725D75]/08 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
        >
          View Package
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onBook(pkg);
          }}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-[#725D75] hover:bg-[#A78A9F] text-white py-2.5 text-[11px] font-bold uppercase tracking-wider shadow-sm transition-colors cursor-pointer"
        >
          Book Now
          <ArrowRight size={12} />
        </button>
      </div>
    </motion.div>
  );
};

export default EventPackageCard;
