import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AdminProduct } from '../../types';
import { ProductCard } from '../product/ProductCard';
import { useLanguage } from '../../hooks/useLanguage';
import { X, Send, Sparkles } from 'lucide-react';
import { cn } from '../../utils/utils';

export type AssistantProduct = {
  id: string;
  name: string;
  image: string;
  category: string;
  price: number;
  featured: boolean;
  description?: string;
};

export type AssistantMessage = {
  id: number;
  sender: 'bot' | 'user';
  text: string;
  products?: AssistantProduct[];
  loading?: boolean;
};

interface AssistantPanelProps {
  open: boolean;
  onClose: () => void;
  messages: AssistantMessage[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
}

export const AssistantPanel: React.FC<AssistantPanelProps> = ({
  open,
  onClose,
  messages,
  inputValue,
  onInputChange,
  onSubmit,
  inputRef,
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const productTrackRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = document.getElementById('assistant-scroll-container');
    if (el) el.scrollTop = el.scrollHeight;
    if (open && inputRef?.current) inputRef.current.focus();
  }, [messages, open, inputRef]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [open]);

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-[1000000] bg-black/40 backdrop-blur-xs transition-opacity duration-200',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          'fixed inset-y-0 right-0 z-[1000001] flex w-[min(440px,100vw)] flex-col bg-white dark:bg-[#1A1A1A] border-l border-[#E8E7E3] dark:border-[#2E2E2E] shadow-2xl transition-transform duration-300',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="AI Event Planner"
        onTouchMove={e => e.stopPropagation()}
        onWheel={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8E7E3] px-5 py-4 dark:border-[#2E2E2E]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F4F3F0] dark:bg-[#262626] text-[#1C1C1C] dark:text-white">
              <Sparkles size={16} className="text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1C1C1C] dark:text-white">
                AI Event Concierge
              </h3>
              <p className="text-[11px] text-[#6F6F6B] dark:text-[#A0A09C]">
                Ask for themes, budgets, or custom setup ideas
              </p>
            </div>
          </div>

          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#6F6F6B] hover:bg-[#F4F3F0] dark:hover:bg-[#262626] cursor-pointer"
            onClick={onClose}
            aria-label="Close assistant"
          >
            <X size={16} />
          </button>
        </div>

        {/* Messages */}
        <div
          className="flex flex-1 flex-col gap-3.5 overflow-y-auto px-4 py-4"
          id="assistant-scroll-container"
        >
          {messages.map(message => (
            <div key={message.id} className={cn('flex flex-col gap-2', message.sender === 'user' && 'items-end')}>
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed',
                  message.sender === 'bot'
                    ? 'bg-[#F4F3F0] text-[#1C1C1C] dark:bg-[#262626] dark:text-neutral-100 rounded-tl-xs'
                    : 'bg-[#1C1C1C] text-white dark:bg-white dark:text-black rounded-tr-xs shadow-xs'
                )}
              >
                {message.loading ? (
                  <div className="flex items-center gap-2 text-xs">
                    <Sparkles size={13} className="text-amber-600 animate-spin" />
                    <span>Styling your celebration...</span>
                  </div>
                ) : (
                  <div className="whitespace-pre-line">{message.text}</div>
                )}
              </div>

              {/* Product cards */}
              {message.products && message.products.length > 0 && (
                <div className="w-full rounded-xl bg-[#FAFAF8] p-3 border border-[#E8E7E3] dark:bg-[#1E1E1E] dark:border-[#2E2E2E]">
                  <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-[#1C1C1C] dark:text-white uppercase tracking-wider">
                    <Sparkles size={11} className="text-amber-600" />
                    Curated Packages
                  </div>

                  <div className="relative">
                    <div
                      ref={productTrackRef}
                      className="flex gap-2.5 overflow-x-auto pb-1 hide-scrollbar snap-x snap-mandatory"
                    >
                      {message.products.map(p => {
                        const product: AdminProduct = {
                          _id: p.id,
                          name: p.name,
                          categoryId: '',
                          categoryName: p.category || '',
                          subcategory: '',
                          price: p.price ?? 0,
                          originalPrice: undefined,
                          description: p.description ?? '',
                          inclusions: [],
                          addOns: [],
                          image: p.image,
                          moreImages: [],
                          badge: undefined,
                          badgeColor: 'purple',
                          rating: 0,
                          reviewCount: 0,
                          active: true,
                          featured: !!p.featured,
                          createdAt: new Date().toISOString(),
                          updatedAt: new Date().toISOString(),
                        };

                        return (
                          <div key={p.id} className="w-[190px] flex-shrink-0 snap-start">
                            <ProductCard
                              product={product}
                              onViewDetails={() => {
                                navigate(`/product/${product._id}`);
                                onClose();
                              }}
                              isAI
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input form */}
        <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-[#E8E7E3] bg-white p-3 dark:bg-[#1A1A1A] dark:border-[#2E2E2E]">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={e => onInputChange(e.target.value)}
            placeholder={t?.ask_assistant || 'Ask for birthday decor under ₹4,000...'}
            autoComplete="off"
            className="flex-1 rounded-full border border-[#E8E7E3] bg-[#FAFAF8] px-4 py-2 text-xs text-[#1C1C1C] outline-none placeholder:text-[#6F6F6B]/60 focus:border-[#1C1C1C] dark:bg-[#262626] dark:border-[#333] dark:text-white"
          />
          <button
            type="submit"
            aria-label="Send message"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1C1C1C] text-white hover:bg-black transition-colors cursor-pointer dark:bg-white dark:text-black"
          >
            <Send size={14} />
          </button>
        </form>
      </aside>
    </>
  );
};
