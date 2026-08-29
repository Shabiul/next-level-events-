import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export type FAQCategory =
  | 'all'
  | 'bookings'
  | 'customisation'
  | 'venues'
  | 'addons';

export interface FAQItem {
  id: string;
  category: FAQCategory;
  categoryLabel: string;
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  // Bookings & Timing
  {
    id: 'b1',
    category: 'bookings',
    categoryLabel: 'Bookings & Timing',
    question: 'How early should I book?',
    answer:
      'We recommend booking 7–15 days in advance for regular celebrations. Larger or highly customised setups should ideally be booked earlier to ensure material availability and dedicated stylists.',
  },
  {
    id: 'b2',
    category: 'bookings',
    categoryLabel: 'Bookings & Timing',
    question: 'Which areas do you serve?',
    answer:
      'We are based in Bengaluru and provide decoration services across the city including Indiranagar, Koramangala, Whitefield, HSR Layout, Jayanagar, JP Nagar, Electronic City, Hebbal, and Sarjapur.',
  },
  {
    id: 'b3',
    category: 'bookings',
    categoryLabel: 'Bookings & Timing',
    question: 'How do I book The Decor Party?',
    answer:
      "Simply contact us with your occasion, date, location, theme, and approximate budget. You can book directly on our website, through our AI planner concierge, or by chatting with us on WhatsApp. We'll help you choose or customise a suitable setup.",
  },

  // Customisation & Decor
  {
    id: 'c1',
    category: 'customisation',
    categoryLabel: 'Customisation & Decor',
    question: 'What occasions do you decorate for?',
    answer:
      'We create décor for birthdays, proposals, anniversaries, baby showers, weddings, engagements, haldi, mehendi, housewarmings, corporate celebrations, and other special milestone occasions.',
  },
  {
    id: 'c2',
    category: 'customisation',
    categoryLabel: 'Customisation & Decor',
    question: 'Do you provide customised decorations?',
    answer:
      'Yes. Every setup can be customised based on your theme, colors, venue, occasion, preferences, and budget.',
  },
  {
    id: 'c3',
    category: 'customisation',
    categoryLabel: 'Customisation & Decor',
    question: 'Can I choose my own theme and colors?',
    answer:
      'Absolutely. You can share your inspiration, reference images, color palette, or theme, and our styling team will build the setup around it to achieve a 100% picture-match.',
  },
  {
    id: 'c4',
    category: 'customisation',
    categoryLabel: 'Customisation & Decor',
    question: 'Do you provide balloons, flowers, and other décor materials?',
    answer:
      'Yes. Depending on the package, we provide biodegradable balloons, backdrops, fresh and artificial flowers, themed props, neon signs, candles, fairy lighting, and other premium decorative elements.',
  },

  // Venues & Setups
  {
    id: 'v1',
    category: 'venues',
    categoryLabel: 'Venues & Setups',
    question: 'Do you provide decorations at home?',
    answer:
      'Yes. We create setups for homes, apartments, terraces, venues, banquet halls, restaurants, cafés, hotels, and other celebration spaces across Bengaluru.',
  },
  {
    id: 'v2',
    category: 'venues',
    categoryLabel: 'Venues & Setups',
    question: 'Can you decorate a small space?',
    answer:
      'Yes. We design compact setups for bedrooms, living rooms, balconies, terraces, and smaller spaces while keeping them visually impactful and clutter-free.',
  },
  {
    id: 'v3',
    category: 'venues',
    categoryLabel: 'Venues & Setups',
    question: 'Do you provide setup and cleanup?',
    answer:
      'Yes. Our team handles complete on-site setup, and cleanup/removal can be included depending on the package and venue requirements.',
  },

  // Add-ons & Packages
  {
    id: 'a1',
    category: 'addons',
    categoryLabel: 'Add-ons & Packages',
    question: 'Do you offer activities along with decoration?',
    answer:
      "Yes. Selected celebrations can include curated party games, kids' DIY activities, face painting, live eateries, tattoo artists, and interactive entertainment experiences.",
  },
  {
    id: 'a2',
    category: 'addons',
    categoryLabel: 'Add-ons & Packages',
    question: 'Can I customise a package?',
    answer:
      'Yes. Our packages are completely flexible. You can choose a base package and add or remove elements based on your celebration needs.',
  },
];

const TABS: { id: FAQCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'bookings', label: 'Bookings & Timing' },
  { id: 'customisation', label: 'Customisation & Decor' },
  { id: 'venues', label: 'Venues & Setups' },
  { id: 'addons', label: 'Add-ons & Packages' },
];

