import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Shield,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
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
import WhyChooseUs from '../../components/ui/WhyChooseUs';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { EVENT_PACKAGES, PACKAGE_IMAGES } from '../../components/packages/eventPackages.data';
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

// Real photos from public/ where one genuinely exists and matches the
// activity (checked each candidate file before using it -- e.g. tattoo.jpeg
// / tatoo.jpeg both actually show face painting, not a tattoo artist, so
// that mislabeled file was used for Face Painting instead). Tattoo Artist,
// Magician, and Mascot now have dedicated photos too, so every tile shows
// a real image instead of an icon-only fallback.
const TOP_ACTIVITIES = [
  { name: 'Tattoo Artist', icon: PenTool, image: '/TATOO FOR HOME PAGE.jpeg' },
  { name: 'Balloon Modelling', icon: PartyPopper, image: '/hero-balloons.jpg' },
  { name: 'Magician', icon: Wand2, image: '/MAGICIAN.jpeg' },
  { name: 'Face Painting', icon: Palette, image: '/tattoo.jpeg' },
  { name: 'Popcorn', icon: Popcorn, image: '/popcorn.jpeg' },
  { name: 'Cotton Candy', icon: Candy, image: '/cotton candy.jpeg' },
  { name: 'Chocolate Fountain', icon: Droplets, image: '/chocolate fountain.jpeg' },
  { name: 'Mascot', icon: Smile, image: '/MASCOT FOR HOME PAGE.jpeg' },
];

const FALLBACK_OCCASION_IMAGE = '/final_logo.jpeg';

