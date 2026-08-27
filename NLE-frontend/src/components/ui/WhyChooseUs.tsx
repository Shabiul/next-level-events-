import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
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
  const sectionRef = useRef<HTMLElement>(null);

  // Scroll-linked parallax: as the section travels through the viewport,
  // the showcase image drifts gently on its own axis (like the reference
  // site's scroll-tied imagery) rather than just fading in once.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ['-6%', '6%']);

  return (
    <section
      ref={sectionRef}
      id="why-us"
      data-nav-theme="light"
      className="relative w-full overflow-hidden bg-[#F9F6F2]"
    >
      <div className="relative mx-auto max-w-[1720px] px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">

          {/* LEFT COLUMN: Narrative & feature highlights */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-xs font-semibold tracking-wide text-[#A78A9F] mb-3"
            >
              {eyebrow}
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold leading-[1.1] text-[#725D75] tracking-tight mb-5"
            >
              {title} <span className="italic text-[#A78A9F]">{titleAccent}</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
              className="text-sm sm:text-base leading-relaxed text-[#746B72] max-w-lg mb-8 sm:mb-10"
            >
              {description}
            </motion.p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {features.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.24 + idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
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

          {/* RIGHT COLUMN: Showcase image with scroll-linked parallax */}
          <div className="lg:col-span-6 h-full flex items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full h-[340px] sm:h-[420px] lg:h-[480px] rounded-2xl overflow-hidden shadow-sm group"
            >
              <motion.img
                src={imageUrl}
                alt={imageAlt}
                style={{ y: imageY }}
                className="absolute inset-0 h-[120%] w-full -top-[10%] object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
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
