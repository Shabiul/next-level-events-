import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Palette,
  Quote,
  Shield,
  Truck,
  Users,
  CheckCircle2,
  ThumbsUp,
  Heart,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SeoHead } from '../../components/layout/SeoHead';
import { AnimatedNumber } from '../../components/core/animated-number';

const HERO_IMAGE = '/about-purple-banner.png';
const STORY_IMAGE = '/about-aesthetic.png';

/* Inline botanical sprig -- matches the Packages page accent */
const Sprig: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 80 24" fill="none" className={className} aria-hidden="true">
    <path d="M2 12h44" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M46 12c6 0 10-4 12-9M46 12c6 0 10 4 12 9M46 12c7 0 12 0 16-3M46 12c7 0 12 0 16 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <circle cx="70" cy="12" r="2.4" fill="currentColor" />
  </svg>
);

const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Choose Your Occasion',
    desc: 'Browse our curated collection of verified balloon arches, candlelight cabanas, and festive setups.',
  },
  {
    step: '02',
    title: 'Select Date & Location',
    desc: 'Choose your event date and Bengaluru area. Select Express Delivery or a future schedule.',
  },
  {
    step: '03',
    title: 'Bespoke Customisation',
    desc: 'Add personalised neon signs, colour choices, milestone numbers, or talk directly with lead stylists on WhatsApp.',
  },
  {
    step: '04',
    title: 'Flawless Setup at Your Door',
    desc: 'Certified master decorators arrive on-time with all props and transform your venue into a dream celebration.',
  },
];

const WHY_CHOOSE_US = [
  { icon: Palette, title: 'Custom Themes', description: 'Tailored to your vision' },
  { icon: Shield, title: 'Premium Quality', description: 'Best materials & setup' },
  { icon: Users, title: 'Experienced Team', description: 'Trained & creative experts' },
  { icon: Truck, title: 'On-Time Delivery', description: 'Punctual & reliable' },
  { icon: CheckCircle2, title: 'End-to-End Service', description: 'We handle everything' },
  { icon: ThumbsUp, title: '100% Satisfaction', description: 'Your happiness matters' },
];

