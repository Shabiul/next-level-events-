import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Heart, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import type { CatalogActivity, CatalogAddon, CatalogSelectionItem } from '../../types';
import { getApiUrl } from '../../services/api.service';
import { cn } from '../../utils/utils';
import { AddonDetailModal, type AddonDetailItem } from './AddonDetailModal';

interface Props {
  onSelectionChange?: (addons: CatalogSelectionItem[], activities: CatalogSelectionItem[]) => void;
  selectedAddonIds?: string[];
  selectedActivityIds?: string[];
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

const getItemImages = (item: RawCatalogItem): string[] => {
  if (!item || typeof item !== 'object') return [];
  const out: string[] = [];
  const push = (v: unknown) => {
    if (typeof v === 'string' && v.trim()) out.push(v.trim());
    else if (v && typeof v === 'object') {
      const o = v as Record<string, unknown>;
      if (typeof o.url === 'string' && o.url.trim()) out.push(o.url.trim());
      else if (typeof o.src === 'string' && o.src.trim()) out.push(o.src.trim());
    }
  };
  push(item.image ?? item.thumbnail ?? item.coverImage ?? item.featuredImage);
  if (Array.isArray(item.images)) item.images.forEach(push);
  if (Array.isArray(item.gallery)) item.gallery.forEach(push);
  if (Array.isArray(item.moreImages)) item.moreImages.forEach(push);
  return Array.from(new Set(out));
};

const getItemInclusions = (item: RawCatalogItem): string[] => {
  const src = item?.inclusions ?? item?.includes ?? item?.features ?? item?.highlights;
  if (!Array.isArray(src)) return [];
  return src
    .map((v) => (typeof v === 'string' ? v : (v && typeof v === 'object' && typeof (v as any).label === 'string' ? (v as any).label : '')))
    .filter(Boolean);
};

const normalizeCatalogItem = (item: RawCatalogItem) => ({
  ...item,
  price: getItemPrice(item),
  image: getItemImage(item),
  images: getItemImages(item),
  inclusions: getItemInclusions(item),
});

// These 8 are the generic "Popular Celebration Enhancements" also offered at
// checkout (a shared stock photo, not a real product photo) -- on the
// product page's own add-ons carousel they should trail behind every
// product-specific addon (e.g. "Welcome board"), not lead the list just
// because they happen to have the most recent created_at.
const CURATED_ADDON_NAMES = new Set([
  'photography', 'videography', 'live catering', 'flower decoration',
  'led numbers', 'custom cake', 'return gifts', 'premium balloon upgrade',
]);
function sortCuratedLast<T extends { name?: string }>(items: T[]): T[] {
  const real: T[] = [];
  const curated: T[] = [];
  for (const item of items) {
    (CURATED_ADDON_NAMES.has(String(item.name || '').toLowerCase()) ? curated : real).push(item);
  }
  return [...real, ...curated];
}

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

export const AddonsModule: React.FC<Props> = ({
  onSelectionChange,
  selectedAddonIds: externalSelectedAddonIds,
  selectedActivityIds: externalSelectedActivityIds,
  themeCategory,
}) => {
  const [addons, setAddons] = useState<CatalogAddon[]>([]);
  const [activities, setActivities] = useState<CatalogActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>(externalSelectedAddonIds || []);
  const [selectedActivityIds, setSelectedActivityIds] = useState<string[]>(externalSelectedActivityIds || []);
  const [activeTab, setActiveTab] = useState<TabKey>('addons');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showAll, setShowAll] = useState(false);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [detailItem, setDetailItem] = useState<AddonDetailItem | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (externalSelectedAddonIds !== undefined) {
      setSelectedAddonIds((prev) => {
        const isSame = prev.length === externalSelectedAddonIds.length && prev.every(id => externalSelectedAddonIds.includes(id));
        return isSame ? prev : externalSelectedAddonIds;
      });
    }
  }, [externalSelectedAddonIds]);

  useEffect(() => {
    if (externalSelectedActivityIds !== undefined) {
      setSelectedActivityIds((prev) => {
        const isSame = prev.length === externalSelectedActivityIds.length && prev.every(id => externalSelectedActivityIds.includes(id));
        return isSame ? prev : externalSelectedActivityIds;
      });
    }
  }, [externalSelectedActivityIds]);

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
          const addonList = Array.isArray(data.addons) ? data.addons.map(normalizeCatalogItem) : [];
          setAddons(sortCuratedLast(addonList));
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

  // Only surface categories that are actually relevant to this product's
  // theme -- an undifferentiated "everything in the catalog" list isn't
  // useful on a single product's page. Falls back to the full catalog only
  // when nothing matches the theme (or no theme was given).
  const categories = useMemo(() => {
    const all = new Set<string>();
    currentItems.forEach((item) => {
      const category = item.category?.trim() || 'General';
      all.add(category);
    });

    if (themeCategory) {
      const related = Array.from(all).filter((c) => fuzzyCategoryMatch(c, themeCategory));
      if (related.length > 0) return related;
    }

    return ['All', ...Array.from(all)];
  }, [currentItems, themeCategory]);

  useEffect(() => {
    if (!categories.includes(activeCategory)) {
      setActiveCategory(categories[0] || 'All');
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

  const selectedAddonsList = useMemo(() => addons
    .filter((addon) => selectedAddonIds.includes(getItemId(addon)))
    .map((addon) => ({
      id: getItemId(addon),
      name: addon.name,
      price: addon.price,
      kind: 'addon' as const,
    })), [addons, selectedAddonIds]);

  const selectedActivitiesList = useMemo(() => activities
    .filter((activity) => selectedActivityIds.includes(getItemId(activity)))
    .map((activity) => ({
      id: getItemId(activity),
      name: activity.name,
      price: activity.price || 0,
      kind: 'activity' as const,
    })), [activities, selectedActivityIds]);

  const selectedTotal = useMemo(() => {
    return selectedAddonsList.reduce((s, a) => s + (a.price || 0), 0) +
           selectedActivitiesList.reduce((s, a) => s + (a.price || 0), 0);
  }, [selectedAddonsList, selectedActivitiesList]);

  useEffect(() => {
    onSelectionChange?.(selectedAddonsList, selectedActivitiesList);
  }, [onSelectionChange, selectedActivitiesList, selectedAddonsList]);

  const toggleAddon = (addonId: string, name?: string, price?: number) => {
    const isAdding = !selectedAddonIds.includes(addonId);
    setSelectedAddonIds((prev) => isAdding ? [...prev, addonId] : prev.filter((id) => id !== addonId));
    const target = addons.find((a) => getItemId(a) === addonId);
    const itemName = name || target?.name || 'Add-on';
    const itemPrice = price ?? (target ? getItemPrice(target) : 0);
    if (isAdding) {
      toast.success(`Added "${itemName}" (+₹${itemPrice.toLocaleString('en-IN')}) to package!`);
    } else {
      toast.info(`Removed "${itemName}" from package.`);
    }
  };

  const toggleActivity = (activityId: string, name?: string, price?: number) => {
    const isAdding = !selectedActivityIds.includes(activityId);
    setSelectedActivityIds((prev) => isAdding ? [...prev, activityId] : prev.filter((id) => id !== activityId));
    const target = activities.find((a) => getItemId(a) === activityId);
    const itemName = name || target?.name || 'Activity';
    const itemPrice = price ?? (target ? getItemPrice(target) : 0);
    if (isAdding) {
      toast.success(`Added "${itemName}" (+₹${itemPrice.toLocaleString('en-IN')}) to package!`);
    } else {
      toast.info(`Removed "${itemName}" from package.`);
    }
  };

  const scrollItems = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const offset = scrollRef.current.clientWidth * 0.7;
    scrollRef.current.scrollBy({ left: direction === 'left' ? -offset : offset, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#381932]/30 bg-[#FFF3E6] p-5 text-xs text-[#381932] dark:bg-[#381932] dark:border-[#381932]">
        Loading add-ons and activities...
      </div>
    );
  }

  const themeLabel = recommendedCategory || themeCategory;

  const buildDetailItem = (item: CatalogAddon | CatalogActivity): AddonDetailItem => {
    const raw = item as RawCatalogItem;
    return {
      _id: getItemId(item),
      name: item.name,
      description: item.description,
      price: getItemPrice(raw),
      priceLabel: getItemPriceLabel(raw),
      image: item.image,
      images: Array.isArray(raw.images) ? raw.images : (item.image ? [item.image] : []),
      category: item.category?.trim() || undefined,
      inclusions: Array.isArray(raw.inclusions) ? raw.inclusions : [],
      kind: activeTab === 'addons' ? 'addon' : 'activity',
    };
  };

  const renderCard = (item: CatalogAddon | CatalogActivity, idx: number) => {
    const itemId = getItemId(item);
    const selected = activeTab === 'addons'
      ? selectedAddonIds.includes(itemId)
      : selectedActivityIds.includes(itemId);
    const wished = wishlistIds.includes(itemId);
    const imgUrl = item.image || 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80';
    const toggle = () => (activeTab === 'addons' ? toggleAddon(itemId, item.name, getItemPrice(item)) : toggleActivity(itemId, item.name, getItemPrice(item)));
    const openDetail = () => setDetailItem(buildDetailItem(item));

    return (
      <motion.div
        key={itemId}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: Math.min(idx * 0.04, 0.3) }}
        className={cn(
          'group relative self-start block overflow-hidden rounded-xl border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300',
          showAll ? 'w-full' : 'flex-none w-[220px] sm:w-[260px] snap-start',
          selected ? 'border-[#381932] ring-2 ring-[#381932]/40' : 'border-[#381932]/30 dark:border-[#381932]'
        )}
      >
        <div
          role="button"
          tabIndex={0}
          onClick={openDetail}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openDetail();
            }
          }}
          className="relative h-72 sm:h-80 w-full cursor-pointer bg-[#381932]/8 dark:bg-[#381932]"
          aria-label={`View ${item.name} details`}
        >
          <img
            src={imgUrl}
            alt={item.name}
            loading="lazy"
            className="h-full w-full object-contain transition-transform duration-[350ms] ease-out group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#381932]/85 via-[#381932]/25 to-transparent" />

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); toggleWishlist(itemId); }}
            aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
            className={cn(
              'absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-[#381932]/40 bg-[#FFF3E6]/90 shadow-sm backdrop-blur-sm transition-colors cursor-pointer',
              wished ? 'text-[#381932]' : 'text-[#381932] hover:text-[#381932]'
            )}
          >
            <Heart size={15} fill={wished ? 'currentColor' : 'none'} />
          </button>

          {/* Overlay text area -- matches Home "Popular Packages" cards */}
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
            <h3 className="font-serif text-lg font-bold text-[#FFF3E6] mb-1 line-clamp-1">{item.name}</h3>
            <span className="text-lg font-bold text-[#FFF3E6] block mb-1.5">{getItemPriceLabel(item)}</span>
            {item.description && (
              <p className="text-xs text-[#FFF3E6]/80 leading-relaxed line-clamp-2 mb-2.5">{item.description}</p>
            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); toggle(); }}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer',
                  selected
                    ? 'bg-[#381932] text-[#FFF3E6]'
                    : 'bg-[#FFF3E6]/90 text-[#381932] hover:bg-[#FFF3E6]'
                )}
              >
                {selected ? <><Check size={12} /> Added</> : <><Plus size={12} /> Add</>}
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); openDetail(); }}
                className="inline-flex items-center rounded-full border border-[#FFF3E6]/60 px-3 py-1.5 text-xs font-bold text-[#FFF3E6] hover:bg-[#FFF3E6]/15 transition-colors cursor-pointer"
              >
                View Details
              </button>
            </div>
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
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#381932] dark:text-[#FFF3E6]">
            Add-ons &amp; Activities
          </h2>
          <p className="text-xs text-[#381932] dark:text-[#FFF3E6] font-medium mt-0.5">
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
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#381932]/30 bg-[#FFF3E6] text-[#381932] hover:bg-[#FFF3E6] dark:bg-[#381932] dark:border-[#381932] dark:text-[#FFF3E6] cursor-pointer disabled:opacity-40"
              aria-label="Scroll left"
              disabled={showAll}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => scrollItems('right')}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#381932]/30 bg-[#FFF3E6] text-[#381932] hover:bg-[#FFF3E6] dark:bg-[#381932] dark:border-[#381932] dark:text-[#FFF3E6] cursor-pointer disabled:opacity-40"
              aria-label="Scroll right"
              disabled={showAll}
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowAll((o) => !o)}
            className="rounded-full border border-[#381932]/30 dark:border-[#381932] px-3.5 py-1.5 text-xs font-bold text-[#381932] dark:text-[#381932] hover:bg-[#A78A9F]/18 dark:hover:bg-[#381932] transition-colors cursor-pointer"
          >
            {showAll ? 'Show Less' : 'View All'}
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="inline-flex rounded-full bg-[#FFF3E6] dark:bg-[#381932] p-1 border border-[#381932]/30 dark:border-[#381932]">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'rounded-full px-4 py-1.5 text-xs font-bold transition-all cursor-pointer',
              activeTab === tab.key
                ? 'bg-[#381932] text-[#FFF3E6] shadow-sm dark:bg-[#381932] dark:text-[#381932]'
                : 'text-[#381932] hover:text-[#381932] dark:text-[#FFF3E6]'
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
                  ? 'border-[#381932] bg-[#381932] text-[#FFF3E6] dark:border-[#381932] dark:bg-[#381932] dark:text-[#381932]'
                  : 'border-[#381932]/30 bg-[#FFF3E6] text-[#381932] hover:border-[#381932] dark:bg-[#381932] dark:border-[#381932] dark:text-[#381932]'
              )}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* Active Selections Summary Strip */}
      {selectedAddonsList.length + selectedActivitiesList.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#381932] dark:bg-[#FFF3E6] text-[#FFF3E6] dark:text-[#381932] px-4 py-3 shadow-md">
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FFF3E6]/20 dark:bg-[#381932]/20 text-xs font-bold">
              ✓
            </span>
            <span className="text-xs sm:text-sm font-bold">
              {selectedAddonsList.length + selectedActivitiesList.length} upgrade{selectedAddonsList.length + selectedActivitiesList.length > 1 ? 's' : ''} selected (+₹{selectedTotal.toLocaleString('en-IN')})
            </span>
          </div>
          <span className="text-xs font-semibold text-[#FFF3E6]/90 dark:text-[#381932]/90">
            Attached to package total
          </span>
        </div>
      )}

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
        <div className="w-full rounded-2xl border border-[#381932]/30 bg-[#FFF3E6] p-5 text-xs text-[#381932] dark:bg-[#381932] dark:border-[#381932]">
          No {activeTab === 'addons' ? 'add-ons' : 'activities'} available in this category.
        </div>
      )}

      <AddonDetailModal
        item={detailItem}
        selected={
          detailItem
            ? (detailItem.kind === 'addon'
                ? selectedAddonIds.includes(detailItem._id || '')
                : selectedActivityIds.includes(detailItem._id || ''))
            : false
        }
        onToggle={() => {
          if (!detailItem?._id) return;
          if (detailItem.kind === 'addon') toggleAddon(detailItem._id);
          else toggleActivity(detailItem._id);
        }}
        onClose={() => setDetailItem(null)}
      />
    </div>
  );
};
