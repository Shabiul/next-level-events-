import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  MessageSquare,
  Clock,
  Shield,
  X,
  Layers,
  HeartHandshake,
} from 'lucide-react';
import { SeoHead } from '../../components/layout/SeoHead';
import { useProducts } from '../../hooks/useProducts';
import type { AdminProduct } from '../../types';

export type PackageCategoryFilter =
  | 'ALL'
  | 'BIRTHDAYS'
  | 'PROPOSALS'
  | 'BABY SHOWERS'
  | 'ANNIVERSARIES'
  | 'WEDDINGS'
  | 'FESTIVALS'
  | 'CUSTOM';

const PACKAGE_FILTERS: PackageCategoryFilter[] = [
  'ALL',
  'BIRTHDAYS',
  'PROPOSALS',
  'BABY SHOWERS',
  'ANNIVERSARIES',
  'WEDDINGS',
  'FESTIVALS',
  'CUSTOM',
];

const SUPPORT_PHONE = '917022058460';

interface PackagesPageProps {
  onViewProduct?: (product: AdminProduct) => void;
  onBookProduct?: (product: AdminProduct) => void;
}

export const PackagesPage: React.FC<PackagesPageProps> = ({
  onViewProduct,
  onBookProduct,
}) => {
  const navigate = useNavigate();
  const { products, loading } = useProducts();
  const [activeFilter, setActiveFilter] = useState<PackageCategoryFilter>('ALL');
  const [selectedModalProduct, setSelectedModalProduct] = useState<AdminProduct | null>(null);

  // Helper category matcher
  const getProductCategoryKey = (catName?: string, name?: string): PackageCategoryFilter => {
    const c = (catName || '').toLowerCase();
    const n = (name || '').toLowerCase();

    if (c.includes('birthday') || n.includes('birthday') || n.includes('bday') || n.includes('kids'))
      return 'BIRTHDAYS';
    if (c.includes('proposal') || n.includes('proposal') || n.includes('marry me') || n.includes('rose day'))
      return 'PROPOSALS';
    if (c.includes('baby') || n.includes('baby') || n.includes('cradle') || n.includes('shower') || n.includes('welcome baby'))
      return 'BABY SHOWERS';
    if (c.includes('anniversary') || n.includes('anniversary') || c.includes('romantic') || n.includes('cabana') || n.includes('candlelight') || c.includes('dinner'))
      return 'ANNIVERSARIES';
    if (c.includes('wedding') || n.includes('wedding') || n.includes('pre & post') || n.includes('haldi') || n.includes('mehendi') || n.includes('sangeet'))
      return 'WEDDINGS';
    if (c.includes('festival') || n.includes('festival') || n.includes('diwali') || n.includes('marigold'))
      return 'FESTIVALS';
    return 'CUSTOM';
  };

  const filteredPackages = useMemo(() => {
    if (!products || products.length === 0) return [];
    if (activeFilter === 'ALL') return products;
    return products.filter(
      (p) => getProductCategoryKey(p.categoryName, p.name) === activeFilter
    );
  }, [products, activeFilter]);

  const handleBook = (p: AdminProduct) => {
    if (onBookProduct) {
      onBookProduct(p);
    } else {
      navigate(`/booking/${p._id}`);
    }
  };

  const handleView = (p: AdminProduct) => {
    if (onViewProduct) {
      onViewProduct(p);
    } else {
      navigate(`/product/${p._id}`);
    }
  };

  const openWhatsApp = (p: AdminProduct) => {
    const text = `Hi TheDecorParty! I'm interested in booking the "${p.name}" package (${p.categoryName || 'Celebration Setup'}). Can you share customisation options and availability for my date?`;
    const url = `https://wa.me/${SUPPORT_PHONE}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const scrollToCatalog = () => {
    const el = document.getElementById('packages-catalog');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <SeoHead
        title="Celebration Packages & Transparent Pricing — TheDecorParty"
        description="Explore handcrafted decoration packages for birthdays, proposals, baby showers, anniversaries, and weddings in Bengaluru. Turnkey setup & 100% picture-match guarantee."
      />

      <div className="flex flex-col w-full bg-[#FAF8F5] dark:bg-[#1B101F] text-[#34203C] dark:text-[#FAF8F5] font-sans antialiased transition-colors min-h-screen">
        
        {/* ========================================================================= */}
        {/* 01 — HERO                                                                 */}
        {/* ========================================================================= */}
        <section
          data-nav-theme="light"
          className="relative w-full pt-12 sm:pt-16 md:pt-20 pb-10 sm:pb-14 px-4 sm:px-6 md:px-8 lg:px-12 max-w-[1720px] mx-auto text-center"
        >
          {/* Ambient Glows */}
          <div className="absolute top-10 left-1/3 w-80 h-80 rounded-full bg-[#A78A9F]/12 blur-3xl pointer-events-none -z-10" />
          <div className="absolute top-32 right-1/4 w-80 h-80 rounded-full bg-[#C9BEAB]/15 blur-3xl pointer-events-none -z-10" />

          <div className="max-w-3xl mx-auto flex flex-col items-center">
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#34203C]/06 dark:bg-white/10 border border-[#34203C]/10 dark:border-white/15 text-xs font-bold uppercase tracking-[0.22em] text-[#725D75] dark:text-[#C9BEAB] mb-4 sm:mb-6"
            >
              <Sparkles size={13} className="text-[#A78A9F]" />
              <span>THEDECORPARTY PACKAGES</span>
            </motion.div>

            {/* H1 */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-normal tracking-tight text-[#34203C] dark:text-[#FAF8F5] leading-[1.12] mb-5 uppercase"
            >
              Designed for{' '}
              <span className="font-serif italic text-[#725D75] dark:text-[#C9BEAB] lowercase">
                your moment.
              </span>
            </motion.h1>

            {/* Supporting Text */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm sm:text-base md:text-lg font-light leading-relaxed text-[#725D75] dark:text-[#C8B5C3] max-w-2xl mb-8"
            >
              Thoughtfully curated decoration packages made for birthdays, proposals, baby showers, anniversaries, weddings and every celebration in between.
            </motion.p>

            {/* Hero CTA */}
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              onClick={scrollToCatalog}
              className="inline-flex items-center gap-2 rounded-full bg-[#34203C] hover:bg-[#483250] text-[#FAF8F5] dark:bg-[#FAF8F5] dark:text-[#34203C] dark:hover:bg-[#C9BEAB] px-8 sm:px-10 py-3.5 sm:py-4 text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg hover:scale-103 active:scale-95 transition-all cursor-pointer"
            >
              <span>PLAN YOUR CELEBRATION</span>
              <ArrowRight size={15} />
            </motion.button>
          </div>

          {/* ========================================================================= */}
          {/* 02 — PACKAGE CATEGORIES (Segmented Filter Bar)                            */}
          {/* ========================================================================= */}
          <div
            id="packages-catalog"
            className="mt-12 sm:mt-16 flex items-center justify-start sm:justify-center overflow-x-auto pb-3 sm:pb-0 scrollbar-none gap-2 px-2 max-w-full"
          >
            {PACKAGE_FILTERS.map((cat) => {
              const isActive = activeFilter === cat;
              const count =
                cat === 'ALL'
                  ? products.length
                  : products.filter(
                      (p) => getProductCategoryKey(p.categoryName, p.name) === cat
                    ).length;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveFilter(cat)}
                  className={`relative shrink-0 rounded-full px-4 sm:px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#34203C] text-[#FAF8F5] dark:bg-[#C9BEAB] dark:text-[#25172C] shadow-md scale-103'
                      : 'bg-[#34203C]/06 text-[#725D75] hover:bg-[#34203C]/12 hover:text-[#34203C] dark:bg-white/06 dark:text-[#C8B5C3] dark:hover:bg-white/12 dark:hover:text-white'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black'
                        : 'bg-[#34203C]/10 dark:bg-white/10 text-[#725D75] dark:text-[#DDD5C7]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 03 — PACKAGES GRID (3-Column Desktop / 2 Tablet / 1 Mobile)               */}
        {/* ========================================================================= */}
        <section className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 pb-16 sm:pb-24">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3">
              <div className="h-8 w-8 rounded-full border-2 border-[#34203C] border-t-transparent animate-spin dark:border-[#C9BEAB] dark:border-t-transparent" />
              <span className="text-xs font-medium text-[#725D75] dark:text-[#C9BEAB]">
                Loading curated celebration packages...
              </span>
            </div>
          ) : filteredPackages.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center gap-3 max-w-md mx-auto">
              <p className="font-serif text-lg text-[#34203C] dark:text-[#FAF8F5]">
                No packages found in this category.
              </p>
              <button
                type="button"
                onClick={() => setActiveFilter('ALL')}
                className="rounded-full border border-[#34203C]/20 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#34203C] dark:text-[#FAF8F5]"
              >
                View All Packages
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredPackages.map((p) => {
                const inclusionsList =
                  Array.isArray(p.inclusions) && p.inclusions.length > 0
                    ? p.inclusions.slice(0, 3)
                    : [
                        'Artisanal Theme Styling & Color Palette',
                        'On-Site Setup by Certified Master Stylists',
                        '100% Picture-Match Guarantee & Punctual Delivery',
                      ];

                return (
                  <motion.div
                    key={p._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="group flex flex-col justify-between rounded-[28px] sm:rounded-[32px] border border-[#DDD5C7] dark:border-[#483250] bg-[#FAF8F5] dark:bg-[#201325] overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                  >
                    {/* Top Image Showcase */}
                    <div>
                      <div
                        className="relative w-full aspect-[4/3] overflow-hidden cursor-pointer bg-[#34203C]/10"
                        onClick={() => handleView(p)}
                      >
                        <img
                          src={p.image}
                          alt={p.name}
                          loading="lazy"
                          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 opacity-70 group-hover:opacity-90 transition-opacity" />

                        {/* Top Badges */}
                        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
                          <span className="rounded-full bg-[#34203C]/80 backdrop-blur-md border border-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#FAF8F5] shadow-sm">
                            {p.categoryName || 'Celebration Setup'}
                          </span>
                          {p.badge && (
                            <span className="rounded-full bg-[#C9BEAB] text-[#25172C] px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                              {p.badge}
                            </span>
                          )}
                        </div>

                        {/* Quick View Button on Image Hover */}
                        <div className="absolute bottom-3.5 right-3.5 flex items-center gap-1.5 rounded-full bg-white/90 dark:bg-black/80 px-3 py-1 text-[11px] font-semibold text-[#34203C] dark:text-white shadow backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span>View Details</span>
                          <ArrowRight size={12} />
                        </div>
                      </div>

                      {/* Content Body */}
                      <div className="p-5 sm:p-6 flex flex-col text-left">
                        {/* Package Title */}
                        <h3
                          className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#34203C] dark:text-[#FAF8F5] leading-snug line-clamp-1 cursor-pointer hover:text-[#A78A9F] transition-colors"
                          onClick={() => handleView(p)}
                        >
                          {p.name}
                        </h3>

                        {/* Short Description */}
                        <p className="text-xs text-[#725D75] dark:text-[#C8B5C3] font-light leading-relaxed mt-1.5 line-clamp-2 min-h-[36px]">
                          {p.description ||
                            'Complete turnkey celebration setup styled with customized props, balloon architecture, and fairy lighting.'}
                        </p>

                        {/* Starting Price */}
                        <div className="flex items-baseline justify-between mt-4 pb-3.5 border-b border-[#DDD5C7]/60 dark:border-[#483250]/60">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#725D75] dark:text-[#A78A9F] block">
                              Starting Price
                            </span>
                            <div className="flex items-baseline gap-1.5">
                              <span className="font-serif text-xl sm:text-2xl font-bold text-[#34203C] dark:text-[#FAF8F5]">
                                ₹{p.price.toLocaleString('en-IN')}
                              </span>
                              {p.originalPrice && p.originalPrice > p.price && (
                                <span className="text-xs text-[#725D75]/60 line-through">
                                  ₹{p.originalPrice.toLocaleString('en-IN')}
                                </span>
                              )}
                            </div>
                          </div>

                          <span className="text-[10px] text-[#725D75] dark:text-[#C8B5C3] italic">
                            / complete setup
                          </span>
                        </div>

                        {/* Key Inclusions */}
                        <div className="mt-3.5 flex flex-col gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#725D75] dark:text-[#C9BEAB]">
                            What's Included:
                          </span>
                          <ul className="flex flex-col gap-1 text-[11px] text-[#725D75] dark:text-[#DDD5C7] font-light">
                            {inclusionsList.map((inc, i) => (
                              <li key={i} className="flex items-start gap-1.5 leading-tight">
                                <CheckCircle2 size={12} className="text-[#A78A9F] shrink-0 mt-0.5" />
                                <span className="line-clamp-1">{inc}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action CTAs */}
                    <div className="p-5 sm:p-6 pt-0 flex flex-col gap-2">
                      {/* Primary CTA: Book This Package */}
                      <button
                        type="button"
                        onClick={() => handleBook(p)}
                        className="flex w-full items-center justify-center gap-2 rounded-full bg-[#34203C] hover:bg-[#483250] dark:bg-[#FAF8F5] dark:text-[#34203C] dark:hover:bg-[#C9BEAB] text-[#FAF8F5] py-3 text-xs font-bold uppercase tracking-wider shadow-md hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer"
                      >
                        <span>BOOK THIS PACKAGE</span>
                        <ArrowRight size={14} />
                      </button>

                      {/* Secondary CTA: Customize on WhatsApp */}
                      <button
                        type="button"
                        onClick={() => openWhatsApp(p)}
                        className="flex w-full items-center justify-center gap-2 rounded-full border border-[#DDD5C7] dark:border-[#483250] hover:border-[#25D366] bg-white dark:bg-[#180E1C] hover:bg-[#25D366]/08 py-2.5 text-xs font-semibold text-[#34203C] dark:text-[#FAF8F5] transition-all cursor-pointer"
                      >
                        <MessageSquare size={14} className="text-[#25D366]" />
                        <span>CUSTOMIZE ON WHATSAPP</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* 05 — CUSTOM PACKAGE CTA                                                   */}
        {/* ========================================================================= */}
        <section
          data-nav-theme="light"
          className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 pb-16 sm:pb-20"
        >
          <div className="relative rounded-[32px] sm:rounded-[40px] border border-[#DDD5C7] dark:border-[#483250] bg-gradient-to-br from-[#FAF8F5] via-[#F4EDE2] to-[#FAF8F5] dark:from-[#25172C] dark:via-[#1F1122] dark:to-[#25172C] p-8 sm:p-12 text-center shadow-lg overflow-hidden">
            <div className="max-w-2xl mx-auto flex flex-col items-center gap-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#34203C]/06 dark:bg-white/10 text-xs font-bold uppercase tracking-wider text-[#725D75] dark:text-[#C9BEAB]">
                <Layers size={13} className="text-[#A78A9F]" />
                <span>BESPOKE STYLING</span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-normal tracking-tight text-[#34203C] dark:text-[#FAF8F5] uppercase">
                Can't find your perfect setup?
              </h2>

              <p className="text-xs sm:text-sm md:text-base font-light text-[#725D75] dark:text-[#C8B5C3] leading-relaxed">
                Tell us what you're imagining and we'll create something around your celebration.
              </p>

              <button
                type="button"
                onClick={() => navigate('/contact')}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[#34203C] hover:bg-[#483250] text-[#FAF8F5] dark:bg-[#C9BEAB] dark:text-[#25172C] dark:hover:bg-[#FAF8F5] px-8 sm:px-10 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg hover:scale-103 active:scale-95 transition-all cursor-pointer"
              >
                <span>CUSTOMIZE YOUR CELEBRATION</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 06 — FINAL CTA                                                            */}
        {/* ========================================================================= */}
        <section
          data-nav-theme="dark"
          className="relative w-full py-16 sm:py-20 lg:py-24 px-4 sm:px-6 md:px-8 lg:px-12 text-[#FAF8F5] text-center border-t border-white/10"
          style={{
            background: 'linear-gradient(145deg, #26112A 0%, #371A3F 55%, #46224F 100%)',
          }}
        >
          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center gap-5 sm:gap-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-bold uppercase tracking-[0.22em] text-[#C9BEAB]">
              <HeartHandshake size={13} className="text-[#C9BEAB]" />
              <span>THE DECOR PARTY PROMISE</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight leading-[1.12] text-[#FAF8F5] uppercase">
              YOUR CELEBRATION.{' '}
              <span className="font-serif italic text-[#C9BEAB] block sm:inline lowercase">
                Your style. Your moment.
              </span>
            </h2>

            <p className="text-xs sm:text-sm md:text-base font-light text-[#F6EFF4]/85 max-w-xl leading-relaxed">
              Let's create a setting worth remembering.
            </p>

            <button
              type="button"
              onClick={scrollToCatalog}
              className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#A78A9F] to-[#725D75] hover:from-[#C9BEAB] hover:to-[#A78A9F] px-8 sm:px-10 py-3.5 sm:py-4 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#FAF8F5] hover:text-[#25172C] shadow-xl hover:scale-103 active:scale-95 transition-all cursor-pointer"
            >
              <span>BOOK YOUR CELEBRATION</span>
              <ArrowRight size={15} />
            </button>

            {/* Micro guarantees */}
            <div className="mt-4 pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-[11px] sm:text-xs text-[#FAF8F5]/75 font-medium tracking-wide">
              <span className="flex items-center gap-1.5">
                <Clock size={13} className="text-[#C9BEAB]" />
                <span>Express 3-Hour Setup</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Shield size={13} className="text-[#C9BEAB]" />
                <span>100% Picture-Match Guarantee</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-[#C9BEAB]" />
                <span>No Hidden Fees</span>
              </span>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 04 — PACKAGE DETAIL MODAL (Optional Quick View)                           */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {selectedModalProduct && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6"
              onClick={() => setSelectedModalProduct(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[#DDD5C7] dark:border-[#483250] bg-[#FAF8F5] dark:bg-[#201325] p-6 sm:p-8 shadow-2xl text-left"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  type="button"
                  aria-label="Close Preview"
                  onClick={() => setSelectedModalProduct(null)}
                  className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 text-[#34203C] dark:text-white transition-colors"
                >
                  <X size={18} />
                </button>

                <div className="flex flex-col gap-4">
                  <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black/10">
                    <img
                      src={selectedModalProduct.image}
                      alt={selectedModalProduct.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div>
                    <span className="rounded-full bg-[#34203C]/08 dark:bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#725D75] dark:text-[#C9BEAB]">
                      {selectedModalProduct.categoryName}
                    </span>
                    <h3 className="font-serif text-2xl font-bold text-[#34203C] dark:text-[#FAF8F5] mt-2">
                      {selectedModalProduct.name}
                    </h3>
                    <p className="font-serif text-2xl font-bold text-[#34203C] dark:text-[#FAF8F5] mt-1">
                      ₹{selectedModalProduct.price.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-[#725D75] dark:text-[#C8B5C3] font-light leading-relaxed">
                    {selectedModalProduct.description}
                  </p>

                  {/* CTAs */}
                  <div className="mt-4 flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedModalProduct(null);
                        handleBook(selectedModalProduct);
                      }}
                      className="flex-1 rounded-full bg-[#34203C] text-white py-3 text-xs font-bold uppercase tracking-wider hover:bg-[#483250] transition-colors"
                    >
                      Book Now
                    </button>
                    <button
                      type="button"
                      onClick={() => openWhatsApp(selectedModalProduct)}
                      className="flex-1 rounded-full border border-[#25D366] text-[#25D366] py-3 text-xs font-bold uppercase tracking-wider hover:bg-[#25D366]/10 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare size={14} />
                      <span>WhatsApp Stylist</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </>
  );
};

export default PackagesPage;
