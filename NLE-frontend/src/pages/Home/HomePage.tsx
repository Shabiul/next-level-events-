import React, { useEffect, useState } from 'react';
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
  Search,
} from 'lucide-react';
import TabbedFAQ from '../../components/ui/TabbedFAQ';
import InfiniteTestimonials from '../../components/ui/InfiniteTestimonials';
import WhyChooseUs from '../../components/ui/WhyChooseUs';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useServiceSearch } from '../../hooks/useServiceSearch';
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

/**
 * Shared editorial section heading for the landing page:
 * a lilac eyebrow with a rule, an Oswald all-caps lead, and one word
 * set in the Great Vibes script on its own line.
 */
const SectionHeading: React.FC<{ eyebrow: string; lead: string; script: string }> = ({
  eyebrow,
  lead,
  script,
}) => (
  <div>
    <span className="inline-flex items-center gap-2.5 text-[11px] font-serif font-semibold uppercase tracking-[0.24em] text-[#A78A9F]">
      <span className="h-px w-8 bg-[#A78A9F]" />
      {eyebrow}
    </span>
    <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-semibold uppercase tracking-tight text-[#381932] leading-[1.05]">
      {lead}{' '}
      <span className="block font-script lowercase normal-case font-normal tracking-normal text-[#A78A9F] text-[1.5em] leading-[0.9]">
        {script}
      </span>
    </h2>
  </div>
);

export const HomePage: React.FC<HomePageProps> = ({
  categories,
  onSelectCategory,
  onViewProduct: _onViewProduct,
  onBookProduct: _onBookProduct,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hero search -- same live suggestions / keyboard nav as the header search.
  const heroSearch = useServiceSearch(categories);
  const [heroSearchFocused, setHeroSearchFocused] = useState(false);
  const showHeroSuggestions = heroSearchFocused && heroSearch.suggestions.length > 0;

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
    <div className="flex flex-col pb-0 bg-[#FFF3E6] text-[#381932] font-sans antialiased transition-colors">

      {/* ========================================================================= */}
      {/* 1. CINEMATIC HERO -- full-screen celebration video, nav floats over it   */}
      {/* ========================================================================= */}
      <section
        data-nav-theme="dark"
        className="relative w-full min-h-[100vh] sm:min-h-[100svh] overflow-hidden flex items-center bg-[#381932]"
      >
        {/* Background celebration video */}
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
            className="w-full h-full object-cover object-center transform-gpu will-change-transform"
          >
            <source src="/lan.mp4" type="video/mp4" />
            <source src="/landing page.mp4" type="video/mp4" />
          </video>
          {/* Plum scrims -- left for the editorial copy, base for the search pill */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#381932]/90 via-[#381932]/45 to-[#381932]/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#381932]/80 via-transparent to-[#381932]/20" />
        </div>

        {/* Editorial hero content -- left aligned */}
        <div className="relative z-10 w-full max-w-[1720px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 pt-28 sm:pt-32 pb-28 sm:pb-32">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-3 text-[#FFF3E6] text-[10px] sm:text-xs font-serif font-medium uppercase tracking-[0.28em]">
              <span className="h-px w-8 sm:w-12 bg-[#A78A9F]" />
              Curated Celebrations · Beautifully Styled
            </span>

            <h1 className="mt-5 font-serif text-[2.6rem] leading-[1.04] sm:text-6xl md:text-[4rem] lg:text-[4.75rem] font-semibold uppercase text-[#FFF3E6] tracking-tight drop-shadow-[0_4px_30px_rgba(56,25,50,0.9)]">
              Make Every Moment<br />
              Worth{' '}
              <span className="inline-block font-script lowercase font-normal normal-case tracking-normal text-[#A78A9F] text-[1.25em] leading-[0.95] pb-1 -mb-1 align-baseline">
                Remembering.
              </span>
            </h1>

            <p className="mt-6 max-w-md text-sm sm:text-base text-[#FFF3E6]/90 font-sans font-light leading-relaxed drop-shadow-[0_2px_12px_rgba(56,25,50,0.85)]">
              Thoughtfully styled celebrations, beautiful surprises, and unforgettable moments — brought beautifully to life.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => navigate('/explore')}
                className="inline-flex items-center gap-2 rounded-full bg-[#FFF3E6] text-[#381932] hover:bg-white px-7 sm:px-8 py-3.5 text-xs sm:text-sm font-serif font-semibold uppercase tracking-[0.14em] shadow-sm transition-colors duration-300 cursor-pointer"
              >
                <span>Explore Celebrations</span>
                <ArrowRight size={15} strokeWidth={2.25} />
              </button>
              <button
                type="button"
                onClick={() => navigate('/packages')}
                className="inline-flex items-center gap-2 rounded-full bg-transparent hover:bg-[#FFF3E6]/12 text-[#FFF3E6] border border-[#FFF3E6]/55 hover:border-[#FFF3E6] px-7 sm:px-8 py-3.5 text-xs sm:text-sm font-serif font-semibold uppercase tracking-[0.14em] transition-colors duration-300 cursor-pointer"
              >
                <span>View Packages</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* CELEBRATION DISCOVERY -- one elegant search, straddling the hero edge    */}
      {/* ========================================================================= */}
      <div className="relative z-20 -mt-14 sm:-mt-16 mb-8 sm:mb-12 px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="relative mx-auto max-w-4xl">
          <form
            onSubmit={(e) => { e.preventDefault(); heroSearch.runSearch(); }}
            className="bg-[#FFF3E6] border border-[#381932]/15 rounded-[28px] sm:rounded-full shadow-[0_28px_70px_-30px_rgba(56,25,50,0.35)] flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 p-4 sm:py-3.5 sm:pl-8 sm:pr-3.5"
          >
            <span className="hidden sm:grid place-items-center h-12 w-12 shrink-0 rounded-full border border-[#381932]/25 text-[#381932]">
              <Sparkles size={20} strokeWidth={1.5} />
            </span>
            <div className="min-w-0 flex-1">
              <label htmlFor="celebrate" className="block font-serif text-[11px] font-semibold uppercase tracking-[0.2em] text-[#A78A9F]">
                What are you celebrating?
              </label>
              <input
                id="celebrate"
                type="text"
                value={heroSearch.query}
                onChange={(e) => heroSearch.setQuery(e.target.value)}
                onKeyDown={heroSearch.onKeyDown}
                onFocus={() => setHeroSearchFocused(true)}
                onBlur={() => setTimeout(() => setHeroSearchFocused(false), 120)}
                placeholder="Birthday, Anniversary, Proposal…"
                autoComplete="off"
                role="combobox"
                aria-expanded={showHeroSuggestions}
                aria-controls="hero-search-suggestions"
                className="mt-0.5 w-full bg-transparent border-none outline-none text-[#381932] text-lg sm:text-xl font-sans placeholder:text-[#381932]/45"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#381932] text-[#FFF3E6] hover:bg-[#2a121f] px-7 py-3.5 text-xs font-serif font-semibold uppercase tracking-[0.14em] shadow-sm transition-colors cursor-pointer"
            >
              <Search size={15} strokeWidth={2.25} />
              <span>Search</span>
              <ArrowRight size={15} strokeWidth={2.25} />
            </button>
          </form>

          {showHeroSuggestions && (
            <ul
              id="hero-search-suggestions"
              className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 max-h-80 overflow-y-auto rounded-2xl border border-[#381932]/15 bg-[#FFF3E6] p-1.5 shadow-[0_28px_70px_-30px_rgba(56,25,50,0.4)]"
            >
              {heroSearch.suggestions.map((s, i) => (
                <li key={`${s.kind}-${s.label}`}>
                  <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); heroSearch.goToEntry(s); }}
                    onMouseEnter={() => heroSearch.setActiveSuggestion(i)}
                    className={
                      'flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors duration-150 cursor-pointer ' +
                      (i === heroSearch.activeSuggestion ? 'bg-[#A78A9F]/25' : 'hover:bg-[#A78A9F]/15')
                    }
                  >
                    <Search size={14} className="shrink-0 text-[#A78A9F]" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-[#381932]">{s.label}</span>
                      <span className="block truncate text-[11px] text-[#381932]/55">
                        {s.kind === 'subcategory'
                          ? `in ${s.category}`
                          : s.kind === 'category'
                            ? 'Service category'
                            : 'Package'}
                      </span>
                    </span>
                    <ArrowRight size={13} className="shrink-0 text-[#381932]/40" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TRUST MARQUEE SECTION                                                    */}
      {/* ========================================================================= */}
      <div id="trust-marquee" data-nav-theme="dark" className="relative z-10 overflow-hidden bg-[#381932] py-4 sm:py-5 text-[#FFF3E6]">
        <div className="animate-marquee whitespace-nowrap text-sm sm:text-base font-medium tracking-wide">
          {[0, 1].map((rep) => (
            <React.Fragment key={rep}>
              <span className="mx-6 inline-flex items-center gap-2">
                <Shield size={16} className="text-[#381932]" /> Verified Master Stylists
              </span>
              <span className="mx-2 text-[#FFF3E6]/25">|</span>
              <span className="mx-6 inline-flex items-center gap-2">
                <Clock size={16} className="text-[#381932]" /> Express Delivery
              </span>
              <span className="mx-2 text-[#FFF3E6]/25">|</span>
              <span className="mx-6 inline-flex items-center gap-2">
                <MapPin size={16} className="text-[#381932]" /> All Bengaluru Locations
              </span>
              <span className="mx-2 text-[#FFF3E6]/25">|</span>
              <span className="mx-6 inline-flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#381932]" /> 100% Picture-Match Guarantee
              </span>
              <span className="mx-2 text-[#FFF3E6]/25">|</span>
              <span className="mx-6 inline-flex items-center gap-2">
                <Sparkles size={16} className="text-[#A78A9F]" /> Zero Hidden Fees
              </span>
              <span className="mx-2 text-[#FFF3E6]/25">|</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main Content Sections Container */}
      <div className="flex flex-col gap-10 sm:gap-12 lg:gap-14 pt-8 sm:pt-10 lg:pt-12 pb-10 sm:pb-12">

        {/* ========================================================================= */}
        {/* 2. CHOOSE YOUR CELEBRATION                                               */}
        {/* ========================================================================= */}
        {occasions.length > 0 && (
          <section id="curated-decors" data-nav-theme="light" className="mx-auto max-w-[1720px] px-4 sm:px-6 md:px-8 lg:px-12 w-full scroll-reveal scroll-mt-24">
            <div className="grid gap-4 sm:gap-8 md:grid-cols-[minmax(0,22rem)_1fr] md:items-end mb-8 sm:mb-10">
              <SectionHeading eyebrow="Made for your moments" lead="Choose Your" script="Celebration" />
              <div className="flex items-end md:justify-end">
                <button
                  type="button"
                  onClick={() => navigate('/explore')}
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-[#381932]/30 bg-[#FFF3E6] px-4 py-2 text-[11px] font-serif font-semibold uppercase tracking-[0.16em] text-[#381932] shadow-sm hover:bg-[#381932] hover:text-[#FFF3E6] hover:border-[#381932] transition-colors cursor-pointer"
                >
                  View All
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>

            <div className="flex gap-4 sm:gap-5 overflow-x-auto pb-2 smooth-horizontal-rail hide-scrollbar snap-x sm:grid sm:grid-cols-3 lg:grid-cols-4 sm:overflow-visible">
              {occasions.map((cat) => (
                <button
                  key={cat._id || cat.name}
                  type="button"
                  onClick={() => onSelectCategory(cat.name)}
                  className="group relative flex-none w-[220px] sm:w-auto snap-start cursor-pointer overflow-hidden rounded-2xl border border-[#381932]/12 shadow-[0_1px_3px_rgba(56,25,50,0.08)] transition-all duration-[400ms] ease-out hover:-translate-y-1.5 hover:shadow-[0_30px_55px_-28px_rgba(56,25,50,0.4)]"
                >
                  <div className="relative aspect-[3/4]">
                    <img
                      src={OCCASION_IMAGE_OVERRIDES[cat.name] || cat.image || FALLBACK_OCCASION_IMAGE}
                      alt={cat.name}
                      className="h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.06]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#381932]/85 via-[#381932]/20 to-transparent" />
                    <span className="absolute left-3.5 top-3.5 grid h-10 w-10 place-items-center rounded-full border border-[#FFF3E6]/50 bg-[#381932]/25 backdrop-blur-sm">
                      <Sparkles size={16} className="text-[#FFF3E6]" strokeWidth={1.75} />
                    </span>
                    <div className="absolute inset-x-0 bottom-0 p-4 text-left">
                      <span className="block font-serif text-lg font-semibold uppercase tracking-tight text-[#FFF3E6] leading-tight line-clamp-2">
                        {cat.name}
                      </span>
                      <span className="mt-1.5 inline-flex items-center gap-1.5 text-[10px] font-serif font-semibold uppercase tracking-[0.18em] text-[#FFF3E6]/85 group-hover:text-[#FFF3E6]">
                        Explore
                        <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
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
            <SectionHeading eyebrow="Curated celebration bundles" lead="Popular" script="Packages" />
            <button
              type="button"
              onClick={() => navigate('/packages')}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-[#381932]/30 bg-[#FFF3E6] px-4 py-2 text-[11px] font-serif font-semibold uppercase tracking-[0.16em] text-[#381932] shadow-sm hover:bg-[#381932] hover:text-[#FFF3E6] hover:border-[#381932] transition-colors cursor-pointer"
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
                className="group relative self-start block w-full rounded-xl border border-[#381932]/30 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer text-left"
              >
                <div className="relative h-72 sm:h-80 w-full">
                  <img
                    src={PACKAGE_IMAGES[pkg.id]}
                    alt={pkg.name}
                    className="h-full w-full object-cover transition-transform duration-[350ms] ease-out group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#381932]/85 via-[#381932]/25 to-transparent" />
                  {pkg.badge === 'Most Popular' && (
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-[#381932] text-[#FFF3E6] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide shadow-sm">
                      <Crown size={11} />
                      Most Popular
                    </span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                    <h3 className="font-serif text-lg font-bold text-[#FFF3E6] mb-1 line-clamp-1">{pkg.name}</h3>
                    <span className="text-lg font-bold text-[#FFF3E6] block mb-1.5">{pkg.price}</span>
                    <p className="text-xs text-[#FFF3E6]/80 leading-relaxed line-clamp-2 mb-2.5">{pkg.description}</p>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#FFF3E6] group-hover:text-[#381932] transition-colors">
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
          <div className="flex items-end justify-between gap-4 mb-8 sm:mb-10">
            <SectionHeading eyebrow="Entertainment & extras" lead="Top Activities &" script="Add-ons" />
            <button
              type="button"
              onClick={() => onSelectCategory('Kids Activities')}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-[#381932]/30 bg-[#FFF3E6] px-4 py-2 text-[11px] font-serif font-semibold uppercase tracking-[0.16em] text-[#381932] shadow-sm hover:bg-[#381932] hover:text-[#FFF3E6] hover:border-[#381932] transition-colors cursor-pointer"
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
                <div className="relative aspect-square rounded-xl overflow-hidden shadow-sm group-hover:shadow-md border border-[#381932]/30 flex items-center justify-center group-hover:border-[#381932]/40 transition-all duration-[250ms]">
                  {activity.image ? (
                    <>
                      <img
                        src={activity.image}
                        alt={activity.name}
                        className="h-full w-full object-cover transition-transform duration-[350ms] ease-out group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#381932]/70 via-[#381932]/10 to-transparent" />
                      <span className="absolute inset-x-0 bottom-0 p-3.5 text-left text-sm font-medium text-[#FFF3E6]">
                        {activity.name}
                      </span>
                    </>
                  ) : (
                    <>
                      <activity.icon size={44} className="text-[#381932] transition-transform duration-300 group-hover:scale-110" />
                      <span className="absolute inset-x-0 bottom-0 p-3.5 text-left text-sm font-medium text-[#381932]">
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
