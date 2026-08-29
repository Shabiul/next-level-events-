import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Plus, MessageCircle, Sparkles } from 'lucide-react';

const SUPPORT_PHONE = '917022058460';

export interface AddonDetailItem {
  _id?: string;
  name: string;
  description?: string;
  price: number;
  priceLabel: string;
  image?: string;
  images?: string[];
  category?: string;
  inclusions?: string[];
  kind: 'addon' | 'activity';
}

export interface AddonDetailModalProps {
  item: AddonDetailItem | null;
  selected: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const DEFAULT_IMG =
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1000&q=80';

export const AddonDetailModal: React.FC<AddonDetailModalProps> = ({
  item,
  selected,
  onToggle,
  onClose,
}) => {
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    setActiveImg(0);
  }, [item?._id, item?.name]);

  useEffect(() => {
    if (!item) return;
    document.body.style.overflow = 'hidden';
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [item, onClose]);

  if (typeof document === 'undefined') return null;

  const gallery = (() => {
    if (!item) return [DEFAULT_IMG];
    const list = [
      ...(item.images || []),
      ...(item.image ? [item.image] : []),
    ].filter((v): v is string => typeof v === 'string' && v.trim().length > 0);
    const unique = Array.from(new Set(list));
    return unique.length > 0 ? unique : [DEFAULT_IMG];
  })();

  const inclusions =
    item?.inclusions && item.inclusions.length > 0
      ? item.inclusions
      : [
          `Complete ${item?.name ?? 'add-on'} setup at your venue`,
          'On-site styling by a trained team member',
          'All required props, materials & serveware',
          'Setup and post-event teardown included',
        ];

  const openWhatsApp = () => {
    if (!item) return;
    const text = `Hi The Decor Party! I'm interested in the "${item.name}" ${item.priceLabel} add-on. Can you share more details?`;
    window.open(
      `https://wa.me/${SUPPORT_PHONE}?text=${encodeURIComponent(text)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return ReactDOM.createPortal(
    <AnimatePresence>
      {item && (
        <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-[#381932]/55 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex min-h-0 max-h-[92vh] sm:max-h-[88vh] w-full sm:max-w-lg flex-col overflow-hidden rounded-t-[24px] sm:rounded-[24px] bg-[#FFF3E6] shadow-2xl"
          >
            {/* Image header -- full width, clean crop, name overlaid */}
            <div className="relative shrink-0 h-56 sm:h-64 w-full overflow-hidden bg-[#A78A9F]/15">
              <img
                src={gallery[activeImg]}
                alt={item.name}
                className="h-full w-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#381932]/90 via-[#381932]/25 to-transparent pointer-events-none" />

              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#FFF3E6]/90 hover:bg-[#FFF3E6] text-[#381932] shadow-md transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="absolute inset-x-0 bottom-0 p-5">
                {item.category && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF3E6]/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#381932] mb-2">
                    <Sparkles size={11} className="text-[#A78A9F]" />
                    {item.category}
                  </span>
                )}
                <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#FFF3E6] leading-tight">
                  {item.name}
                </h2>
              </div>
            </div>

            {/* Body -- clean Milk surface */}
            <div className="flex-1 min-h-0 overflow-y-auto bg-[#FFF3E6] px-6 sm:px-7 py-5">
              {gallery.length > 1 && (
                <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-4">
                  {gallery.map((src, i) => (
                    <button
                      key={src + i}
                      type="button"
                      onClick={() => setActiveImg(i)}
                      className={`h-12 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                        i === activeImg
                          ? 'border-[#381932]'
                          : 'border-[#E6D7C5] opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={src} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-baseline justify-between gap-3 mb-3">
                <span className="font-serif text-2xl sm:text-[28px] font-bold text-[#381932]">
                  {item.priceLabel}
                </span>
              </div>

              {item.description && (
                <p className="text-sm text-[#381932]/80 font-light leading-relaxed mb-5">
                  {item.description}
                </p>
              )}

              <div className="h-px w-full bg-[#E6D7C5] mb-4" />

              <div className="flex items-center gap-2 text-[#381932] font-bold text-sm mb-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#A78A9F]/20 text-[#381932] shrink-0">
                  <Check size={14} />
                </span>
                What&apos;s Included
              </div>
              <ul className="flex flex-col gap-2">
                {inclusions.map((line, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-[13px] text-[#381932]/85 leading-relaxed"
                  >
                    <Check size={14} className="text-[#A78A9F] shrink-0 mt-0.5" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA footer -- clean Milk bar */}
            <div className="shrink-0 border-t border-[#E6D7C5] bg-[#FFF3E6] px-4 sm:px-7 py-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:pb-4">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={openWhatsApp}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#381932] text-[#381932] hover:bg-[#A78A9F]/18 py-3 text-xs font-semibold tracking-wide transition-colors cursor-pointer"
                >
                  <MessageCircle size={13} />
                  Enquire on WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onToggle();
                    onClose();
                  }}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg py-3 text-xs font-semibold tracking-wide shadow-sm transition-colors cursor-pointer ${
                    selected
                      ? 'bg-[#A78A9F] text-[#FFF3E6] hover:bg-[#8C6E84]'
                      : 'bg-[#381932] text-[#FFF3E6] hover:bg-[#483250]'
                  }`}
                >
                  {selected ? (
                    <>
                      <Check size={13} /> Remove from Setup
                    </>
                  ) : (
                    <>
                      <Plus size={13} /> Add to Setup
                    </>
                  )}
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

export default AddonDetailModal;
