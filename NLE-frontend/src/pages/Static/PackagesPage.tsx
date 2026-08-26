import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  Shield,
  HeartHandshake,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { SeoHead } from '../../components/layout/SeoHead';
import { useProducts } from '../../hooks/useProducts';
import type { AdminProduct } from '../../types';
import {
  EVENT_PACKAGES,
  CATEGORY_FILTERS,
  CATEGORY_META,
  type EventPackage,
  type PackageCategoryKey,
} from '../../components/packages/eventPackages.data';
import { EventPackageCard } from '../../components/packages/EventPackageCard';
import { EventPackageDetailModal } from '../../components/packages/EventPackageDetailModal';

const SUPPORT_PHONE = '917022058460';

type CategoryFilterOption = 'ALL' | PackageCategoryKey;

interface PackagesPageProps {
  onViewProduct?: (product: AdminProduct) => void;
  onBookProduct?: (product: AdminProduct) => void;
}

export const PackagesPage: React.FC<PackagesPageProps> = ({
  onViewProduct: _onViewProduct,
  onBookProduct,
}) => {
  const navigate = useNavigate();
  const { products } = useProducts();
  const [activeFilter, setActiveFilter] = useState<CategoryFilterOption>('ALL');
  const [viewingPackage, setViewingPackage] = useState<EventPackage | null>(null);
  const [showMore, setShowMore] = useState(false);

  const filteredPackages = useMemo(() => {
    if (activeFilter === 'ALL') return EVENT_PACKAGES;
    return EVENT_PACKAGES.filter((pkg) => pkg.categories.some((c) => c.key === activeFilter));
  }, [activeFilter]);

  const primaryPackages = filteredPackages.slice(0, 4);
  const extraPackages = filteredPackages.slice(4);

  const handleBookPackage = (pkg: EventPackage) => {
    setViewingPackage(null);

    const matched = products.find(
      (p) =>
        p.name.toLowerCase().includes(pkg.name.toLowerCase()) ||
        pkg.name.toLowerCase().includes(p.name.toLowerCase())
    ) || {
      _id: pkg.id,
      name: pkg.name,
      price: pkg.numericPrice,
      categoryName: 'Event Packages',
      description: pkg.description,
      image: '/exploreee.jpeg',
      inclusions: pkg.categories.flatMap((c) => c.items.map((i) => i.label)),
      addOns: [],
      active: true,
      featured: true,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    };

    if (onBookProduct) {
      onBookProduct(matched as AdminProduct);
    } else {
      navigate(`/booking/${matched._id}`, {
        state: { product: matched, preferredMethod: 'razorpay' },
      });
    }
  };

  const openWhatsAppEnquiry = () => {
    const text = "Hi TheDecorParty! I'd like to know more about your Event Packages.";
    window.open(`https://wa.me/${SUPPORT_PHONE}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  const scrollToCatalog = () => {
    const el = document.getElementById('package-tiers-list');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <SeoHead
        title="Event Packages — TheDecorParty"
        description="Explore thoughtfully curated event packages with transparent pricing, decor, activities, live eateries, and complimentary extras across Bengaluru."
      />

      <div className="flex flex-col w-full bg-[#F9F6F2] text-[#2F2930] font-sans antialiased min-h-screen">

        {/* ========================================================================= */}
        {/* 01 — EDITORIAL HERO HEADER                                               */}
        {/* ========================================================================= */}
        <section
          data-nav-theme="light"
          className="relative w-full pt-12 sm:pt-16 md:pt-20 pb-8 sm:pb-12 px-4 sm:px-6 md:px-8 lg:px-12 max-w-[1720px] mx-auto text-center"
        >
          {/* Ambient Lighting Orbs */}
          <div className="absolute top-10 left-1/4 w-96 h-96 rounded-full bg-[#725D75]/10 blur-3xl pointer-events-none -z-10" />
          <div className="absolute top-28 right-1/4 w-96 h-96 rounded-full bg-[#C9BEAB]/08 blur-3xl pointer-events-none -z-10" />

          <div className="max-w-4xl mx-auto flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#725D75]/06 border border-[#725D75]/15 text-xs font-bold uppercase tracking-[0.22em] text-[#746B72] mb-4 sm:mb-5"
            >
              <Sparkles size={13} className="text-[#725D75]" />
              <span>CURATED CELEBRATION PACKAGES</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-[64px] font-normal tracking-tight text-[#2F2930] leading-[1.08] mb-4"
            >
              Event <span className="font-serif italic text-[#725D75]">Packages</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm sm:text-base font-light leading-relaxed text-[#746B72] max-w-xl mb-8"
            >
              Celebrate beautifully with our thoughtfully curated packages.
            </motion.p>
          </div>

          {/* ========================================================================= */}
          {/* 02 — CATEGORY FILTER NAVIGATION                                           */}
          {/* ========================================================================= */}
          <div
            id="package-tiers-list"
            className="mt-2 flex items-center justify-start sm:justify-center overflow-x-auto pb-3 scrollbar-none gap-2 px-2 max-w-full"
          >
            {(['ALL', ...CATEGORY_FILTERS] as CategoryFilterOption[]).map((filterKey) => {
              const isActive = activeFilter === filterKey;
              const label = filterKey === 'ALL' ? 'All Packages' : CATEGORY_META[filterKey].label;
              const Icon = filterKey === 'ALL' ? Sparkles : CATEGORY_META[filterKey].icon;
              const count =
                filterKey === 'ALL'
                  ? EVENT_PACKAGES.length
                  : EVENT_PACKAGES.filter((p) => p.categories.some((c) => c.key === filterKey)).length;

              return (
                <button
                  key={filterKey}
                  type="button"
                  onClick={() => {
                    setActiveFilter(filterKey);
                    setShowMore(false);
                  }}
                  className={`relative shrink-0 rounded-full px-4 sm:px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#725D75] text-white shadow-md scale-102'
                      : 'bg-[#725D75]/06 text-[#746B72] hover:bg-[#725D75]/12 hover:text-[#2F2930]'
                  }`}
                >
                  <Icon size={13} className={isActive ? 'text-white' : 'text-[#725D75]'} />
                  <span>{label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[#725D75]/10 text-[#746B72]'
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
        {/* 03 — PACKAGE GRID + VIEW MORE CAROUSEL                                    */}
        {/* ========================================================================= */}
        <section className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 pb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
            {primaryPackages.map((pkg, idx) => (
              <EventPackageCard
                key={pkg.id}
                pkg={pkg}
                index={idx}
                onView={setViewingPackage}
                onBook={handleBookPackage}
              />
            ))}
          </div>

          {primaryPackages.length === 0 && (
            <div className="py-16 text-center text-sm text-[#746B72]">
              No packages found in this category yet.
            </div>
          )}

          {extraPackages.length > 0 && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => setShowMore((v) => !v)}
                className="inline-flex items-center gap-2 rounded-full border border-[#725D75]/30 bg-white px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#725D75] hover:bg-[#725D75]/06 shadow-sm transition-all cursor-pointer"
              >
                <span>{showMore ? 'Hide Packages' : `View More Packages (${extraPackages.length})`}</span>
                {showMore ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
          )}

          {showMore && extraPackages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.4 }}
              className="mt-8 overflow-hidden"
            >
              <div className="flex gap-5 overflow-x-auto pb-4 smooth-horizontal-rail hide-scrollbar snap-x">
                {extraPackages.map((pkg, idx) => (
                  <div key={pkg.id} className="flex-none w-[280px] sm:w-[320px] snap-start">
                    <EventPackageCard
                      pkg={pkg}
                      index={idx}
                      onView={setViewingPackage}
                      onBook={handleBookPackage}
                      className="h-full"
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* 04 — GENERAL ENQUIRY STRIP                                                */}
        {/* ========================================================================= */}
        <section className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 pb-16 sm:pb-24">
          <div className="rounded-[28px] border border-[#E4DCD2] bg-white p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2F2930] mb-1">
                Don't see the exact fit?
              </h3>
              <p className="text-xs sm:text-sm text-[#746B72] font-light">
                Every package can be customised — mix decor, activities, and eateries to your taste and budget.
              </p>
            </div>
            <button
              type="button"
              onClick={openWhatsAppEnquiry}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-[#725D75] hover:bg-[#A78A9F] text-white px-6 py-3 text-xs font-bold uppercase tracking-wider shadow-md transition-colors cursor-pointer"
            >
              Enquire Now
              <ArrowRight size={13} />
            </button>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 05 — THE DECOR PARTY PROMISE & GUARANTEE                                  */}
        {/* ========================================================================= */}
        <section
          data-nav-theme="dark"
          className="relative w-full py-16 sm:py-20 lg:py-24 px-4 sm:px-6 md:px-8 lg:px-12 text-[#F9F6F2] text-center border-t border-white/10"
          style={{
            background: 'linear-gradient(145deg, #26112A 0%, #371A3F 55%, #46224F 100%)',
          }}
        >
          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center gap-5 sm:gap-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-bold uppercase tracking-[0.22em] text-[#A78A9F]">
              <HeartHandshake size={13} className="text-[#A78A9F]" />
              <span>THE DECOR PARTY PROMISE</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight leading-[1.12] text-[#F9F6F2] uppercase">
              YOUR CELEBRATION.{' '}
              <span className="font-serif italic text-[#A78A9F] block sm:inline lowercase">
                Your style. Your moment.
              </span>
            </h2>

            <p className="text-xs sm:text-sm md:text-base font-light text-[#F9F6F2]/85 max-w-xl leading-relaxed">
              Transparent fixed pricing with guaranteed punctual arrival anywhere in Bengaluru.
            </p>

            <button
              type="button"
              onClick={scrollToCatalog}
              className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#725D75] to-[#A78A9F] hover:from-[#C9BEAB] hover:to-[#725D75] px-8 sm:px-10 py-3.5 sm:py-4 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#F9F6F2] hover:text-[#25172C] shadow-xl hover:scale-103 active:scale-95 transition-all cursor-pointer"
            >
              <span>EXPLORE ALL PACKAGES</span>
              <ArrowRight size={15} />
            </button>

            <div className="mt-4 pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-[11px] sm:text-xs text-[#F9F6F2]/75 font-medium tracking-wide">
              <span className="flex items-center gap-1.5">
                <Clock size={13} className="text-[#A78A9F]" />
                <span>Express 3-Hour Setup</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Shield size={13} className="text-[#A78A9F]" />
                <span>100% Picture-Match Guarantee</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-[#A78A9F]" />
                <span>No Hidden Fees</span>
              </span>
            </div>
          </div>
        </section>

      </div>

      <EventPackageDetailModal
        pkg={viewingPackage}
        onClose={() => setViewingPackage(null)}
        onBook={handleBookPackage}
      />
    </>
  );
};

export default PackagesPage;
