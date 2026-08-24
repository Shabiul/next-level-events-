import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import {
  Sparkles,
  Clock,
  Camera,
  UserCheck,
  ShieldCheck,
  Palette,
  HeartHandshake,
  Quote,
} from 'lucide-react';
import { SeoHead } from '../../components/layout/SeoHead';

// Interactive 3D Tilt Card Component
const ThreeDCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
}> = ({ children, className = '', delay = 0 }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotX, setRotX] = React.useState(0);
  const [rotY, setRotY] = React.useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotX((-y / rect.height) * 10);
    setRotY((x / rect.width) * 10);
  };

  const handleMouseLeave = () => {
    setRotX(0);
    setRotY(0);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
      animate={{
        rotateX: rotX,
        rotateY: rotY,
      }}
      className={`transition-transform duration-200 ease-out ${className}`}
    >
      <div style={{ transform: 'translateZ(20px)' }}>{children}</div>
    </motion.div>
  );
};

export const AboutPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const splitRef = useRef<HTMLDivElement>(null);

  // Scroll Progress Bindings for 3D Parallax & Depth
  const { scrollYProgress: heroScroll } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const { scrollYProgress: splitScroll } = useScroll({
    target: splitRef,
    offset: ['start end', 'end start'],
  });

  // Smooth Spring Transforms
  const heroScale = useSpring(useTransform(heroScroll, [0, 0.6], [1, 0.94]), {
    stiffness: 100,
    damping: 20,
  });
  const heroRotateX = useSpring(useTransform(heroScroll, [0, 0.6], [0, 6]), {
    stiffness: 100,
    damping: 20,
  });
  const heroImgY = useTransform(heroScroll, [0, 0.6], [0, 50]);

  const splitImgRotateY = useSpring(
    useTransform(splitScroll, [0, 1], [-8, 8]),
    { stiffness: 100, damping: 20 }
  );
  const splitImgY = useTransform(splitScroll, [0, 1], [-30, 30]);

  const pillars = [
    {
      icon: Clock,
      title: 'Prime Location & Timing',
      description:
        'We value your time above all else. Our dedicated styling crew arrives promptly to ensure your setup is completed well before your guests arrive.',
    },
    {
      icon: Camera,
      title: 'Real-to-Photo Guarantee',
      description:
        'What you see in our catalog is exactly what you get at your event. We guarantee 100% fidelity in colors, balloon density, and aesthetic arrangement.',
    },
    {
      icon: UserCheck,
      title: 'Verified Master Stylists',
      description:
        'Our decorators undergo rigorous training and background checks. They bring professional finesse, safety standards, and artistic care to your home or venue.',
    },
    {
      icon: ShieldCheck,
      title: 'Upfront & Honest Pricing',
      description:
        'No hidden fees or unexpected surcharges on event day. All costs are transparently detailed upfront so you can plan your budget with complete confidence.',
    },
    {
      icon: Palette,
      title: 'Bespoke Customization',
      description:
        'Every setup can be personalized to fit your theme, color scheme, and venue layout. We tailor fonts, neon signs, and backdrops to match your vision.',
    },
    {
      icon: HeartHandshake,
      title: 'End-to-End Execution',
      description:
        'From initial concept and material delivery to post-event teardown options, we manage the complete lifecycle so you enjoy a hassle-free celebration.',
    },
  ];

  return (
    <>
      <SeoHead
        title="About Us — TheDecorParty | Bespoke Celebration & Event Styling"
        description="Providing Bengaluru's finest bespoke styling and surprise experiences. Discover our story, standards, and founder commitment at TheDecorParty."
      />

      <div
        ref={containerRef}
        className="w-full bg-[#F8F6F2] text-[#34203C] font-sans antialiased selection:bg-[#A78A9F]/20 overflow-x-hidden"
      >
        {/* ========================================================================= */}
        {/* SECTION 1 — HERO HEADER BANNER (3D Parallax Scroll)                      */}
        {/* ========================================================================= */}
        <section data-nav-theme="light" className="w-full max-w-7xl mx-auto pt-8 pb-4 px-6 perspective-[1200px]">
          <motion.div
            style={{
              scale: heroScale,
              rotateX: heroRotateX,
              transformStyle: 'preserve-3d',
            }}
            className="relative w-full h-[280px] sm:h-[380px] rounded-[32px] sm:rounded-[40px] overflow-hidden shadow-2xl border border-[#A78A9F]/30 bg-[#34203C]"
          >
            {/* Background Image with 3D Parallax */}
            <motion.img
              style={{ y: heroImgY }}
              src="/about-purple-banner.png"
              alt="TheDecorParty Luxury Setup"
              className="w-full h-[120%] object-cover object-center scale-105"
            />

            {/* Gradient Overlay matching Reference */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#2A1732]/90 via-[#34203C]/60 to-black/35 backdrop-blur-[1px]" />

            {/* Centered Headline matching Murudeshwara layout */}
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 z-10">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="font-serif text-4xl sm:text-5xl lg:text-[64px] font-normal tracking-tight text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)] mb-3"
              >
                About Us
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-[0.3em] text-[#C9BEAB] drop-shadow-md"
              >
                <Sparkles size={14} className="text-[#C9BEAB]" />
                <span>OUR STORY</span>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2 — NARRATIVE SPLIT SECTION ("WHO WE ARE")                        */}
        {/* ========================================================================= */}
        <section
          ref={splitRef}
          data-nav-theme="light"
          className="w-full max-w-7xl mx-auto py-16 sm:py-20 px-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Column (7 cols) */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-7 flex flex-col text-left"
            >
              <div className="flex items-center gap-2 text-sm sm:text-base font-extrabold uppercase tracking-[0.32em] text-[#A78A9F] mb-4">
                <span>WHO WE ARE</span>
              </div>

              <h2 className="font-serif text-4xl sm:text-5xl lg:text-[56px] font-semibold leading-[1.12] text-[#34203C] mb-7">
                Providing the Best Bespoke Celebration Experience in{' '}
                <span className="font-serif italic text-[#725D75]">
                  Bengaluru
                </span>
              </h2>

              <div className="space-y-5 text-lg sm:text-xl text-[#725D75] leading-relaxed font-normal">
                <p>
                  At TheDecorParty, we are committed to delivering top-tier styling and surprise celebration services. From intimate residential anniversaries to grand milestone extravagances, we ensure every aspect of your event is handled with absolute professionalism.
                </p>
                <p>
                  Our team of experienced master stylists and friendly event coordinators work around the clock to create seamless, memorable journeys and picture-perfect backdrops across Bengaluru.
                </p>
              </div>
            </motion.div>

            {/* Right Column 3D Image Showcase (5 cols) */}
            <motion.div
              style={{
                rotateY: splitImgRotateY,
                y: splitImgY,
                transformStyle: 'preserve-3d',
              }}
              className="lg:col-span-5 w-full perspective-[1000px]"
            >
              <div className="relative w-full rounded-[32px] sm:rounded-[36px] overflow-hidden shadow-2xl border border-[#A78A9F]/25 aspect-[4/5] bg-[#34203C]">
                <img
                  src="/about-aesthetic.png"
                  alt="Bespoke Celebration Experience"
                  className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#34203C]/70 via-transparent to-transparent pointer-events-none" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3 — CORE PILLARS GRID ("Why Bengaluru Chooses Us")               */}
        {/* ========================================================================= */}
        <section
          data-nav-theme="light"
          className="w-full py-20 px-6 bg-[#FAF8F5] border-y border-[#A78A9F]/15"
        >
          <div className="max-w-7xl mx-auto">
            {/* Centered Title matching Reference Image 3 */}
            <div className="text-center max-w-3xl mx-auto mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="font-serif text-3xl sm:text-4xl lg:text-[48px] font-normal text-[#34203C] mb-4 tracking-tight"
              >
                Why Bengaluru Chooses Us
              </motion.h2>
              <p className="text-base text-[#725D75] max-w-xl mx-auto">
                Discover the foundational standards that make every celebration with us effortless and unforgettable.
              </p>
            </div>

            {/* 3D Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pillars.map((pillar, idx) => {
                const Icon = pillar.icon;
                return (
                  <ThreeDCard key={pillar.title} delay={idx * 0.1}>
                    <div className="h-full bg-white rounded-[28px] p-8 border border-[#A78A9F]/20 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group">
                      <div>
                        {/* Circular Icon Pill Badge */}
                        <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#A78A9F]/25 flex items-center justify-center text-[#A78A9F] mb-6 shadow-sm group-hover:bg-[#34203C] group-hover:text-[#C9BEAB] transition-colors">
                          <Icon size={20} />
                        </div>

                        <h3 className="font-serif text-xl font-bold text-[#34203C] mb-3">
                          {pillar.title}
                        </h3>

                        <p className="text-sm sm:text-[15px] text-[#725D75] leading-relaxed font-light">
                          {pillar.description}
                        </p>
                      </div>
                    </div>
                  </ThreeDCard>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 4 — FOUNDER SIGN-OFF & LEADERSHIP SECTION                        */}
        {/* ========================================================================= */}
        <section data-nav-theme="dark" className="w-full max-w-6xl mx-auto py-16 px-6">
          <ThreeDCard delay={0.1}>
            <div className="bg-[#34203C] rounded-[32px] p-8 sm:p-14 border border-[#A78A9F]/30 text-center flex flex-col items-center gap-6 shadow-2xl relative overflow-hidden">
              {/* Soft Ambient Radial Glows */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#A78A9F]/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#483250]/40 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center gap-5">
                {/* Quote Icon */}
                <div className="w-12 h-12 rounded-full bg-[#A78A9F]/20 text-[#C9BEAB] border border-[#A78A9F]/30 flex items-center justify-center shadow-inner">
                  <Quote size={20} />
                </div>

                {/* Quote Message */}
                <blockquote className="font-serif text-xl sm:text-2xl lg:text-[28px] italic font-normal text-[#FAF8F5] leading-relaxed max-w-3xl">
                  “Every celebration is someone’s once-in-a-lifetime moment. We started TheDecorParty to ensure every setup feels effortless, personal, and impeccably styled.”
                </blockquote>

                <div className="w-24 h-[1px] bg-[#A78A9F]/40 my-2" />

                {/* Founder Identity */}
                <div className="flex flex-col items-center gap-1">
                  <span className="font-serif text-xl sm:text-2xl font-semibold text-[#C9BEAB]">
                    Prashanth B S
                  </span>
                  <span className="text-xs sm:text-sm font-medium tracking-wider text-[#A78A9F] uppercase">
                    Founders &amp; Creative Directors, TheDecorParty
                  </span>

                  <div className="font-serif italic text-2xl text-[#C9BEAB] opacity-80 tracking-widest mt-2 select-none">
                    Prashanth B S
                  </div>
                </div>
              </div>
            </div>
          </ThreeDCard>
        </section>
      </div>
    </>
  );
};

export default AboutPage;

