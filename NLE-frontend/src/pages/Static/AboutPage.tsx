import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Heart,
  Eye,
  Wand2,
  PartyPopper,
  CheckCircle2,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react';
import { SeoHead } from '../../components/layout/SeoHead';

export const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  const philosophySteps = [
    {
      number: '01',
      title: 'LISTEN',
      subtitle: 'Understand the moment.',
      description: 'We listen to your occasion, guest vibe, space layout, and emotional intent before proposing any aesthetic.',
      icon: Eye,
    },
    {
      number: '02',
      title: 'IMAGINE',
      subtitle: 'Find the visual story.',
      description: 'We curate bespoke palettes, neon accents, textured balloon architecture, and bespoke ambient lighting tailored to you.',
      icon: Wand2,
    },
    {
      number: '03',
      title: 'CREATE',
      subtitle: 'Turn the idea into something tangible.',
      description: 'Our certified master stylists execute the decor on-site with meticulous precision and 100% picture-match guarantee.',
      icon: Sparkles,
    },
    {
      number: '04',
      title: 'CELEBRATE',
      subtitle: 'Let the space make the moment memorable.',
      description: 'Step into a transformed room that elevates your milestone celebration and leaves lasting memories for years.',
      icon: PartyPopper,
    },
  ];

  const founders = [
    {
      name: 'Prashanth B S',
      role: 'Founder & Creative Lead',
      bio: 'Passionate about experiential design and turning ordinary residential and outdoor venues into cinematic celebrations.',
      initials: 'PB',
    },
    {
      name: 'Revanth L M',
      role: 'Founder & Operations Lead',
      bio: 'Dedicated to hospitality excellence, flawless on-time delivery across Bengaluru, and perfection in every subtle detail.',
      initials: 'RL',
    },
  ];

  return (
    <>
      <SeoHead
        title="About Us — TheDecorParty | Bespoke Celebration & Event Styling"
        description="TheDecorParty turns ideas into beautifully styled spaces and celebrations that feel personal, memorable, and completely yours across Bengaluru."
      />

      <div className="flex flex-col w-full bg-[#FAF8F5] dark:bg-[#1B101F] text-[#34203C] dark:text-[#FAF8F5] font-sans antialiased transition-colors overflow-hidden">
        
        {/* ========================================================================= */}
        {/* SECTION 01 — HERO (Editorial Statement)                                  */}
        {/* ========================================================================= */}
        <section
          data-nav-theme="light"
          className="relative w-full pt-12 sm:pt-16 md:pt-20 pb-12 sm:pb-16 px-4 sm:px-6 md:px-8 lg:px-12 max-w-[1720px] mx-auto"
        >
          {/* Ambient Glows */}
          <div className="absolute top-10 left-1/4 w-96 h-96 rounded-full bg-[#A78A9F]/10 blur-3xl pointer-events-none -z-10" />
          <div className="absolute top-40 right-10 w-96 h-96 rounded-full bg-[#C9BEAB]/15 blur-3xl pointer-events-none -z-10" />

          <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-10 sm:mb-14">
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#34203C]/06 dark:bg-white/10 border border-[#34203C]/10 dark:border-white/15 text-xs font-bold uppercase tracking-[0.22em] text-[#725D75] dark:text-[#C9BEAB] mb-4 sm:mb-6"
            >
              <Sparkles size={13} className="text-[#A78A9F]" />
              <span>ABOUT THEDECORPARTY</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-normal tracking-tight text-[#34203C] dark:text-[#FAF8F5] leading-[1.12] mb-6"
            >
              We don't just decorate spaces.{' '}
              <span className="font-serif italic text-[#725D75] dark:text-[#C9BEAB] block sm:inline">
                We set the scene for memories.
              </span>
            </motion.h1>

            {/* Text */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-sm sm:text-base md:text-lg font-light leading-relaxed text-[#725D75] dark:text-[#C8B5C3] max-w-2xl"
            >
              TheDecorParty turns ideas into beautifully styled spaces and celebrations that feel personal, memorable, and completely yours.
            </motion.p>
          </div>

          {/* Hero Visual Banner Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative w-full max-w-6xl mx-auto overflow-hidden rounded-[28px] sm:rounded-[36px] border border-[#DDD5C7] dark:border-[#483250] shadow-2xl bg-[#34203C] aspect-[16/9] sm:aspect-[21/9] max-h-[480px]"
          >
            <img
              src="/about-purple-decor.png"
              alt="TheDecorParty Bespoke Celebration Setup"
              className="h-full w-full object-cover object-center transition-transform duration-1000 hover:scale-103"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#25172C]/80 via-black/20 to-transparent pointer-events-none" />
            
            {/* Floating Glass Pill Badge */}
            <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 flex items-center gap-2 rounded-full bg-black/50 backdrop-blur-md border border-white/20 px-4 py-2 text-xs font-semibold text-white shadow-lg">
              <span className="h-2 w-2 rounded-full bg-[#C9BEAB] animate-pulse" />
              <span>Thoughtfully Styled Across Bengaluru</span>
            </div>
          </motion.div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 02 — OUR STORY (Where It All Started)                            */}
        {/* ========================================================================= */}
        <section
          data-nav-theme="light"
          className="relative w-full py-14 sm:py-20 px-4 sm:px-6 md:px-8 lg:px-12 max-w-[1720px] mx-auto border-t border-[#DDD5C7]/70 dark:border-[#483250]/70"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 xl:gap-20 items-center">
            
            {/* Left Column: Narrative Copy */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-7 flex flex-col text-left"
            >
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-[#725D75] dark:text-[#A78A9F] mb-3 sm:mb-4">
                <span className="w-6 h-[1.5px] bg-[#A78A9F]" />
                <span>WHERE IT ALL STARTED</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[44px] font-normal tracking-tight text-[#34203C] dark:text-[#FAF8F5] leading-[1.15] mb-6">
                Every beautiful celebration starts with a{' '}
                <span className="font-serif italic text-[#725D75] dark:text-[#C9BEAB]">
                  little imagination.
                </span>
              </h2>

              <div className="flex flex-col gap-4 text-xs sm:text-sm md:text-[15px] leading-relaxed text-[#725D75] dark:text-[#C8B5C3] font-normal max-w-2xl">
                <p className="text-base sm:text-lg font-medium text-[#34203C] dark:text-[#FAF8F5] leading-snug">
                  We believe a space can change the way a moment feels.
                </p>
                <div className="p-4 sm:p-5 rounded-2xl bg-[#34203C]/05 dark:bg-white/05 border-l-2 border-[#A78A9F] flex flex-col gap-1.5 italic font-serif text-sm sm:text-base text-[#34203C] dark:text-[#FAF8F5]">
                  <p>A room can become a surprise.</p>
                  <p>A corner can become a memory.</p>
                  <p>A few carefully chosen details can become the backdrop to a story you'll remember for years.</p>
                </div>
                <p className="mt-1">
                  That's the thinking behind <strong>TheDecorParty</strong>.
                </p>
                <p>
                  We bring together creative ideas, thoughtful styling, and hands-on execution to transform everyday spaces into celebrations that feel considered, personal, and completely yours.
                </p>
              </div>
            </motion.div>

            {/* Right Column: High-Aesthetic Portrait Image Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-5 w-full flex justify-center"
            >
              <div className="relative w-full overflow-hidden rounded-[32px] sm:rounded-[40px] shadow-2xl border border-[#DDD5C7] dark:border-[#483250] aspect-[4/5] max-h-[580px] group bg-[#FAF8F5] dark:bg-[#2D1C34]">
                <img
                  src="/about-aesthetic.png"
                  alt="TheDecorParty Celebration Atmosphere"
                  className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-103"
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-black/5 dark:ring-white/10 rounded-[32px] sm:rounded-[40px] pointer-events-none" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 03 — OUR PHILOSOPHY (Our Way of Thinking)                        */}
        {/* ========================================================================= */}
        <section
          data-nav-theme="dark"
          className="relative w-full py-16 sm:py-20 lg:py-24 px-4 sm:px-6 md:px-8 lg:px-12 text-[#FAF8F5] border-y border-white/10"
          style={{
            background: 'linear-gradient(150deg, #1F1224 0%, #2A1732 45%, #34203C 85%, #25172C 100%)',
          }}
        >
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#483250]/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#A78A9F]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-[1720px] mx-auto">
            {/* Header */}
            <div className="max-w-3xl mb-12 sm:mb-16 text-left">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-[#C9BEAB] mb-3">
                <span className="w-6 h-[1.5px] bg-[#C9BEAB]" />
                <span>OUR WAY OF THINKING</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[48px] font-normal tracking-tight text-[#FAF8F5] leading-[1.12] mb-4">
                No two celebrations should feel the same.
              </h2>
              <div className="flex flex-col gap-2 text-xs sm:text-sm md:text-base font-light text-[#F6EFF4]/85 leading-relaxed">
                <p>We don't believe in simply repeating what has already been done.</p>
                <p>We start with your story — the occasion, the people, the space, the mood, and the little things that matter to you. Then we build around it.</p>
              </div>
            </div>

            {/* 4-Step Editorial Process Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {philosophySteps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                    className="group relative flex flex-col justify-between rounded-3xl border border-[#A78A9F]/25 bg-[#34203C]/80 p-6 sm:p-7 backdrop-blur-xl shadow-xl hover:border-[#C9BEAB]/50 hover:bg-[#483250]/80 transition-all duration-300 hover:-translate-y-1"
                  >
                    <div>
                      {/* Top Step Number & Icon */}
                      <div className="flex items-center justify-between mb-6">
                        <span className="font-serif text-2xl sm:text-3xl font-bold text-[#C9BEAB]/90 tracking-tight">
                          {step.number}
                        </span>
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/08 text-[#C9BEAB] border border-white/10 group-hover:bg-[#C9BEAB] group-hover:text-[#25172C] transition-colors">
                          <Icon size={18} />
                        </div>
                      </div>

                      {/* Step Title & Subtitle */}
                      <h3 className="font-serif text-lg sm:text-xl font-bold uppercase tracking-wider text-[#FAF8F5] mb-1">
                        {step.title}
                      </h3>
                      <p className="text-xs sm:text-[13px] font-semibold text-[#C9BEAB] mb-3">
                        {step.subtitle}
                      </p>

                      {/* Description */}
                      <p className="text-xs sm:text-[13px] font-light leading-relaxed text-[#DDD5C7]/85">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 04 — THE PEOPLE BEHIND THEDECORPARTY                             */}
        {/* ========================================================================= */}
        <section
          data-nav-theme="light"
          className="relative w-full py-16 sm:py-20 lg:py-24 px-4 sm:px-6 md:px-8 lg:px-12 max-w-[1720px] mx-auto"
        >
          <div className="max-w-3xl mb-12 sm:mb-14 text-left">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-[#725D75] dark:text-[#A78A9F] mb-3">
              <span className="w-6 h-[1.5px] bg-[#A78A9F]" />
              <span>MEET THE PEOPLE BEHIND THE PARTIES</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[46px] font-normal tracking-tight text-[#34203C] dark:text-[#FAF8F5] leading-[1.12] mb-4">
              A love for celebrations brought us here.
            </h2>
            <div className="flex flex-col gap-2.5 text-xs sm:text-sm md:text-[15px] font-normal text-[#725D75] dark:text-[#C8B5C3] leading-relaxed">
              <p>
                Behind every setup is a team that cares about the details most people don't see — the planning, the little adjustments, the finishing touches, and the final moment when everything comes together.
              </p>
              <p className="font-serif italic text-sm sm:text-base text-[#34203C] dark:text-[#FAF8F5]">
                We're not just here to put décor in a room. We're here to make the room feel different.
              </p>
            </div>
          </div>

          {/* Founders Duo Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl">
            {founders.map((founder, idx) => (
              <motion.div
                key={founder.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className="flex flex-col sm:flex-row items-start gap-5 p-6 sm:p-8 rounded-3xl border border-[#DDD5C7] dark:border-[#483250] bg-[#FAF8F5] dark:bg-[#25172C] shadow-lg hover:shadow-xl transition-shadow"
              >
                {/* Monogram Badge */}
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#34203C] to-[#483250] text-[#C9BEAB] font-serif text-xl font-bold shadow-md border border-[#A78A9F]/30">
                  {founder.initials}
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="rounded-full bg-[#C9BEAB]/20 border border-[#C9BEAB]/40 px-2.5 py-0.5 text-[10px] font-bold text-[#725D75] dark:text-[#C9BEAB] uppercase tracking-wider">
                      Founder
                    </span>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#34203C] dark:text-[#FAF8F5] tracking-tight">
                    {founder.name}
                  </h3>
                  <p className="text-xs font-semibold text-[#A78A9F] uppercase tracking-wider mb-2.5">
                    {founder.role}
                  </p>
                  <p className="text-xs sm:text-[13px] text-[#725D75] dark:text-[#C8B5C3] font-light leading-relaxed">
                    {founder.bio}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 05 — OUR PROMISE & CTA (Why We Do It)                            */}
        {/* ========================================================================= */}
        <section
          data-nav-theme="dark"
          className="relative w-full py-16 sm:py-20 lg:py-24 px-4 sm:px-6 md:px-8 lg:px-12 text-[#FAF8F5] border-t border-white/10 text-center"
          style={{
            background: 'linear-gradient(145deg, #26112A 0%, #371A3F 55%, #46224F 100%)',
          }}
        >
          {/* Ambient Glows */}
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#A78A9F]/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#483250]/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center gap-5 sm:gap-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-bold uppercase tracking-[0.22em] text-[#C9BEAB]">
              <Heart size={13} className="text-[#C9BEAB]" />
              <span>WHY WE DO IT</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[50px] font-normal tracking-tight leading-[1.12] text-[#FAF8F5]">
              Because the best celebrations aren't just beautiful.{' '}
              <span className="font-serif italic text-[#C9BEAB] block sm:inline">They're felt.</span>
            </h2>

            <div className="text-xs sm:text-sm md:text-base font-light text-[#F6EFF4]/85 max-w-2xl leading-relaxed space-y-3">
              <p>
                We want you to walk into your celebration and have that little moment of:
              </p>
              <p className="font-serif italic text-lg sm:text-xl text-white font-normal py-1">
                “This is exactly what I imagined.”
              </p>
              <p>
                That's why we care about thoughtful design, quality, clear communication, and getting every detail right.
              </p>
              <p className="font-medium text-[#C9BEAB]">
                You bring the reason to celebrate. We'll create the setting you'll remember.
              </p>
            </div>

            {/* Primary Action Button */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => navigate('/explore')}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#A78A9F] to-[#725D75] hover:from-[#C9BEAB] hover:to-[#A78A9F] px-8 sm:px-10 py-3.5 sm:py-4 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#FAF8F5] hover:text-[#25172C] shadow-xl hover:scale-103 active:scale-95 transition-all cursor-pointer"
              >
                <span>LET'S CREATE YOUR MOMENT</span>
                <ArrowRight size={16} />
              </button>

              <a
                href="https://wa.me/917022058460"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FAF8F5] px-7 py-3.5 text-xs sm:text-sm font-semibold tracking-wider text-[#1F1122] shadow-md hover:bg-white hover:scale-103 active:scale-95 transition-all"
              >
                <MessageSquare size={16} className="text-[#25D366]" />
                <span>WhatsApp Our Stylists</span>
              </a>
            </div>

            {/* Guarantees row */}
            <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-[11px] sm:text-xs text-[#FAF8F5]/75 font-medium tracking-wide">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-[#C9BEAB]" />
                <span>Zero Hidden Fees</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-[#C9BEAB]" />
                <span>Express 3-Hour Setup</span>
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-[#C9BEAB]" />
                <span>100% Picture-Match Guarantee</span>
              </span>
            </div>
          </div>
        </section>

      </div>
    </>
  );
};

export default AboutPage;
