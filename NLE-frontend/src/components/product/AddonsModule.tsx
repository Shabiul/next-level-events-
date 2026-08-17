import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import type { CatalogActivity, CatalogAddon, CatalogSelectionItem } from '../../types';
import { getApiUrl } from '../../services/api.service';
import { cn } from '../../utils/utils';

interface Props {
  onSelectionChange?: (addons: CatalogSelectionItem[], activities: CatalogSelectionItem[]) => void;
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

export const AddonsModule: React.FC<Props> = ({ onSelectionChange }) => {
  const [addons, setAddons] = useState<CatalogAddon[]>([]);
  const [activities, setActivities] = useState<CatalogActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [selectedActivityIds, setSelectedActivityIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>('addons');
  const [activeCategory, setActiveCategory] = useState('All');
  const scrollRef = useRef<HTMLDivElement | null>(null);

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

  const getItemId = (item: CatalogAddon | CatalogActivity) => item._id || item.name;

  const visibleItems = useMemo(() => {
    return currentItems.filter((item) => {
      const category = item.category?.trim() || 'General';
      return activeCategory === 'All' || category === activeCategory;
    });
  }, [activeCategory, currentItems]);

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
      <div className="rounded-xl border border-[#E8E7E3] bg-[#FAFAF8] p-4 text-xs text-[#6F6F6B] dark:bg-[#1E1E1E] dark:border-[#2E2E2E]">
        Loading add-ons and activities...
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-[#E8E7E3] bg-[#FAFAF8] p-4 sm:p-5 dark:bg-[#191919] dark:border-[#2E2E2E]">
      {/* Tab Switcher */}
      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-full bg-[#E8E7E3] dark:bg-[#2A2A2A] p-0.5">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'rounded-full px-3.5 py-1 text-xs font-semibold transition-all cursor-pointer',
                activeTab === tab.key
                  ? 'bg-white text-[#1C1C1C] shadow-xs dark:bg-[#1E1E1E] dark:text-white'
                  : 'text-[#6F6F6B] hover:text-[#1C1C1C] dark:text-[#A0A09C]'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="hidden sm:flex items-center gap-1">
          <button
            type="button"
            onClick={() => scrollItems('left')}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-[#E8E7E3] bg-white text-[#1C1C1C] hover:bg-[#F4F3F0] dark:bg-[#1E1E1E] dark:border-[#2E2E2E] dark:text-white cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={() => scrollItems('right')}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-[#E8E7E3] bg-white text-[#1C1C1C] hover:bg-[#F4F3F0] dark:bg-[#1E1E1E] dark:border-[#2E2E2E] dark:text-white cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight size={14} />
          </button>
        </div>
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
                'whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition cursor-pointer border',
                isActive
                  ? 'border-[#1C1C1C] bg-[#1C1C1C] text-white dark:border-white dark:bg-white dark:text-black'
                  : 'border-[#E8E7E3] bg-white text-[#6F6F6B] hover:border-[#1C1C1C] dark:bg-[#1E1E1E] dark:border-[#2E2E2E] dark:text-neutral-300'
              )}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* Scrollable Row */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 pt-1 hide-scrollbar snap-x snap-mandatory"
      >
        {visibleItems.length > 0 ? (
          visibleItems.map((item) => {
            const itemId = getItemId(item);
            const selected = activeTab === 'addons'
              ? selectedAddonIds.includes(itemId)
              : selectedActivityIds.includes(itemId);

            return (
              <div
                key={itemId}
                className="flex-none w-[180px] sm:w-[200px] snap-start"
              >
                <div className="flex h-full flex-col overflow-hidden rounded-lg border border-[#E8E7E3] bg-white dark:bg-[#1E1E1E] dark:border-[#2E2E2E] shadow-card transition-all hover:border-[#1C1C1C]">
                  <div className="h-[110px] w-full overflow-hidden bg-[#F4F3F0] relative dark:bg-[#141414]">
                    <img
                      src={item.image || 'https://via.placeholder.com/400x300?text=Experience'}
                      alt={item.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-2.5">
                    <div>
                      <h4 className="line-clamp-1 text-xs font-semibold text-[#1C1C1C] dark:text-white">
                        {item.name}
                      </h4>
                      <p className="mt-0.5 text-xs font-bold text-[#1C1C1C] dark:text-white">
                        {getItemPriceLabel(item)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => activeTab === 'addons' ? toggleAddon(itemId) : toggleActivity(itemId)}
                      className={cn(
                        'mt-2.5 flex items-center justify-center gap-1 rounded-md py-1 px-2 text-xs font-semibold transition-all cursor-pointer',
                        selected
                          ? 'bg-[#1C1C1C] text-white dark:bg-white dark:text-black'
                          : 'border border-[#E8E7E3] bg-white text-[#1C1C1C] hover:bg-[#F4F3F0] dark:bg-[#262626] dark:border-[#333] dark:text-white'
                      )}
                    >
                      {selected ? (
                        <>
                          <Check size={12} />
                          <span>Added</span>
                        </>
                      ) : (
                        <span>+ Add</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="w-full rounded-lg border border-[#E8E7E3] bg-white p-4 text-xs text-[#6F6F6B] dark:bg-[#1E1E1E] dark:border-[#2E2E2E]">
            No {activeTab === 'addons' ? 'add-ons' : 'activities'} available in this category.
          </div>
        )}
      </div>
    </div>
  );
};
