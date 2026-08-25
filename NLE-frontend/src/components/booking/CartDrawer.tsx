import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, X, Minus, Plus, Trash2, ArrowRight, CalendarCheck } from 'lucide-react';
import type { CartItem } from '../../types';
import { Button } from '../ui/Button';
import { resolveProductCardImage } from '../../utils/imageUtils';

interface CartDrawerProps {
  items: CartItem[];
  total: number;
  onRemove: (id: string) => void;
  onUpdateQty: (id: string, qty: number) => void;
  onClear: () => void;
  onClose: () => void;
  isLoggedIn: boolean;
  onLoginClick: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  items, total, onRemove, onUpdateQty, onClear, onClose, isLoggedIn, onLoginClick,
}) => {
  const navigate = useNavigate();

  const handleBookNowItem = (item: CartItem) => {
    const selectedAddOns = item.bookingDetails?.[0]?.addOns || [];
    navigate(`/booking/${item._id}`, {
      state: { product: item, preferredMethod: 'razorpay', selectedAddOns },
    });
  };

  const handleBookNowAll = () => {
    if (items.length === 0) return;
    const primaryItem = items[0];
    const allAddons = items.flatMap(i => (i.bookingDetails || []).flatMap(b => b.addOns || []));
    navigate(`/booking/${primaryItem._id}`, {
      state: { product: primaryItem, preferredMethod: 'razorpay', selectedAddOns: allAddons },
    });
  };

  const handleCheckout = () => {
    if (!isLoggedIn) { onLoginClick(); return; }

    const D = '----------------------';
    const lines = items.flatMap(i => {
      if (i.bookingDetails.length === 0) {
        return [
          D,
          `*Package:* ${i.name} (x${i.qty})`,
          `*Price:* ₹${(i.price * i.qty).toLocaleString('en-IN')}`,
        ].join('\n');
      }
      return i.bookingDetails.map((b, idx) => {
        const label = i.bookingDetails.length > 1 ? ` — Booking ${idx + 1}` : '';
        const addOnLines = b.addOns.length > 0
          ? ['*Selected Add-ons / Activities:*', ...b.addOns.map(addon => `  - ${addon.name} (+₹${addon.price.toLocaleString('en-IN')})`)]
          : [];
        const parts = [
          D,
          `*Package${label}:* ${i.name}`,
          `*Price:* ₹${i.price.toLocaleString('en-IN')}`,
          ...addOnLines,
          `*Event Date:* ${b.eventDate} at ${b.eventTime}`,
          `*Venue:* ${b.location}`,
          `*Contact:* +91 ${b.mobile}`,
        ];
        if (b.requests) parts.push(`*Special Requests:* ${b.requests}`);
        return parts.join('\n');
      });
    }).join('\n\n');

    const msg = [
      '*New Booking Request — TheDecorParty*',
      '',
      lines,
      '',
      D,
      `*Order Total:* ₹${total.toLocaleString('en-IN')}`,
      D,
      '',
      'Kindly confirm availability and share payment details. Thank you!',
    ].join('\n');

    window.open(`https://wa.me/917022058460?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[500] bg-black/40 backdrop-blur-xs transition-opacity animate-fade-in" onClick={onClose}>
      <div
        className="fixed inset-y-0 right-0 flex w-full max-w-md flex-col bg-white dark:bg-[#1E1E1E] border-l border-[#E8E7E3] dark:border-[#2E2E2E] shadow-2xl animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#E8E7E3] px-5 py-4 dark:border-[#2E2E2E]">
          <div className="flex items-center gap-2 text-base font-bold text-[#1C1C1C] dark:text-white">
            <ShoppingCart size={18} />
            <span>Your Cart</span>
            {items.length > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#8F6FC4] px-1.5 text-[10px] font-bold text-white dark:bg-[#C9BEAB] dark:text-[#1B101F]">
                {items.reduce((s, i) => s + i.qty, 0)}
              </span>
            )}
          </div>
          <button className="rounded-full p-1.5 text-[#6F6F6B] hover:bg-[#F4F3F0] dark:hover:bg-[#262626] cursor-pointer" onClick={onClose} aria-label="Close cart">
            <X size={18} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
            <ShoppingCart size={40} strokeWidth={1.5} className="mb-1 text-[#6F6F6B]" />
            <h3 className="text-base font-semibold text-[#1C1C1C] dark:text-white">Your cart is empty</h3>
            <p className="text-xs text-[#6F6F6B] dark:text-[#A0A09C]">Discover and book event decorations.</p>
            <Button
              variant="primary"
              size="sm"
              className="mt-4"
              onClick={onClose}
            >
              Browse Events
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="flex flex-col gap-3">
                {items.map(item => (
                  <div className="flex gap-3 rounded-2xl border border-[#E8E7E3] p-3.5 dark:border-[#2E2E2E] bg-[#FAFAF8] dark:bg-[#181818] shadow-2xs hover:border-[#E4DEF2] transition-all" key={item._id}>
                    <img src={resolveProductCardImage(item)} alt={item.name} className="h-18 w-18 flex-shrink-0 rounded-xl object-cover bg-white" />
                    <div className="min-w-0 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="truncate text-xs font-bold text-[#1C1C1C] dark:text-white">{item.name}</div>
                        <div className="text-[11px] text-[#6F6F6B] dark:text-[#A0A09C]">{item.categoryName}</div>
                        <div className="mt-1 text-xs font-extrabold text-[#1C1B22] dark:text-[#C9BEAB]">₹{item.price.toLocaleString('en-IN')}</div>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleBookNowItem(item)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#1C1B22] dark:text-[#C9BEAB] hover:underline cursor-pointer"
                        >
                          <span>Book Now</span>
                          <ArrowRight size={11} />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <button className="text-[#6F6F6B] hover:text-rose-500 cursor-pointer transition-colors p-2 -m-1" onClick={() => onRemove(item._id)} aria-label="Remove item">
                        <Trash2 size={15} />
                      </button>
                      <div className="flex items-center gap-1 rounded-md border border-[#E8E7E3] bg-white dark:bg-[#262626] dark:border-[#333] px-0.5 py-0.5 shadow-2xs">
                        <button
                          className="flex h-8 w-8 items-center justify-center text-[#1C1C1C] dark:text-white cursor-pointer"
                          onClick={() => item.qty === 1 ? onRemove(item._id) : onUpdateQty(item._id, item.qty - 1)}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="w-3 text-center text-xs font-bold">{item.qty}</span>
                        <button
                          className="flex h-8 w-8 items-center justify-center text-[#1C1C1C] dark:text-white cursor-pointer"
                          onClick={() => onUpdateQty(item._id, item.qty + 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-[#E8E7E3] dark:border-[#2E2E2E] p-5 bg-white/95 dark:bg-[#1E1E1E]/95 backdrop-blur-md">
              <div className="mb-4 flex items-center justify-between text-base font-bold text-[#1C1C1C] dark:text-white">
                <span>Total Amount</span>
                <span className="font-serif text-lg font-bold text-[#1C1B22] dark:text-[#C9BEAB]">₹{total.toLocaleString('en-IN')}</span>
              </div>
              
              <div className="flex flex-col gap-2.5">
                {/* 1. Primary Direct Online Book Now Button */}
                <button
                  type="button"
                  onClick={handleBookNowAll}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#8F6FC4] hover:bg-[#483250] text-[#FAF8F5] dark:bg-[#C9BEAB] dark:hover:bg-white dark:text-[#1B101F] py-3 px-4 text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <CalendarCheck size={16} />
                  <span>Book Now (Proceed to Checkout)</span>
                  <ArrowRight size={14} />
                </button>

                {/* 2. Secondary WhatsApp Checkout Button */}
                <button
                  type="button"
                  onClick={handleCheckout}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-emerald-600/60 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100/70 text-emerald-700 dark:text-emerald-300 py-2.5 px-4 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  <span>Confirm via WhatsApp</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              <button
                type="button"
                className="mt-3 w-full py-1 text-xs font-medium text-[#6F6F6B] hover:text-rose-500 transition-colors cursor-pointer text-center"
                onClick={onClear}
              >
                Clear Cart
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
