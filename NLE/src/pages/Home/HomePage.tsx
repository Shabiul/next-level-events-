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
import TabbedFAQ, { FAQ_DATA } from '../../components/ui/TabbedFAQ';
import { SeoHead } from '../../components/layout/SeoHead';
import InfiniteTestimonials from '../../components/ui/InfiniteTestimonials';
import WhyChooseUs from '../../components/ui/WhyChooseUs';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useSiteSettings } from '../../hooks/useSiteSettings';
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
// activity (checked each candidate file before using it -- e.g. tattoo.jpg
// / tatoo.jpg both actually show face painting, not a tattoo artist, so
// that mislabeled file was used for Face Painting instead). Tattoo Artist,
// Magician, and Mascot now have dedicated photos too, so every tile shows
// a real image instead of an icon-only fallback.
const TOP_ACTIVITIES = [
  { name: 'Tattoo Artist', icon: PenTool, image: '/TATOO FOR HOME PAGE.jpg' },
  { name: 'Balloon Modelling', icon: PartyPopper, image: '/hero-balloons.jpg' },
  { name: 'Magician', icon: Wand2, image: '/MAGICIAN.jpg' },
  { name: 'Face Painting', icon: Palette, image: '/tattoo.jpg' },
  { name: 'Popcorn', icon: Popcorn, image: '/popcorn.jpg' },
  { name: 'Cotton Candy', icon: Candy, image: '/cotton candy.jpg' },
  { name: 'Chocolate Fountain', icon: Droplets, image: '/chocolate fountain.jpg' },
  { name: 'Mascot', icon: Smile, image: '/MASCOT FOR HOME PAGE.jpg' },
];

const FALLBACK_OCCASION_IMAGE = '/final_logo.jpg';

// Dedicated decor photography for the "Shop by Occasion" tiles (verified
// to actually depict each occasion), replacing the admin-uploaded category
// thumbnails on the Home page only -- keyed by category name, falls back
// to cat.image for any category without a photo here (e.g. Kids
// Activities, Live Eateries) so nothing elsewhere in the app is affected.
const OCCASION_IMAGE_OVERRIDES: Record<string, string> = {
  'Simple wall decors': '/SIMPLE WALL FOR HOME PAGE.webp',
  'Event Packages': '/explore2.webp',
  'Birthday': '/BIRTHDAY FOR HOME PAGE.webp',
  'Baby Shower': '/BABY SHOWER FOR HOME PAGE.webp',
  '1st Birthday': '/1ST BIRTHDAY FOR HOME PAGE.webp',
  'Welcome Baby': '/WELCOME FOR HOME PAGE.webp',
  'Anniversary Celebrations': '/ANNIVERSAY FOR HOME PAGE.webp',
  'Pre & Post Wedding decors': '/PRE AND POST WEDDING FOR HOME PAGE.webp',
  'Naming ceremony': '/NAMING  FOR HOME PAGE.webp',
};

const getOccasionImage = (name?: string, fallbackImage?: string): string => {
  if (!name) return fallbackImage || FALLBACK_OCCASION_IMAGE;
  const cleanName = name.trim().toLowerCase();
  for (const [key, val] of Object.entries(OCCASION_IMAGE_OVERRIDES)) {
    if (key.trim().toLowerCase() === cleanName) return val;
  }
  return fallbackImage || FALLBACK_OCCASION_IMAGE;
};

