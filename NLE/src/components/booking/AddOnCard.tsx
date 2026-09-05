import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Check, Plus, Sparkles } from 'lucide-react';
import { Card } from '../ui/Card';
import { cn } from '../../utils/utils';

export interface AddOnCardProps {
  title: string;
  description?: string;
  price: number;
  /** Override the default "+₹{price}" label, e.g. "From ₹1,500" for
   * variable-price add-ons. The numeric `price` is still what gets added
   * to the booking total when selected. */
  priceLabel?: string;
  /** Small semantic line icon -- falls back to a generic sparkle if omitted. */
  icon?: LucideIcon;
  /** e.g. "POPULAR" -- omit when there's no real signal backing it. */
  badge?: string;
  selected?: boolean;
  onToggle?: () => void;
  className?: string;
}

/**
 * Compact, catalogue-style add-on card for the Event Packages / Booking
 * add-ons step -- premium soft editorial styling (white card, thin border,
 * subtle shadow), NOT a SaaS feature-card. Icon-forward rather than
 * photo-forward, so a large number of add-ons can be scanned quickly.
 */
export const AddOnCard: React.FC<AddOnCardProps> = ({
  title,
  description,
  price,
  priceLabel,
  icon: Icon = Sparkles,
  badge,
  selected = false,
  onToggle,
  className,
}) => {
  return (
    <Card
      className={cn(
        'relative flex flex-col gap-3 rounded-xl border p-4 shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 cursor-pointer dark:hover:shadow-none',
        selected
          ? 'border-[#381932] bg-[#381932]/05 dark:border-[#FFF3E6]'
          : 'border-[#381932]/30 bg-[#FFF3E6] hover:border-[#381932] dark:bg-[#381932] dark:border-[#381932]',
        className
      )}
      onClick={onToggle}
    >
      {badge && (
        <span className="absolute -top-2 right-3 rounded-full bg-[#381932] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#FFF3E6] shadow-xs">
          {badge}
        </span>
      )}

      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-200',
            selected ? 'bg-[#381932] text-[#FFF3E6]' : 'bg-[#FFF3E6] text-[#381932] dark:bg-[#381932]'
          )}
        >
          <Icon size={20} strokeWidth={1.75} />
        </span>
        <span className="text-sm font-bold text-[#381932] dark:text-[#381932] whitespace-nowrap">
          {priceLabel ?? `+₹${price.toLocaleString('en-IN')}`}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="line-clamp-1 font-serif text-sm font-semibold text-[#381932] dark:text-[#FFF3E6]">
          {title}
        </h4>
        {description && (
          <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-[#381932] dark:text-[#FFF3E6]">
            {description}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle?.();
        }}
        className={cn(
          'flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition-colors duration-200 cursor-pointer',
          selected
            ? 'bg-[#381932] text-[#FFF3E6] hover:opacity-90'
            : 'border border-[#381932]/30 bg-[#FFF3E6] text-[#381932] hover:border-[#381932] hover:text-[#381932] dark:bg-[#381932] dark:border-[#381932] dark:text-[#FFF3E6]'
        )}
        aria-pressed={selected}
      >
        {selected ? (
          <>
            <Check size={13} />
            <span>Added</span>
          </>
        ) : (
          <>
            <Plus size={13} />
            <span>Add</span>
          </>
        )}
      </button>
    </Card>
  );
};

export default AddOnCard;
