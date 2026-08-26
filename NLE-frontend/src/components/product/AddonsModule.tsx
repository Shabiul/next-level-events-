import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Maximize2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [previewItem, setPreviewItem] = useState<{ url: string; title: string; price: string } | null>(null);
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
      <div className="rounded-2xl border border-[#E4DCD2] bg-[#F9F6F2] p-5 text-xs text-[#746B72] dark:bg-[#1E1E1E] dark:border-[#483250]">
        Loading add-ons and activities...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tab Switcher */}
      <div className="flex items-center justify-between">
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

        <div className="hidden sm:flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => scrollItems('left')}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E4DCD2] bg-white text-[#2F2930] hover:bg-[#F9F6F2] dark:bg-[#1E1E1E] dark:border-[#483250] dark:text-white cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => scrollItems('right')}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E4DCD2] bg-white text-[#2F2930] hover:bg-[#F9F6F2] dark:bg-[#1E1E1E] dark:border-[#483250] dark:text-white cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight size={16} />
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

      {/* Scrollable Row with 3D Animated Cards */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-3 pt-1 hide-scrollbar snap-x snap-mandatory perspective-[1000px]"
      >
        {visibleItems.length > 0 ? (
          visibleItems.map((item, idx) => {
            const itemId = getItemId(item);
            const selected = activeTab === 'addons'
              ? selectedAddonIds.includes(itemId)
              : selectedActivityIds.includes(itemId);

            const imgUrl = item.image || 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80';

            return (
              <motion.div
                key={itemId}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, delay: Math.min(idx * 0.04, 0.3) }}
                whileHover={{ y: -6, rotateX: 2, scale: 1.02 }}
                className="flex-none w-[200px] sm:w-[220px] snap-start transform-gpu"
              >
                <div className={cn(
                  'flex h-full flex-col overflow-hidden rounded-2xl border bg-white dark:bg-[#1E1E1E] shadow-card hover:shadow-2xl transition-all duration-300',
                  selected
                    ? 'border-[#725D75] ring-2 ring-[#725D75]/50 dark:border-amber-400 dark:ring-amber-400/50'
                    : 'border-[#E8E7E3] dark:border-[#2E2E2E] hover:border-[#725D75]'
                )}>
                  {/* Clickable Image for Full View */}
                  <div
                    className="h-[135px] w-full overflow-hidden bg-[#F9F6F2] relative dark:bg-[#141414] cursor-pointer group"
                    onClick={() => setPreviewItem({
                      url: imgUrl,
                      title: item.name,
                      price: getItemPriceLabel(item)
                    })}
                  >
                    <img
                      src={imgUrl}
                      alt={item.name}
                      loading="lazy"
                      className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5 backdrop-blur-[2px]">
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 border border-white/30 backdrop-blur-md">
                        <Maximize2 size={13} />
                        <span>Full View</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-3.5">
                    <div>
                      <h4 className="line-clamp-1 font-serif text-xs font-bold text-[#1C1C1C] dark:text-white">
                        {item.name}
                      </h4>
                      {item.description && (
                        <p className="mt-1 text-[11px] text-[#746B72] dark:text-[#C8B5C3] font-light leading-snug line-clamp-1">
                          {item.description}
                        </p>
                      )}
                      <p className="mt-1 text-xs font-extrabold text-[#746B72] dark:text-[#C9BEAB]">
                        {getItemPriceLabel(item)}
                      </p>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => activeTab === 'addons' ? toggleAddon(itemId) : toggleActivity(itemId)}
                      className={cn(
                        'mt-3 flex items-center justify-center gap-1.5 rounded-full py-1.5 px-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs',
                        selected
                          ? 'bg-[#725D75] text-white dark:bg-amber-400 dark:text-slate-950 shadow-md'
                          : 'border border-[#E4DCD2] bg-[#F9F6F2] text-[#2F2930] hover:bg-[#725D75] hover:text-white dark:bg-[#262626] dark:border-[#483250] dark:text-white dark:hover:bg-amber-400 dark:hover:text-slate-950'
                      )}
                    >
                      {selected ? (
                        <>
                          <Check size={14} />
                          <span>Added</span>
                        </>
                      ) : (
                        <span>+ Add</span>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="w-full rounded-2xl border border-[#E4DCD2] bg-white p-5 text-xs text-[#746B72] dark:bg-[#1E1E1E] dark:border-[#483250]">
            No {activeTab === 'addons' ? 'add-ons' : 'activities'} available in this category.
          </div>
        )}
      </div>

      {/* Full-Size Image Preview Lightbox Modal */}
      <AnimatePresence>
        {previewItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md p-4"
            onClick={() => setPreviewItem(null)}
          >
            <div className="absolute top-5 right-5 flex items-center gap-3 text-white">
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-[85vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={previewItem.url}
                alt={previewItem.title}
                className="max-h-[75vh] max-w-[90vw] object-contain rounded-2xl border border-white/20 shadow-2xl"
              />
              <div className="mt-4 text-center text-white">
                <h3 className="font-serif text-xl font-bold">{previewItem.title}</h3>
                <p className="text-sm font-semibold text-[#A78A9F]">{previewItem.price}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
