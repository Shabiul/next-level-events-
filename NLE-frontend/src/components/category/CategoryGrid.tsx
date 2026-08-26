import React from 'react';
import { ArrowRight } from 'lucide-react';
import { LayoutGroup } from 'framer-motion';
import type { AdminCategory } from '../../types';
import { useLanguage } from '../../hooks/useLanguage';
import { AutoLayoutCard } from '../ui/AutoLayoutCard';

interface CategoryGridProps {
  categories: AdminCategory[];
  onSelect: (categoryName: string) => void;
}

const CATEGORY_META: Record<
  string,
  { tag: string; subtitle: string; price: string; count: string }
> = {
  Birthday: {
    tag: 'Best Seller',
    subtitle: 'Balloon Arches & Custom Neon',
    price: 'From ₹1,999',
    count: '24+ Setups',
  },
  '1st Birthday': {
    tag: 'Milestone Special',
    subtitle: 'Grand Pastel & Ring Themes',
    price: 'From ₹3,499',
    count: '18+ Themes',
  },
  'Welcome Baby': {
    tag: 'Express 3H',
    subtitle: 'Hospital & Homecoming Cradles',
    price: 'From ₹2,199',
    count: '12+ Setups',
  },
  'Baby Shower': {
    tag: 'Trending',
    subtitle: 'Floral Rings & Soft Pastels',
    price: 'From ₹2,799',
    count: '16+ Setups',
  },
  'Anniversary Celebrations': {
    tag: 'Romantic Special',
    subtitle: 'Candlelight & Rose Canopies',
    price: 'From ₹2,499',
    count: '14+ Setups',
  },
  'Pre & Post Wedding decors': {
    tag: 'Grand Occasions',
    subtitle: 'Marigold & Traditional Drapes',
    price: 'From ₹4,999',
    count: '20+ Setups',
  },
  'Kids Activities': {
    tag: 'Interactive Fun',
    subtitle: 'Party Games & Face Painting',
    price: 'From ₹1,499',
    count: '10+ Add-ons',
  },
  'Simple wall decors': {
    tag: 'Quick 45-Min',
    subtitle: 'Compact Living Room Styling',
    price: 'From ₹1,299',
    count: '15+ Setups',
  },
  'Naming ceremony': {
    tag: 'Traditional Floral',
    subtitle: 'Brass Urli & Fresh Blooms',
    price: 'From ₹2,999',
    count: '12+ Setups',
  },
};

export const CategoryGrid: React.FC<CategoryGridProps> = ({ categories, onSelect }) => {
  const { t } = useLanguage();

  return (
    <div className="w-full">
      {/* Section header */}
      <div className="mb-8 sm:mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-[#746B72] dark:text-[#A78A9F]">
            <span className="eyebrow-line bg-[#A78A9F] dark:bg-[#A78A9F]" />
            Celebration Catalog
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-[44px] font-normal uppercase tracking-tight text-[#2F2930] dark:text-[#FAF8F5] leading-[1.08]">
            {t?.categories_title || 'Explore Our Categories'}
          </h2>
          <p className="text-xs sm:text-sm md:text-[15px] font-light leading-relaxed text-[#746B72] dark:text-[#C8B5C3] max-w-2xl">
            Select a milestone celebration to view handcrafted decor packages styled by our master decorators.
          </p>
        </div>

        <a
          href="/explore"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#2F2930] hover:text-[#746B72] dark:text-[#C9BEAB] dark:hover:text-[#FAF8F5] hover:underline whitespace-nowrap self-start sm:self-auto transition-colors"
        >
          <span>View All Setups</span>
          <ArrowRight size={14} />
        </a>
      </div>

      {/* Auto-Layout Interaction Responsive Grid wrapped in LayoutGroup */}
      <LayoutGroup id="category-grid">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => {
            const meta = CATEGORY_META[cat.name] || {
              tag: 'Handcrafted',
              subtitle: 'Curated by Master Stylists',
              price: 'From ₹1,999',
              count: '12+ Setups',
            };

            return (
              <AutoLayoutCard
                key={cat._id || cat.name}
                id={cat._id}
                name={cat.name}
                image={cat.image || '/exploreee.jpeg'}
                icon={cat.icon}
                tag={meta.tag}
                subtitle={meta.subtitle}
                price={meta.price}
                setupsCount={meta.count}
                onSelect={() => onSelect(cat.name)}
                className="h-full"
              />
            );
          })}

          <AutoLayoutCard
            key="explore-all-card"
            id="explore-all"
            name="Explore All Setups"
            image="/exploreee.jpeg"
            tag="Full Catalog"
            subtitle="Browse All Handcrafted Packages"
            price="All Prices"
            setupsCount="50+ Setups"
            onSelect={() => onSelect('ALL')}
            className="h-full"
          />
        </div>
      </LayoutGroup>
    </div>
  );
};

export default CategoryGrid;
