import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Sparkles, Clock } from 'lucide-react';

interface FeatureItem {
  icon: React.ElementType;
  title: string;
  description: string;
}

const DEFAULT_FEATURES: FeatureItem[] = [
  {
    icon: MapPin,
    title: 'All Bengaluru Locations',
    description: 'Direct doorstep setup across every neighborhood, corner to corner.',
  },
  {
    icon: Sparkles,
    title: 'Premium Quality',
    description: 'Handpicked decor and verified master stylists on every booking.',
  },
  {
    icon: Clock,
    title: 'On-Time, Every Time',
    description: 'Express 3-hour setup slots, delivered right on schedule.',
  },
];

interface WhyChooseUsProps {
  eyebrow?: string;
  title?: string;
  titleAccent?: string;
  description?: string;
  features?: FeatureItem[];
  imageUrl?: string;
  imageAlt?: string;
}

export const WhyChooseUs: React.FC<WhyChooseUsProps> = ({
  eyebrow = 'Why Choose Us',
  title = 'Beautiful Celebrations,',
  titleAccent = 'Beautifully Delivered.',
  description = "We bring together verified master stylists, honest pricing, and picture-accurate décor craftsmanship — the kind of celebration service we'd trust for our own milestone moments.",
  features = DEFAULT_FEATURES,
  imageUrl = '/birthday-landscape.jpg',
  imageAlt = 'Premium celebration décor setup',
}) => {
  return (
    <section
      id="why-us"
      data-nav-theme="light"
      className="relative w-full overflow-hidden bg-[#F9F6F2]"
    >
      <div className="relative mx-auto max-w-[1720px] px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">

          {/* LEFT COLUMN: Narrative & feature highlights */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <p className="text-xs font-semibold tracking-wide text-[#A78A9F] mb-3">
              {eyebrow}
            </p>

            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold leading-[1.1] text-[#725D75] tracking-tight mb-5">
              {title} <span className="italic text-[#A78A9F]">{titleAccent}</span>
            </h2>

            <p className="text-sm sm:text-base leading-relaxed text-[#746B72] max-w-lg mb-8 sm:mb-10">
              {description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {features.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    className="rounded-xl border border-[#E4DCD2] bg-white p-4 sm:p-5"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#F3EFE7] flex items-center justify-center text-[#725D75] mb-3">
                      <IconComponent size={18} />
                    </div>
                    <h3 className="text-sm font-semibold text-[#2F2930] mb-1">
                      {item.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-[#746B72]">
                      {item.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN: Showcase image */}
          <div className="lg:col-span-6 h-full flex items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative w-full h-[340px] sm:h-[420px] lg:h-[480px] rounded-2xl overflow-hidden shadow-sm group"
            >
              <img
                src={imageUrl}
                alt={imageAlt}
                className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
              />
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
