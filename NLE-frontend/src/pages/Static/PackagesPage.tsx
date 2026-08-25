import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  MessageSquare,
  Clock,
  Shield,
  HeartHandshake,
  Heart,
  Gift,
  Flame,
  Check,
  Zap,
} from 'lucide-react';
import { SeoHead } from '../../components/layout/SeoHead';
import { useProducts } from '../../hooks/useProducts';
import type { AdminProduct } from '../../types';

export type PackageCategoryFilter =
  | 'ALL'
  | 'BIRTHDAYS'
  | 'ROMANTIC & PROPOSALS'
  | 'BABY SHOWERS'
  | 'ANNIVERSARIES'
  | 'FESTIVALS & HALDI'
  | 'KIDS ACTIVITIES'
  | 'CUSTOM';

const PACKAGE_FILTERS: PackageCategoryFilter[] = [
  'ALL',
  'BIRTHDAYS',
  'ROMANTIC & PROPOSALS',
  'BABY SHOWERS',
  'ANNIVERSARIES',
  'FESTIVALS & HALDI',
  'KIDS ACTIVITIES',
  'CUSTOM',
];

const SUPPORT_PHONE = '917022058460';

interface DetailedPackageInfo {
  id: string;
  tag: string;
  categoryFilter: PackageCategoryFilter;
  title: string;
  pricePrefix: string;
  price: string;
  numericPrice: number;
  desc: string;
  popular?: boolean;
  iconType: 'gift' | 'heart' | 'sparkles' | 'flame';
  inclusions: string[];
  specs: {
    duration: string;
    team: string;
    lights: string;
    customization: string;
  };
  productNameMatch: string;
}

