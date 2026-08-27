import type { LucideIcon } from 'lucide-react';
import {
  PartyPopper,
  Sparkles,
  Image,
  Cake,
  CakeSlice,
  Baby,
  Heart,
  Badge,
  HeartHandshake,
  Soup,
  Car,
  DoorOpen,
  GraduationCap,
  Tent,
  Flower2,
  Gift,
  Gamepad2,
  Utensils,
  Camera,
} from 'lucide-react';

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
  /** Small semantic line icon shown beside the label in the Services
   * mega-menu/mobile menu -- keep to Lucide only, no emoji. */
  icon?: LucideIcon;
}

export interface ServiceColumn {
  key: 'curated-decors' | 'activities-entertainment';
  title: string;
  icon: LucideIcon;
  items: ServiceLink[];
}

export const CURATED_DECORS: ServiceLink[] = [
  { label: 'Simple Wall Decors', icon: Image },
  {
    label: 'Birthdays',
    subServices: ['Boy Kids Themes', 'Girl Baby Themes', 'Ring Decor Designs', 'U-Arch Decor Designs'],
    icon: Cake,
  },
  { label: '1st Birthday Designs', icon: CakeSlice },
  { label: 'Baby Showers', icon: Baby },
  { label: 'Welcome Baby', icon: Baby },
  { label: 'Anniversary Celebrations', icon: Heart },
  { label: 'Naming Ceremonies', icon: Badge },
  {
    label: 'Pre & Post Wedding',
    subServices: ['Engagement Decor', 'Haldi Ceremony', 'Bride-to-Be', 'Groom-to-Be', 'Ring Ceremony'],
    icon: HeartHandshake,
  },
  { label: 'Annaprashan', icon: Soup },
  { label: 'Bike & Car Deliveries', icon: Car },
  { label: 'National Festivals', icon: Sparkles },
  { label: 'Opening Decors', icon: DoorOpen },
  { label: 'Graduation', icon: GraduationCap },
  { label: 'Proposal Setup', icon: Heart },
  { label: 'Cabana Setups', icon: Tent },
  { label: 'Terrace Proposals', icon: Flower2 },
  { label: 'Car Boot Surprises', icon: Gift },
];

export const ACTIVITIES_ENTERTAINMENT: ServiceLink[] = [
  {
    label: 'Kids Activities',
    icon: Gamepad2,
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
    icon: Utensils,
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
  { label: 'Photography & Videography', icon: Camera },
  {
    label: 'Other Services',
    icon: Sparkles,
    subServices: ['Return Gifts', 'Flower Bouquets', 'Gift Hampers', 'Customised Cakes', 'Music Systems', 'Venues', 'Food & Catering'],
  },
];

export const SERVICE_COLUMNS: ServiceColumn[] = [
  { key: 'curated-decors', title: 'Curated Décors', icon: PartyPopper, items: CURATED_DECORS },
  { key: 'activities-entertainment', title: 'Activities & Entertainment', icon: Sparkles, items: ACTIVITIES_ENTERTAINMENT },
];

const ALL_SERVICE_LINKS: ServiceLink[] = [...CURATED_DECORS, ...ACTIVITIES_ENTERTAINMENT];

/**
 * Real photos from public/ that were individually opened and verified to
 * actually depict the named service (see the review notes in
 * OccasionPage.tsx for the mismatches that were caught and avoided --
 * e.g. tattoo.jpeg / tatoo.jpeg both actually show face painting, so they
 * back "Face Painting" here and are deliberately NOT used for either
 * "Tattoo Artist" entry). Keyed by lower-cased service name.
 */
const SUB_SERVICE_IMAGES: Record<string, string> = {
  'face painting': '/tattoo.jpeg',
  'balloon modelling': '/hero-balloons.jpg',
  'balloon shooting': '/hero-balloons.jpg',
  'popcorn': '/popcorn.jpeg',
  'cotton candy': '/cotton candy.jpeg',
  'chocolate fountain': '/chocolate fountain.jpeg',
  'ice gola': '/ice gola.jpeg',
  'ice cream flavours': '/ice gola.jpeg',
  'sweet corn': '/sweet corn.jpeg',
  'potato twister': '/potato twister.jpeg',
};

/** Generic celebration photo used when no verified photo exists for a
 * specific sub-service -- keeps every card populated with a real, on-brand
 * image rather than a blank/broken `<img>` (never a guessed/mismatched one). */
const DEFAULT_SUB_SERVICE_IMAGE = '/hero-balloons.jpg';

export function getSubServiceImage(name: string): string {
  return SUB_SERVICE_IMAGES[name.trim().toLowerCase()] || DEFAULT_SUB_SERVICE_IMAGE;
}

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
