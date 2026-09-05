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
  onRemoveAddon?: (productId: string, addonIdOrName: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  items, total, onRemove, onUpdateQty, onClear, onClose, isLoggedIn, onLoginClick, onRemoveAddon,
}) => {
  const navigate = useNavigate();

  // Note: no onClose() after these navigate() calls. The drawer is driven by
  // the route (MainLayout treats path === '/cart' as "drawer open"), so
  // leaving /cart already unmounts it -- calling onClose (which navigates
  // back a step) right after would race the forward navigation and pop it
  // straight back to /cart, making "Book Now" look like it did nothing.
  const handleBookNowItem = (item: CartItem) => {
    const selectedAddOns = item.bookingDetails?.[0]?.addOns || [];
    navigate(`/booking/${item._id}`, {
      state: { product: item, cartItems: [item], preferredMethod: 'razorpay', selectedAddOns },
    });
  };

  const handleBookNowAll = () => {
    if (items.length === 0) return;
    const primaryItem = items[0];
    const allAddons = items.flatMap(i => (i.bookingDetails || []).flatMap(b => b.addOns || []));
    navigate('/checkout', {
      state: {
        product: primaryItem,
        cartItems: items,
        preferredMethod: 'razorpay',
        selectedAddOns: allAddons,
      },
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
      '*New Booking Request — The Decor Party*',
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
    <div className="fixed inset-0 z-[500] bg-[#381932]/40 backdrop-blur-xs transition-opacity animate-fade-in" onClick={onClose}>
      <div
        className="fixed inset-y-0 right-0 flex w-full max-w-md flex-col bg-[#FFF3E6] dark:bg-[#381932] border-l border-[#381932]/30 dark:border-[#381932] shadow-2xl animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#381932]/30 px-5 py-4 dark:border-[#381932]">
          <div className="flex items-center gap-2 text-base font-bold text-[#381932] dark:text-[#FFF3E6]">
            <ShoppingCart size={18} />
            <span>Your Cart</span>
            {items.length > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#381932] px-1.5 text-[10px] font-bold text-[#FFF3E6] dark:bg-[#381932] dark:text-[#381932]">
                {items.reduce((s, i) => s + i.qty, 0)}
              </span>
            )}
          </div>
          <button className="rounded-full p-1.5 text-[#381932] hover:bg-[#FFF3E6] dark:hover:bg-[#381932] cursor-pointer" onClick={onClose} aria-label="Close cart">
            <X size={18} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
            <ShoppingCart size={40} strokeWidth={1.5} className="mb-1 text-[#381932]" />
            <h3 className="text-base font-semibold text-[#381932] dark:text-[#FFF3E6]">Your cart is empty</h3>
            <p className="text-xs text-[#381932] dark:text-[#381932]">Discover and book event decorations.</p>
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
                {items.map(item => {
                  const itemAddons = (item.bookingDetails || []).flatMap(b => b.addOns || []);
                  const itemAddonsTotal = itemAddons.reduce(
                    (sum, a) => sum + (Number(a.price) || 0) * (Number(a.qty) || 1),
                    0
                  );
                  const lineTotal = item.price * item.qty + itemAddonsTotal;

                  return (
                    <div className="flex gap-3 rounded-2xl border border-[#381932]/30 p-3.5 dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] shadow-2xs hover:border-[#FFF3E6] transition-all" key={item._id}>
                      <img src={resolveProductCardImage(item)} alt={item.name} className="h-18 w-18 flex-shrink-0 rounded-xl object-cover bg-[#FFF3E6]" />
                      <div className="min-w-0 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="truncate text-xs font-bold text-[#381932] dark:text-[#FFF3E6]">{item.name}</div>
                          <div className="text-[11px] text-[#381932] dark:text-[#381932]">{item.categoryName}</div>
                          <div className="mt-1 text-xs font-extrabold text-[#381932] dark:text-[#FFF3E6]">
                            ₹{lineTotal.toLocaleString('en-IN')}
                            {itemAddonsTotal > 0 && (
                              <span className="ml-1 text-[10px] font-normal text-[#381932]/70 dark:text-[#FFF3E6]/70">
                                (Base ₹{item.price.toLocaleString('en-IN')} + Add-ons ₹{itemAddonsTotal.toLocaleString('en-IN')})
                              </span>
                            )}
                          </div>

                          {itemAddons.length > 0 && (
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {itemAddons.map(addon => (
                                <span
                                  key={addon.id || addon.name}
                                  className="inline-flex items-center gap-1 rounded bg-[#381932]/10 dark:bg-[#381932]/40 px-1.5 py-0.5 text-[10px] font-semibold text-[#381932] dark:text-[#FFF3E6]"
                                >
                                  <span>{addon.name} (+₹{Number(addon.price || 0).toLocaleString('en-IN')})</span>
                                  {onRemoveAddon && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onRemoveAddon(item._id, addon.id || addon.name);
                                      }}
                                      className="hover:text-red-500 cursor-pointer ml-0.5"
                                      title="Remove add-on"
                                    >
                                      <X size={10} />
                                    </button>
                                  )}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleBookNowItem(item)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#A78A9F] dark:text-[#381932] hover:underline cursor-pointer"
                          >
                            <span>Book Now</span>
                            <ArrowRight size={11} />
                          </button>
                        </div>
                      </div>
                    <div className="flex flex-col items-end justify-between">
                      <button className="text-[#381932] hover:text-[#381932] cursor-pointer transition-colors p-2 -m-1" onClick={() => onRemove(item._id)} aria-label="Remove item">
                        <Trash2 size={15} />
                      </button>
                      <div className="flex items-center gap-1 rounded-md border border-[#381932]/30 bg-[#FFF3E6] dark:bg-[#381932] dark:border-[#381932] px-0.5 py-0.5 shadow-2xs">
                        <button
                          className="flex h-8 w-8 items-center justify-center text-[#381932] dark:text-[#FFF3E6] cursor-pointer"
                          onClick={() => item.qty === 1 ? onRemove(item._id) : onUpdateQty(item._id, item.qty - 1)}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="w-3 text-center text-xs font-bold">{item.qty}</span>
                        <button
                          className="flex h-8 w-8 items-center justify-center text-[#381932] dark:text-[#FFF3E6] cursor-pointer"
                          onClick={() => onUpdateQty(item._id, item.qty + 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
            </div>

            <div className="border-t border-[#381932]/30 dark:border-[#381932] p-5 bg-[#FFF3E6]/95 dark:bg-[#381932]/95 backdrop-blur-md">
              <div className="mb-4 flex items-center justify-between text-base font-bold text-[#381932] dark:text-[#FFF3E6]">
                <span>Total Amount</span>
                <span className="font-serif text-lg font-bold text-[#381932] dark:text-[#381932]">₹{total.toLocaleString('en-IN')}</span>
              </div>
              
              <div className="flex flex-col gap-2.5">
                {/* 1. Primary Direct Online Book Now Button */}
                <button
                  type="button"
                  onClick={handleBookNowAll}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#381932] hover:opacity-90 text-[#FFF3E6] dark:bg-[#381932] dark:hover:bg-[#FFF3E6] dark:text-[#381932] py-3 px-4 text-xs sm:text-sm font-medium tracking-wide shadow-sm transition-colors cursor-pointer"
                >
                  <CalendarCheck size={16} />
                  <span>Book Now (Proceed to Checkout)</span>
                  <ArrowRight size={14} />
                </button>

                {/* 2. Secondary WhatsApp Checkout Button */}
                <button
                  type="button"
                  onClick={handleCheckout}
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-[#381932]/60 bg-[#FFF3E6] dark:bg-[#381932]/30 hover:bg-[#FFF3E6]/70 text-[#381932] dark:text-[#381932] py-2.5 px-4 text-xs sm:text-sm font-medium tracking-wide transition-colors cursor-pointer"
                >
                  <span>Confirm via WhatsApp</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              <button
                type="button"
                className="mt-3 w-full py-1 text-xs font-medium text-[#381932] hover:text-[#381932] transition-colors cursor-pointer text-center"
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
