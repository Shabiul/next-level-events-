import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Shield,
  Clock,
  ArrowRight,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Phone,
  Gift,
  Heart,
  Flame,
  MapPin,
} from 'lucide-react';
import { CategoryGrid } from '../../components/category/CategoryGrid';
import { Button } from '../../components/ui/Button';
import TabbedFAQ from '../../components/ui/TabbedFAQ';
import { WhyChooseUs } from '../../components/ui/WhyChooseUs';
import InfiniteTestimonials from '../../components/ui/InfiniteTestimonials';
import { GradientBoldCard } from '../../components/ui/GradientBoldCard';
import { GlowingImageCard } from '../../components/ui/GlowingImageCard';
import { TiltGlareCard } from '../../components/ui/TiltGlareCard';
import { ParallaxTourCard } from '../../components/ui/ParallaxTourCard';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import type { AdminCategory, AdminProduct } from '../../types';

interface HomePageProps {
  categories: AdminCategory[];
  onSelectCategory: (categoryName: string, subcategoryName?: string) => void;
  onViewProduct: (product: AdminProduct) => void;
  onBookProduct: (product: AdminProduct) => void;
}

// 3. SIGNATURE PACKAGES SHOWCASE (Editorial Card Layout)
const SIGNATURE_COLLECTIONS = [
  {
    id: 'c1',
    name: 'Candlelight & Cabana Setups',
    type: 'Romantic Special',
    tag: 'Top Rated',
    image: '/romantic-dinner.jpg',
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
    image: '/1ss.jpeg',
    desc: 'Artisanal pastel balloon ring installations with customized LED neon signage, organic garlands, and photo-ready backdrop styling.',
    popularSetup: 'Pastel Ring Arch & Neon',
    specs: ['🎂 All Ages', '💡 Neon Included', '⏱️ 60m Setup'],
    price: '₹2,499',
    unit: '/ complete setup',
    categoryKey: 'Birthdays',
  },
  {
    id: 'c3',
    name: 'Kids Activities & Party Games',
    type: 'Kids Special',
    tag: 'Interactive Fun',
    image: '/kids.jpeg',
    desc: 'Fun party games, balloon twisting, face painting, mascot artists, and bespoke theme styling for kids birthday bashes.',
    popularSetup: 'Kids Theme & Games Zone',
    specs: ['🧒 All Ages', '🎨 Games Included', '⏱️ 45m Setup'],
    price: '₹1,499',
    unit: '/ complete setup',
    categoryKey: 'Kids Activities',
  },
  {
    id: 'c4',
    name: 'Baby Shower & Welcome Baby',
    type: 'Welcome Baby',
    tag: 'Cherished',
    image: '/welcome-baby.jpg',
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

  // Initialize clean scroll reveal & scroll threshold effects
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

  return (
    <div className="flex flex-col pb-0 bg-[#FAF8F5] dark:bg-[#1B101F] text-[#1C1B22] dark:text-[#FAF8F5] font-sans antialiased transition-colors">

      {/* ========================================================================= */}
      {/* 1. CINEMATIC LUXURY FULL-SCREEN HERO SECTION                             */}
      {/* ========================================================================= */}
      <section 
        data-nav-theme="dark" 
        className="relative w-full min-h-[100vh] sm:min-h-[100svh] overflow-hidden flex flex-col justify-center items-center text-center shadow-2xl bg-[#0F0A12] px-4 sm:px-6"
      >
        {/* Background Video Media with Scrim & Vignette Overlays */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            disablePictureInPicture
            disableRemotePlayback
            controls={false}
            className="w-full h-full object-cover object-center transform-gpu will-change-transform transition-all duration-700"
          >
            <source src="/lan.mp4" type="video/mp4" />
            <source src="/landing page.mp4" type="video/mp4" />
          </video>
          {/* Ambient vignette & gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/45 pointer-events-none" />
        </div>

        {/* Hero Editorial Content */}
        <div className="relative z-10 max-w-4xl mx-auto w-full flex flex-col items-center justify-center text-center px-4 my-auto pt-16 sm:pt-20">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-black/50 border border-white/25 text-[#FAF8F5] text-[10px] sm:text-xs font-semibold uppercase tracking-[0.22em] backdrop-blur-md mb-4 shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-[#C7B8E8]" />
            Bespoke Event Styling &amp; Surprise Setups
          </span>

          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-[76px] font-normal text-[#FAF8F5] leading-[1.04] tracking-tight uppercase max-w-4xl drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)]">
            CELEBRATE <span className="text-[#C7B8E8] font-normal italic font-['Great_Vibes'] lowercase text-[1.2em] tracking-normal">Unforgettable</span> MOMENTS
          </h1>

          <p className="mt-4 max-w-2xl text-xs sm:text-sm md:text-base text-[#FAF8F5]/90 font-sans font-light leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
            Signature balloon arches, romantic candlelight cabanas, bespoke birthday themes, and live entertainment styled across Bengaluru.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => navigate('/explore')}
              className="inline-flex items-center gap-2 rounded-full bg-[#FAF8F5] text-[#1B101F] hover:bg-[#C7B8E8] px-7 py-3.5 text-xs font-extrabold uppercase tracking-wider shadow-xl transition-all duration-300 hover:scale-103 cursor-pointer"
            >
              <span>Explore Themes &amp; Setups</span>
              <ArrowRight size={14} />
            </button>
            <button
              type="button"
              onClick={() => navigate('/packages')}
              className="inline-flex items-center gap-2 rounded-full bg-black/50 hover:bg-white/20 text-[#FAF8F5] border border-white/30 backdrop-blur-md px-7 py-3.5 text-xs font-bold uppercase tracking-wider shadow-xl transition-all duration-300 hover:scale-103 cursor-pointer"
            >
              <span>View All Packages</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. TRUST MARQUEE SECTION                                                 */}
      {/* ========================================================================= */}
      <div id="trust-marquee" data-nav-theme="light" className="relative z-10 overflow-hidden bg-[#C7B8E8] py-3.5 text-[#1C1B22] border-y border-[#B8AC98] shadow-xs">
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
      {/* 5. OUR SERVICES & PACKAGES (Luxury Full-Width Section)                   */}
      {/* ========================================================================= */}
      <section id="services" data-nav-theme="dark" className="w-full scroll-reveal scroll-mt-24 sm:scroll-mt-28">
        <div id="experiences" className="scroll-mt-24 sm:scroll-mt-28" />
        <div id="signature-collections" className="scroll-mt-24 sm:scroll-mt-28" />
        <div
          className="relative overflow-hidden rounded-none w-full py-12 sm:py-16 lg:py-20 px-6 sm:px-10 md:px-14 lg:px-16 xl:px-20 text-[#FAF8F5] shadow-2xl border-y border-white/10"
          style={{
            background: 'linear-gradient(145deg, #8F6FC4 0%, #483250 55%, #5A3E62 100%)',
          }}
        >
          {/* Ambient Glows */}
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-[#C7B8E8]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-[#8F6FC4]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="w-full max-w-[1800px] mx-auto">
            {/* Editorial Section Header */}
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-14">
              <div className="flex flex-col gap-2.5">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-[#C7B8E8]">
                  <span className="eyebrow-line bg-[#C7B8E8]" />
                  Signature Packages &amp; Services
                </p>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-[48px] font-normal tracking-tight text-[#FAF8F5] leading-[1.08]">
                  Our Services
                </h2>
                <p className="max-w-2xl text-xs sm:text-sm md:text-[15px] font-light leading-relaxed text-[#F2EEFA]/90">
                  Experience luxury and effortless celebrations with our curated selection of bespoke packages.
                </p>
              </div>

              <a
                href="/explore"
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#C7B8E8] hover:text-[#FAF8F5] hover:underline whitespace-nowrap self-start sm:self-auto transition-colors"
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
      {/* 7. DETAILED SERVICE INCLUSIONS / TRANSPARENT PRICING                      */}
      {/* ========================================================================= */}
      <section id="packages" data-nav-theme="light" className="mx-auto max-w-[1720px] px-4 sm:px-6 md:px-8 lg:px-12 w-full scroll-reveal scroll-mt-36 sm:scroll-mt-44 pt-6 sm:pt-10">
        <div id="express" className="scroll-mt-36 sm:scroll-mt-44" />
        <div id="detailed-services" className="scroll-mt-36 sm:scroll-mt-44" />
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-12">
          <div className="flex flex-col gap-2.5">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#6B6B76] dark:text-[#A78A9F]">
              <span className="eyebrow-line" />
              Transparent Pricing
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[46px] font-normal uppercase tracking-tight text-[#1C1B22] dark:text-[#FAF8F5] leading-[1.08]">
              Detailed Service Inclusions
            </h2>
            <p className="max-w-2xl text-xs sm:text-sm md:text-[15px] font-light leading-relaxed text-[#6B6B76] dark:text-[#C8B5C3]">
              Every package is delivered turnkey with verified decorators, premium props, and transparent fixed pricing.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/packages')}
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1C1B22] hover:text-[#6B6B76] dark:text-[#C9BEAB] hover:underline whitespace-nowrap self-start sm:self-auto cursor-pointer"
          >
            <span>Explore All Packages</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* 4-Card Single Row Grid with Animated Gradient Border Beam & Ambient Inner Glow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 items-stretch">
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
                className="h-full flex flex-col justify-between"
              >
                <div className="flex flex-col h-full">
                  {/* Top Inner Header Box (Matching Champagne Gold Palette from Image 2) */}
                  <div className="rounded-2xl p-4 sm:p-5 mb-5 border border-[#8F6FC4]/25 bg-[#8F6FC4]/85 shadow-inner backdrop-blur-md transition-all duration-300 group-hover:border-[#C7B8E8]/40 group-hover:bg-[#483250]/90">
                    {/* Tag & Popular Badge */}
                    <div className="flex items-center justify-between gap-2 min-h-[24px]">
                      <div className="flex items-center gap-1.5 text-[#C7B8E8] text-[11px] font-bold uppercase tracking-wider min-w-0">
                        <Icon size={13} className="text-[#C7B8E8] flex-shrink-0" />
                        <span className="whitespace-nowrap">{srv.tag}</span>
                      </div>
                      {srv.popular && (
                        <span className="rounded-full border border-[#C7B8E8]/40 bg-[#483250]/80 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#C7B8E8] shadow-xs flex-shrink-0">
                          Popular
                        </span>
                      )}
                    </div>

                    {/* Price Display */}
                    <div className="flex items-baseline justify-between mt-3 mb-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-semibold text-[#E4DEF2]/75 uppercase tracking-wider">
                          {srv.pricePrefix}
                        </span>
                        <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#FAF8F5]">
                          {srv.price}
                        </span>
                      </div>
                    </div>

                    {/* Action Button inside Top Box */}
                    <button
                      type="button"
                      onClick={() => onSelectCategory(srv.category)}
                      className="flex items-center justify-center gap-1.5 w-full rounded-full bg-[#C7B8E8] hover:bg-[#FAF8F5] text-[#1C1B22] py-2.5 px-4 text-xs font-bold uppercase tracking-wider shadow-md transition-all duration-300 hover:scale-103 active:scale-95 cursor-pointer"
                    >
                      <span>Book This Package</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>

                  {/* Package Title */}
                  <h3 className="font-serif text-sm sm:text-base font-bold uppercase tracking-[0.03em] leading-snug text-[#FAF8F5] mb-2 group-hover:text-[#C7B8E8] transition-colors min-h-[48px] flex items-start">
                    {srv.title}
                  </h3>

                  {/* Subtitle / Description */}
                  <p className="text-xs font-light leading-relaxed text-[#E4DEF2]/85 mb-5 min-h-[52px]">
                    {srv.desc}
                  </p>

                  {/* What's Included / Circular Checkmarks List */}
                  <div className="border-t border-white/10 pt-4 mb-5 flex-1">
                    <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#C7B8E8] block mb-3">
                      What's Included:
                    </span>
                    <div className="space-y-2.5">
                      {srv.inclusions.map((inc, incIdx) => (
                        <div key={incIdx} className="flex items-start gap-2 text-xs font-light leading-snug text-[#F2EEFA]/90">
                          <CheckCircle2 size={14} className="text-[#C7B8E8] flex-shrink-0 mt-0.5" />
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
                    className="inline-flex items-center justify-center gap-1.5 w-full text-[11px] font-semibold tracking-wider uppercase text-[#E4DEF2]/80 hover:text-[#C7B8E8] hover:underline transition-colors"
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
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#6B6B76] dark:text-[#A78A9F]">
              <span className="eyebrow-line" />
              Visual Inspiration
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[44px] font-bold uppercase tracking-tight text-[#1C1B22] dark:text-[#FAF8F5] leading-[1.1]">
              Real Celebrations. Real Setups.
            </h2>
            <p className="max-w-2xl text-xs sm:text-sm md:text-[15px] font-normal leading-relaxed text-[#6B6B76] dark:text-[#C8B5C3]">
              Tap any celebration snapshot to explore matching packages and customized accessories.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/gallery')}
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
        <div className="w-full rounded-none border-y border-[#E4DEF2] dark:border-[#483250] bg-[#F2EEFA] dark:bg-[#25172C] py-12 sm:py-16 lg:py-18 px-5 sm:px-8 lg:px-12 shadow-xs">
          <div className="mx-auto max-w-[1720px]">
            <div className="mb-8 sm:mb-10 text-center max-w-2xl mx-auto">
              <p className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-[#6B6B76] dark:text-[#A78A9F] mb-2.5">
                <span className="eyebrow-line bg-[#A48ED0] dark:bg-[#A78A9F]" />
                Seamless Booking Flow
                <span className="eyebrow-line bg-[#A48ED0] dark:bg-[#A78A9F]" />
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[44px] font-normal uppercase tracking-tight text-[#1C1B22] dark:text-[#FAF8F5] leading-[1.08]">
                How It Works
              </h2>
              <p className="text-xs sm:text-sm md:text-[15px] font-light leading-relaxed text-[#6B6B76] dark:text-[#C8B5C3] mt-2 max-w-md mx-auto">
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
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#8F6FC4]/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#483250]/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center gap-4 sm:gap-5">
            
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[50px] font-normal tracking-tight leading-[1.12] text-[#FAF8F5]">
              Planning Your Next Celebration?
            </h2>

            <p className="text-xs sm:text-sm md:text-[15px] font-light text-[#F2EEFA]/85 max-w-2xl leading-relaxed">
              Tell us where you&apos;re celebrating, how many guests are attending and what theme you need — we&apos;ll help you plan the setup and share a clear quotation.
            </p>

            {/* 3-Pill Action Buttons Row (Image 2 exact style) */}
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => navigate('/explore')}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#8F6FC4] to-[#A48ED0] px-7 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#FAF8F5] shadow-lg hover:opacity-95 hover:scale-103 active:scale-95 transition-all cursor-pointer"
              >
                <Sparkles size={15} className="text-[#C7B8E8]" />
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
                <CheckCircle2 size={13} className="text-[#C7B8E8]" />
                <span>Zero Hidden Fees</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={13} className="text-[#C7B8E8]" />
                <span>Express 3-Hour Setup</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Shield size={13} className="text-[#C7B8E8]" />
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