export interface TabbedFAQProps {
  id?: string;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function TabbedFAQ({
  id = 'faq',
  title = 'Frequently Asked Questions',
  subtitle = 'Everything you need to know about our setups, booking, and custom decor.',
  className = '',
}: TabbedFAQProps) {
  const [activeTab, setActiveTab] = useState<FAQCategory>('all');
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({
    b1: true, // first item open by default
  });

  const toggleFAQ = (faqId: string) => {
    setOpenIds((prev) => ({
      ...prev,
      [faqId]: !prev[faqId],
    }));
  };

  const filteredFAQs =
    activeTab === 'all'
      ? FAQ_DATA
      : FAQ_DATA.filter((item) => item.category === activeTab);

  return (
    <section
      id={id}
      data-nav-theme="light"
      className={`relative w-full bg-[#FFF3E6] dark:bg-[#381932] py-4 sm:py-5 lg:py-6 text-[#381932] dark:text-[#FFF3E6] transition-colors duration-200 ${className}`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 1. Section Header (Image 2 style with centered clean layout) */}
        <div className="mx-auto max-w-2xl text-center mb-8 sm:mb-10">
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#381932] dark:text-[#381932] mb-2">
            — FAQS —
          </p>
          <h2 className="font-serif text-3xl font-semibold tracking-tight text-[#381932] dark:text-[#FFF3E6] sm:text-4xl lg:text-[42px] leading-[1.15]">
            {title}
          </h2>
          <p className="mt-2 text-xs sm:text-sm md:text-[15px] font-light leading-relaxed text-[#381932] dark:text-[#FFF3E6]">
            {subtitle}
          </p>
        </div>

        {/* 2. Category Filter Tabs */}
        <div className="flex items-center justify-center mb-6 sm:mb-8">
          <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 rounded-full bg-[#FFF3E6] dark:bg-[#381932] border border-[#381932]/30 dark:border-[#381932] shadow-xs">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative z-10 rounded-full px-3.5 py-1.5 text-xs sm:text-[13px] font-medium transition-colors duration-200 cursor-pointer ${
                    isActive
                      ? 'text-[#FFF3E6] font-semibold'
                      : 'text-[#381932] hover:text-[#381932] dark:text-[#FFF3E6] dark:hover:text-[#FFF3E6] hover:bg-[#FFF3E6]/60'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeFaqTab"
                      className="absolute inset-0 z-[-1] rounded-full bg-[#381932] dark:bg-[#381932] shadow-sm"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Single Unified Box Container (Exact Image 2 Style) */}
        <div className="mx-auto max-w-3xl rounded-2xl sm:rounded-3xl border border-[#381932]/30 dark:border-[#381932] bg-[#FFF3E6] dark:bg-[#381932] shadow-sm overflow-hidden divide-y divide-[#FFF3E6]/60 dark:divide-[#381932]/60">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="divide-y divide-[#FFF3E6]/60 dark:divide-[#381932]/60"
            >
              {filteredFAQs.map((item) => {
                const isOpen = !!openIds[item.id];
                return (
                  <div key={item.id} className="transition-colors hover:bg-[#FFF3E6]/50 dark:hover:bg-[#381932]/20">
                    <button
                      type="button"
                      onClick={() => toggleFAQ(item.id)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-4 p-4.5 sm:p-5 sm:px-6 text-left transition-colors cursor-pointer select-none"
                    >
                      <span className="text-xs sm:text-sm md:text-[15px] font-medium text-[#381932] dark:text-[#FFF3E6] tracking-tight pr-2">
                        {item.question}
                      </span>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.22, ease: 'easeInOut' }}
                        className="flex h-6 w-6 sm:h-7 sm:w-7 flex-shrink-0 items-center justify-center rounded-full text-[#381932] dark:text-[#FFF3E6]"
                      >
                        <ChevronDown className="h-4 w-4 stroke-[2]" />
                      </motion.div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <div className="px-4.5 sm:px-6 pb-5 pt-0">
                            <p className="text-xs sm:text-[13px] font-light leading-relaxed text-[#381932] dark:text-[#FFF3E6]">
                              {item.answer}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Direct Concierge Contact Footer */}
        <div className="mt-6 sm:mt-8 text-center text-xs sm:text-[13px] text-[#381932] dark:text-[#FFF3E6]">
          Have a question not listed here?{' '}
          <a
            href="https://wa.me/917022058460"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-[#381932] dark:text-[#FFF3E6] underline underline-offset-4 hover:text-[#381932] transition-colors"
          >
            Chat directly with our styling team on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

export default TabbedFAQ;