// Dedicated decor photography for the "Shop by Occasion" tiles (verified
// to actually depict each occasion), replacing the admin-uploaded category
// thumbnails on the Home page only -- keyed by category name, falls back
// to cat.image for any category without a photo here (e.g. Kids
// Activities, Live Eateries) so nothing elsewhere in the app is affected.
const OCCASION_IMAGE_OVERRIDES: Record<string, string> = {
  'Simple wall decors': '/SIMPLE WALL FOR HOME PAGE.jpeg',
  'Birthday': '/BIRTHDAY FOR HOME PAGE.jpeg',
  'Baby Shower': '/BABY SHOWER FOR HOME PAGE.jpeg',
  '1st Birthday': '/1ST BIRTHDAY FOR HOME PAGE.jpeg',
  'Welcome Baby': '/WELCOME FOR HOME PAGE.jpeg',
  'Anniversary Celebrations': '/ANNIVERSAY FOR HOME PAGE.jpeg',
  'Pre & Post Wedding decors': '/PRE AND POST WEDDING FOR HOME PAGE.jpeg',
  'Naming ceremony': '/NAMING  FOR HOME PAGE.jpeg',
};

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
    <div className="flex flex-col pb-0 bg-[#F9F6F2] text-[#2F2930] font-sans antialiased transition-colors">

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
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-black/50 border border-white/25 text-[#F9F6F2] text-[10px] sm:text-xs font-semibold uppercase tracking-[0.22em] backdrop-blur-md mb-4 shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-[#A78A9F]" />
            Bespoke Event Styling &amp; Surprise Setups
          </span>

          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-[76px] font-semibold text-[#F9F6F2] leading-[1] tracking-tight max-w-4xl drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)]">
            Celebrate <span className="text-[#C9BEAB] italic font-medium tracking-normal">Unforgettable</span> Moments
          </h1>

          <p className="mt-4 max-w-2xl text-xs sm:text-sm md:text-base text-[#F9F6F2]/90 font-sans font-light leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
            Signature balloon arches, romantic candlelight cabanas, bespoke birthday themes, and live entertainment styled across Bengaluru.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => navigate('/explore')}
              className="inline-flex items-center gap-2 rounded-lg bg-[#F9F6F2] text-[#2F2930] hover:bg-[#C9BEAB] px-7 py-3 text-xs sm:text-sm font-medium tracking-wide shadow-sm transition-colors duration-300 cursor-pointer"
            >
              <span>Explore Themes &amp; Setups</span>
              <ArrowRight size={14} />
            </button>
            <button
              type="button"
              onClick={() => navigate('/packages')}
              className="inline-flex items-center gap-2 rounded-lg bg-transparent hover:bg-white/10 text-[#F9F6F2] border border-white/50 px-7 py-3 text-xs sm:text-sm font-medium tracking-wide transition-colors duration-300 cursor-pointer"
            >
              <span>View All Packages</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* TRUST MARQUEE SECTION                                                    */}
      {/* ========================================================================= */}
      <div id="trust-marquee" data-nav-theme="dark" className="relative z-10 overflow-hidden bg-[#725D75] py-4 sm:py-5 text-[#F9F6F2]">
        <div className="animate-marquee whitespace-nowrap text-sm sm:text-base font-medium tracking-wide">
          {[0, 1].map((rep) => (
            <React.Fragment key={rep}>
              <span className="mx-6 inline-flex items-center gap-2">
                <Shield size={16} className="text-[#C9BEAB]" /> Verified Master Stylists
              </span>
              <span className="mx-2 text-white/25">|</span>
              <span className="mx-6 inline-flex items-center gap-2">
                <Clock size={16} className="text-[#C9BEAB]" /> Express 3-Hour Setup
              </span>
              <span className="mx-2 text-white/25">|</span>
              <span className="mx-6 inline-flex items-center gap-2">
                <MapPin size={16} className="text-[#C9BEAB]" /> All Bengaluru Locations
              </span>
              <span className="mx-2 text-white/25">|</span>
              <span className="mx-6 inline-flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#C9BEAB]" /> 100% Picture-Match Guarantee
              </span>
              <span className="mx-2 text-white/25">|</span>
              <span className="mx-6 inline-flex items-center gap-2">
                <Sparkles size={16} className="text-[#C9BEAB]" /> Zero Hidden Fees
              </span>
              <span className="mx-2 text-white/25">|</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main Content Sections Container */}
      <div className="flex flex-col gap-10 sm:gap-12 lg:gap-14 pt-8 sm:pt-10 lg:pt-12 pb-10 sm:pb-12">

        {/* ========================================================================= */}
        {/* 2. SHOP BY OCCASION                                                       */}
        {/* ========================================================================= */}
        {occasions.length > 0 && (
          <section id="curated-decors" data-nav-theme="light" className="mx-auto max-w-[1720px] px-4 sm:px-6 md:px-8 lg:px-12 w-full scroll-reveal scroll-mt-24">
            <div className="flex items-end justify-between gap-4 mb-2">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2F2930]">Shop by Occasion</h2>
                <p className="mt-1.5 text-sm text-[#746B72]">Beautiful setups for every moment worth celebrating.</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/explore')}
                className="shrink-0 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#725D75] hover:underline cursor-pointer"
              >
                View All Occasions
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-2 pt-6 smooth-horizontal-rail hide-scrollbar snap-x sm:grid sm:grid-cols-4 sm:overflow-visible">
              {occasions.map((cat) => (
                <button
                  key={cat._id || cat.name}
                  type="button"
                  onClick={() => onSelectCategory(cat.name)}
                  className="group flex-none w-[150px] sm:w-auto snap-start cursor-pointer transition-transform duration-[250ms] ease-out hover:-translate-y-1"
                >
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden shadow-sm group-hover:shadow-md transition-shadow duration-[250ms]">
                    <img
                      src={OCCASION_IMAGE_OVERRIDES[cat.name] || cat.image || FALLBACK_OCCASION_IMAGE}
                      alt={cat.name}
                      className="h-full w-full object-cover transition-transform duration-[250ms] ease-out group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <span className="absolute inset-x-0 bottom-0 p-3.5 text-left text-sm font-medium text-white leading-tight line-clamp-1">
                      {cat.name}
                    </span>
                  </div>
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
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2F2930]">Popular Packages</h2>
            <button
              type="button"
              onClick={() => navigate('/packages')}
              className="shrink-0 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#725D75] hover:underline cursor-pointer"
            >
              View All Packages
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {homePackages.map((pkg) => (
              <button
                key={pkg.id}
                type="button"
                onClick={() => navigate('/packages')}
                className="group relative self-start block w-full rounded-xl border border-[#E4DCD2] overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer text-left"
              >
                <div className="relative h-72 sm:h-80 w-full">
                  <img
                    src={PACKAGE_IMAGES[pkg.id]}
                    alt={pkg.name}
                    className="h-full w-full object-cover transition-transform duration-[350ms] ease-out group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                  {pkg.badge === 'Most Popular' && (
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-[#725D75] text-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide shadow-sm">
                      <Crown size={11} />
                      Most Popular
                    </span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                    <h3 className="font-serif text-lg font-bold text-white mb-1 line-clamp-1">{pkg.name}</h3>
                    <span className="text-lg font-bold text-white block mb-1.5">{pkg.price}</span>
                    <p className="text-xs text-white/80 leading-relaxed line-clamp-2 mb-2.5">{pkg.description}</p>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-white group-hover:text-[#C9BEAB] transition-colors">
                      View Details
                      <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. WHY CHOOSE US                                                          */}
        {/* ========================================================================= */}
        <WhyChooseUs />

        {/* ========================================================================= */}
        {/* 6. TOP ACTIVITIES & ADD-ONS                                               */}
        {/* ========================================================================= */}
        <section data-nav-theme="light" className="mx-auto max-w-[1720px] px-4 sm:px-6 md:px-8 lg:px-12 w-full scroll-reveal scroll-mt-24">
          <div className="flex items-end justify-between gap-4 mb-6 sm:mb-8">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2F2930]">Top Activities &amp; Add-ons</h2>
            <button
              type="button"
              onClick={() => onSelectCategory('Kids Activities')}
              className="shrink-0 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#725D75] hover:underline cursor-pointer"
            >
              View All Services
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="flex gap-5 overflow-x-auto pb-2 smooth-horizontal-rail hide-scrollbar snap-x sm:grid sm:grid-cols-4 sm:overflow-visible">
            {TOP_ACTIVITIES.map((activity) => (
              <button
                key={activity.name}
                type="button"
                onClick={() => onSelectCategory('Kids Activities', activity.name)}
                className="group flex-none w-[190px] sm:w-auto snap-start cursor-pointer transition-transform duration-[250ms] ease-out hover:-translate-y-1"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden shadow-sm group-hover:shadow-md border border-[#E4DCD2] flex items-center justify-center group-hover:border-[#725D75]/40 transition-all duration-[250ms]">
                  {activity.image ? (
                    <>
                      <img
                        src={activity.image}
                        alt={activity.name}
                        className="h-full w-full object-cover transition-transform duration-[350ms] ease-out group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                      <span className="absolute inset-x-0 bottom-0 p-3.5 text-left text-sm font-medium text-white">
                        {activity.name}
                      </span>
                    </>
                  ) : (
                    <>
                      <activity.icon size={44} className="text-[#725D75] transition-transform duration-300 group-hover:scale-110" />
                      <span className="absolute inset-x-0 bottom-0 p-3.5 text-left text-sm font-medium text-[#2F2930]">
                        {activity.name}
                      </span>
                    </>
                  )}
                </div>
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
            subtitle="Real celebrations. Real people. Real moments."
          />
        </div>

        {/* ========================================================================= */}
        {/* 8. TABBED FAQ ACCORDION SECTION                                           */}
        {/* ========================================================================= */}
        <div className="w-full scroll-reveal scroll-mt-24 sm:scroll-mt-28">
          <TabbedFAQ id="faq" />
        </div>

      </div>
    </div>
  );
};
