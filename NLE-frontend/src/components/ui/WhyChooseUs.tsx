import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { MapPin, Sparkles, Clock, ArrowRight } from 'lucide-react';

interface FeatureItem {
  icon: React.ElementType;
  title: string;
  description: string;
  /** Optional per-feature image -- when set, the pinned right-column image
   * crossfades to it as this card scrolls into view. Features that omit it
   * simply keep showing the section's base `imageUrl`. */
  image?: string;
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
    description: 'Express Delivery, delivered right on schedule.',
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
  ctaLabel?: string;
  ctaHref?: string;
}

export const WhyChooseUs: React.FC<WhyChooseUsProps> = ({
  eyebrow = 'Why Choose Us',
  title = 'Beautiful Celebrations,',
  titleAccent = 'Beautifully Delivered.',
  description = "We bring together verified master stylists, honest pricing, and picture-accurate décor craftsmanship — the kind of celebration service we'd trust for our own milestone moments.",
  features = DEFAULT_FEATURES,
  imageUrl = '/birthday-landscape.jpg',
  imageAlt = 'Premium celebration décor setup',
  ctaLabel = 'Explore All',
  ctaHref = '/explore',
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeImage, setActiveImage] = useState(imageUrl);

  // Scroll-linked parallax: as the section travels through the viewport,
  // the showcase image drifts gently on its own axis (like the reference
  // site's scroll-tied imagery) rather than just fading in once.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ['-6%', '6%']);

  // Optional image sync: only kicks in for features that actually specify
  // their own `image` -- with the default feature set (none do) this is a
  // no-op and the pinned image never changes from `imageUrl`.
  const hasPerFeatureImages = features.some((f) => f.image);
  useEffect(() => {
    if (!hasPerFeatureImages) {
      setActiveImage(imageUrl);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idx = cardRefs.current.findIndex((el) => el === entry.target);
          const next = features[idx]?.image;
          if (next) setActiveImage(next);
        });
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );

    cardRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [features, hasPerFeatureImages, imageUrl]);

  return (
    <section
      ref={sectionRef}
      id="why-us"
      data-nav-theme="light"
      className="relative w-full bg-[#FFF3E6]"
    >
      <div className="relative mx-auto max-w-[1720px] px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">

          {/* LEFT COLUMN: Narrative & feature highlights -- scrolls
              naturally past the pinned image on the right. */}
          <div className="lg:col-span-5 flex flex-col justify-center py-10 lg:py-16">
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-[11px] font-poppins font-semibold uppercase tracking-[0.2em] text-[#A78A9F] mb-3"
            >
              {eyebrow}
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="font-serif text-3xl sm:text-4xl md:text-[44px] font-bold uppercase leading-[1.08] text-[#381932] tracking-tight mb-5"
            >
              {title} <span className="text-[#A78A9F]">{titleAccent}</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
              className="text-sm sm:text-[15px] leading-relaxed text-[#381932]/80 max-w-lg mb-8 sm:mb-10"
            >
              {description}
            </motion.p>

            <div className="flex flex-col gap-3.5">
              {features.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    ref={(el) => { cardRefs.current[idx] = el; }}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.24 + idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className="flex items-start gap-4 rounded-[18px] border border-[#E6D7C5] bg-[#FFF3E6] p-4 sm:p-5 shadow-[0_10px_30px_-22px_rgba(56,25,50,0.4)] transition-transform duration-300 hover:-translate-y-1"
                  >
                    <div className="w-11 h-11 shrink-0 rounded-full bg-[#A78A9F] flex items-center justify-center text-[#FFF3E6] shadow-[0_8px_18px_-8px_rgba(167,138,159,0.9)]">
                      <IconComponent size={18} />
                    </div>
                    <div>
                      <h3 className="font-serif text-sm font-bold uppercase tracking-tight text-[#381932] mb-1">
                        {item.title}
                      </h3>
                      <p className="text-[13px] leading-relaxed text-[#381932]/70">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {ctaLabel && ctaHref && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.24 + features.length * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="mt-7"
              >
                <Link
                  to={ctaHref}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#381932] hover:bg-[#483250] text-[#FFF3E6] px-5 py-2.5 text-[11px] font-serif font-semibold uppercase tracking-wide shadow-sm transition-colors group/btn"
                >
                  {ctaLabel}
                  <ArrowRight size={13} className="transition-transform group-hover/btn:translate-x-0.5" />
                </Link>
              </motion.div>
            )}
          </div>

          {/* RIGHT COLUMN: Showcase image, pinned via sticky positioning on
              desktop while the left column scrolls past it. Wider than the
              text column and stretched to match its height (rather than a
              fixed vh calc) so the image scales with however much text
              content is there. Stacks below the content with no sticky
              behavior under lg. */}
          <div className="lg:col-span-7 lg:sticky lg:top-24 lg:self-stretch lg:min-h-[560px] py-6 lg:py-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full h-[340px] sm:h-[420px] lg:h-full rounded-[24px] overflow-hidden border border-[#E6D7C5] shadow-[0_24px_60px_-34px_rgba(56,25,50,0.45)] group"
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage}
                  src={activeImage}
                  alt={imageAlt}
                  initial={hasPerFeatureImages ? { opacity: 0 } : false}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  style={{ y: imageY }}
                  className="absolute inset-0 h-[120%] w-full -top-[10%] object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />
              </AnimatePresence>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