export const AboutPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });
  const heroImgY = useTransform(heroScroll, [0, 0.6], [0, 60]);

  return (
    <>
      <SeoHead
        title="About Us — The Decor Party | Bespoke Celebration & Event Styling"
        description="Providing Bengaluru's finest bespoke styling and surprise experiences. Discover our story, standards, and founder commitment at The Decor Party."
      />

      <div
        ref={containerRef}
        className="w-full bg-[#FFF3E6] text-[#381932] font-poppins antialiased selection:bg-[#381932]/20 overflow-x-hidden"
      >
        {/* ===================================================================== */}
        {/* SECTION 1 — HERO                                                      */}
        {/* ===================================================================== */}
        <section data-nav-theme="light" className="w-full max-w-7xl mx-auto pt-8 pb-4 px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full h-[300px] sm:h-[420px] rounded-[24px] sm:rounded-[32px] overflow-hidden border border-[#E6D7C5] shadow-[0_24px_60px_-30px_rgba(56,25,50,0.5)] bg-[#381932]"
          >
            <motion.img
              style={{ y: heroImgY }}
              src={HERO_IMAGE}
              alt="The Decor Party bespoke celebration styling"
              className="w-full h-[118%] object-cover object-center"
            />
            {/* layered scrim -- vertical wash + centre vignette for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#25101f]/95 via-[#381932]/70 to-[#381932]/45" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,16,31,0.55)_0%,transparent_65%)]" />

            <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 z-10">
              <motion.span
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="inline-flex items-center gap-2 rounded-full border border-[#FFF3E6]/25 bg-[#25101f]/40 px-4 py-1.5 text-[10px] sm:text-[11px] font-poppins font-semibold uppercase tracking-[0.28em] text-[#FFF3E6] backdrop-blur-sm mb-4"
              >
                <Heart size={12} className="fill-[#C8B5C3] text-[#C8B5C3]" />
                Our Story
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="font-serif text-4xl sm:text-5xl lg:text-[64px] font-bold uppercase tracking-tight text-[#FFF3E6] leading-[1.05] [text-shadow:0_2px_24px_rgba(37,16,31,0.85)]"
              >
                About <span className="text-[#C8B5C3]">The Decor Party</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="font-script text-2xl sm:text-3xl text-[#FFF3E6] mt-3 [text-shadow:0_2px_18px_rgba(37,16,31,0.9)]"
              >
                celebrations, beautifully styled
              </motion.p>
            </div>
          </motion.div>
        </section>

        {/* ===================================================================== */}
        {/* SECTION 2 — WHO WE ARE (split)                                        */}
        {/* ===================================================================== */}
        <section data-nav-theme="light" className="w-full max-w-7xl mx-auto py-10 sm:py-12 px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-7 flex flex-col text-left"
            >
              <span className="inline-flex items-center gap-2 text-[11px] font-poppins font-semibold uppercase tracking-[0.2em] text-[#A78A9F] mb-4">
                <Sprig className="w-14 h-5 text-[#A78A9F]" />
                Who We Are
              </span>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[48px] font-bold uppercase leading-[1.1] tracking-tight text-[#381932] mb-6">
                Bengaluru's Finest{' '}
                <span className="text-[#A78A9F]">Bespoke Celebration</span> Experience
              </h2>

              <div className="space-y-4 text-[15px] sm:text-base text-[#381932]/80 leading-relaxed">
                <p>
                  At The Decor Party, we are committed to delivering top-tier styling and surprise
                  celebration services. From intimate residential anniversaries to grand milestone
                  extravagances, we ensure every aspect of your event is handled with absolute
                  professionalism.
                </p>
                <p>
                  Our team of experienced master stylists and friendly event coordinators work around
                  the clock to create seamless, memorable journeys and picture-perfect backdrops
                  across Bengaluru.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-6 mt-9 py-6 border-y border-[#E6D7C5]">
                {[
                  { value: 4.9, dp: 1, suffix: '★', label: 'Guest Rating' },
                  { value: 5200, dp: 0, suffix: '+', label: 'Happy Guests' },
                  { value: 100, dp: 0, suffix: '%', label: 'Real-to-Photo' },
                  { value: 500, dp: 0, suffix: '+', label: 'Curated Setups' },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="flex items-baseline font-serif text-2xl sm:text-3xl lg:text-[32px] font-bold text-[#381932] tracking-tight">
                      <AnimatedNumber value={s.value} decimalPlaces={s.dp} springOptions={{ bounce: 0, duration: 2000 }} />
                      <span className="ml-1 text-[#A78A9F] text-xl sm:text-2xl">{s.suffix}</span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] font-poppins font-semibold uppercase tracking-[0.14em] text-[#381932]/60 mt-1">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-5 w-full"
            >
              <div className="relative w-full rounded-[26px] overflow-hidden border border-[#E6D7C5] shadow-[0_24px_55px_-30px_rgba(56,25,50,0.5)] aspect-[4/5] bg-[#381932] group">
                <img
                  src={STORY_IMAGE}
                  alt="Bespoke celebration experience by The Decor Party"
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#381932]/60 via-transparent to-transparent pointer-events-none" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* SECTION 3 — WHY CHOOSE US (icon row)                                  */}
        {/* ===================================================================== */}
        <section data-nav-theme="light" className="w-full py-10 sm:py-12 px-6">
          <div className="mx-auto max-w-7xl">
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
              <span className="inline-flex items-center gap-2 text-[11px] font-poppins font-semibold uppercase tracking-[0.2em] text-[#A78A9F] mb-3">
                <Sprig className="w-14 h-5 text-[#A78A9F]" />
                The Difference
                <Sprig className="w-14 h-5 text-[#A78A9F] -scale-x-100" />
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold uppercase tracking-tight text-[#381932]">
                Why Choose The Decor Party
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
              {WHY_CHOOSE_US.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="flex flex-col items-center text-center gap-2.5 rounded-[20px] border border-[#E6D7C5] bg-[#FFF3E6] p-5 shadow-[0_10px_30px_-22px_rgba(56,25,50,0.4)] transition-transform duration-300 hover:-translate-y-1"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#A78A9F] text-[#FFF3E6] shadow-[0_8px_18px_-8px_rgba(167,138,159,0.9)]">
                    <Icon size={20} />
                  </span>
                  <span className="font-serif text-[13px] font-bold uppercase tracking-tight text-[#381932] leading-tight">
                    {title}
                  </span>
                  <span className="text-[11px] text-[#381932]/60">{description}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* SECTION 5 — HOW IT WORKS                                              */}
        {/* ===================================================================== */}
        <section id="process" data-nav-theme="light" className="w-full py-10 sm:py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="inline-flex items-center gap-2 text-[11px] font-poppins font-semibold uppercase tracking-[0.2em] text-[#A78A9F] mb-3">
                <Sprig className="w-14 h-5 text-[#A78A9F]" />
                Seamless Booking Flow
                <Sprig className="w-14 h-5 text-[#A78A9F] -scale-x-100" />
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[44px] font-bold uppercase tracking-tight text-[#381932]">
                How It Works
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {PROCESS_STEPS.map((step, i) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: i * 0.07 }}
                  className="relative h-full rounded-[22px] bg-[#FFF3E6] p-6 border border-[#E6D7C5] shadow-[0_12px_34px_-22px_rgba(56,25,50,0.4)] transition-transform duration-300 hover:-translate-y-1"
                >
                  <span className="font-serif text-3xl font-bold text-[#A78A9F]/45">{step.step}</span>
                  <h3 className="font-serif text-base font-bold uppercase tracking-tight text-[#381932] mt-2 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-[13px] text-[#381932]/75 leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* SECTION 6 — FOUNDER SIGN-OFF                                          */}
        {/* ===================================================================== */}
        <section data-nav-theme="dark" className="w-full max-w-6xl mx-auto py-10 px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative bg-[#381932] rounded-[28px] p-8 sm:p-14 border border-[#E6D7C5]/20 text-center flex flex-col items-center gap-6 shadow-[0_30px_70px_-35px_rgba(56,25,50,0.8)] overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#A78A9F]/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center gap-5">
              <div className="w-12 h-12 rounded-full bg-[#A78A9F]/25 text-[#FFF3E6] flex items-center justify-center">
                <Quote size={20} />
              </div>

              <blockquote className="font-serif text-xl sm:text-2xl lg:text-[26px] font-medium uppercase tracking-tight text-[#FFF3E6] leading-[1.35] max-w-3xl">
                Every celebration is someone's once-in-a-lifetime moment. We started The Decor Party
                to ensure every setup feels effortless, personal, and impeccably styled.
              </blockquote>

              <div className="w-16 h-[1px] bg-[#A78A9F]/50 my-1" />

              <div className="flex flex-col items-center gap-1">
                <span className="font-script text-2xl sm:text-3xl text-[#A78A9F]">
                  Revanth &amp; Prashanth B S
                </span>
                <span className="text-[11px] sm:text-xs font-poppins font-medium tracking-[0.16em] text-[#FFF3E6]/70 uppercase">
                  Founders &amp; Creative Directors, The Decor Party
                </span>
              </div>

              <Link
                to="/packages"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#FFF3E6] text-[#381932] px-6 py-3 text-[11px] font-serif font-semibold uppercase tracking-wide shadow-sm hover:bg-[#A78A9F] hover:text-[#FFF3E6] transition-colors group/btn"
              >
                Explore Our Packages
                <ArrowRight size={13} className="transition-transform group-hover/btn:translate-x-0.5" />
              </Link>
            </div>
          </motion.div>
        </section>
      </div>
    </>
  );
};

export default AboutPage;
