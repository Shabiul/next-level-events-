import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Send, Bot } from 'lucide-react';
import { useAI } from '../../context/AIContext';
import { ProductCard } from '../../components/product/ProductCard';
import { Button } from '../../components/ui/Button';
import type { AdminProduct } from '../../types';

const SUGGESTIONS = [
  'Romantic cabana setup under ₹4,000 in Bengaluru',
  '1st Birthday pastel theme for baby boy with mascot',
  'Anniversary surprise dinner decor with fairy lights',
  'Welcome baby girl balloon arch for hospital/home',
  'Kids superhero birthday decoration with balloon twisting',
];

export const AIPlannerPage: React.FC = () => {
  const navigate = useNavigate();
  const { messages, loading, sendMessage, retryLast, canRetry, input, setInput } = useAI();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    sendMessage(input.trim());
  };

  const handleSuggestionClick = (prompt: string) => {
    sendMessage(prompt);
  };

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 md:px-8 animate-fade-in pb-24 sm:pb-12">
      {/* Header */}
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF3E6] dark:bg-[#381932] px-3.5 py-1 text-xs font-semibold text-[#381932] dark:text-[#FFF3E6] mb-3">
          <Sparkles size={13} className="text-[#A78A9F]" />
          <span>AI-Powered Event Concierge</span>
        </div>
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold tracking-tight text-[#381932] dark:text-[#FFF3E6]">
          Plan Your Dream Celebration
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-[#381932] dark:text-[#381932]">
          Tell our intelligent stylist what you're celebrating, your theme ideas, or budget. We'll curate exact matching packages in real time.
        </p>
      </div>

      {/* Main Chat & Recommendation Interface */}
      <div className="rounded-2xl border border-[#381932]/30 bg-[#FFF3E6] shadow-card overflow-hidden dark:bg-[#381932] dark:border-[#381932] flex flex-col h-[min(72dvh,650px)] sm:h-[650px]">
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF3E6] dark:bg-[#381932] mb-3 text-[#381932] dark:text-[#FFF3E6]">
                <Bot size={24} />
              </div>
              <h3 className="text-base font-bold text-[#381932] dark:text-[#FFF3E6]">What are we celebrating?</h3>
              <p className="text-xs text-[#381932] dark:text-[#381932] mt-1 mb-6">
                Pick a popular inspiration below or type your custom event requirements.
              </p>

              <div className="flex flex-col gap-2 w-full">
                {SUGGESTIONS.map((suggestion, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-left text-xs font-medium rounded-xl border border-[#381932]/30 bg-[#FFF3E6] p-3 text-[#381932] hover:border-[#381932] hover:bg-[#FFF3E6] dark:bg-[#381932] dark:border-[#381932] dark:text-[#381932] dark:hover:border-[#FFF3E6] transition-all cursor-pointer shadow-xs"
                  >
                    ✨ {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col gap-2 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#381932] text-[#FFF3E6] dark:bg-[#FFF3E6] dark:text-[#381932] rounded-tr-xs shadow-xs'
                      : 'bg-[#FFF3E6] text-[#381932] dark:bg-[#381932] dark:text-[#FFF3E6] rounded-tl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>

                {/* Product Recommendation Rail */}
                {msg.products && msg.products.length > 0 && (
                  <div className="w-full rounded-xl border border-[#381932]/30 bg-[#FFF3E6] p-4 dark:bg-[#381932] dark:border-[#381932] mt-1">
                    <div className="mb-3 flex items-center gap-1.5 text-xs font-bold text-[#381932] dark:text-[#FFF3E6] uppercase tracking-wider">
                      <Sparkles size={13} className="text-[#A78A9F]" />
                      Recommended Setups For Your Event
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {msg.products.map((p) => {
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
                          <div key={p.id} className="h-full">
                            <ProductCard
                              product={product}
                              onViewDetails={() => navigate(`/product/${product._id}`)}
                              onBook={() => navigate(`/booking/${product._id}`)}
                              isAI
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-[#381932] dark:text-[#381932] bg-[#FFF3E6] dark:bg-[#381932] px-4 py-2.5 rounded-2xl w-fit">
              <Sparkles size={14} className="animate-spin text-[#A78A9F]" />
              <span>Analyzing catalog &amp; crafting custom suggestions...</span>
            </div>
          )}

          {canRetry && !loading && (
            <button
              type="button"
              onClick={retryLast}
              className="w-fit rounded-full border border-[#381932] bg-[#FFF3E6] px-4 py-2 text-xs font-serif font-semibold uppercase tracking-wide text-[#381932] hover:bg-[#A78A9F]/15 transition-colors"
            >
              Try again
            </button>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="border-t border-[#381932]/30 bg-[#FFF3E6] p-3 sm:p-4 dark:bg-[#381932] dark:border-[#381932] flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. We want a terrace birthday surprise for wife under ₹5,000..."
            className="flex-1 rounded-full border border-[#381932]/30 bg-[#FFF3E6] px-4 py-2.5 text-xs sm:text-sm text-[#381932] outline-none placeholder:text-[#381932]/60 focus:border-[#381932] dark:bg-[#381932] dark:border-[#381932] dark:text-[#FFF3E6]"
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!input.trim() || loading}
            className="rounded-full px-5 flex-shrink-0"
          >
            <Send size={14} />
            <span className="hidden sm:inline">Ask AI</span>
          </Button>
        </form>
      </div>
    </div>
  );
};
