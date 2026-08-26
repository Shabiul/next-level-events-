import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ArrowRight, MessageCircle, Wand2, Crown, Sparkles } from 'lucide-react';
import { CATEGORY_META, type EventPackage } from './eventPackages.data';

const SUPPORT_PHONE = '917022058460';

const BADGE_META = {
  'Most Popular': { icon: Sparkles, className: 'bg-[#725D75] text-white' },
  Luxury: { icon: Crown, className: 'bg-gradient-to-r from-[#C9BEAB] to-[#A69882] text-white' },
  Custom: { icon: Wand2, className: 'bg-[#725D75] text-white' },
} as const;

export interface EventPackageDetailModalProps {
  pkg: EventPackage | null;
  onClose: () => void;
  onBook: (pkg: EventPackage) => void;
}

export const EventPackageDetailModal: React.FC<EventPackageDetailModalProps> = ({
  pkg,
  onClose,
  onBook,
}) => {
  useEffect(() => {
    if (!pkg) return;
    document.body.style.overflow = 'hidden';
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [pkg, onClose]);

  if (typeof document === 'undefined') return null;

  const openWhatsApp = (intent: 'customise' | 'enquire') => {
    if (!pkg) return;
    const text =
      intent === 'customise'
        ? `Hi TheDecorParty! I'd like to customise the "${pkg.name}" (${pkg.price}). Can we discuss options?`
        : `Hi TheDecorParty! I'm interested in the "${pkg.name}" (${pkg.price}). Can you share more details?`;
    window.open(`https://wa.me/${SUPPORT_PHONE}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  const badgeMeta = pkg?.badge ? BADGE_META[pkg.badge] : null;
  const BadgeIcon = badgeMeta?.icon;

  return ReactDOM.createPortal(
    <AnimatePresence>
      {pkg && (
        <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex max-h-[92vh] sm:max-h-[85vh] w-full sm:max-w-2xl flex-col overflow-hidden rounded-t-[32px] sm:rounded-[32px] bg-[#F9F6F2] shadow-2xl"
          >
            {/* Header */}
            <div className="relative shrink-0 bg-[#F3EFE7] border-b border-[#E4DCD2] px-6 sm:px-8 pt-6 pb-6 sm:pt-8 sm:pb-7">
              <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-[#725D75]/15 blur-3xl pointer-events-none" />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 hover:bg-white text-[#2F2930] shadow-sm transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>

              {badgeMeta && BadgeIcon && (
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider shadow-md mb-3 ${badgeMeta.className}`}>
                  <BadgeIcon size={11} />
                  {pkg.badge}
                </span>
              )}

              <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#2F2930] pr-10 mb-1.5">
                {pkg.name}
              </h2>
              <p className="text-xs sm:text-sm text-[#746B72] font-light leading-relaxed max-w-lg mb-3">
                {pkg.description}
              </p>
              <span className="font-serif text-3xl font-bold text-[#725D75]">{pkg.price}</span>
            </div>

            {/* Scrollable body: category breakdown */}
            <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-6">
              {pkg.categories.map((cat) => {
                const meta = CATEGORY_META[cat.key];
                const Icon = meta.icon;
                return (
                  <div key={cat.key} className="rounded-2xl border border-[#E4DCD2] bg-white p-4 sm:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 text-[#2F2930] font-bold text-sm">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F9F6F2] text-[#725D75] shrink-0">
                          <Icon size={15} />
                        </span>
                        {cat.labelOverride || meta.label}
                      </div>
                      <div className="flex items-center gap-2">
                        {cat.note && (
                          <span className="rounded-full bg-[#F9F6F2] text-[#725D75] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                            {cat.note}
                          </span>
                        )}
                        {cat.price && (
                          <span className="font-serif text-sm font-bold text-[#2F2930]">{cat.price}</span>
                        )}
                      </div>
                    </div>
                    {cat.items.length > 0 && (
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                        {cat.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-[#746B72] leading-relaxed">
                            <Check size={13} className="text-[#725D75] shrink-0 mt-0.5" />
                            <span>{item.label}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Sticky CTA footer */}
            <div className="shrink-0 border-t border-[#E4DCD2] bg-white/95 backdrop-blur-md px-4 sm:px-8 py-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:pb-4">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={() => openWhatsApp('customise')}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#A78A9F] text-[#725D75] hover:bg-[#725D75]/08 py-3 text-xs font-medium tracking-wide transition-colors cursor-pointer"
                >
                  <Wand2 size={13} />
                  Customise Package
                </button>
                <button
                  type="button"
                  onClick={() => openWhatsApp('enquire')}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-600/40 bg-emerald-50/60 text-emerald-700 hover:bg-emerald-100/70 py-3 text-xs font-medium tracking-wide transition-colors cursor-pointer"
                >
                  <MessageCircle size={13} />
                  Enquire Now
                </button>
                <button
                  type="button"
                  onClick={() => onBook(pkg)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#725D75] hover:bg-[#A78A9F] text-white py-3 text-xs font-medium tracking-wide shadow-sm transition-colors cursor-pointer"
                >
                  Book Now
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default EventPackageDetailModal;
