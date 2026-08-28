import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Heart, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import type { CatalogActivity, CatalogAddon, CatalogSelectionItem } from '../../types';
import { getApiUrl } from '../../services/api.service';
import { cn } from '../../utils/utils';

interface Props {
  onSelectionChange?: (addons: CatalogSelectionItem[], activities: CatalogSelectionItem[]) => void;
  /** The product's own category/theme (e.g. "Birthdays", "Kids Activities"),
   * used to recommend relevant add-ons/activities first instead of an
   * undifferentiated full catalog. */
  themeCategory?: string;
}

type RawCatalogItem = Record<string, any>;

const getItemPrice = (item: RawCatalogItem): number => {
  if (!item || typeof item !== 'object') return 0;
  const candidates = [
    item.price,
    item.activityPrice,
    item.basePrice,
    item.amount,
    item.cost,
    item.pricing?.price,
    item.pricing?.basePrice,
    item.pricing?.amount,
  ];

  for (const value of candidates) {
    if (typeof value === 'number' && !Number.isNaN(value)) return value;
    if (typeof value === 'string') {
      const numeric = Number(value.replace(/[^0-9.]/g, ''));
      if (!Number.isNaN(numeric)) return numeric;
    }
  }
  return 0;
};

const getItemPriceLabel = (item: RawCatalogItem): string => {
  const price = getItemPrice(item);
  const hasExactPrice = typeof item?.price === 'number' || (typeof item?.price === 'string' && !Number.isNaN(Number(item.price)));
  const prefix = hasExactPrice ? '₹' : 'From ₹';
  return `${prefix}${price.toLocaleString('en-IN')}`;
};

const getItemImage = (item: RawCatalogItem): string | undefined => {
  if (!item || typeof item !== 'object') return undefined;
  const candidate = item.image ?? item.thumbnail ?? item.coverImage ?? item.featuredImage;
  if (typeof candidate === 'string' && candidate.trim()) return candidate;
  if (candidate && typeof candidate === 'object' && typeof candidate.url === 'string' && candidate.url.trim()) return candidate.url;

  if (Array.isArray(item.images) && item.images.length > 0) {
    const firstImage = item.images[0];
    if (typeof firstImage === 'string' && firstImage.trim()) return firstImage;
    if (firstImage && typeof firstImage === 'object') {
      if (typeof firstImage.url === 'string' && firstImage.url.trim()) return firstImage.url;
      if (typeof firstImage.src === 'string' && firstImage.src.trim()) return firstImage.src;
    }
  }
  return undefined;
};

const normalizeCatalogItem = (item: RawCatalogItem) => ({
  ...item,
  price: getItemPrice(item),
  image: getItemImage(item),
});

