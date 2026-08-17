import React from 'react';
import { ShoppingCart, X, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import type { CartItem } from '../../types';
import { Button } from '../ui/Button';

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
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#1C1C1C] px-1.5 text-[10px] font-bold text-white dark:bg-white dark:text-black">
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
                  <div className="flex gap-3 rounded-xl border border-[#E8E7E3] p-3 dark:border-[#2E2E2E] bg-[#FAFAF8] dark:bg-[#181818]" key={item._id}>
                    <img src={item.image} alt={item.name} className="h-16 w-16 flex-shrink-0 rounded-lg object-cover bg-white" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-semibold text-[#1C1C1C] dark:text-white">{item.name}</div>
                      <div className="text-[11px] text-[#6F6F6B] dark:text-[#A0A09C]">{item.categoryName}</div>
                      <div className="mt-1 text-xs font-bold text-[#1C1C1C] dark:text-white">₹{item.price.toLocaleString('en-IN')}</div>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <button className="text-[#6F6F6B] hover:text-red-500 cursor-pointer" onClick={() => onRemove(item._id)} aria-label="Remove item">
                        <Trash2 size={15} />
                      </button>
                      <div className="flex items-center gap-1.5 rounded-md border border-[#E8E7E3] bg-white dark:bg-[#262626] dark:border-[#333] px-1 py-0.5">
                        <button
                          className="flex h-5 w-5 items-center justify-center text-[#1C1C1C] dark:text-white cursor-pointer"
                          onClick={() => item.qty === 1 ? onRemove(item._id) : onUpdateQty(item._id, item.qty - 1)}
                        >
                          <Minus size={11} />
                        </button>
                        <span className="w-3 text-center text-xs font-medium">{item.qty}</span>
                        <button
                          className="flex h-5 w-5 items-center justify-center text-[#1C1C1C] dark:text-white cursor-pointer"
                          onClick={() => onUpdateQty(item._id, item.qty + 1)}
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-[#E8E7E3] dark:border-[#2E2E2E] p-5">
              <div className="mb-4 flex items-center justify-between text-base font-bold text-[#1C1C1C] dark:text-white">
                <span>Total Amount</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
              <Button
                variant="primary"
                size="lg"
                className="w-full justify-center rounded-xl"
                onClick={handleCheckout}
              >
                {isLoggedIn ? (
                  <>
                    <span>Confirm via WhatsApp</span>
                    <ArrowRight size={15} />
                  </>
                ) : 'Login to Checkout'}
              </Button>
              <button
                type="button"
                className="mt-2 w-full py-2 text-xs font-medium text-[#6F6F6B] hover:text-red-500 transition-colors cursor-pointer text-center"
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
