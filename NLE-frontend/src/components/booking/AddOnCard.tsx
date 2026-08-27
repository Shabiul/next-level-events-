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
          ? 'border-[#725D75] bg-[#725D75]/05 dark:border-amber-400'
          : 'border-[#E4DCD2] bg-white hover:border-[#A78A9F] dark:bg-[#1E1E1E] dark:border-[#2E2E2E]',
        className
      )}
      onClick={onToggle}
    >
      {badge && (
        <span className="absolute -top-2 right-3 rounded-full bg-[#725D75] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-xs">
          {badge}
        </span>
      )}

      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-200',
            selected ? 'bg-[#725D75] text-white' : 'bg-[#F3EFE7] text-[#725D75] dark:bg-[#2A2A2A]'
          )}
        >
          <Icon size={20} strokeWidth={1.75} />
        </span>
        <span className="text-sm font-bold text-[#725D75] dark:text-[#C9BEAB] whitespace-nowrap">
          {priceLabel ?? `+₹${price.toLocaleString('en-IN')}`}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="line-clamp-1 font-serif text-sm font-semibold text-[#2F2930] dark:text-white">
          {title}
        </h4>
        {description && (
          <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-[#746B72] dark:text-[#C8B5C3]">
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
            ? 'bg-[#725D75] text-white hover:bg-[#A78A9F]'
            : 'border border-[#E4DCD2] bg-[#F9F6F2] text-[#2F2930] hover:border-[#725D75] hover:text-[#725D75] dark:bg-[#262626] dark:border-[#483250] dark:text-white'
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
