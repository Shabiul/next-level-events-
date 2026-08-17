import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Shield,
  Clock,
  ArrowRight,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  MapPin,
  CalendarDays,
  Search,
  Phone,
  Layers,
  Gift,
  Heart,
  Flame
} from 'lucide-react';
import { motion } from 'framer-motion';
import { HeroSlider } from '../../components/product/HeroSlider';
import { CategoryGrid } from '../../components/category/CategoryGrid';
import { Button } from '../../components/ui/Button';
import TabbedFAQ from '../../components/ui/TabbedFAQ';
import { WhyChooseUs } from '../../components/ui/WhyChooseUs';
import { AnimatedNumber } from '../../components/core/animated-number';
import InfiniteTestimonials from '../../components/ui/InfiniteTestimonials';
import { GradientBoldCard } from '../../components/ui/GradientBoldCard';
import { GlowingImageCard } from '../../components/ui/GlowingImageCard';
import { TiltGlareCard } from '../../components/ui/TiltGlareCard';
import { ParallaxTourCard } from '../../components/ui/ParallaxTourCard';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { cn } from '../../utils/utils';
import type { AdminCategory, AdminProduct } from '../../types';

interface HomePageProps {
  categories: AdminCategory[];
  onSelectCategory: (categoryName: string, subcategoryName?: string) => void;
  onViewProduct: (product: AdminProduct) => void;
  onBookProduct: (product: AdminProduct) => void;
}

// 1. FLOATING SELECTOR MODE TABS
const SELECTOR_TABS = [
  { id: 'birthdays', label: 'Birthday Setups', query: 'Birthday', icon: '🎂' },
  { id: 'romantic', label: 'Candlelight & Cabana', query: 'Romantic', icon: '🕯️' },
  { id: 'proposals', label: 'Marry Me & Proposal', query: 'Proposal', icon: '💍' },
  { id: 'baby-shower', label: 'Baby Shower & Welcome', query: 'Baby Shower', icon: '👶' },
  { id: 'festivals', label: 'Haldi & Festivals', query: 'Festivals', icon: '🌸' },
];

// 3. SIGNATURE PACKAGES SHOWCASE (Editorial Card Layout)
const SIGNATURE_COLLECTIONS = [
  {
    id: 'c1',
    name: 'Candlelight & Cabana Setups',
    type: 'Romantic Special',
    tag: 'Top Rated',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop&q=80',
    desc: 'Private sheer canopy cabana with fresh rose petal walkways, fairy lights, and intimate candlelit dining styled at your home or terrace.',
    popularSetup: 'Dreamy Rooftop Cabana',
    specs: ['🕯️ 50+ LED Lights', '🌹 Fresh Petals', '⏱️ 75m Setup'],
    price: '₹2,499',
    unit: '/ complete setup',
    categoryKey: 'Romantic Experiences',
  },
  {
    id: 'c2',
    name: 'Milestone Birthday Arches',
    type: 'Birthday Milestone',
    tag: 'Best Seller',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&fit=crop&q=80',
    desc: 'Artisanal pastel balloon ring installations with customized LED neon signage, organic garlands, and photo-ready backdrop styling.',
    popularSetup: 'Pastel Ring Arch & Neon',
    specs: ['🎂 All Ages', '💡 Neon Included', '⏱️ 60m Setup'],
    price: '₹2,499',
    unit: '/ complete setup',
    categoryKey: 'Birthdays',
  },
  {
    id: 'c3',
    name: 'Grand Proposals & Marry Me',
    type: 'Grand Proposal',
    tag: 'Cinematic',
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&auto=format&fit=crop&q=80',
    desc: 'Giant 4-foot illuminated marquee letters with plush red carpet walkways, romantic heart balloon arches, lanterns, and mood lighting.',
    popularSetup: '4FT Illuminated Marry Me',
    specs: ['💍 4ft Marquee', '🔴 Red Carpet', '⏱️ 90m Setup'],
    price: '₹4,999',
    unit: '/ complete setup',
    categoryKey: 'Anniversary',
  },
  {
    id: 'c4',
    name: 'Baby Shower & Welcome Baby',
    type: 'Welcome Baby',
    tag: 'Cherished',
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&auto=format&fit=crop&q=80',
    desc: 'Pastel blue & blush pink organic balloon cascades with plush teddy bear props, custom welcome signage, and bespoke cradle styling.',
    popularSetup: 'Teddy Bear & Clouds Arch',
    specs: ['👶 Cradle Styling', '☁️ Cloud Props', '⏱️ 60m Setup'],
    price: '₹2,999',
    unit: '/ complete setup',
    categoryKey: 'Baby Shower',
  },
  {
    id: 'c5',
    name: 'Traditional Marigold & Floral Drapes',
    type: 'Haldi & Festive',
    tag: 'Vibrant',
    image: 'https://images.unsplash.com/photo-1602631985686-1bb0e6a8696e?w=800&auto=format&fit=crop&q=80',
    desc: 'Draped yellow & orange canopies, brass urlis with floating blossoms, and traditional photobooths.',
    specs: ['🌸 Fresh Flowers', '🪔 Brass Urli', '⏱️ 90m Setup'],
    price: '₹3,999',
    unit: '/ complete setup',
    categoryKey: 'Festivals',
  },
  {
    id: 'c6',
    name: 'Corporate Stage & Brand Arch Gala',
    type: 'Corporate Gala',
    tag: 'Professional',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=80',
    desc: 'Custom brand color balloon columns, stage stagecraft, entrance arches, and GST compliant invoicing.',
    specs: ['🏢 Brand Logo', '🎤 Stage Backdrop', '⏱️ 120m Setup'],
    price: '₹5,999',
    unit: '/ complete setup',
    categoryKey: 'Corporate',
  },
];

