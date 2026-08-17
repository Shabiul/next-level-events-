import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Wallet,
  Sparkles,
  Clock,
  CheckCircle2,
  Star,
  ArrowUpRight,
} from 'lucide-react';

interface FeatureItem {
  icon: React.ElementType;
  title: string;
  description: string;
}

const DEFAULT_FEATURES: FeatureItem[] = [
  {
    icon: ShieldCheck,
    title: 'Verified, Master Stylists',
    description:
      'Every decorator is background-checked, certified in balloon architecture, and trained in on-time hospitality.',
  },
  {
    icon: Wallet,
    title: 'Transparent Pricing',
    description:
      'The fare you’re quoted is the fare you pay. Tolls, taxes & stylist charges shown upfront — no surprises.',
  },
  {
    icon: Sparkles,
    title: '100% Real-To-Photo Guarantee',
    description:
      'Exact Pantone color matching, 48h helium float retention, and premium metallic & eco-friendly latex.',
  },
  {
    icon: Clock,
    title: 'Express 3-Hour Booking',
    description:
      'Same-day emergency setup across all Bengaluru pincodes with real-time decorator tracking from dispatch to door.',
  },
];

interface WhyChooseUsProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  features?: FeatureItem[];
  imageUrl?: string;
  imageAlt?: string;
}

export const WhyChooseUs: React.FC<WhyChooseUsProps> = ({
  eyebrow = 'WHY THEDECORPARTY',
  title = 'Why choose TheDecorParty?',
  description = "Award-worthy celebrations aren't a slogan here — it's verified master stylists, honest pricing, and decor craftsmanship we'd trust for our own milestone moments.",
  features = DEFAULT_FEATURES,
  imageUrl = 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&auto=format&fit=crop&q=85',
  imageAlt = 'Luxury Party & Celebration Decor Setup',
}) => {
  return (
    <section
      id="why-us"
      data-nav-theme="dark"
      className="relative w-full overflow-hidden border-y border-[#483250]/40 text-[#FAF8F5] py-16 sm:py-20 lg:py-24 transition-colors duration-300"
      style={{
        background: 'linear-gradient(150deg, #1F1224 0%, #2A1732 45%, #34203C 85%, #25172C 100%)',
      }}
    >
      {/* Ambient website-themed luxury purple & champagne glow effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#725D75]/20 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#483250]/25 rounded-full blur-3xl pointer-events-none translate-x-1/3 translate-y-1/3" />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-[#C9BEAB]/5 rounded-full blur-2xl pointer-events-none" />

      <div className="relative mx-auto max-w-[1600px] px-6 sm:px-10 lg:px-16 xl:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 xl:gap-20 items-center">
          
          {/* ========================================================================= */}
          {/* LEFT COLUMN: Narrative & 2x2 Feature Highlights                            */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Eyebrow with horizontal dash */}
            <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold uppercase tracking-[0.22em] text-[#C9BEAB] mb-4">
              <span className="w-6 sm:w-8 h-[1.5px] bg-[#C9BEAB]" />
              <span>{eyebrow}</span>
            </div>

            {/* Main Headline */}
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[50px] font-normal leading-[1.12] text-[#FAF8F5] tracking-tight mb-5">
              {title}
            </h2>

            {/* Subheadline narrative */}
            <p className="text-sm sm:text-base md:text-[16px] font-light leading-relaxed text-[#C8B5C3] max-w-2xl mb-10 sm:mb-12">
              {description}
            </p>

            {/* 2x2 Feature Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 sm:gap-x-10 gap-y-8 sm:gap-y-10">
              {features.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    className="group flex flex-col items-start"
                  >
                    {/* Circular Icon with website brand color accents */}
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-[#A78A9F]/40 bg-[#34203C]/80 flex items-center justify-center text-[#C9BEAB] mb-3.5 group-hover:border-[#C9BEAB] group-hover:bg-[#483250] group-hover:text-[#FAF8F5] transition-all duration-300 shadow-md">
                      <IconComponent className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                    </div>

                    {/* Title */}
                    <h3 className="text-base sm:text-[17px] font-semibold text-[#FAF8F5] mb-1.5 tracking-tight group-hover:text-[#C9BEAB] transition-colors">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs sm:text-[13.5px] font-light text-[#C8B5C3] leading-relaxed">
                      {item.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: Luxury Showcase Visual                                      */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 h-full flex items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative w-full h-[460px] sm:h-[520px] lg:h-[580px] xl:h-[620px] rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl border border-[#A78A9F]/30 group"
            >
              {/* Showcase Image */}
              <img
                src={imageUrl}
                alt={imageAlt}
                className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
              />

              {/* Gradient lighting overlay matching brand colors */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1F1224]/90 via-[#25172C]/20 to-black/20 pointer-events-none" />

              {/* Top floating trust badge */}
              <div className="absolute top-4 right-4 sm:top-5 sm:right-5 bg-[#25172C]/90 backdrop-blur-md border border-[#A78A9F]/35 px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                <Star className="w-3.5 h-3.5 text-[#C9BEAB] fill-[#C9BEAB]" />
                <span className="text-xs font-medium text-[#FAF8F5] tracking-wide">
                  4.98/5 Rated (2,400+ Events)
                </span>
              </div>

              {/* Bottom detail card */}
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 bg-[#25172C]/90 backdrop-blur-md border border-[#A78A9F]/35 rounded-xl p-4 sm:p-5 flex items-center justify-between shadow-xl">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#C9BEAB] flex items-center gap-1.5 mb-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C9BEAB]" />
                    Picture-Accurate Guarantee
                  </p>
                  <p className="text-xs sm:text-sm font-light text-[#FAF8F5]/90">
                    What you see in catalogue is exactly what is staged.
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#34203C] border border-[#A78A9F]/30 flex items-center justify-center text-[#C9BEAB] shrink-0 ml-3 group-hover:bg-[#C9BEAB] group-hover:text-[#34203C] transition-all">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
