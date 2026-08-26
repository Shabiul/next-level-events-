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
  Crown,
  PenTool,
  PartyPopper,
  Wand2,
  Popcorn,
  Candy,
  Droplets,
  Smile,
  MapPin,
} from 'lucide-react';
import TabbedFAQ from '../../components/ui/TabbedFAQ';
import InfiniteTestimonials from '../../components/ui/InfiniteTestimonials';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { EVENT_PACKAGES } from '../../components/packages/eventPackages.data';
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

// Real decor photos already used elsewhere in this app (verified to exist
// and to actually depict the celebration/decor imagery they're used for),
// keyed by EVENT_PACKAGES id.
const HOME_PACKAGE_IMAGES: Record<string, string> = {
  'essential-celebration': '/kkkk-landscape.jpeg',
  'fun-fiesta': '/hero-balloons.jpg',
  'premium-carnival': '/explore2-landscape.jpeg',
  '30k-theme-decor': '/tearce-landscape.jpeg',
  'grand-celebration': '/cabana.jpeg',
  '1-lakh-custom-stage': '/romantic-dinner-landscape.jpg',
};

// Real photos from public/ where one genuinely exists and matches the
// activity (checked each candidate file before using it -- e.g. tattoo.jpeg
// / tatoo.jpeg both actually show face painting, not a tattoo artist, so
// that mislabeled file was used for Face Painting instead). No photo in
// public/ actually depicts Tattoo Artist, Magician, or Mascot, so those
// three keep the icon-tile fallback rather than using a mismatched image.
const TOP_ACTIVITIES = [
  { name: 'Tattoo Artist', icon: PenTool },
  { name: 'Balloon Modelling', icon: PartyPopper, image: '/hero-balloons.jpg' },
  { name: 'Magician', icon: Wand2 },
  { name: 'Face Painting', icon: Palette, image: '/tattoo.jpeg' },
  { name: 'Popcorn', icon: Popcorn, image: '/popcorn.jpeg' },
  { name: 'Cotton Candy', icon: Candy, image: '/cotton candy.jpeg' },
  { name: 'Chocolate Fountain', icon: Droplets, image: '/chocolate fountain.jpeg' },
  { name: 'Mascot', icon: Smile },
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
      {/* 1. CINEMATIC LUXURY FULL-SCREEN HERO SECTION (original video hero)       */}
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
      {/* TRUST MARQUEE SECTION                                                    */}
      {/* ========================================================================= */}
      <div id="trust-marquee" data-nav-theme="light" className="relative z-10 overflow-hidden bg-[#C7B8E8] py-3.5 text-[#1C1B22] border-y border-[#B8AC98] shadow-xs">
        <div className="animate-marquee whitespace-nowrap text-[13px] font-medium tracking-wide">
          {[0, 1].map((rep) => (
            <React.Fragment key={rep}>
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
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main Content Sections Container */}
      <div className="flex flex-col gap-14 sm:gap-16 lg:gap-20 pt-10 sm:pt-12 lg:pt-14 pb-14 sm:pb-16">

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
                <div className="relative -mx-5 -mt-5 mb-4 h-36 rounded-t-[24px] overflow-hidden bg-[#F2EEFA]">
                  <img
                    src={HOME_PACKAGE_IMAGES[pkg.id]}
                    alt={pkg.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
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
                  {activity.image ? (
                    <img
                      src={activity.image}
                      alt={activity.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <activity.icon size={30} className="text-[#8F6FC4] transition-transform duration-300 group-hover:scale-110" />
                  )}
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