/**
 * Shared editorial section heading for the landing page:
 * a lilac eyebrow with a rule, an Oswald all-caps lead, and one accent line.
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
      <span className="block font-serif font-semibold uppercase tracking-tight text-[#A78A9F]">
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

  const siteSettings = useSiteSettings();

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

  const occasions = categories.length > 0 ? categories : [];
  const homePackages = HOME_PACKAGE_INDICES.map((i) => EVENT_PACKAGES[i]).filter(Boolean);

  return (
    <>
      <SeoHead
        title="The Decor Party | Luxury Surprise & Event Decoration Bangalore"
        description="Bangalore's #1 surprise & event decoration platform. Balloon setups, romantic candlelight dinners, room decors, milestone birthdays & proposal setups across Bengaluru with 3-hour same-day slots."
        keywords={[
          'balloon decoration bangalore',
          'birthday decoration bengaluru',
          'candlelight dinner bangalore',
          'room decoration for birthday bangalore',
          'proposal decorators bengaluru',
          'cabana setup bangalore',
          'baby shower event planners bangalore',
          'kids birthday theme decors bangalore',
        ]}
        faqData={FAQ_DATA.map((f) => ({ question: f.question, answer: f.answer }))}
      />
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
              {siteSettings.heroEyebrow}
            </span>

            <h1 className="mt-5 font-serif text-[2.6rem] leading-[1.04] sm:text-6xl md:text-[4rem] lg:text-[4.75rem] font-semibold uppercase text-[#FFF3E6] tracking-tight drop-shadow-[0_4px_30px_rgba(56,25,50,0.9)]">
              {siteSettings.heroHeadlineLine1}<br />
              {siteSettings.heroHeadlineLine2}{' '}
              <span className="inline-block font-serif uppercase font-semibold text-[#A78A9F] align-baseline">
                {siteSettings.heroHeadlineScript}
              </span>
            </h1>

            <p className="mt-6 max-w-md text-sm sm:text-base text-[#FFF3E6]/90 font-sans font-light leading-relaxed drop-shadow-[0_2px_12px_rgba(56,25,50,0.85)]">
              {siteSettings.heroSubtext}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => navigate('/gallery')}
                className="inline-flex items-center gap-2 rounded-full bg-[#FFF3E6] text-[#381932] hover:bg-white px-7 sm:px-8 py-3.5 text-xs sm:text-sm font-serif font-semibold uppercase tracking-[0.14em] shadow-sm transition-colors duration-300 cursor-pointer"
              >
                <span>Explore Celebrations</span>
                <ArrowRight size={15} strokeWidth={2.25} />
              </button>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('packages');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  } else {
                    navigate('/packages');
                  }
                }}
                className="inline-flex items-center gap-2 rounded-full bg-transparent hover:bg-[#FFF3E6]/12 text-[#FFF3E6] border border-[#FFF3E6]/55 hover:border-[#FFF3E6] px-7 sm:px-8 py-3.5 text-xs sm:text-sm font-serif font-semibold uppercase tracking-[0.14em] transition-colors duration-300 cursor-pointer"
              >
                <span>View Packages</span>
              </button>
            </div>
          </div>
        </div>
      </section>


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
        {/* 2. CHOOSE YOUR CELEBRATION (3 IN A ROW GRID - NO DRAG)                   */}
        {/* ========================================================================= */}
        {occasions.length > 0 && (
          <section id="curated-decors" data-nav-theme="light" className="mx-auto max-w-[1720px] px-4 sm:px-6 md:px-8 lg:px-12 w-full scroll-reveal scroll-mt-24">
            <div className="flex items-end justify-between gap-4 mb-6 sm:mb-8">
              <SectionHeading eyebrow="Made for your moments" lead="Explore Our" script="Categories" />
              <button
                type="button"
                onClick={() => navigate('/explore')}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-[#381932]/30 bg-[#FFF3E6] px-4 py-2 text-[11px] font-serif font-semibold uppercase tracking-[0.16em] text-[#381932] shadow-sm hover:bg-[#381932] hover:text-[#FFF3E6] hover:border-[#381932] transition-colors cursor-pointer ml-1"
              >
                View All
                <ArrowRight size={13} />
              </button>
            </div>

            {/* 3 in a row grid that continues below - all displayed at once without dragging */}
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
              {occasions.map((cat, catIdx) => {
                const imgSrc = getOccasionImage(cat.name, cat.image);
                const webpSrc = imgSrc && !imgSrc.startsWith('http') && /\.(jpe?g|png)$/i.test(imgSrc)
                  ? imgSrc.replace(/\.(jpe?g|png)$/i, '.webp')
                  : null;
                return (
                  <button
                    key={cat._id || cat.name || catIdx}
                    type="button"
                    onClick={() => onSelectCategory(cat.name)}
                    className="group flex flex-col items-center cursor-pointer text-center focus:outline-none w-full"
                  >
                    {/* Rounded thumbnail box with border matching Image 1 */}
                    <div className="relative aspect-square w-full overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-[#381932]/12 bg-white/70 p-1 sm:p-1.5 shadow-xs transition-all duration-300 group-hover:border-[#381932]/40 group-hover:shadow-md group-hover:-translate-y-1">
                      <div className="relative w-full h-full overflow-hidden rounded-xl sm:rounded-2xl">
                        <picture className="block h-full w-full">
                          {webpSrc && <source type="image/webp" srcSet={webpSrc} />}
                          <img
                            src={imgSrc}
                            alt={cat.name}
                            loading={catIdx < 6 ? 'eager' : 'lazy'}
                            decoding="async"
                            onError={(e) => {
                              const target = e.currentTarget;
                              if (target.src !== FALLBACK_OCCASION_IMAGE) {
                                target.src = FALLBACK_OCCASION_IMAGE;
                              }
                            }}
                            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                          />
                        </picture>
                      </div>
                    </div>

                    {/* Centered category label underneath matching Image 1 */}
                    <span className="mt-2 sm:mt-2.5 px-0.5 font-sans text-[11px] sm:text-xs md:text-sm font-medium text-[#381932] leading-tight text-center line-clamp-2 transition-colors duration-200 group-hover:text-[#A78A9F]">
                      {cat.name}
                    </span>
                  </button>
                );
              })}
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

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-5 md:gap-6">
            {homePackages.map((pkg, pkgIdx) => {
              const pImg = PACKAGE_IMAGES[pkg.id];
              const pWebp = pImg && !pImg.startsWith('http') && /\.(jpe?g|png)$/i.test(pImg)
                ? pImg.replace(/\.(jpe?g|png)$/i, '.webp')
                : null;
              return (
              <button
                key={pkg.id}
                type="button"
                onClick={() => navigate('/packages')}
                className="group relative self-start block w-full rounded-xl border border-[#381932]/30 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer text-left"
              >
                <div className="relative h-60 sm:h-80 w-full">
                  <picture className="absolute inset-0 block h-full w-full">
                    {pWebp && <source type="image/webp" srcSet={pWebp} />}
                    <img
                      src={pImg}
                      alt={pkg.name}
                      loading={pkgIdx < 2 ? 'eager' : 'lazy'}
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-[350ms] ease-out group-hover:scale-[1.03]"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src !== pImg) {
                          target.src = pImg;
                        }
                      }}
                    />
                  </picture>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#381932]/90 via-[#381932]/30 to-transparent" />
                  {pkg.badge === 'Most Popular' && (
                    <span className="absolute top-2 left-2 sm:top-3 sm:left-3 inline-flex items-center gap-1 rounded-full bg-[#381932] text-[#FFF3E6] px-2 py-0.5 sm:px-2.5 sm:py-1 text-[8px] sm:text-[10px] font-bold uppercase tracking-wide shadow-sm">
                      <Crown size={10} />
                      Most Popular
                    </span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-5">
                    <h3 className="font-serif text-sm sm:text-lg font-bold text-[#FFF3E6] mb-0.5 sm:mb-1 line-clamp-1 leading-snug">{pkg.name}</h3>
                    <span className="text-xs sm:text-lg font-bold text-[#FFF3E6] block mb-1 sm:mb-1.5 leading-tight">{pkg.price}</span>
                    <p className="text-[10px] sm:text-xs text-[#FFF3E6]/80 leading-snug line-clamp-2 mb-1.5 sm:mb-2.5">{pkg.description}</p>
                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-[#FFF3E6] group-hover:text-[#FFF3E6]/90 transition-colors">
                      View Details
                      <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              </button>
              );
            })}
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

          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
            {TOP_ACTIVITIES.map((activity, idx) => (
              <button
                key={activity.name}
                type="button"
                onClick={() => onSelectCategory('Kids Activities', activity.name)}
                className="group relative block w-full cursor-pointer transition-transform duration-[250ms] ease-out hover:-translate-y-1 focus:outline-none"
              >
                <div className="relative aspect-square w-full rounded-xl sm:rounded-2xl overflow-hidden shadow-xs group-hover:shadow-md border border-[#381932]/25 flex items-center justify-center group-hover:border-[#381932]/40 transition-all duration-[250ms]">
                  {activity.image ? (
                    <>
                      <picture className="absolute inset-0 block h-full w-full">
                        {activity.image && !activity.image.startsWith('http') && /\.(jpe?g|png)$/i.test(activity.image) && (
                          <source type="image/webp" srcSet={activity.image.replace(/\.(jpe?g|png)$/i, '.webp')} />
                        )}
                        <img
                          src={activity.image}
                          alt={activity.name}
                          loading={idx < 6 ? 'eager' : 'lazy'}
                          decoding="async"
                          className="h-full w-full object-cover transition-transform duration-[350ms] ease-out group-hover:scale-[1.04]"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (target.src !== activity.image) {
                              target.src = activity.image;
                            }
                          }}
                        />
                      </picture>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#381932]/85 via-[#381932]/25 to-transparent" />
                      <span className="absolute inset-x-0 bottom-0 p-1.5 sm:p-3 text-left text-[10px] sm:text-sm font-medium text-[#FFF3E6] leading-tight line-clamp-2">
                        {activity.name}
                      </span>
                    </>
                  ) : (
                    <>
                      <activity.icon size={32} className="text-[#381932] transition-transform duration-300 group-hover:scale-110 sm:w-10 sm:h-10" />
                      <span className="absolute inset-x-0 bottom-0 p-1.5 sm:p-3 text-left text-[10px] sm:text-sm font-medium text-[#381932] leading-tight line-clamp-2">
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
    </>
  );
};
