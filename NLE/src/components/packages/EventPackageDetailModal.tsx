import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ArrowRight, MessageCircle, Wand2, Crown, Sparkles } from 'lucide-react';
import { CATEGORY_META, PACKAGE_IMAGES, type EventPackage } from './eventPackages.data';

const SUPPORT_PHONE = '917022058460';

const BADGE_META = {
  'Most Popular': { icon: Sparkles, label: 'Popular', className: 'bg-[#381932] text-[#FFF3E6]' },
  Luxury: { icon: Crown, label: 'Luxury', className: 'bg-[#A78A9F] text-[#FFF3E6]' },
  Custom: { icon: Wand2, label: 'Custom', className: 'bg-[#381932] text-[#FFF3E6]' },
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
        ? `Hi The Decor Party! I'd like to customise the "${pkg.name}" (${pkg.price}). Can we discuss options?`
        : `Hi The Decor Party! I'm interested in the "${pkg.name}" (${pkg.price}). Can you share more details?`;
    window.open(`https://wa.me/${SUPPORT_PHONE}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  const badgeMeta = pkg?.badge ? BADGE_META[pkg.badge] : null;
  const BadgeIcon = badgeMeta?.icon;
  const image = pkg ? PACKAGE_IMAGES[pkg.id] : undefined;

  return ReactDOM.createPortal(
    <AnimatePresence>
      {pkg && (
        <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-[#381932]/55 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex min-h-0 max-h-[92vh] sm:max-h-[88vh] w-full sm:max-w-3xl flex-col overflow-hidden rounded-t-[26px] sm:rounded-[26px] bg-[#FFF3E6] shadow-2xl lg:flex-row"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute top-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-[#FFF3E6]/90 hover:bg-[#E6D7C5] text-[#381932] shadow-md transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            {/* Left -- image */}
            <div className="relative shrink-0 h-52 lg:h-auto lg:w-[42%] overflow-hidden bg-[#A78A9F]/15">
              {image && (
                <img src={image} alt={pkg.name} className="h-full w-full object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#381932]/45 via-transparent to-transparent pointer-events-none" />
              {badgeMeta && BadgeIcon && (
                <span className={`absolute top-3 left-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-serif font-bold uppercase tracking-wider shadow-sm ${badgeMeta.className}`}>
                  <BadgeIcon size={10} />
                  {badgeMeta.label}
                </span>
              )}
            </div>

            {/* Right -- info */}
            <div className="flex flex-1 min-h-0 flex-col">
              <div className="flex-1 min-h-0 overflow-y-auto px-6 sm:px-8 py-6">
                <span className="text-[10px] font-poppins font-semibold uppercase tracking-[0.16em] text-[#A78A9F]">
                  {pkg.categories.map((c) => c.labelOverride || CATEGORY_META[c.key].label).slice(0, 2).join(' · ')}
                </span>
                <h2 className="font-serif text-2xl sm:text-[28px] font-bold uppercase tracking-tight text-[#381932] leading-[1.12] mt-1 mb-2">
                  {pkg.name}
                </h2>
                <div className="flex items-baseline gap-1.5 mb-3">
                  <span className="font-serif text-3xl font-bold text-[#381932]">{pkg.price}</span>
                  <span className="text-[11px] text-[#381932]/60 font-medium">per package</span>
                </div>
                <p className="text-[13px] font-poppins text-[#381932]/80 leading-relaxed mb-6">
                  {pkg.description}
                </p>

                <div className="space-y-5">
                  {pkg.categories.map((cat) => {
                    const meta = CATEGORY_META[cat.key];
                    const Icon = meta.icon;
                    return (
                      <div key={cat.key}>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="inline-flex items-center gap-2 text-[11px] font-serif font-bold uppercase tracking-wider text-[#381932]">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#A78A9F]/20 text-[#381932]">
                              <Icon size={12} />
                            </span>
                            {cat.labelOverride || meta.label}
                          </span>
                          {cat.price && (
                            <span className="font-serif text-xs font-bold text-[#381932]">{cat.price}</span>
                          )}
                        </div>
                        {cat.items.length > 0 && (
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 pl-8">
                            {cat.items.map((item, i) => (
                              <li key={i} className="flex items-start gap-2 text-[12px] font-poppins text-[#381932]/80 leading-relaxed">
                                <Check size={12} className="text-[#A78A9F] shrink-0 mt-0.5" />
                                <span>{item.label}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="shrink-0 border-t border-[#E6D7C5] bg-[#FFF3E6] px-4 sm:px-8 py-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:pb-4">
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="button"
                    onClick={() => openWhatsApp('customise')}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#381932] text-[#381932] hover:bg-[#A78A9F]/15 py-3 text-[11px] font-serif font-semibold uppercase tracking-wide transition-colors cursor-pointer"
                  >
                    <Wand2 size={12} />
                    Customise
                  </button>
                  <button
                    type="button"
                    onClick={() => openWhatsApp('enquire')}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#A78A9F] bg-[#A78A9F]/12 text-[#381932] hover:bg-[#A78A9F]/20 py-3 text-[11px] font-serif font-semibold uppercase tracking-wide transition-colors cursor-pointer"
                  >
                    <MessageCircle size={12} />
                    Enquire
                  </button>
                  <button
                    type="button"
                    onClick={() => onBook(pkg)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#381932] hover:bg-[#483250] text-[#FFF3E6] py-3 text-[11px] font-serif font-semibold uppercase tracking-wide shadow-sm transition-colors cursor-pointer group/btn"
                  >
                    Book Now
                    <ArrowRight size={12} className="transition-transform group-hover/btn:translate-x-0.5" />
                  </button>
                </div>
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
