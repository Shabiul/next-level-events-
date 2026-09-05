import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Heart,
  ImageIcon,
  Clock,
  ShieldCheck,
  Sparkles,
  Wand2,
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
const CTA_IMAGE = '/kkkk.jpg';

type CategoryFilterOption = 'ALL' | PackageCategoryKey;

interface PackagesPageProps {
  onViewProduct?: (product: AdminProduct) => void;
  onBookProduct?: (product: AdminProduct) => void;
}

const BENEFITS = [
  { icon: ImageIcon, title: '100% Picture Match', sub: 'What you see is what you get' },
  { icon: Clock, title: 'On-Time Delivery', sub: 'We value your time' },
  { icon: ShieldCheck, title: 'Zero Hidden Cost', sub: 'Transparent pricing always' },
  { icon: Sparkles, title: 'Expert Stylists', sub: 'Designed by celebration experts' },
  { icon: Wand2, title: 'Customisable', sub: 'Tailored to your taste & budget' },
];

/* Thin botanical sprig */
const Sprig: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 120 80" className={className} fill="none" aria-hidden="true">
    <path d="M10 70 C 40 60, 60 40, 110 10" stroke="#A78A9F" strokeWidth="1.25" strokeLinecap="round" opacity="0.5" />
    {[22, 40, 58, 76, 94].map((x, i) => (
      <path
        key={x}
        d={`M${x} ${62 - i * 12} q 10 -6 16 -16 q -12 2 -16 16`}
        stroke="#A78A9F"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.4"
      />
    ))}
  </svg>
);