// 5. PINTEREST-STYLE MASONRY GALLERY ITEMS
const GALLERY_ITEMS = [
  {
    id: 'g1',
    title: 'Pastel Lilac Ring Arch',
    category: 'Birthdays',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&auto=format&fit=crop&q=80',
    aspect: 'aspect-[3/4]',
    tag: '1st Birthday',
    price: '₹2,499',
  },
  {
    id: 'g2',
    title: 'Rooftop Candlelight Cabana',
    category: 'Romantic Experiences',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&auto=format&fit=crop&q=80',
    aspect: 'aspect-[4/3]',
    tag: 'Anniversary',
    price: '₹3,499',
  },
  {
    id: 'g3',
    title: 'Teddy Clouds Baby Welcome',
    category: 'Baby Shower',
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&auto=format&fit=crop&q=80',
    aspect: 'aspect-[3/4]',
    tag: 'Baby Shower',
    price: '₹2,999',
  },
  {
    id: 'g4',
    title: 'Haldi Marigold Canopy',
    category: 'Festivals',
    image: 'https://images.unsplash.com/photo-1602631985686-1bb0e6a8696e?w=600&auto=format&fit=crop&q=80',
    aspect: 'aspect-[4/5]',
    tag: 'Haldi Special',
    price: '₹3,999',
  },
  {
    id: 'g5',
    title: 'Metallic Chrome Backdrop Arch',
    category: 'Balloon Decor',
    image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop&q=80',
    aspect: 'aspect-[3/4]',
    tag: 'Chrome Ring',
    price: '₹2,799',
  },
  {
    id: 'g6',
    title: 'Marry Me 4FT Giant Letters',
    category: 'Anniversary',
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&auto=format&fit=crop&q=80',
    aspect: 'aspect-[4/3]',
    tag: 'Proposal',
    price: '₹4,999',
  },
  {
    id: 'g7',
    title: 'Boho Pampas Grass Backdrop',
    category: 'Weddings',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80',
    aspect: 'aspect-[3/4]',
    tag: 'Boho Luxe',
    price: '₹4,499',
  },
  {
    id: 'g8',
    title: 'Grand Floral Entrance Tunnel',
    category: 'Weddings',
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&auto=format&fit=crop&q=80',
    aspect: 'aspect-[4/5]',
    tag: 'Grand Wedding',
    price: '₹7,999',
  },
];

// 6. DETAILED SERVICES INCLUSIONS BREAKDOWN
const DETAILED_SERVICES = [
  {
    tag: 'Birthday Milestone Packages',
    title: 'SIGNATURE BALLOON ARCHES & CUSTOMIZED NEON BACKDROP',
    pricePrefix: 'Starting from',
    price: '₹2,499',
    desc: 'Tailored for milestone birthdays, first birthdays, and sweet 16 celebrations in Bengaluru.',
    category: 'Birthdays',
    iconType: 'gift',
    popular: false,
    inclusions: [
      'Circular 6ft metallic backdrop frame with organic chrome balloon garland',
      'Customized LED neon sign ("Happy Birthday" / Name / Milestone Age)',
      '3-hour same-day slot guarantee with certified master stylists',
      'On-site lighting, transport, and 100% clean post-event teardown',
    ],
  },
  {
    tag: 'Romantic Experiences',
    title: 'PRIVATE ROOFTOP CANOPY CABANA & CANDLELIGHT PATHWAY',
    pricePrefix: 'Starting from',
    price: '₹3,499',
    desc: 'Curated for wedding anniversaries, surprise date nights, and intimate rooftop proposals.',
    category: 'Romantic Experiences',
    iconType: 'heart',
    popular: true,
    inclusions: [
      'Sheer canopy cabana decorated with fairy micro-string lights',
      '50+ smokeless LED pillar candles & authentic fresh red rose petal walkway',
      'Customized romantic acrylic message board with fairy lights',
      'Polite decorators who style your space in absolute privacy',
    ],
  },
  {
    tag: 'Welcome & Celebrations',
    title: 'DREAMY PASTEL BABY SHOWER & CRADLE WELCOME SETUP',
    pricePrefix: 'Starting from',
    price: '₹2,999',
    desc: 'Soft pastel cascades, plush teddy props, and customized cradle wreaths for the new arrival.',
    category: 'Baby Shower',
    iconType: 'sparkles',
    popular: false,
    inclusions: [
      'Dual-tone pastel organic balloon installation (Blush / Mint / Baby Blue)',
      'Plush oversized teddy bear props, cloud cutouts, and marquee text',
      'Cradle floral ring styling with fresh baby’s breath florals',
      'Delivered turnkey with zero setup hassle for the expectant parents',
    ],
  },
  {
    tag: 'Festivals & Haldi',
    title: 'TRADITIONAL YELLOW MARIGOLD DRAPES & BRASS URLI FLORALS',
    pricePrefix: 'Starting from',
    price: '₹3,999',
    desc: 'Vibrant marigold hangings, ethnic brass lamps, and photobooth canopies for Haldi ceremonies.',
    category: 'Festivals',
    iconType: 'flame',
    popular: false,
    inclusions: [
      'Traditional yellow & orange satin drapery with fresh marigold strings',
      'Handcrafted brass urli bowl with floating blossoms and LED tea lights',
      'Ethnic backdrop for photo sessions with customized signage',
      'Early setup guarantee ensuring pristine blossoms before rituals start',
    ],
  },
];