const DETAILED_PACKAGES_DATA: DetailedPackageInfo[] = [
  {
    id: 'pkg-bday-1',
    tag: 'Birthday Milestone Packages',
    categoryFilter: 'BIRTHDAYS',
    title: 'SIGNATURE BALLOON ARCHES & CUSTOMIZED NEON BACKDROP',
    pricePrefix: 'Starting from',
    price: '₹2,499',
    numericPrice: 2499,
    desc: 'Tailored for milestone birthdays, first birthdays, and sweet 16 celebrations in Bengaluru.',
    popular: true,
    iconType: 'gift',
    inclusions: [
      'Circular 6ft metallic backdrop frame with organic chrome & pastel balloon garland',
      'Customized high-lumen LED neon sign ("Happy Birthday" / Custom Name / Milestone Age)',
      '3-hour same-day express setup guarantee with certified master decorators',
      'On-site warm ambient lighting, complete transportation, and 100% clean post-event teardown',
      'Wall-friendly non-marking painter tape mounts suitable for apartments and living rooms',
    ],
    specs: {
      duration: '45-60 Mins',
      team: '2 Certified Stylists',
      lights: 'Custom LED Neon + String Lights',
      customization: '100% Color Palette Choice',
    },
    productNameMatch: 'Birthday',
  },
  {
    id: 'pkg-romantic-1',
    tag: 'Romantic Experiences',
    categoryFilter: 'ROMANTIC & PROPOSALS',
    title: 'PRIVATE ROOFTOP CANOPY CABANA & CANDLELIGHT PATHWAY',
    pricePrefix: 'Starting from',
    price: '₹3,499',
    numericPrice: 3499,
    desc: 'Curated for wedding anniversaries, surprise date nights, and intimate rooftop terrace proposals.',
    popular: true,
    iconType: 'heart',
    inclusions: [
      'Sheer chiffon canopy cabana decorated with warm fairy micro-string lights',
      '50+ smokeless LED pillar candles & authentic fresh red rose petal walkway',
      'Customized romantic acrylic message board with fairy backlight accents',
      'Polite decorators who arrive promptly and style your space in absolute privacy',
      'Plush floor cushions, romantic lanterns, and tabletop dining setup included',
    ],
    specs: {
      duration: '75-90 Mins',
      team: '2 Master Stylists',
      lights: '50+ LED Candles & Fairylights',
      customization: 'Personalized Message Board',
    },
    productNameMatch: 'Cabana',
  },
  {
    id: 'pkg-proposal-1',
    tag: 'Marry Me Proposals',
    categoryFilter: 'ROMANTIC & PROPOSALS',
    title: 'GRAND MARRY ME 4FT ILLUMINATED LETTERS & FLORAL AISLE',
    pricePrefix: 'Starting from',
    price: '₹4,999',
    numericPrice: 4999,
    desc: 'Cinematic proposal setup featuring giant marquee letters, heart-shaped floral arches, and cold pyro effects.',
    popular: false,
    iconType: 'heart',
    inclusions: [
      '4ft tall illuminated warm-white "MARRY ME" giant marquee letters',
      'Fresh red Dutch rose petal walkway with 60+ glass votive LED candles',
      'Heart-shaped floral backdrop arch styled with ambient fairy lights',
      'Surprise coordination with sound system setup for your special proposal soundtrack',
      'Optional photographer coordination window for picture-perfect proposal moment',
    ],
    specs: {
      duration: '90 Mins',
      team: '3 Lead Stylists',
      lights: '4FT Marquee + LED Votives',
      customization: 'Custom Letters & Song Playlist',
    },
    productNameMatch: 'Proposal',
  },
  {
    id: 'pkg-baby-1',
    tag: 'Welcome & Celebrations',
    categoryFilter: 'BABY SHOWERS',
    title: 'DREAMY PASTEL BABY SHOWER & CRADLE WELCOME SETUP',
    pricePrefix: 'Starting from',
    price: '₹2,999',
    numericPrice: 2999,
    desc: 'Soft pastel cascades, plush teddy props, and customized cradle wreaths for expectant parents and new arrivals.',
    popular: false,
    iconType: 'sparkles',
    inclusions: [
      'Dual-tone pastel organic balloon installation (Blush / Mint / Baby Blue / Soft Yellow)',
      'Plush oversized teddy bear props, 3D cloud cutouts, and marquee welcome text',
      'Cradle floral ring styling with fresh baby’s breath florals and satin ribbons',
      'Delivered turnkey with zero setup hassle for the expectant parents and family',
      'Matching welcome easel stand with customized baby name / announcement signage',
    ],
    specs: {
      duration: '60 Mins',
      team: '2 Decorators',
      lights: 'Warm Fairy Accents',
      customization: 'Gender/Neutral Theme Palettes',
    },
    productNameMatch: 'Baby',
  },
  {
    id: 'pkg-fest-1',
    tag: 'Festivals & Haldi',
    categoryFilter: 'FESTIVALS & HALDI',
    title: 'TRADITIONAL YELLOW MARIGOLD DRAPES & BRASS URLI FLORALS',
    pricePrefix: 'Starting from',
    price: '₹3,999',
    numericPrice: 3999,
    desc: 'Vibrant marigold hangings, ethnic brass lamps, and photobooth canopies for Haldi ceremonies and traditional poojas.',
    popular: false,
    iconType: 'flame',
    inclusions: [
      'Traditional yellow & orange satin drapery with fresh marigold strings & mango leaf torans',
      'Handcrafted heavy brass urli bowl with floating blossoms and LED tea lights',
      'Ethnic backdrop for photo sessions with customized traditional signage',
      'Early setup guarantee ensuring pristine fresh blossoms before ritual muhurtham',
      'Traditional wooden bajot and festive brass props included for pooja setup',
    ],
    specs: {
      duration: '90 Mins',
      team: '2 Floral Artisans',
      lights: 'Brass Diyas & Fairy Drapes',
      customization: 'Fresh Flower Sourcing Guarantee',
    },
    productNameMatch: 'Haldi',
  },
  {
    id: 'pkg-anniv-1',
    tag: 'Anniversary Specials',
    categoryFilter: 'ANNIVERSARIES',
    title: 'LUXURY CANDLELIT LIVING ROOM & BALLOON CANOPY',
    pricePrefix: 'Starting from',
    price: '₹2,799',
    numericPrice: 2799,
    desc: 'Romantic surprise transformation for your bedroom or living room with ceiling balloon cascades and warm glowing candles.',
    popular: false,
    iconType: 'heart',
    inclusions: [
      '100+ ceiling floating balloons with metallic curled ribbons and hanging memory photos',
      'Heart-shaped bed styling with fresh rose petals and glowing LED fairy string lights',
      'Customized acrylic milestone anniversary board with couple’s names & dates',
      'Discreet installation team who prepares the surprise while you are away',
    ],
    specs: {
      duration: '45 Mins',
      team: '2 Stylists',
      lights: 'Bedside Micro Fairy Lights',
      customization: '15 Printed Couple Photos',
    },
    productNameMatch: 'Anniversary',
  },
  {
    id: 'pkg-kids-1',
    tag: 'Kids Entertainment & Games',
    categoryFilter: 'KIDS ACTIVITIES',
    title: 'KIDS THEME ZONE, TATTOO ARTIST & INTERACTIVE ENTERTAINMENT',
    pricePrefix: 'Starting from',
    price: '₹1,999',
    numericPrice: 1999,
    desc: 'High-energy kids birthday entertainment including professional tattoo artists, cartoon mascots, and fun party game hosting.',
    popular: true,
    iconType: 'sparkles',
    inclusions: [
      '2 Hours of professional skin-safe glitter tattoo and face art for all kids',
      'Certified kids entertainer / anchor hosting musical games and prize distribution',
      'Bespoke cartoon theme props & colorful balloon balloon-twisting swords and animals',
      'Full setup with sound system and kids party playlist included',
    ],
    specs: {
      duration: '2 Hours Live Coverage',
      team: 'Lead Artist & Assistant',
      lights: 'Interactive Party Sound System',
      customization: 'Choice of Cartoon Themes',
    },
    productNameMatch: 'Activities',
  },
  {
    id: 'pkg-custom-1',
    tag: 'Bespoke & Grand Stages',
    categoryFilter: 'CUSTOM',
    title: 'BESPOKE CELEBRATION STYLING & GRAND FLORAL TUNNEL',
    pricePrefix: 'Starting from',
    price: '₹7,999',
    numericPrice: 7999,
    desc: 'Fully customized large-scale stage setups, floral arches, neon tunnels, and designer backdrops for grand milestones.',
    popular: false,
    iconType: 'sparkles',
    inclusions: [
      '12ft wide custom stage backdrop with imported pampas grass and premium fresh blooms',
      'Multi-level acrylic plinths, customized 3D neon logo or monogram branding',
      'Dedicated Event Director on-site managing end-to-end styling and lighting',
      'Express 3D mockup consultation provided within 4 hours of booking',
    ],
    specs: {
      duration: '2.5 Hours Setup',
      team: 'Dedicated 4-Member Crew',
      lights: 'Studio Stage Spotlights + 3D Neon',
      customization: 'Full Bespoke Design Mockup',
    },
    productNameMatch: 'Custom',
  },
];

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
  const [activeFilter, setActiveFilter] = useState<PackageCategoryFilter>('ALL');

  const filteredPackages = useMemo(() => {
    if (activeFilter === 'ALL') return DETAILED_PACKAGES_DATA;
    return DETAILED_PACKAGES_DATA.filter((p) => p.categoryFilter === activeFilter);
  }, [activeFilter]);

  const handleBookPackage = (pkg: DetailedPackageInfo) => {
    // Find matched product from DB or construct fallback
    const matched = products.find(
      (p) =>
        p.name.toLowerCase().includes(pkg.productNameMatch.toLowerCase()) ||
        (p.categoryName && p.categoryName.toLowerCase().includes(pkg.productNameMatch.toLowerCase()))
    ) || {
      _id: pkg.id,
      name: pkg.title,
      price: pkg.numericPrice,
      categoryName: pkg.tag,
      description: pkg.desc,
      image: '/exploreee.jpeg',
      inclusions: pkg.inclusions,
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

  const openWhatsAppPackage = (pkg: DetailedPackageInfo) => {
    const text = `Hi TheDecorParty! I'm interested in booking the "${pkg.title}" (${pkg.tag} - ${pkg.price}). Can you please share availability and customization options?`;
    const url = `https://wa.me/${SUPPORT_PHONE}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
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
        title="Celebration Packages & Transparent Pricing — TheDecorParty"
        description="Explore detailed service inclusions, transparent fixed pricing, and turnkey setup specifications for all celebration packages across Bengaluru."
      />

      <div className="flex flex-col w-full bg-[#FAF8F5] dark:bg-[#1B101F] text-[#1C1B22] dark:text-[#FAF8F5] font-sans antialiased transition-colors min-h-screen">
        
        {/* ========================================================================= */}
        {/* 01 — EDITORIAL HERO HEADER                                               */}
        {/* ========================================================================= */}
        <section
          data-nav-theme="light"
          className="relative w-full pt-12 sm:pt-16 md:pt-20 pb-8 sm:pb-12 px-4 sm:px-6 md:px-8 lg:px-12 max-w-[1720px] mx-auto text-center"
        >
          {/* Ambient Lighting Orbs */}
          <div className="absolute top-10 left-1/4 w-96 h-96 rounded-full bg-[#8F6FC4]/10 blur-3xl pointer-events-none -z-10" />
          <div className="absolute top-28 right-1/4 w-96 h-96 rounded-full bg-[#C7B8E8]/12 blur-3xl pointer-events-none -z-10" />

          <div className="max-w-4xl mx-auto flex flex-col items-center">
            {/* Eyebrow Pill */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#8F6FC4]/06 dark:bg-white/10 border border-[#8F6FC4]/10 dark:border-white/15 text-xs font-bold uppercase tracking-[0.22em] text-[#6B6B76] dark:text-[#C9BEAB] mb-4 sm:mb-5"
            >
              <Sparkles size={13} className="text-[#8F6FC4]" />
              <span>TRANSPARENT PRICING &amp; DETAILED SPECIFICATIONS</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-normal tracking-tight text-[#1C1B22] dark:text-[#FAF8F5] leading-[1.12] mb-4 uppercase"
            >
              DETAILED SERVICE <span className="font-serif italic text-[#6B6B76] dark:text-[#C9BEAB] lowercase">Inclusions</span> &amp; TIERS
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xs sm:text-sm md:text-base font-light leading-relaxed text-[#6B6B76] dark:text-[#C8B5C3] max-w-2xl mb-8"
            >
              Every package is delivered turnkey with verified decorators, premium props, clean teardown, and 100% transparent fixed pricing — zero hidden fees.
            </motion.p>
          </div>

          {/* ========================================================================= */}
          {/* 02 — SEGMENTED CATEGORY TABS                                              */}
          {/* ========================================================================= */}
          <div
            id="package-tiers-list"
            className="mt-6 flex items-center justify-start sm:justify-center overflow-x-auto pb-3 scrollbar-none gap-2 px-2 max-w-full"
          >
            {PACKAGE_FILTERS.map((cat) => {
              const isActive = activeFilter === cat;
              const count =
                cat === 'ALL'
                  ? DETAILED_PACKAGES_DATA.length
                  : DETAILED_PACKAGES_DATA.filter((p) => p.categoryFilter === cat).length;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveFilter(cat)}
                  className={`relative shrink-0 rounded-full px-4 sm:px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#8F6FC4] text-[#FAF8F5] dark:bg-[#C9BEAB] dark:text-[#25172C] shadow-md scale-102'
                      : 'bg-[#8F6FC4]/06 text-[#6B6B76] hover:bg-[#8F6FC4]/12 hover:text-[#1C1B22] dark:bg-white/06 dark:text-[#C8B5C3] dark:hover:bg-white/12 dark:hover:text-white'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black'
                        : 'bg-[#8F6FC4]/10 dark:bg-white/10 text-[#6B6B76] dark:text-[#DDD5C7]'
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
        {/* 03 — TEXT-RICH DETAILED PACKAGES GRID                                     */}
        {/* ========================================================================= */}
        <section className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 pb-16 sm:pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
            {filteredPackages.map((pkg, idx) => {
              const Icon =
                pkg.iconType === 'heart'
                  ? Heart
                  : pkg.iconType === 'sparkles'
                  ? Sparkles
                  : pkg.iconType === 'flame'
                  ? Flame
                  : Gift;

              return (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: (idx % 4) * 0.08 }}
                  className={`group relative flex flex-col justify-between rounded-[28px] sm:rounded-[32px] p-6 sm:p-7 shadow-xl transition-all duration-300 hover:-translate-y-1.5 ${
                    pkg.popular
                      ? 'bg-gradient-to-b from-[#2B142F] to-[#1D0E20] border-2 border-[#C7B8E8]/60 shadow-[0_20px_50px_rgba(52,32,60,0.25)]'
                      : 'bg-gradient-to-b from-[#26112A] to-[#190C1C] border border-[#8F6FC4]/20 hover:border-[#C7B8E8]/40'
                  } text-[#FAF8F5]`}
                >
                  {/* Top Inner Header Box */}
                  <div>
                    <div className="rounded-2xl p-4 sm:p-5 mb-5 border border-[#8F6FC4]/25 bg-[#8F6FC4]/85 shadow-inner backdrop-blur-md transition-all duration-300 group-hover:border-[#C7B8E8]/40 group-hover:bg-[#483250]/90">
                      {/* Tag & Popular Badge */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-[#C7B8E8] text-xs font-bold uppercase tracking-wider min-w-0">
                          <Icon size={14} className="text-[#C7B8E8] flex-shrink-0" />
                          <span className="truncate">{pkg.tag}</span>
                        </div>
                        {pkg.popular && (
                          <span className="rounded-full border border-[#C7B8E8]/50 bg-[#C7B8E8] text-[#25172C] px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider shadow-xs flex-shrink-0">
                            Popular Choice
                          </span>
                        )}
                      </div>

                      {/* Price Display */}
                      <div className="flex items-baseline justify-between mt-3 mb-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-semibold text-[#E4DEF2]/75 uppercase tracking-wider">
                            {pkg.pricePrefix}
                          </span>
                          <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#FAF8F5]">
                            {pkg.price}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#E4DEF2]/60 italic">
                          / complete setup
                        </span>
                      </div>

                      {/* Primary Book This Package Action Button */}
                      <button
                        type="button"
                        onClick={() => handleBookPackage(pkg)}
                        className="flex items-center justify-center gap-1.5 w-full rounded-full bg-[#C7B8E8] hover:bg-[#FAF8F5] text-[#1C1B22] py-2.5 px-4 text-xs font-bold uppercase tracking-wider shadow-md transition-all duration-300 hover:scale-102 active:scale-95 cursor-pointer"
                      >
                        <span>Book This Package</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>

                    {/* Package Title */}
                    <h3 className="font-serif text-base sm:text-lg font-bold uppercase tracking-[0.03em] leading-snug text-[#FAF8F5] mb-2 group-hover:text-[#C7B8E8] transition-colors">
                      {pkg.title}
                    </h3>

                    {/* Description Paragraph */}
                    <p className="text-xs font-light leading-relaxed text-[#E4DEF2]/85 mb-5">
                      {pkg.desc}
                    </p>

                    {/* Quick Specs Badges */}
                    <div className="grid grid-cols-2 gap-2 mb-5 p-3 rounded-xl bg-white/05 border border-white/10 text-[10px] text-[#E4DEF2]">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} className="text-[#C7B8E8] shrink-0" />
                        <span>{pkg.specs.duration}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Shield size={12} className="text-[#C7B8E8] shrink-0" />
                        <span>{pkg.specs.team}</span>
                      </div>
                    </div>

                    {/* What's Included / Bulleted Checkmarks List */}
                    <div className="border-t border-white/10 pt-4 mb-5">
                      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#C7B8E8] block mb-3">
                        What's Included:
                      </span>
                      <div className="space-y-2.5">
                        {pkg.inclusions.map((inc, incIdx) => (
                          <div key={incIdx} className="flex items-start gap-2 text-xs font-light leading-snug text-[#F2EEFA]/90">
                            <CheckCircle2 size={14} className="text-[#C7B8E8] flex-shrink-0 mt-0.5" />
                            <span>{inc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Secondary WhatsApp Link */}
                  <div className="pt-4 border-t border-white/10 mt-auto">
                    <button
                      type="button"
                      onClick={() => openWhatsAppPackage(pkg)}
                      className="inline-flex items-center justify-center gap-1.5 w-full text-[11px] font-semibold text-[#E4DEF2] hover:text-emerald-400 transition-colors cursor-pointer py-1"
                    >
                      <MessageSquare size={13} className="text-emerald-400" />
                      <span>Customise via WhatsApp</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 04 — COMPLETE PACKAGE COMPARISON & INCLUSIONS MATRIX                       */}
        {/* ========================================================================= */}
        <section
          data-nav-theme="light"
          className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 pb-16 sm:pb-24"
        >
          <div className="rounded-[32px] sm:rounded-[40px] border border-[#E4DEF2] dark:border-[#483250] bg-white/80 dark:bg-[#201325]/90 p-6 sm:p-10 lg:p-12 shadow-xl backdrop-blur-md">
            <div className="max-w-3xl mb-8">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#6B6B76] dark:text-[#C9BEAB] mb-2">
                <Zap size={13} className="text-[#8F6FC4]" />
                TIER COMPARISON SPECIFICATIONS
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-normal uppercase tracking-tight text-[#1C1B22] dark:text-[#FAF8F5]">
                What Makes Every Tier Distinct
              </h2>
              <p className="text-xs sm:text-sm text-[#6B6B76] dark:text-[#C8B5C3] font-light mt-2 leading-relaxed">
                Compare features across standard birthday packages, romantic cabanas, and bespoke luxury setups.
              </p>
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[#E4DEF2] dark:border-[#483250] text-[#1C1B22] dark:text-[#FAF8F5] uppercase tracking-wider text-[11px] font-bold">
                    <th className="py-4 pr-4">Service Feature</th>
                    <th className="py-4 px-4">Standard Balloon Arch (₹2,499)</th>
                    <th className="py-4 px-4 bg-[#8F6FC4]/04 dark:bg-white/04 rounded-t-xl">Cabana &amp; Rooftop (₹3,499)</th>
                    <th className="py-4 pl-4">Bespoke Grand Stage (₹7,999)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4DEF2]/60 dark:divide-[#483250]/60 text-[#6B6B76] dark:text-[#C8B5C3] font-light">
                  <tr>
                    <td className="py-4 pr-4 font-medium text-[#1C1B22] dark:text-[#FAF8F5]">Backdrop Structure</td>
                    <td className="py-4 px-4">6ft Metallic Ring Frame</td>
                    <td className="py-4 px-4 bg-[#8F6FC4]/04 dark:bg-white/04">Sheer Chiffon Canopy Cabana</td>
                    <td className="py-4 pl-4">12ft Grand Stage with Acrylic Plinths</td>
                  </tr>
                  <tr>
                    <td className="py-4 pr-4 font-medium text-[#1C1B22] dark:text-[#FAF8F5]">Neon &amp; Signage</td>
                    <td className="py-4 px-4">LED Neon Sign Included</td>
                    <td className="py-4 px-4 bg-[#8F6FC4]/04 dark:bg-white/04">Customized Romantic Message Board</td>
                    <td className="py-4 pl-4">3D Custom Acrylic Name / Monogram</td>
                  </tr>
                  <tr>
                    <td className="py-4 pr-4 font-medium text-[#1C1B22] dark:text-[#FAF8F5]">Lighting Elements</td>
                    <td className="py-4 px-4">Ambient String Lights</td>
                    <td className="py-4 px-4 bg-[#8F6FC4]/04 dark:bg-white/04">50+ Smokeless LED Pillar Candles</td>
                    <td className="py-4 pl-4">Studio Focus Spotlights + Fairylights</td>
                  </tr>
                  <tr>
                    <td className="py-4 pr-4 font-medium text-[#1C1B22] dark:text-[#FAF8F5]">On-Site Stylists</td>
                    <td className="py-4 px-4">2 Certified Decorators</td>
                    <td className="py-4 px-4 bg-[#8F6FC4]/04 dark:bg-white/04">2 Master Stylists</td>
                    <td className="py-4 pl-4">4-Member Crew + Dedicated Event Lead</td>
                  </tr>
                  <tr>
                    <td className="py-4 pr-4 font-medium text-[#1C1B22] dark:text-[#FAF8F5]">Setup Time Guarantee</td>
                    <td className="py-4 px-4">45-60 Minutes</td>
                    <td className="py-4 px-4 bg-[#8F6FC4]/04 dark:bg-white/04">75-90 Minutes</td>
                    <td className="py-4 pl-4">2.5 Hours Complete Staging</td>
                  </tr>
                  <tr>
                    <td className="py-4 pr-4 font-medium text-[#1C1B22] dark:text-[#FAF8F5]">Post-Event Teardown</td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <Check size={14} /> 100% Clean Teardown
                      </span>
                    </td>
                    <td className="py-4 px-4 bg-[#8F6FC4]/04 dark:bg-white/04">
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <Check size={14} /> 100% Clean Teardown
                      </span>
                    </td>
                    <td className="py-4 pl-4">
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <Check size={14} /> VIP Priority Teardown
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 05 — THE DECOR PARTY PROMISE & GUARANTEE                                  */}
        {/* ========================================================================= */}
        <section
          data-nav-theme="dark"
          className="relative w-full py-16 sm:py-20 lg:py-24 px-4 sm:px-6 md:px-8 lg:px-12 text-[#FAF8F5] text-center border-t border-white/10"
          style={{
            background: 'linear-gradient(145deg, #26112A 0%, #371A3F 55%, #46224F 100%)',
          }}
        >
          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center gap-5 sm:gap-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-bold uppercase tracking-[0.22em] text-[#C7B8E8]">
              <HeartHandshake size={13} className="text-[#C7B8E8]" />
              <span>THE DECOR PARTY PROMISE</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight leading-[1.12] text-[#FAF8F5] uppercase">
              YOUR CELEBRATION.{' '}
              <span className="font-serif italic text-[#C7B8E8] block sm:inline lowercase">
                Your style. Your moment.
              </span>
            </h2>

            <p className="text-xs sm:text-sm md:text-base font-light text-[#F2EEFA]/85 max-w-xl leading-relaxed">
              Transparent fixed pricing with guaranteed punctual arrival anywhere in Bengaluru.
            </p>

            <button
              type="button"
              onClick={scrollToCatalog}
              className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#8F6FC4] to-[#A48ED0] hover:from-[#C7B8E8] hover:to-[#8F6FC4] px-8 sm:px-10 py-3.5 sm:py-4 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#FAF8F5] hover:text-[#25172C] shadow-xl hover:scale-103 active:scale-95 transition-all cursor-pointer"
            >
              <span>EXPLORE ALL PACKAGES</span>
              <ArrowRight size={15} />
            </button>

            {/* Micro guarantees */}
            <div className="mt-4 pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-[11px] sm:text-xs text-[#FAF8F5]/75 font-medium tracking-wide">
              <span className="flex items-center gap-1.5">
                <Clock size={13} className="text-[#C7B8E8]" />
                <span>Express 3-Hour Setup</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Shield size={13} className="text-[#C7B8E8]" />
                <span>100% Picture-Match Guarantee</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-[#C7B8E8]" />
                <span>No Hidden Fees</span>
              </span>
            </div>
          </div>
        </section>

      </div>
    </>
  );
};

export default PackagesPage;
