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
  Palette,
  Truck,
  Users,
  Crown,
  ThumbsUp,
  PenTool,
  PartyPopper,
  Wand2,
  Popcorn,
  Candy,
  Droplets,
  Smile,
} from 'lucide-react';
import TabbedFAQ from '../../components/ui/TabbedFAQ';
import InfiniteTestimonials from '../../components/ui/InfiniteTestimonials';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { EVENT_PACKAGES } from '../../components/packages/eventPackages.data';
import { SERVICE_COLUMNS } from '../../data/servicesData';
import type { AdminCategory, AdminProduct } from '../../types';

interface HomePageProps {
  categories: AdminCategory[];
  onSelectCategory: (categoryName: string, subcategoryName?: string) => void;
  onViewProduct: (product: AdminProduct) => void;
  onBookProduct: (product: AdminProduct) => void;
}

// Homepage teaser: same 6 packages the reference mockup shows (skips the
// second ₹39,999 tier so pricing reads as a clean staircase); full list
// with badges lives on /packages via EVENT_PACKAGES.
const HOME_PACKAGE_INDICES = [0, 1, 2, 3, 5, 6];

const SERVICE_COLUMN_VISUALS: Record<string, string> = {
  'curated-decors': '/romantic-dinner.jpg',
  'activities-entertainment': 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=900&auto=format&fit=crop&q=80',
};

// Icon tiles rather than stock photos: reliable and on-brand, and avoids
// gambling on a specific stock photo actually depicting a niche activity
// like "chocolate fountain" or "mascot" correctly.
const TOP_ACTIVITIES = [
  { name: 'Tattoo Artist', icon: PenTool },
  { name: 'Balloon Modelling', icon: PartyPopper },
  { name: 'Magician', icon: Wand2 },
  { name: 'Face Painting', icon: Palette },
  { name: 'Popcorn', icon: Popcorn },
  { name: 'Cotton Candy', icon: Candy },
  { name: 'Chocolate Fountain', icon: Droplets },
  { name: 'Mascot', icon: Smile },
];

const WHY_CHOOSE_US = [
  { icon: Palette, title: 'Custom Themes', description: 'Tailored to your vision' },
  { icon: Shield, title: 'Premium Quality', description: 'Best materials & setup' },
  { icon: Users, title: 'Experienced Team', description: 'Trained & creative experts' },
  { icon: Truck, title: 'On-Time Delivery', description: 'Punctual & reliable' },
  { icon: CheckCircle2, title: 'End-to-End Service', description: 'We handle everything' },
  { icon: ThumbsUp, title: '100% Satisfaction', description: 'Your happiness matters' },
];