const TABS = [
  { key: 'addons', label: 'Add-ons' },
  { key: 'activities', label: 'Activities & Entertainment' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

/** Fuzzy, case-insensitive, either-direction substring match -- same
 * pattern used for service/category lookups elsewhere in the app (e.g.
 * findServiceSubItems), so "Birthdays" theme matches an addon category of
 * "Birthday" or "Birthday Decor" and vice versa. */
const fuzzyCategoryMatch = (a: string, b: string): boolean => {
  const na = a.trim().toLowerCase();
  const nb = b.trim().toLowerCase();
  if (!na || !nb) return false;
  return na.includes(nb) || nb.includes(na);
};

export const AddonsModule: React.FC<Props> = ({ onSelectionChange, themeCategory }) => {
  const [addons, setAddons] = useState<CatalogAddon[]>([]);
  const [activities, setActivities] = useState<CatalogActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [selectedActivityIds, setSelectedActivityIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>('addons');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showAll, setShowAll] = useState(false);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const toggleWishlist = (id: string) => {
    setWishlistIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch(getApiUrl('/api/catalog'))
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load catalog');
        const data = await res.json();
        if (isMounted) {
          setAddons(Array.isArray(data.addons) ? data.addons.map(normalizeCatalogItem) : []);
          setActivities(Array.isArray(data.activities) ? data.activities.map(normalizeCatalogItem) : []);
        }
      })
      .catch(() => {
        if (isMounted) {
          setAddons([]);
          setActivities([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const currentItems = activeTab === 'addons' ? addons : activities;

  const categories = useMemo(() => {
    const set = new Set<string>(['All']);
    currentItems.forEach((item) => {
      const category = item.category?.trim() || 'General';
      set.add(category);
    });
    return Array.from(set);
  }, [currentItems]);

  useEffect(() => {
    if (!categories.includes(activeCategory)) {
      setActiveCategory('All');
    }
  }, [activeCategory, categories]);

  // Recommend add-ons/activities matching the product's own theme by
  // default, instead of always starting on an undifferentiated "All" list.
  const recommendedCategory = useMemo(() => {
    if (!themeCategory) return null;
    return categories.find((c) => c !== 'All' && fuzzyCategoryMatch(c, themeCategory)) || null;
  }, [categories, themeCategory]);

  const autoSelectedRef = useRef(false);
  useEffect(() => {
    if (autoSelectedRef.current) return;
    if (recommendedCategory) {
      setActiveCategory(recommendedCategory);
      autoSelectedRef.current = true;
    }
  }, [recommendedCategory]);

  const getItemId = (item: CatalogAddon | CatalogActivity) => item._id || item.name;

  const visibleItems = useMemo(() => {
    const filtered = currentItems.filter((item) => {
      const category = item.category?.trim() || 'General';
      return activeCategory === 'All' || category === activeCategory;
    });

    // On the "All" view, float theme-matching items to the front rather
    // than leaving recommendations undifferentiated from the rest of the
    // catalog.
    if (activeCategory === 'All' && themeCategory) {
      return [...filtered].sort((a, b) => {
        const aMatch = fuzzyCategoryMatch(a.category?.trim() || 'General', themeCategory) ? 0 : 1;
        const bMatch = fuzzyCategoryMatch(b.category?.trim() || 'General', themeCategory) ? 0 : 1;
        return aMatch - bMatch;
      });
    }

    return filtered;
  }, [activeCategory, currentItems, themeCategory]);

  useEffect(() => {
    const selectedAddonsList = addons
      .filter((addon) => selectedAddonIds.includes(getItemId(addon)))
      .map((addon) => ({
        id: getItemId(addon),
        name: addon.name,
        price: addon.price,
        kind: 'addon' as const,
      }));

    const selectedActivitiesList = activities
      .filter((activity) => selectedActivityIds.includes(getItemId(activity)))
      .map((activity) => ({
        id: getItemId(activity),
        name: activity.name,
        price: activity.price || 0,
        kind: 'activity' as const,
      }));

    onSelectionChange?.(selectedAddonsList, selectedActivitiesList);
  }, [activities, addons, onSelectionChange, selectedActivityIds, selectedAddonIds]);

  const toggleAddon = (addonId: string) => {
    setSelectedAddonIds((prev) => prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]);
  };

  const toggleActivity = (activityId: string) => {
    setSelectedActivityIds((prev) => prev.includes(activityId) ? prev.filter((id) => id !== activityId) : [...prev, activityId]);
  };

  const scrollItems = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const offset = scrollRef.current.clientWidth * 0.7;
    scrollRef.current.scrollBy({ left: direction === 'left' ? -offset : offset, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#E4DCD2] bg-[#F9F6F2] p-5 text-xs text-[#746B72] dark:bg-[#1E1E1E] dark:border-[#483250]">
        Loading add-ons and activities...
      </div>
    );
  }

  const themeLabel = recommendedCategory || themeCategory;

  const renderCard = (item: CatalogAddon | CatalogActivity, idx: number) => {
    const itemId = getItemId(item);
    const selected = activeTab === 'addons'
      ? selectedAddonIds.includes(itemId)
      : selectedActivityIds.includes(itemId);
    const wished = wishlistIds.includes(itemId);
    const imgUrl = item.image || 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80';

    return (
      <motion.div
        key={itemId}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: Math.min(idx * 0.04, 0.3) }}
        className={cn(
          'group relative self-start block overflow-hidden rounded-xl border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300',
          showAll ? 'w-full' : 'flex-none w-[220px] sm:w-[260px] snap-start',
          selected ? 'border-[#725D75] ring-2 ring-[#725D75]/40' : 'border-[#E4DCD2] dark:border-[#2E2E2E]'
        )}
      >
        <div className="relative h-72 sm:h-80 w-full">
          <img
            src={imgUrl}
            alt={item.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[350ms] ease-out group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

          <button
            type="button"
            onClick={() => toggleWishlist(itemId)}
            aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
            className={cn(
              'absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/40 bg-white/90 shadow-sm backdrop-blur-sm transition-colors cursor-pointer',
              wished ? 'text-rose-600' : 'text-[#2F2930] hover:text-rose-600'
            )}
          >
            <Heart size={15} fill={wished ? 'currentColor' : 'none'} />
          </button>

          {/* Overlay text area -- matches Home "Popular Packages" cards */}
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
            <h3 className="font-serif text-lg font-bold text-white mb-1 line-clamp-1">{item.name}</h3>
            <span className="text-lg font-bold text-white block mb-1.5">{getItemPriceLabel(item)}</span>
            {item.description && (
              <p className="text-xs text-white/80 leading-relaxed line-clamp-2 mb-2.5">{item.description}</p>
            )}
            <button
              type="button"
              onClick={() => (activeTab === 'addons' ? toggleAddon(itemId) : toggleActivity(itemId))}
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer',
                selected
                  ? 'bg-[#725D75] text-white'
                  : 'bg-white/90 text-[#2F2930] hover:bg-white'
              )}
            >
              {selected ? <><Check size={12} /> Added</> : <><Plus size={12} /> Add</>}
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Section Header -- title + View All, styled like "You May Also Like" */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2F2930] dark:text-white">
            Add-ons &amp; Activities
          </h2>
          <p className="text-xs text-[#746B72] dark:text-[#C8B5C3] font-medium mt-0.5">
            {themeLabel
              ? `Handpicked for your ${themeLabel} celebration`
              : 'Complete your celebration with popular extras'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scrollItems('left')}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E4DCD2] bg-white text-[#2F2930] hover:bg-[#F9F6F2] dark:bg-[#1E1E1E] dark:border-[#483250] dark:text-white cursor-pointer disabled:opacity-40"
              aria-label="Scroll left"
              disabled={showAll}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => scrollItems('right')}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E4DCD2] bg-white text-[#2F2930] hover:bg-[#F9F6F2] dark:bg-[#1E1E1E] dark:border-[#483250] dark:text-white cursor-pointer disabled:opacity-40"
              aria-label="Scroll right"
              disabled={showAll}
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowAll((o) => !o)}
            className="rounded-full border border-[#E4DCD2] dark:border-[#483250] px-3.5 py-1.5 text-xs font-bold text-[#725D75] dark:text-[#C9BEAB] hover:bg-[#725D75]/08 dark:hover:bg-[#25172C] transition-colors cursor-pointer"
          >
            {showAll ? 'Show Less' : 'View All'}
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="inline-flex rounded-full bg-[#E8E7E3] dark:bg-[#25172C] p-1 border border-[#E4DCD2] dark:border-[#483250]">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'rounded-full px-4 py-1.5 text-xs font-bold transition-all cursor-pointer',
              activeTab === tab.key
                ? 'bg-[#725D75] text-[#F9F6F2] shadow-sm dark:bg-[#C9BEAB] dark:text-[#201325]'
                : 'text-[#746B72] hover:text-[#2F2930] dark:text-[#C8B5C3]'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Subcategory Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
        {categories.map((category) => {
          const isActive = category === activeCategory;
          return (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={cn(
                'whitespace-nowrap rounded-full px-3.5 py-1 text-xs font-semibold transition cursor-pointer border',
                isActive
                  ? 'border-[#725D75] bg-[#725D75] text-white dark:border-[#C9BEAB] dark:bg-[#C9BEAB] dark:text-[#201325]'
                  : 'border-[#E4DCD2] bg-white text-[#746B72] hover:border-[#725D75] dark:bg-[#1E1E1E] dark:border-[#483250] dark:text-neutral-300'
              )}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* Cards -- carousel by default, responsive grid on "View All" */}
      {visibleItems.length > 0 ? (
        showAll ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {visibleItems.map((item, idx) => renderCard(item, idx))}
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-3 pt-1 hide-scrollbar snap-x snap-mandatory"
          >
            {visibleItems.map((item, idx) => renderCard(item, idx))}
          </div>
        )
      ) : (
        <div className="w-full rounded-2xl border border-[#E4DCD2] bg-white p-5 text-xs text-[#746B72] dark:bg-[#1E1E1E] dark:border-[#483250]">
          No {activeTab === 'addons' ? 'add-ons' : 'activities'} available in this category.
        </div>
      )}
    </div>
  );
};
