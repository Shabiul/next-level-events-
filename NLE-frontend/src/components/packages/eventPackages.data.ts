import type { LucideIcon } from 'lucide-react';
import {
  Palette,
  PartyPopper,
  IceCream2,
  Camera,
  Gift,
  Car,
} from 'lucide-react';

export type PackageCategoryKey =
  | 'decor'
  | 'activities'
  | 'liveEateries'
  | 'photography'
  | 'complimentary'
  | 'grandEntry';

export const CATEGORY_META: Record<
  PackageCategoryKey,
  { label: string; icon: LucideIcon }
> = {
  decor: { label: 'Decor', icon: Palette },
  activities: { label: 'Activities', icon: PartyPopper },
  liveEateries: { label: 'Live Eateries', icon: IceCream2 },
  photography: { label: 'Photography & Videography', icon: Camera },
  complimentary: { label: 'Complimentary', icon: Gift },
  grandEntry: { label: 'Grand Entry', icon: Car },
};

export const CATEGORY_FILTERS: PackageCategoryKey[] = [
  'decor',
  'activities',
  'liveEateries',
  'photography',
  'complimentary',
];

export interface PackageCategoryItem {
  /** e.g. "Popcorn", or "Magician / Host / Games — ₹5,000" for priced sub-items */
  label: string;
}

export interface PackageCategoryBlock {
  key: PackageCategoryKey;
  /** Optional label override, e.g. "Activities / Photo" or "Theme Decor" */
  labelOverride?: string;
  /** e.g. "₹4,999" -- omitted when the category has no standalone price */
  price?: string;
  /** e.g. "Any 2", "Included — ₹13,000 value" */
  note?: string;
  items: PackageCategoryItem[];
}

export type PackageBadge = 'Most Popular' | 'Luxury' | 'Custom';

// Real decor photos already used elsewhere in this app (verified to exist
// and to actually depict the celebration/decor imagery they're used for),
// keyed by EventPackage id. Shared by the Home "Popular Packages" rail and
// the /packages catalogue cards so both use the exact same photography.
export const PACKAGE_IMAGES: Record<string, string> = {
  'essential-celebration': '/kkkk-landscape.jpeg',
  'fun-fiesta': '/hero-balloons.jpg',
  'premium-carnival': '/explore2-landscape.jpeg',
  '30k-theme-decor': '/tearce-landscape.jpeg',
  'theme-decor-birthday': '/birthday-landscape.jpg',
  'grand-celebration': '/cabana.jpeg',
  '1-lakh-custom-stage': '/romantic-dinner-landscape.jpg',
};

export interface EventPackage {
  id: string;
  name: string;
  price: string;
  numericPrice: number;
  description: string;
  badge?: PackageBadge;
  categories: PackageCategoryBlock[];
}

