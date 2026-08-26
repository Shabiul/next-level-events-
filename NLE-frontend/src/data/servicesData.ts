import type { LucideIcon } from 'lucide-react';
import { PartyPopper, Sparkles } from 'lucide-react';

/**
 * Single source of truth for the site's service navigation:
 * - Header.tsx's desktop mega-menu and mobile Sheet menu both render
 *   from these two arrays.
 * - OccasionPage.tsx consults `findServiceSubItems` to decide which
 *   sub-category filter chips to show for a given top-level category,
 *   before falling back to its own legacy pattern-matching.
 *
 * `label` doubles as the category name used for routing
 * (`/category/:label`), matching the rest of the app's convention of
 * navigating by category display name rather than a separate id.
 */
export interface ServiceLink {
  label: string;
  subServices?: string[];
}

export interface ServiceColumn {
  key: 'curated-decors' | 'activities-entertainment';
  title: string;
  icon: LucideIcon;
  items: ServiceLink[];
}

export const CURATED_DECORS: ServiceLink[] = [
  { label: 'Simple Wall Decors' },
  {
    label: 'Birthdays',
    subServices: ['Boy Kids Themes', 'Girl Baby Themes', 'Ring Decor Designs', 'U-Arch Decor Designs'],
  },
  { label: '1st Birthday Designs' },
  { label: 'Baby Showers' },
  { label: 'Welcome Baby' },
  { label: 'Anniversary Celebrations' },
  { label: 'Naming Ceremonies' },
  {
    label: 'Pre & Post Wedding',
    subServices: ['Engagement Decor', 'Haldi Ceremony', 'Bride-to-Be', 'Groom-to-Be', 'Ring Ceremony'],
  },
  { label: 'Annaprashan' },
  { label: 'Bike & Car Deliveries' },
  { label: 'National Festivals' },
  { label: 'Opening Decors' },
  { label: 'Graduation' },
  { label: 'Proposal Setup' },
  { label: 'Cabana Setups' },
  { label: 'Terrace Proposals' },
  { label: 'Car Boot Surprises' },
];

export const ACTIVITIES_ENTERTAINMENT: ServiceLink[] = [
  {
    label: 'Kids Activities',
    subServices: [
      'Tattoo Artist',
      'Caricature',
      'Balloon Modelling',
      'Magician',
      'Game Host / Anchor / EMCEE',
      'Face Painting',
      'Balloon Shooting',
      'Pottery',
      'Nail Art',
      'Pebble Stone Painting',
      'Mascot',
      'Bouncy Castle',
      'Keychain Making',
      'Hair Braiding',
      'Trampoline',
      'Mehendi',
    ],
  },
  {
    label: 'Live Eateries / Catering',
    subServices: [
      'Popcorn',
      'Cotton Candy',
      'Chocolate Fountain',
      'Ice Gola',
      'Sweet Corn',
      'Potato Twister',
      'Turkish Ice Cream',
      'Instant Maggi',
      'Chaat Counters',
      'Fruit Salad',
      'Live Pani Puri',
      'Ice Cream Flavours',
    ],
  },
  { label: 'Photography & Videography' },
  {
    label: 'Other Services',
    subServices: ['Return Gifts', 'Flower Bouquets', 'Gift Hampers', 'Customised Cakes', 'Music Systems', 'Venues', 'Food & Catering'],
  },
];

export const SERVICE_COLUMNS: ServiceColumn[] = [
  { key: 'curated-decors', title: 'Curated Décors', icon: PartyPopper, items: CURATED_DECORS },
  { key: 'activities-entertainment', title: 'Activities & Entertainment', icon: Sparkles, items: ACTIVITIES_ENTERTAINMENT },
];

const ALL_SERVICE_LINKS: ServiceLink[] = [...CURATED_DECORS, ...ACTIVITIES_ENTERTAINMENT];

/**
 * Looks up sub-service names for a top-level category by fuzzy
 * (case-insensitive, either-direction substring) label match, so it
 * still resolves whether the route was built from the exact label,
 * a URL-decoded variant, or partial text. Returns null when the
 * category isn't one of ours or has no sub-services defined, so
 * callers can fall back to their own logic.
 */
export function findServiceSubItems(categoryName: string): string[] | null {
  const norm = categoryName.trim().toLowerCase();
  if (!norm) return null;

  const exact = ALL_SERVICE_LINKS.find((link) => link.label.toLowerCase() === norm);
  if (exact) return exact.subServices ?? null;

  const fuzzy = ALL_SERVICE_LINKS.find(
    (link) => link.subServices && (norm.includes(link.label.toLowerCase()) || link.label.toLowerCase().includes(norm))
  );
  return fuzzy?.subServices ?? null;
}