const FALLBACK_OCCASION_IMAGE = '/final_logo.jpeg';

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

  const occasions = categories.slice(0, 8);
  const homePackages = HOME_PACKAGE_INDICES.map((i) => EVENT_PACKAGES[i]).filter(Boolean);

  return (
    <div className="flex flex-col pb-0 bg-[#FAF8F5] text-[#1C1B22] font-sans antialiased transition-colors">

      {/* ========================================================================= */}
      {/* 1. HERO -- light split layout                                            */}
      {/* ========================================================================= */}
      <section data-nav-theme="light" className="w-full bg-gradient-to-b from-[#F2EEFA] to-[#FAF8F5] pt-8 sm:pt-12 pb-10 sm:pb-14">
        <div className="mx-auto max-w-[1720px] px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left: Copy */}
            <div className="lg:col-span-6 flex flex-col">
              <span className="inline-flex w-fit items-center gap-1.5 px-4 py-1.5 rounded-full bg-white border border-[#8F6FC4]/20 text-[#8F6FC4] text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] shadow-xs mb-5">
                <Sparkles size={13} />
                Celebrate Every Moment
              </span>

              <h1 className="font-serif text-4xl sm:text-5xl md:text-[56px] font-normal text-[#1C1B22] leading-[1.12] tracking-tight mb-4">
                Beautiful Décor.
                <br />
                Joyful Moments.
                <br />
                <span className="italic text-[#8F6FC4]">Unforgettable Celebrations.</span>
              </h1>

              <p className="text-sm sm:text-base text-[#6B6B76] font-light leading-relaxed max-w-lg mb-7">
                From stunning decorations to fun activities and live treats — we create magical experiences for every celebration.
              </p>

              <div className="flex flex-wrap items-center gap-3 mb-8">
                <button
                  type="button"
                  onClick={() => navigate('/explore')}
                  className="inline-flex items-center gap-2 rounded-full bg-[#8F6FC4] hover:bg-[#7D5DB2] text-white px-7 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg hover:scale-103 transition-all cursor-pointer"
                >
                  Explore Services
                  <ArrowRight size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/packages')}
                  className="inline-flex items-center gap-2 rounded-full bg-white border border-[#E4DEF2] text-[#1C1B22] hover:bg-[#F2EEFA] px-7 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                >
                  View Packages
                </button>
              </div>

              {/* Trust icon row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-6 border-t border-[#E4DEF2]">
                {[
                  { icon: Sparkles, label: 'Custom Themes' },
                  { icon: Shield, label: 'Premium Quality' },
                  { icon: Truck, label: 'On-Time Delivery' },
                  { icon: CheckCircle2, label: 'Hassle Free Setup' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center sm:items-start gap-1.5 text-center sm:text-left">
                    <Icon size={20} className="text-[#8F6FC4]" />
                    <span className="text-[11px] font-semibold text-[#6B6B76]">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Image */}
            <div className="lg:col-span-6">
              <div className="relative w-full aspect-[4/3] rounded-[32px] overflow-hidden shadow-2xl border border-[#E4DEF2]">
                <img
                  src="/1ss.jpeg"
                  alt="Beautifully decorated birthday celebration"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Sections Container */}
      <div className="flex flex-col gap-14 sm:gap-16 lg:gap-20 pt-4 pb-14 sm:pb-16">

        {/* ========================================================================= */}
        {/* 2. SHOP BY OCCASION                                                       */}
        {/* ========================================================================= */}
        {occasions.length > 0 && (
          <section id="curated-decors" data-nav-theme="light" className="mx-auto max-w-[1720px] px-4 sm:px-6 md:px-8 lg:px-12 w-full scroll-reveal scroll-mt-24">
            <div className="flex items-end justify-between gap-4 mb-6 sm:mb-8">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1B22]">Shop by Occasion</h2>
              <button
                type="button"
                onClick={() => navigate('/explore')}
                className="shrink-0 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#8F6FC4] hover:underline cursor-pointer"
              >
                View All Occasions
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-2 smooth-horizontal-rail hide-scrollbar snap-x sm:grid sm:grid-cols-4 lg:grid-cols-8 sm:overflow-visible">
              {occasions.map((cat) => (
                <button
                  key={cat._id || cat.name}
                  type="button"
                  onClick={() => onSelectCategory(cat.name)}
                  className="group flex-none w-[100px] sm:w-auto snap-start flex flex-col items-center gap-2.5 cursor-pointer"
                >
                  <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full overflow-hidden border-2 border-[#E4DEF2] group-hover:border-[#8F6FC4] shadow-sm transition-all duration-300 group-hover:scale-105">
                    <img
                      src={cat.image || FALLBACK_OCCASION_IMAGE}
                      alt={cat.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="text-xs font-semibold text-[#1C1B22] text-center leading-tight line-clamp-2">
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 3. OUR SERVICES -- two curated columns                                    */}
        {/* ========================================================================= */}
        <section id="services" data-nav-theme="light" className="mx-auto max-w-[1720px] px-4 sm:px-6 md:px-8 lg:px-12 w-full scroll-reveal scroll-mt-24">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1B22]">Our Services</h2>
            <p className="text-sm text-[#6B6B76] font-light mt-1">Everything you need for a perfect celebration</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {SERVICE_COLUMNS.map((column) => (
              <button
                key={column.key}
                type="button"
                onClick={() => onSelectCategory(column.title)}
                className="group relative flex items-center gap-5 rounded-[28px] border border-[#E4DEF2] bg-[#F2EEFA] p-6 sm:p-7 overflow-hidden text-left shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#8F6FC4] shadow-sm mb-3">
                    <column.icon size={20} />
                  </span>
                  <h3 className="font-serif text-lg font-bold uppercase tracking-wide text-[#1C1B22] mb-2">
                    {column.title}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#8F6FC4] group-hover:underline">
                    View All {column.key === 'curated-decors' ? 'Décors' : 'Activities'}
                    <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
                <div className="hidden sm:block h-28 w-28 shrink-0 rounded-2xl overflow-hidden shadow-md">
                  <img
                    src={SERVICE_COLUMN_VISUALS[column.key]}
                    alt={column.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. POPULAR PACKAGES                                                       */}
        {/* ========================================================================= */}
        <section id="packages" data-nav-theme="light" className="mx-auto max-w-[1720px] px-4 sm:px-6 md:px-8 lg:px-12 w-full scroll-reveal scroll-mt-24">
          <div className="flex items-end justify-between gap-4 mb-8 sm:mb-10">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1B22]">Popular Packages</h2>
            <button
              type="button"
              onClick={() => navigate('/packages')}
              className="shrink-0 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#8F6FC4] hover:underline cursor-pointer"
            >
              View All Packages
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {homePackages.map((pkg) => (
              <button
                key={pkg.id}
                type="button"
                onClick={() => navigate('/packages')}
                className="group relative flex flex-col rounded-[24px] border border-[#E4DEF2] bg-white p-5 text-left shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                <div className="relative -mx-5 -mt-5 mb-4 h-28 rounded-t-[24px] overflow-hidden bg-gradient-to-br from-[#F2EEFA] via-[#EAE1F7] to-[#F2EEFA]">
                  <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-[#8F6FC4]/20 blur-2xl" />
                  <Sparkles size={16} className="absolute bottom-3 left-5 text-[#8F6FC4]/40" />
                  {pkg.badge === 'Most Popular' && (
                    <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-[#8F6FC4] text-white px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider shadow-md">
                      <Crown size={10} />
                      Most Popular
                    </span>
                  )}
                </div>
                <h3 className="font-serif text-base font-bold text-[#1C1B22] mb-1">{pkg.name}</h3>
                <span className="font-serif text-xl font-bold text-[#8F6FC4] mb-2">{pkg.price}</span>
                <p className="text-xs text-[#6B6B76] font-light leading-relaxed line-clamp-2 mb-3">{pkg.description}</p>
                <span className="mt-auto inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#1C1B22] group-hover:text-[#8F6FC4]">
                  View Details
                  <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. WHY CHOOSE THE DECOR PARTY -- simple icon row                          */}
        {/* ========================================================================= */}
        <section data-nav-theme="light" className="w-full bg-[#F2EEFA] py-12 sm:py-14 border-y border-[#E4DEF2]">
          <div className="mx-auto max-w-[1720px] px-4 sm:px-6 md:px-8 lg:px-12">
            <h2 className="text-center font-serif text-2xl sm:text-3xl font-bold text-[#1C1B22] mb-8 sm:mb-10">
              Why Choose The Decor Party?
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8">
              {WHY_CHOOSE_US.map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex flex-col items-center text-center gap-2">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#8F6FC4] shadow-sm">
                    <Icon size={22} />
                  </span>
                  <span className="text-xs font-bold text-[#1C1B22]">{title}</span>
                  <span className="text-[11px] text-[#6B6B76] font-light">{description}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. TOP ACTIVITIES & ADD-ONS                                               */}
        {/* ========================================================================= */}
        <section data-nav-theme="light" className="mx-auto max-w-[1720px] px-4 sm:px-6 md:px-8 lg:px-12 w-full scroll-reveal scroll-mt-24">
          <div className="flex items-end justify-between gap-4 mb-6 sm:mb-8">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1B22]">Top Activities &amp; Add-ons</h2>
            <button
              type="button"
              onClick={() => onSelectCategory('Kids Activities')}
              className="shrink-0 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#8F6FC4] hover:underline cursor-pointer"
            >
              View All Services
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 smooth-horizontal-rail hide-scrollbar snap-x sm:grid sm:grid-cols-4 lg:grid-cols-8 sm:overflow-visible">
            {TOP_ACTIVITIES.map((activity) => (
              <button
                key={activity.name}
                type="button"
                onClick={() => onSelectCategory('Kids Activities', activity.name)}
                className="group flex-none w-[130px] sm:w-auto snap-start flex flex-col gap-2 cursor-pointer"
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden shadow-sm border border-[#E4DEF2] bg-gradient-to-br from-[#F2EEFA] via-[#EAE1F7] to-[#F2EEFA] flex items-center justify-center group-hover:shadow-md group-hover:border-[#8F6FC4]/40 transition-all">
                  <activity.icon size={30} className="text-[#8F6FC4] transition-transform duration-300 group-hover:scale-110" />
                </div>
                <span className="text-xs font-semibold text-[#1C1B22] text-center">{activity.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 7. CUSTOMER REVIEWS & TESTIMONIALS                                        */}
        {/* ========================================================================= */}
        <div id="testimonials" data-nav-theme="light" className="w-full scroll-reveal scroll-mt-24 sm:scroll-mt-28">
          <InfiniteTestimonials
            badgeText="Verified Reviews"
            subtitle="Real reviews from Indiranagar, Koramangala, Whitefield, HSR, and all across Bengaluru."
          />
        </div>

        {/* ========================================================================= */}
        {/* 8. TABBED FAQ ACCORDION SECTION                                           */}
        {/* ========================================================================= */}
        <div className="w-full scroll-reveal scroll-mt-24 sm:scroll-mt-28">
          <TabbedFAQ id="faq" />
        </div>

        {/* ========================================================================= */}
        {/* 9. FINAL CTA BANNER                                                       */}
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
                Let&apos;s Plan Your Perfect Celebration!
              </h2>

              <p className="text-xs sm:text-sm md:text-[15px] font-light text-[#F2EEFA]/85 max-w-2xl leading-relaxed">
                Share your ideas and we&apos;ll bring them to life — tell us where you&apos;re celebrating, how many guests are attending and what theme you need.
              </p>

              <div className="mt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/explore')}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#8F6FC4] to-[#A48ED0] px-7 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#FAF8F5] shadow-lg hover:opacity-95 hover:scale-103 active:scale-95 transition-all cursor-pointer"
                >
                  <Sparkles size={15} className="text-[#C7B8E8]" />
                  <span>Get a Free Quote</span>
                </button>

                <a
                  href="https://wa.me/917022058460"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FAF8F5] px-7 py-3 text-xs sm:text-sm font-semibold tracking-wider text-[#1F1122] shadow-md hover:bg-white hover:scale-103 active:scale-95 transition-all"
                >
                  <MessageSquare size={16} className="text-[#25D366]" />
                  <span>Chat on WhatsApp</span>
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
                <span id="express" className="flex items-center gap-1.5 scroll-mt-24">
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