// 7. STEP-BY-STEP PROCESS JOURNEY
const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Choose Your Occasion',
    desc: 'Browse our curated collection of verified balloon arches, candlelight cabanas, and festive setups.',
  },
  {
    step: '02',
    title: 'Select Date & Location',
    desc: 'Choose your event date and Bengaluru area. Select express 3-hour same-day or future schedule.',
  },
  {
    step: '03',
    title: 'Bespoke Customization',
    desc: 'Add personalized neon signs, color choices, milestone numbers, or talk directly with lead stylists on WhatsApp.',
  },
  {
    step: '04',
    title: 'Flawless Setup at Your Door',
    desc: 'Certified master decorators arrive on-time with all props and transform your venue into a dream celebration.',
  },
];





export const HomePage: React.FC<HomePageProps> = ({
  categories,
  onSelectCategory,
  onViewProduct: _onViewProduct,
  onBookProduct: _onBookProduct,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Floating filter form state
  const [activeTab, setActiveTab] = useState('birthdays');
  const [pickupArea, setPickupArea] = useState('');
  const [themeInput, setThemeInput] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [spaceType, setSpaceType] = useState('');

  // Initialize clean scroll reveal effects
  useScrollReveal();

  // Handle incoming hash anchors from navigation with smooth scroll & sticky navbar offset
  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace('#', '');
      if (targetId) {
        const timer = setTimeout(() => {
          const el = document.getElementById(targetId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 120);
        return () => clearTimeout(timer);
      }
    }
  }, [location.hash]);

  const handleBookingSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const queryParts: string[] = [];
    if (pickupArea) queryParts.push(pickupArea);
    if (themeInput) queryParts.push(themeInput);
    if (spaceType) queryParts.push(spaceType);
    const tabObj = SELECTOR_TABS.find(t => t.id === activeTab);
    if (tabObj && !themeInput) {
      queryParts.push(tabObj.query);
    }
    const q = queryParts.join(' ').trim() || 'all';
    navigate(`/explore?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="flex flex-col pb-0 bg-[#FAF8F5] dark:bg-[#1B101F] text-[#34203C] dark:text-[#FAF8F5] font-sans antialiased transition-colors">

      {/* ========================================================================= */}
      {/* 1. HERO SLIDER SECTION                                                    */}
      {/* ========================================================================= */}
      <section data-nav-theme="dark" className="relative w-full">
        <HeroSlider />
      </section>

      {/* ========================================================================= */}
      {/* 2. CELEBRATION FINDER (Embedded In-Page Search Capsule)                   */}
      {/* ========================================================================= */}
      <section id="celebration-finder" data-nav-theme="light" className="relative z-20 -mt-16 pb-10 sm:-mt-20 sm:pb-14">
        <div className="mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-12 flex flex-col items-center gap-4">
          
          {/* Top Category Mode Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto rounded-full bg-[#34203C]/40 p-1.5 backdrop-blur-md border border-[#C9BEAB]/30 shadow-xl max-w-full hide-scrollbar">
            {SELECTOR_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'rounded-full px-4 py-2 text-xs sm:text-sm font-semibold tracking-wide transition-colors whitespace-nowrap cursor-pointer',
                  activeTab === tab.id
                    ? 'bg-[#FAF8F5] text-[#34203C] shadow-md font-bold'
                    : 'text-[#FAF8F5]/85 hover:text-[#FAF8F5] hover:bg-white/10'
                )}
              >
                <span className="mr-1.5">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Floating Search Capsule Bar */}
          <div className="w-full">
            <form
              onSubmit={handleBookingSearch}
              className="mx-auto flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-[#FAF8F5]/95 shadow-2xl border border-[#DDD5C7]/80 backdrop-blur-xl dark:bg-[#2D1C34]/95 dark:border-[#483250] lg:flex-row lg:items-center lg:rounded-full lg:p-2"
            >
              {/* Location Input */}
              <label className="flex flex-1 cursor-text flex-col gap-1 border-b border-[#34203C]/8 px-5 py-3.5 transition-colors last:border-b-0 dark:border-[#483250] lg:border-b-0 lg:px-5 lg:py-2 lg:rounded-full lg:hover:bg-[#34203C]/5 dark:lg:hover:bg-[#FAF8F5]/5">
                <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#34203C] dark:text-[#C9BEAB]">
                  <MapPin size={14} className="text-[#A78A9F]" />
                  <span>Setup Location</span>
                </span>
                <input
                  type="text"
                  placeholder="e.g. Indiranagar, Whitefield"
                  value={pickupArea}
                  onChange={(e) => setPickupArea(e.target.value)}
                  className="w-full border-none bg-transparent p-0 text-sm font-medium text-[#34203C] placeholder:text-[#725D75]/60 focus:outline-none dark:text-[#FAF8F5] dark:placeholder:text-[#A78A9F]/60"
                />
              </label>

              <div className="mx-1 hidden h-8 w-px shrink-0 self-center bg-[#DDD5C7] dark:bg-[#483250] lg:block" />

              {/* Theme / Style Input */}
              <label className="flex flex-1 cursor-text flex-col gap-1 border-b border-[#34203C]/8 px-5 py-3.5 transition-colors last:border-b-0 dark:border-[#483250] lg:border-b-0 lg:px-5 lg:py-2 lg:rounded-full lg:hover:bg-[#34203C]/5 dark:lg:hover:bg-[#FAF8F5]/5">
                <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#34203C] dark:text-[#C9BEAB]">
                  <Sparkles size={14} className="text-[#A78A9F]" />
                  <span>Occasion / Vibe</span>
                </span>
                <input
                  type="text"
                  placeholder="e.g. Pastel Ring, Cabana"
                  value={themeInput}
                  onChange={(e) => setThemeInput(e.target.value)}
                  className="w-full border-none bg-transparent p-0 text-sm font-medium text-[#34203C] placeholder:text-[#725D75]/60 focus:outline-none dark:text-[#FAF8F5] dark:placeholder:text-[#A78A9F]/60"
                />
              </label>

              <div className="mx-1 hidden h-8 w-px shrink-0 self-center bg-[#DDD5C7] dark:bg-[#483250] lg:block" />

              {/* Date Input */}
              <label className="flex flex-1 cursor-text flex-col gap-1 border-b border-[#34203C]/8 px-5 py-3.5 transition-colors last:border-b-0 dark:border-[#483250] lg:border-b-0 lg:px-5 lg:py-2 lg:rounded-full lg:hover:bg-[#34203C]/5 dark:lg:hover:bg-[#FAF8F5]/5">
                <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#34203C] dark:text-[#C9BEAB]">
                  <CalendarDays size={14} className="text-[#A78A9F]" />
                  <span>Celebration Date</span>
                </span>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full border-none bg-transparent p-0 text-sm font-medium text-[#34203C] placeholder:text-[#725D75]/60 focus:outline-none dark:text-[#FAF8F5] cursor-pointer"
                />
              </label>

              <div className="mx-1 hidden h-8 w-px shrink-0 self-center bg-[#DDD5C7] dark:bg-[#483250] lg:block" />

              {/* Space / Guests */}
              <label className="flex flex-1 cursor-text flex-col gap-1 border-b border-[#34203C]/8 px-5 py-3.5 transition-colors last:border-b-0 dark:border-[#483250] lg:border-b-0 lg:px-5 lg:py-2 lg:rounded-full lg:hover:bg-[#34203C]/5 dark:lg:hover:bg-[#FAF8F5]/5">
                <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#34203C] dark:text-[#C9BEAB]">
                  <Layers size={14} className="text-[#A78A9F]" />
                  <span>Space Type</span>
                </span>
                <input
                  type="text"
                  placeholder="Living Room, Terrace"
                  value={spaceType}
                  onChange={(e) => setSpaceType(e.target.value)}
                  className="w-full border-none bg-transparent p-0 text-sm font-medium text-[#34203C] placeholder:text-[#725D75]/60 focus:outline-none dark:text-[#FAF8F5] dark:placeholder:text-[#A78A9F]/60"
                />
              </label>

              {/* Submit CTA Button in Radiant Lilac */}
              <div className="p-3 lg:p-0 lg:pl-2">
                <button
                  type="submit"
                  aria-label="Search decoration setups"
                  className="group flex h-12 w-full lg:w-12 items-center justify-center gap-2 rounded-2xl lg:rounded-full bg-[#A78A9F] text-[#34203C] hover:bg-[#C9BEAB] shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Search size={18} />
                  <span className="text-xs font-bold uppercase tracking-wider lg:hidden">Search Setups</span>
                </button>
              </div>
            </form>
          </div>

          {/* Quick AI Planner Trigger Prompt */}
          <div className="flex items-center justify-center gap-2 pt-1 text-center">
            <button
              type="button"
              onClick={() => navigate('/ai-planner')}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#34203C]/50 hover:bg-[#34203C]/70 dark:bg-white/10 dark:hover:bg-white/15 border border-[#C9BEAB]/35 text-xs font-medium text-[#FAF8F5] transition-all hover:scale-102 cursor-pointer shadow-sm backdrop-blur-md"
            >
              <Sparkles size={13} className="text-[#C9BEAB]" />
              <span>Need custom theme ideas? <span className="font-semibold text-[#C9BEAB] hover:underline">Ask our AI Celebration Planner →</span></span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. TRUST MARQUEE SECTION                                                 */}
      {/* ========================================================================= */}
      <div id="trust-marquee" data-nav-theme="light" className="relative z-10 overflow-hidden bg-[#C9BEAB] py-3.5 text-[#34203C] border-y border-[#B8AC98] shadow-xs">
        <div className="animate-marquee whitespace-nowrap text-[13px] font-medium tracking-wide">
          <span className="mx-6 inline-flex items-center gap-2">
            <Shield size={16} /> Verified Master Stylists
          </span>
          <span className="mx-6 inline-flex items-center gap-2">
            <Clock size={16} /> Express 3-Hour Setup
          </span>
          <span className="mx-6 inline-flex items-center gap-2">
            <MapPin size={16} /> All Bengaluru Locations
          </span>
          <span className="mx-6 inline-flex items-center gap-2">
            <CheckCircle2 size={16} /> 100% Picture-Match Guarantee
          </span>
          <span className="mx-6 inline-flex items-center gap-2">
            <Sparkles size={16} /> Zero Hidden Fees
          </span>
          <span className="mx-6 inline-flex items-center gap-2">
            <Shield size={16} /> Verified Master Stylists
          </span>
          <span className="mx-6 inline-flex items-center gap-2">
            <Clock size={16} /> Express 3-Hour Setup
          </span>
          <span className="mx-6 inline-flex items-center gap-2">
            <MapPin size={16} /> All Bengaluru Locations
          </span>
          <span className="mx-6 inline-flex items-center gap-2">
            <CheckCircle2 size={16} /> 100% Picture-Match Guarantee
          </span>
          <span className="mx-6 inline-flex items-center gap-2">
            <Sparkles size={16} /> Zero Hidden Fees
          </span>
        </div>
      </div>

      {/* Main Content Sections Container with compact, clean vertical spacing */}
      <div className="flex flex-col gap-8 sm:gap-10 lg:gap-12 pt-6 sm:pt-8 lg:pt-10">

      {/* ========================================================================= */}
      {/* 4. ABOUT THEDECORPARTY (Exact Redesign Section)                          */}
      {/* ========================================================================= */}
      <section id="about" data-nav-theme="light" className="mx-auto max-w-[1720px] px-4 sm:px-6 md:px-8 lg:px-12 w-full scroll-reveal scroll-mt-24 sm:scroll-mt-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-20 items-center">
          {/* Left Column: Story & Narrative Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 flex flex-col justify-center text-left"
          >
            {/* Small Eyebrow */}
            <p className="text-[12px] sm:text-[13px] font-bold uppercase tracking-[0.22em] text-[#C9BEAB] dark:text-[#C9BEAB] mb-3 sm:mb-4">
              ABOUT THEDECORPARTY
            </p>

            {/* Headline */}
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[46px] xl:text-[50px] font-normal leading-[1.12] tracking-tight text-[#34203C] dark:text-[#FAF8F5] mb-5 sm:mb-6">
              We create celebrations that feel <span className="font-serif italic font-normal text-[#725D75] dark:text-[#C9BEAB]">personal</span>, <span className="font-serif italic font-normal text-[#725D75] dark:text-[#C9BEAB]">beautiful</span>, and <span className="font-serif italic font-normal text-[#725D75] dark:text-[#C9BEAB]">unforgettable</span>.
            </h2>

            {/* Body Copy */}
            <div className="flex flex-col gap-3.5 text-xs sm:text-sm md:text-[15px] leading-relaxed text-[#725D75] dark:text-[#C8B5C3] font-normal max-w-2xl mb-8 sm:mb-10">
              <p>
                TheDecorParty is a Bengaluru-based celebration and décor studio creating thoughtfully styled experiences for birthdays, proposals, weddings, baby showers, anniversaries, and special occasions.
              </p>
              <p>
                From elegant décor and immersive setups to fun activities and meaningful details, we bring every element together with creativity and care — turning your ideas into celebrations worth remembering.
              </p>
            </div>

            {/* 4-Column Horizontal Stats Bar with Vertical Dividers & Rolling Animated Counters */}
            <div
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-0 sm:divide-x divide-[#DDD5C7] dark:divide-[#483250] py-4 border-y border-[#DDD5C7]/70 dark:border-[#483250]/80"
            >
              <div className="sm:pr-5 sm:pl-0">
                <div className="flex items-baseline font-serif text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#34203C] dark:text-[#C9BEAB] tracking-tight">
                  <AnimatedNumber
                    value={4.9}
                    decimalPlaces={1}
                    springOptions={{ bounce: 0, duration: 2000 }}
                  />
                  <span className="text-[#A78A9F] ml-1 text-xl sm:text-2xl">★</span>
                </div>
                <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] text-[#725D75] dark:text-[#A78A9F] mt-1">
                  Guest Rating
                </p>
              </div>

              <div className="sm:px-5">
                <div className="flex items-baseline font-serif text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#34203C] dark:text-[#C9BEAB] tracking-tight">
                  <AnimatedNumber
                    value={5200}
                    decimalPlaces={0}
                    springOptions={{ bounce: 0, duration: 2000 }}
                  />
                  <span className="text-[#A78A9F] font-serif text-xl sm:text-2xl">+</span>
                </div>
                <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] text-[#725D75] dark:text-[#A78A9F] mt-1">
                  Happy Guests
                </p>
              </div>

              <div className="sm:px-5">
                <div className="flex items-baseline font-serif text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#34203C] dark:text-[#C9BEAB] tracking-tight">
                  <AnimatedNumber
                    value={100}
                    decimalPlaces={0}
                    springOptions={{ bounce: 0, duration: 2000 }}
                  />
                  <span className="text-[#A78A9F] font-serif text-xl sm:text-2xl">%</span>
                </div>
                <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] text-[#725D75] dark:text-[#A78A9F] mt-1">
                  Real-to-Photo
                </p>
              </div>

              <div className="sm:pl-5 sm:pr-0">
                <div className="flex items-baseline font-serif text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#34203C] dark:text-[#C9BEAB] tracking-tight">
                  <AnimatedNumber
                    value={3}
                    decimalPlaces={0}
                    springOptions={{ bounce: 0, duration: 2000 }}
                  />
                  <span className="text-[#A78A9F] font-serif text-lg sm:text-xl ml-0.5">-Hour</span>
                </div>
                <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] text-[#725D75] dark:text-[#A78A9F] mt-1">
                  Express Setup
                </p>
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="flex items-center mt-7 sm:mt-8">
              <button
                type="button"
                onClick={() => navigate('/about')}
                className="pill-btn-khaki inline-flex items-center justify-center rounded-full px-8 sm:px-10 py-3 sm:py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider cursor-pointer shadow-md hover:scale-103 active:scale-95 transition-all"
              >
                <span>Know More</span>
                <ArrowRight size={15} className="ml-2" />
              </button>
            </div>
          </motion.div>

          {/* Right Column: Aesthetic Large Rounded Portrait Image with "The Decor Party" neon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 w-full flex justify-center"
          >
            <div className="relative w-full overflow-hidden rounded-[32px] sm:rounded-[40px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.14)] border border-[#DDD5C7]/70 dark:border-[#483250] aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5] max-h-[560px] lg:max-h-[620px] group bg-[#FAF8F5] dark:bg-[#2D1C34]">
              <img
                src="/about-aesthetic.png"
                alt="TheDecorParty Aesthetic Celebration Setup"
                loading="lazy"
                className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-103"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-black/5 dark:ring-white/10 rounded-[32px] sm:rounded-[40px] pointer-events-none" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. OUR SERVICES & PACKAGES (Luxury Full-Width Section)                   */}
      {/* ========================================================================= */}
      <section id="services" data-nav-theme="dark" className="w-full scroll-reveal scroll-mt-24 sm:scroll-mt-28">
        <div id="experiences" className="scroll-mt-24 sm:scroll-mt-28" />
        <div id="signature-collections" className="scroll-mt-24 sm:scroll-mt-28" />
        <div
          className="relative overflow-hidden rounded-none w-full py-12 sm:py-16 lg:py-20 px-6 sm:px-10 md:px-14 lg:px-16 xl:px-20 text-[#FAF8F5] shadow-2xl border-y border-white/10"
          style={{
            background: 'linear-gradient(145deg, #34203C 0%, #483250 55%, #5A3E62 100%)',
          }}
        >
          {/* Ambient Glows */}
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-[#C9BEAB]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-[#A78A9F]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="w-full max-w-[1800px] mx-auto">
            {/* Editorial Section Header */}
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-14">
              <div className="flex flex-col gap-2.5">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-[#C9BEAB]">
                  <span className="eyebrow-line bg-[#C9BEAB]" />
                  Signature Packages &amp; Services
                </p>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-[48px] font-normal tracking-tight text-[#FAF8F5] leading-[1.08]">
                  Our Services
                </h2>
                <p className="max-w-2xl text-xs sm:text-sm md:text-[15px] font-light leading-relaxed text-[#F6EFF4]/90">
                  Experience luxury and effortless celebrations with our curated selection of bespoke packages.
                </p>
              </div>

              <a
                href="/explore"
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#C9BEAB] hover:text-[#FAF8F5] hover:underline whitespace-nowrap self-start sm:self-auto transition-colors"
              >
                <span>View All Packages</span>
                <ArrowRight size={14} />
              </a>
            </div>

            {/* 4-Column Luxury Glowing Image Cards Grid (21st.dev top-image glow layout) */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {SIGNATURE_COLLECTIONS.slice(0, 4).map((item) => (
                <GlowingImageCard
                  key={item.id}
                  image={item.image}
                  imageAlt={item.name}
                  tag={item.tag}
                  title={item.name}
                  description={item.desc}
                  popularSetup={item.popularSetup}
                  specs={item.specs}
                  price={item.price}
                  pricePrefix="Starting At"
                  buttonText="Explore"
                  onSelect={() => onSelectCategory(item.categoryKey)}
                  className="h-full"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. CELEBRATION OCCASIONS DIRECTORY                                       */}
      {/* ========================================================================= */}
      <section id="curated-decors" data-nav-theme="light" className="mx-auto max-w-[1720px] px-4 sm:px-6 md:px-8 lg:px-12 w-full scroll-reveal scroll-mt-24 sm:scroll-mt-28">
        <div id="categories" className="scroll-mt-24 sm:scroll-mt-28" />
        <CategoryGrid
          categories={categories}
          onSelect={(catName) => onSelectCategory(catName)}
        />
      </section>

      {/* ========================================================================= */}
      {/* 7. FEATURED PACKAGES (Detailed Inclusions & Live Product Rails)           */}
      {/* ========================================================================= */}
      <section id="packages" data-nav-theme="light" className="mx-auto max-w-[1720px] px-4 sm:px-6 md:px-8 lg:px-12 w-full scroll-reveal scroll-mt-24 sm:scroll-mt-28">
        <div id="express" className="scroll-mt-24 sm:scroll-mt-28" />
        <div id="detailed-services" className="scroll-mt-24 sm:scroll-mt-28" />
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-12">
          <div className="flex flex-col gap-2.5">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#725D75] dark:text-[#A78A9F]">
              <span className="eyebrow-line" />
              Transparent Pricing
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[46px] font-normal uppercase tracking-tight text-[#34203C] dark:text-[#FAF8F5] leading-[1.08]">
              Detailed Service Inclusions
            </h2>
            <p className="max-w-2xl text-xs sm:text-sm md:text-[15px] font-light leading-relaxed text-[#725D75] dark:text-[#C8B5C3]">
              Every package is delivered turnkey with verified decorators, premium props, and transparent fixed pricing.
            </p>
          </div>

          <a
            href="/explore"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#34203C] hover:text-[#725D75] dark:text-[#C9BEAB] hover:underline whitespace-nowrap self-start sm:self-auto"
          >
            <span>Explore All Tiers</span>
            <ArrowRight size={14} />
          </a>
        </div>

        {/* 4-Card Single Row Grid with Animated Gradient Border Beam & Ambient Inner Glow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {DETAILED_SERVICES.map((srv, i) => {
            const Icon =
              srv.iconType === 'heart'
                ? Heart
                : srv.iconType === 'sparkles'
                ? Sparkles
                : srv.iconType === 'flame'
                ? Flame
                : Gift;

            return (
              <GradientBoldCard
                key={i}
                popular={srv.popular}
                className="h-full"
              >
                <div>
                  {/* Top Inner Header Box (Matching Champagne Gold Palette from Image 2) */}
                  <div className="rounded-2xl p-4 sm:p-5 mb-5 border border-[#A78A9F]/25 bg-[#34203C]/85 shadow-inner backdrop-blur-md transition-all duration-300 group-hover:border-[#C9BEAB]/40 group-hover:bg-[#483250]/90">
                    {/* Tag & Popular Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[#C9BEAB] text-xs font-bold uppercase tracking-wider min-w-0">
                        <Icon size={14} className="text-[#C9BEAB] flex-shrink-0" />
                        <span className="truncate">{srv.tag}</span>
                      </div>
                      {srv.popular && (
                        <span className="rounded-full border border-[#C9BEAB]/40 bg-[#483250]/80 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#C9BEAB] shadow-xs flex-shrink-0">
                          Popular
                        </span>
                      )}
                    </div>

                    {/* Price Display */}
                    <div className="flex items-baseline justify-between mt-3 mb-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-semibold text-[#DDD5C7]/75 uppercase tracking-wider">
                          {srv.pricePrefix}
                        </span>
                        <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#FAF8F5]">
                          {srv.price}
                        </span>
                      </div>
                    </div>

                    {/* Action Button inside Top Box (Exact Khaki Shell Pill from Image 2) */}
                    <button
                      type="button"
                      onClick={() => onSelectCategory(srv.category)}
                      className="flex items-center justify-center gap-1.5 w-full rounded-full bg-[#C9BEAB] hover:bg-[#FAF8F5] text-[#34203C] py-2.5 px-4 text-xs font-bold uppercase tracking-wider shadow-md transition-all duration-300 hover:scale-103 active:scale-95 cursor-pointer"
                    >
                      <span>Book This Package</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>

                  {/* Package Title */}
                  <h3 className="font-serif text-sm sm:text-base font-bold uppercase tracking-[0.03em] leading-snug text-[#FAF8F5] mb-2 group-hover:text-[#C9BEAB] transition-colors">
                    {srv.title}
                  </h3>

                  {/* Subtitle / Description */}
                  <p className="text-xs font-light leading-relaxed text-[#DDD5C7]/85 mb-5">
                    {srv.desc}
                  </p>

                  {/* What's Included / Circular Checkmarks List */}
                  <div className="border-t border-white/10 pt-4 mb-5">
                    <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#C9BEAB] block mb-3">
                      What's Included:
                    </span>
                    <div className="space-y-2.5">
                      {srv.inclusions.map((inc, incIdx) => (
                        <div key={incIdx} className="flex items-start gap-2 text-xs font-light leading-snug text-[#F6EFF4]/90">
                          <CheckCircle2 size={14} className="text-[#C9BEAB] flex-shrink-0 mt-0.5" />
                          <span>{inc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* WhatsApp Customization Link */}
                <div className="pt-4 border-t border-white/10 mt-auto">
                  <a
                    href="https://wa.me/917022058460"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 w-full text-[11px] font-semibold tracking-wider uppercase text-[#DDD5C7]/80 hover:text-[#C9BEAB] hover:underline transition-colors"
                  >
                    <MessageSquare size={12} />
                    <span>Customize on WhatsApp</span>
                  </a>
                </div>
              </GradientBoldCard>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. REAL CELEBRATIONS / MASONRY GALLERY                                   */}
      {/* ========================================================================= */}
      <section id="gallery" data-nav-theme="light" className="mx-auto max-w-[1720px] px-4 sm:px-6 md:px-8 lg:px-12 w-full scroll-reveal scroll-mt-24 sm:scroll-mt-28">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-12">
          <div className="flex flex-col gap-2.5">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#725D75] dark:text-[#A78A9F]">
              <span className="eyebrow-line" />
              Visual Inspiration
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[44px] font-bold uppercase tracking-tight text-[#34203C] dark:text-[#FAF8F5] leading-[1.1]">
              Real Celebrations. Real Setups.
            </h2>
            <p className="max-w-2xl text-xs sm:text-sm md:text-[15px] font-normal leading-relaxed text-[#725D75] dark:text-[#C8B5C3]">
              Tap any celebration snapshot to explore matching packages and customized accessories.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/explore')}
            className="self-start sm:self-auto rounded-full text-xs font-semibold tracking-wider uppercase px-6 py-3"
          >
            <span>Browse Full Gallery</span>
            <ArrowRight size={14} />
          </Button>
        </div>

        {/* Responsive Multi-Column Masonry Grid with 3D Parallax Tour Cards */}
        <div className="masonry-4-col">
          {GALLERY_ITEMS.map((item) => (
            <div key={item.id} className="masonry-item mb-6">
              <ParallaxTourCard
                image={item.image}
                imageAlt={item.title}
                subtitle={item.category}
                title={item.title}
                badge={item.tag}
                price={item.price}
                aspectRatio={item.aspect}
                onClick={() => onSelectCategory(item.category)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. WHY CHOOSE THEDECORPARTY (SPLIT-LAYOUT LUXURY TRUST SECTION)           */}
      {/* ========================================================================= */}
      <WhyChooseUs />

      {/* ========================================================================= */}
      {/* 10. HOW IT WORKS / BOOKING JOURNEY (Full Width & Squared)                 */}
      {/* ========================================================================= */}
      <section id="process" data-nav-theme="light" className="w-full scroll-reveal scroll-mt-24 sm:scroll-mt-28">
        <div className="w-full rounded-none border-y border-[#DDD5C7] dark:border-[#483250] bg-[#F5EFE6] dark:bg-[#25172C] py-12 sm:py-16 lg:py-18 px-5 sm:px-8 lg:px-12 shadow-xs">
          <div className="mx-auto max-w-[1720px]">
            <div className="mb-8 sm:mb-10 text-center max-w-2xl mx-auto">
              <p className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-[#725D75] dark:text-[#A78A9F] mb-2.5">
                <span className="eyebrow-line bg-[#725D75] dark:bg-[#A78A9F]" />
                Seamless Booking Flow
                <span className="eyebrow-line bg-[#725D75] dark:bg-[#A78A9F]" />
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[44px] font-normal uppercase tracking-tight text-[#34203C] dark:text-[#FAF8F5] leading-[1.08]">
                How It Works
              </h2>
              <p className="text-xs sm:text-sm md:text-[15px] font-light leading-relaxed text-[#725D75] dark:text-[#C8B5C3] mt-2 max-w-md mx-auto">
                From discovering your aesthetic to verified decorators setting up at your door.
              </p>
            </div>

            {/* 4-Step 3D Tilt + Glare Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {PROCESS_STEPS.map((step) => (
                <TiltGlareCard
                  key={step.step}
                  step={step.step}
                  title={step.title}
                  desc={step.desc}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 12. CUSTOMER REVIEWS & TESTIMONIALS (Infinite Scrolling Section)          */}
      {/* ========================================================================= */}
      <div id="testimonials" data-nav-theme="light" className="w-full scroll-reveal scroll-mt-24 sm:scroll-mt-28">
        <InfiniteTestimonials
          badgeText="Verified Reviews"
          subtitle="Real reviews from Indiranagar, Koramangala, Whitefield, HSR, and all across Bengaluru."
        />
      </div>

      {/* ========================================================================= */}
      {/* 13. TABBED FAQ ACCORDION SECTION                                         */}
      {/* ========================================================================= */}
      <div className="w-full scroll-reveal scroll-mt-24 sm:scroll-mt-28">
        <TabbedFAQ id="faq" />
      </div>

      {/* ========================================================================= */}
      {/* 14. FINAL CTA BANNER (Contact / Booking Action Section)                   */}
      {/* ========================================================================= */}
      <section id="contact" data-nav-theme="dark" className="w-full scroll-reveal scroll-mt-24 sm:scroll-mt-28">
        <div id="final-cta" className="scroll-mt-24 sm:scroll-mt-28" />
        <div
          className="relative overflow-hidden rounded-none py-14 sm:py-16 md:py-20 px-6 sm:px-10 text-[#FAF8F5] shadow-2xl border-y border-white/10 text-center w-full"
          style={{
            background: 'linear-gradient(145deg, #26112A 0%, #371A3F 55%, #46224F 100%)',
          }}
        >
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#A78A9F]/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#483250]/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center gap-4 sm:gap-5">
            
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[50px] font-normal tracking-tight leading-[1.12] text-[#FAF8F5]">
              Planning Your Next Celebration?
            </h2>

            <p className="text-xs sm:text-sm md:text-[15px] font-light text-[#F6EFF4]/85 max-w-2xl leading-relaxed">
              Tell us where you&apos;re celebrating, how many guests are attending and what theme you need — we&apos;ll help you plan the setup and share a clear quotation.
            </p>

            {/* 3-Pill Action Buttons Row (Image 2 exact style) */}
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => navigate('/explore')}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#A78A9F] to-[#725D75] px-7 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#FAF8F5] shadow-lg hover:opacity-95 hover:scale-103 active:scale-95 transition-all cursor-pointer"
              >
                <Sparkles size={15} className="text-[#C9BEAB]" />
                <span>Book Now</span>
              </button>

              <a
                href="https://wa.me/917022058460"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FAF8F5] px-7 py-3 text-xs sm:text-sm font-semibold tracking-wider text-[#1F1122] shadow-md hover:bg-white hover:scale-103 active:scale-95 transition-all"
              >
                <MessageSquare size={16} className="text-[#25D366]" />
                <span>WhatsApp Us</span>
              </a>

              <a
                href="tel:+917022058460"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-black/40 border border-white/25 px-7 py-3 text-xs sm:text-sm font-semibold tracking-wider text-[#FAF8F5] shadow-md hover:bg-black/60 hover:scale-103 active:scale-95 transition-all"
              >
                <Phone size={14} className="text-[#FAF8F5]" />
                <span>Call Now</span>
              </a>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-[11px] sm:text-xs text-[#FAF8F5]/75 font-medium tracking-wide">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-[#C9BEAB]" />
                <span>Zero Hidden Fees</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={13} className="text-[#C9BEAB]" />
                <span>Express 3-Hour Setup</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Shield size={13} className="text-[#C9BEAB]" />
                <span>100% Picture-Match Guarantee</span>
              </span>
            </div>

          </div>
        </div>
      </section>

      </div>
    </div>
  );
};