export const EVENT_PACKAGES: EventPackage[] = [
  {
    id: 'essential-celebration',
    name: 'Essential Celebration',
    price: '₹14,999',
    numericPrice: 14999,
    description:
      'A beautifully simple start — balloon backdrop, cake table styling, and fun activities for an intimate celebration.',
    categories: [
      {
        key: 'decor',
        price: '₹4,999',
        items: [
          { label: 'Basic ring balloon backdrop decoration' },
          { label: 'Cake table setup' },
          { label: 'Baby name & age LED' },
        ],
      },
      {
        key: 'activities',
        price: '₹6,999',
        note: 'Any 2',
        items: [
          { label: 'Tattoo artist' },
          { label: 'Balloon modelling' },
          { label: 'Face painting' },
          { label: 'Mascot' },
        ],
      },
      {
        key: 'liveEateries',
        price: '₹3,999',
        note: 'Any 1',
        items: [
          { label: 'Popcorn' },
          { label: 'Cotton candy' },
          { label: 'Chocolate fountain' },
        ],
      },
    ],
  },
  {
    id: 'fun-fiesta',
    name: 'Fun Fiesta',
    price: '₹24,999',
    numericPrice: 24999,
    description:
      'Vibrant color-themed decor with entertainment and treats — perfect for a lively, memorable celebration.',
    categories: [
      {
        key: 'decor',
        price: '₹9,999',
        items: [
          { label: 'Premium round arch / double U-arch' },
          { label: 'Premium customised flex backdrop' },
          { label: 'Color-theme balloon decoration' },
          { label: 'Cake table setup with props' },
          { label: 'Welcome board' },
          { label: 'Balloon bunches' },
        ],
      },
      {
        key: 'activities',
        labelOverride: 'Activities / Photo',
        price: '₹8,000',
        items: [
          { label: 'Magician / Host / Games — ₹5,000' },
          { label: 'Balloon modelling / Tattoo / Mascot — ₹3,000' },
        ],
      },
      {
        key: 'liveEateries',
        price: '₹7,000',
        note: 'Any 2',
        items: [
          { label: 'Popcorn' },
          { label: 'Cotton candy' },
          { label: 'Chocolate fountain' },
        ],
      },
    ],
  },
  {
    id: 'premium-carnival',
    name: 'Premium Carnival',
    price: '₹39,999',
    numericPrice: 39999,
    badge: 'Most Popular',
    description:
      'Our most-loved tier: premium stage decor, entertainment, treats, and complimentary photography included.',
    categories: [
      {
        key: 'decor',
        price: '₹14,999',
        items: [
          { label: 'Premium 3-U arch / up to 15 ft stage decor' },
          { label: 'Welcome board' },
          { label: 'Welcome arch' },
          { label: 'Cake table setup' },
          { label: 'Baby name & age LED' },
        ],
      },
      {
        key: 'activities',
        price: '₹8,000',
        items: [
          { label: 'Tattoo / Balloon Modelling / Mascot — ₹3,000' },
          { label: 'Event Host / Magician — ₹5,000' },
        ],
      },
      {
        key: 'liveEateries',
        price: '₹4,000',
        items: [
          { label: 'Popcorn' },
          { label: 'Cotton candy' },
          { label: 'Chocolate fountain' },
        ],
      },
      {
        key: 'photography',
        note: 'Included — ₹13,000 value',
        items: [],
      },
    ],
  },
  {
    id: '30k-theme-decor',
    name: '30K Theme Decor Package',
    price: '₹30,000',
    numericPrice: 30000,
    description:
      'A fully themed stage setup with custom LED signage, activities, and live food counters.',
    categories: [
      {
        key: 'decor',
        labelOverride: 'Theme Decor',
        items: [
          { label: 'Customised theme decor — 12 × 15 ft stage' },
          { label: 'Customised welcome board' },
          { label: 'Theme-based welcome arch' },
          { label: 'Cake tables' },
          { label: 'LED letters' },
          { label: 'Age LED letters' },
          { label: 'Focus lights' },
          { label: 'Balloon bunches' },
        ],
      },
      {
        key: 'activities',
        items: [
          { label: 'Tattoo artist' },
          { label: 'Balloon modelling' },
          { label: 'Keychain making' },
        ],
      },
      {
        key: 'liveEateries',
        items: [
          { label: 'Popcorn' },
          { label: 'Chocolate fountain' },
          { label: 'Cotton candy' },
        ],
      },
    ],
  },
  {
    id: 'theme-decor-birthday',
    name: 'Theme Decor Birthday Package',
    price: '₹39,999',
    numericPrice: 39999,
    description:
      'Grand themed decor with a milestone photo pathway and a showstopping car entry with cold fire.',
    categories: [
      {
        key: 'decor',
        labelOverride: 'Decoration',
        items: [
          { label: 'Customised theme decor — 18 × 24 ft stage' },
          { label: 'Customised welcome board with balloon decor' },
          { label: 'Customised color balloon welcome arch' },
          { label: 'Cake table setup with suitable props' },
          { label: '12-month milestone board' },
          { label: 'Balloon baby photo pathway — 6 stands' },
          { label: 'Warm lighting' },
          { label: 'Grand car entry with cold fire' },
        ],
      },
      {
        key: 'activities',
        labelOverride: 'Activities & Live Eateries',
        items: [
          { label: 'Chocolate fountain' },
          { label: 'Popcorn' },
          { label: 'Mascot' },
          { label: 'Tattoo artist' },
          { label: 'Music system' },
        ],
      },
    ],
  },
  {
    id: 'grand-celebration',
    name: 'Grand Celebration Package',
    price: '₹50,000',
    numericPrice: 50000,
    badge: 'Luxury',
    description:
      'An opulent full-scale celebration with a grand entry, live counters, and complimentary extras.',
    categories: [
      {
        key: 'decor',
        labelOverride: 'Decoration',
        items: [
          { label: '20–24 ft theme-based backdrop' },
          { label: 'Customised theme decor' },
          { label: 'Customised welcome board' },
          { label: 'Welcome arch' },
          { label: 'Cake tables' },
          { label: 'Age LED letter' },
          { label: 'Name LED letter' },
          { label: 'Focus lights' },
          { label: 'Balloon bunches' },
          { label: 'Theme-matched props' },
          { label: 'Customised floor flex' },
          { label: 'Pathway baby cutouts' },
        ],
      },
      {
        key: 'grandEntry',
        items: [
          { label: 'Car entry with fog & cold fire (6)' },
          { label: 'OR cart entry' },
        ],
      },
      {
        key: 'activities',
        items: [
          { label: 'Bouncy castle / caricature' },
          { label: 'Magician / balloon shooting' },
        ],
      },
      {
        key: 'liveEateries',
        items: [
          { label: 'Chocolate fountain' },
          { label: 'Popcorn' },
          { label: 'Cotton candy' },
          { label: 'Turkish ice cream' },
        ],
      },
      {
        key: 'complimentary',
        items: [
          { label: 'Tattoo artist' },
          { label: 'Balloon modelling' },
          { label: 'Free transport' },
          { label: 'Digital invitation' },
        ],
      },
    ],
  },
  {
    id: '1-lakh-custom-stage',
    name: '₹1 Lakh Custom Stage Package',
    price: '₹1,00,000',
    numericPrice: 100000,
    badge: 'Custom',
    description:
      'Fully bespoke staging and entry experience, tailored end-to-end to your vision.',
    categories: [
      {
        key: 'decor',
        labelOverride: 'Decoration',
        items: [
          { label: 'Custom theme decoration' },
          { label: '25–30 ft stage decor' },
          { label: 'Welcome board' },
          { label: 'Entrance arch' },
          { label: 'Balloon bunches' },
          { label: '12-month milestone board' },
          { label: 'Baby pathway photos with balloon standees' },
          { label: 'Photobooth' },
          { label: 'Balloon tunnel arch pathway — 4' },
        ],
      },
      {
        key: 'grandEntry',
        items: [
          { label: 'Car entry' },
          { label: 'OR cart entry' },
          { label: 'Fog & cold fire' },
        ],
      },
    ],
  },
];