export const PackagesPage: React.FC<PackagesPageProps> = ({
  onViewProduct: _onViewProduct,
  onBookProduct,
}) => {
  const navigate = useNavigate();
  const { products } = useProducts();
  const [activeFilter, setActiveFilter] = useState<CategoryFilterOption>('ALL');
  const [viewingPackage, setViewingPackage] = useState<EventPackage | null>(null);
  const [showMore, setShowMore] = useState(false);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  const toggleWishlist = (pkg: EventPackage) =>
    setWishlistIds((prev) =>
      prev.includes(pkg.id) ? prev.filter((x) => x !== pkg.id) : [...prev, pkg.id]
    );

  const filteredPackages = useMemo(() => {
    if (activeFilter === 'ALL') return EVENT_PACKAGES;
    return EVENT_PACKAGES.filter((pkg) => pkg.categories.some((c) => c.key === activeFilter));
  }, [activeFilter]);

  const primaryPackages = filteredPackages.slice(0, 4);
  const extraPackages = filteredPackages.slice(4);

  const handleBookPackage = (pkg: EventPackage) => {
    setViewingPackage(null);

    const matched =
      products.find(
        (p) =>
          p.name.toLowerCase().includes(pkg.name.toLowerCase()) ||
          pkg.name.toLowerCase().includes(p.name.toLowerCase())
      ) || {
        _id: pkg.id,
        name: pkg.name,
        price: pkg.numericPrice,
        categoryName: 'Event Packages',
        description: pkg.description,
        image: '/exploreee.jpg',
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
    const text = "Hi The Decor Party! I'd like to plan a celebration. Can you help me customise a package?";
    window.open(`https://wa.me/${SUPPORT_PHONE}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <SeoHead
        title="Curated Celebration Packages — The Decor Party Bangalore"
        description="Explore thoughtfully curated event packages with transparent pricing, decor, activities, live eateries, and complimentary extras across Bengaluru."
        keywords={[
          'event packages bangalore',
          'birthday packages bengaluru',
          'surprise party packages bangalore',
          'balloon arch packages bangalore',
        ]}
        url="https://thedecorparty.com/packages"
        schema={[
          {
            '@type': 'ItemList',
            name: 'Curated Celebration Packages Bangalore',
            description: 'Thoughtfully curated celebration and decoration packages by The Decor Party in Bangalore.',
            numberOfItems: EVENT_PACKAGES.length,
            itemListElement: EVENT_PACKAGES.map((pkg, idx) => ({
              '@type': 'ListItem',
              position: idx + 1,
              name: pkg.name,
              description: pkg.tagline,
              url: 'https://thedecorparty.com/packages',
            })),
          },
        ]}
        breadcrumbs={[
          { name: 'Home', item: '/' },
          { name: 'Packages', item: '/packages' },
        ]}
      />

      <div className="flex flex-col w-full bg-[#FFF3E6] text-[#381932] font-poppins antialiased min-h-screen overflow-x-hidden">

        {/* ================================================================= */}
        {/* 1. HERO                                                           */}
        {/* ================================================================= */}
        <section className="relative w-full max-w-[1500px] mx-auto pt-14 sm:pt-20 pb-8 px-5 sm:px-8 text-center">
          <div className="pointer-events-none absolute -top-6 -left-16 h-72 w-72 rounded-[46%_54%_58%_42%] bg-[#A78A9F]/18 blur-3xl" />
          <Sprig className="pointer-events-none absolute top-10 right-4 hidden lg:block w-40 h-28 opacity-70" />

          <div className="relative flex flex-col items-center">
            <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#A78A9F] mb-3">
              <Heart size={11} className="fill-[#A78A9F] text-[#A78A9F]" />
              Curated Celebration Packages
            </span>

            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-[64px] font-bold uppercase tracking-tight text-[#381932] leading-[1.04] max-w-3xl">
              Celebrations, Curated to{' '}
              <span className="text-[#A78A9F]">Perfection</span>
            </h1>

            <p className="font-script text-xl sm:text-2xl text-[#A78A9F] mt-4">
              Thoughtfully designed packages for unforgettable moments.
            </p>
          </div>

          {/* Category filter */}
          <div
            id="package-tiers-list"
            className="mt-9 flex items-center justify-start sm:justify-center gap-2.5 overflow-x-auto pb-2 scrollbar-none px-1"
          >
            {(['ALL', ...CATEGORY_FILTERS] as CategoryFilterOption[]).map((filterKey) => {
              const isActive = activeFilter === filterKey;
              const label = filterKey === 'ALL' ? 'All Packages' : CATEGORY_META[filterKey].label;
              const Icon = filterKey === 'ALL' ? Sparkles : CATEGORY_META[filterKey].icon;
              return (
                <button
                  key={filterKey}
                  type="button"
                  onClick={() => {
                    setActiveFilter(filterKey);
                    setShowMore(false);
                  }}
                  className={`shrink-0 inline-flex items-center gap-2 rounded-full border px-4 sm:px-5 py-2.5 text-[11px] font-serif font-semibold uppercase tracking-wide transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'border-[#381932] bg-[#381932] text-[#FFF3E6] shadow-sm'
                      : 'border-[#E6D7C5] bg-[#FFF3E6] text-[#381932] hover:border-[#A78A9F]'
                  }`}
                >
                  <Icon size={12} />
                  {label}
                </button>
              );
            })}
          </div>
        </section>

        {/* ================================================================= */}
        {/* 2. PACKAGE GRID                                                   */}
        {/* ================================================================= */}
        <section className="w-full max-w-[1500px] mx-auto px-5 sm:px-8 pt-4 pb-16 sm:pb-24">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
            {primaryPackages.map((pkg, idx) => (
              <EventPackageCard
                key={pkg.id}
                pkg={pkg}
                index={idx}
                onView={setViewingPackage}
                onBook={handleBookPackage}
                wished={wishlistIds.includes(pkg.id)}
                onToggleWishlist={toggleWishlist}
              />
            ))}
          </div>

          {primaryPackages.length === 0 && (
            <div className="py-16 text-center text-sm text-[#381932]/70">
              No packages found in this category yet.
            </div>
          )}

          {extraPackages.length > 0 && (
            <div className="mt-9 flex justify-center">
              <button
                type="button"
                onClick={() => setShowMore((v) => !v)}
                className="inline-flex items-center gap-2 rounded-full border border-[#E6D7C5] bg-[#FFF3E6] px-6 py-3 text-[11px] font-serif font-semibold uppercase tracking-wider text-[#381932] hover:border-[#A78A9F] transition-colors cursor-pointer"
              >
                {showMore ? 'Hide Packages' : `View More Packages (${extraPackages.length})`}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
                {extraPackages.map((pkg, idx) => (
                  <EventPackageCard
                    key={pkg.id}
                    pkg={pkg}
                    index={idx}
                    onView={setViewingPackage}
                    onBook={handleBookPackage}
                    wished={wishlistIds.includes(pkg.id)}
                    onToggleWishlist={toggleWishlist}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </section>

        {/* ================================================================= */}
        {/* 3. TRUST / BENEFITS STRIP                                         */}
        {/* ================================================================= */}
        <section className="w-full bg-[#A78A9F]/10 border-y border-[#E6D7C5]">
          <div className="max-w-[1500px] mx-auto px-5 sm:px-8 py-10 sm:py-12 grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="flex flex-col items-center text-center gap-2.5 rounded-[18px] border border-[#E6D7C5] bg-[#FFF3E6] px-4 py-6 shadow-[0_10px_30px_-22px_rgba(56,25,50,0.4)] transition-transform duration-300 hover:-translate-y-1"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#A78A9F] text-[#FFF3E6] shadow-[0_8px_18px_-8px_rgba(167,138,159,0.9)]">
                  <b.icon size={18} />
                </span>
                <h4 className="font-serif text-[13px] font-bold uppercase tracking-tight text-[#381932] leading-tight">
                  {b.title}
                </h4>
                <p className="text-[11px] text-[#381932]/60 leading-snug">{b.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ================================================================= */}
        {/* 4. CUSTOM PACKAGE CTA                                             */}
        {/* ================================================================= */}
        <section className="w-full max-w-[1500px] mx-auto px-5 sm:px-8 py-12 sm:py-16">
          <div className="relative grid grid-cols-1 lg:grid-cols-2 overflow-hidden rounded-[24px] border border-[#E6D7C5] bg-[#A78A9F]/12 shadow-[0_28px_60px_-34px_rgba(56,25,50,0.3)]">
            <Sprig className="pointer-events-none absolute bottom-4 right-6 hidden lg:block w-40 h-28 rotate-180 opacity-55" />

              <div className="relative min-h-[220px] lg:min-h-[320px]">
              <picture className="absolute inset-0 block h-full w-full">
                <source type="image/webp" srcSet={CTA_IMAGE.replace(/\.jpg$/, '.webp')} />
                <img
                  src={CTA_IMAGE}
                  alt="The Decor Party candlelight celebration setup"
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src !== CTA_IMAGE) {
                      target.src = CTA_IMAGE;
                    }
                  }}
                />
              </picture>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#A78A9F]/25" />
            </div>

            <div className="relative flex flex-col justify-center gap-4 p-8 sm:p-12">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A78A9F]">
                Bespoke by design
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-[38px] font-bold uppercase leading-[1.08] tracking-tight text-[#381932]">
                Can&apos;t Find the Perfect Fit?
              </h2>
              <p className="text-sm font-poppins leading-relaxed text-[#381932]/80 max-w-md">
                Every celebration is different. We can customise a package around your
                taste, theme and budget.
              </p>
              <button
                type="button"
                onClick={openWhatsAppEnquiry}
                className="mt-1 inline-flex w-fit items-center gap-2 rounded-xl bg-[#381932] hover:bg-[#483250] text-[#FFF3E6] px-6 py-3.5 text-[11px] font-serif font-semibold uppercase tracking-wide shadow-[0_16px_34px_-16px_rgba(56,25,50,0.6)] transition-colors group/btn"
              >
                Let&apos;s Plan Together
                <ArrowRight size={13} className="transition-transform group-hover/btn:translate-x-0.5" />
              </button>
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
