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
  {
    label: 'Proposal Setup',
    subServices: ['Terrace Proposals', 'Marry Me Marquee', 'Heart Arch Setup', 'Candlelight Pathway'],
    icon: Heart,
  },
  { label: 'Cabana Setups', icon: Tent },
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
  'bride-to-be': '/bride to be.jpeg',
  'food & catering': '/food.jpeg',
  'engagement decor': '/pre and post 2.jpeg',
  'haldi ceremony': '/pre and post 5.jpeg',
  'groom-to-be': '/pre and post 8.jpeg',
  'ring ceremony': '/pre and post 3.jpeg',
  'terrace proposals': '/tearce.jpeg',
  'marry me marquee': '/terrace-proposal.jpeg',
  'heart arch setup': '/proposal set up 2.jpeg',
  'candlelight pathway': '/proposal set up 3.jpeg',
};

/**
 * Themed photo galleries pulled from public/ for the top-level Curated
 * Décor / Activities services. Keyed by the lower-cased `label`. These are
 * the real event photos added to the site's Services section (NOT the home
 * page) -- one entry per theme, every image verified to depict that theme.
 */
export const SERVICE_GALLERY_IMAGES: Record<string, string[]> = {
  'simple wall decors': [
    '/simple-wall-decor.jpg',
    '/simple-wall-decors.jpg',
  ],
  'birthdays': [
    '/birthday.jpeg',
    '/birthday.jpg',
    '/birthday-landscape.jpg',
  ],
  '1st birthday designs': [
    '/1st birthday.jpeg',
    '/1st-birthday.jpeg',
    '/1st-birthday.jpg',
    '/1ss.jpeg',
  ],
  'baby showers': [
    '/baby shower.jpeg',
    '/baby-shower.jpeg',
    '/baby-shower.jpg',
  ],
  'welcome baby': [
    '/welcome-baby.jpeg',
    '/welcome-baby.jpg',
    '/welcome.jpeg',
  ],
  'anniversary celebrations': [
    '/romantic-dinner.jpg',
    '/romantic-dinner-landscape.jpg',
    '/romantic-dinner-ref.jpg',
    '/candlelight-dinner.jpg',
  ],
  'naming ceremonies': [
    '/NAMING CERMERIONS CARD.jpeg',
    '/NAMING  FOR HOME PAGE.jpeg',
  ],
  'annaprashan': [
    '/ANNAPARAS CARD.jpeg',
    '/food.jpeg',
    '/food 3.jpeg',
    '/food 5.jpeg',
    '/food 6.jpeg',
    '/food 7.jpeg',
  ],
  'cabana setups': [
    '/kkkk.jpeg',
    '/cabana.jpeg',
    '/kkkk-landscape.jpeg',
  ],
  'kids activities': [
    '/kids-activities.jpeg',
    '/kids activities.jpeg',
    '/kids-activities.jpg',
    '/kids theme.jpeg',
    '/kids.jpeg',
    '/kids-landscape.jpeg',
  ],
  'opening decors': [
    '/OPINING CARD.jpeg',
    '/opining 2.jpeg',
    '/opining 4.jpeg',
    '/opining 4 (2).jpeg',
    '/opining5.jpeg',
    '/opining6.jpeg',
    '/opining7.jpeg',
  ],
  'national festivals': [
    '/NATIONAL FISTIVAL CARD.jpeg',
    '/national fistival.jpeg',
    '/national fistival 5.jpeg',
    '/national fistive 2.jpeg',
    '/national fistivial 8.jpeg',
  ],
  'graduation': [
    '/GRADUATION CARD.jpeg',
    '/graduation.jpeg',
    '/graduation set up.jpeg',
    '/graduation set up 2.jpeg',
    '/graduation set up 3.jpeg',
    '/graduation set up 4.jpeg',
    '/graduation set up 5.jpeg',
    '/graduation set up 6.jpeg',
    '/graduation set up 7.jpeg',
  ],
  'pre & post wedding': [
    '/PRE AND POST CARD.jpeg',
    '/pre and post 2.jpeg',
    '/pre and post 3.jpeg',
    '/pre and post 4.jpeg',
    '/pre and post 5.jpeg',
    '/pre and post 6.jpeg',
    '/pre and post 7.jpeg',
    '/pre and post 8.jpeg',
    '/pre and post 9.jpeg',
    '/pre and post 10.jpeg',
    '/bride to be.jpeg',
    '/bride to be 3.jpeg',
    '/bride to be 4.jpeg',
    '/bride to be 5.jpeg',
  ],
  'proposal setup': [
    '/proposal set up.jpeg',
    '/proposal set up 1.jpeg',
    '/proposal set up 2.jpeg',
    '/proposal set up 3.jpeg',
    '/proposal set up 4.jpeg',
    '/proposal set up 5.jpeg',
    '/propsal set up 6.jpeg',
    '/propsal set up 7.jpeg',
    '/tearce.jpeg',
    '/terrace-proposal.jpeg',
    '/terrace.jpeg',
  ],
  'bike & car deliveries': [
    '/BIKE AND CAR DELIVER CARD.jpeg',
    '/car deliver.jpeg',
    '/car deliver (2).jpeg',
    '/car deliver (3).jpeg',
    '/car deliver 4.jpeg',
    '/car deliver 5.jpeg',
  ],
  'live eateries / catering': [
    '/food.jpeg',
    '/food 3.jpeg',
    '/food 5.jpeg',
    '/food 6.jpeg',
    '/food 7.jpeg',
  ],
};

/**
 * One representative public/ photo per top-level service, shown as the
 * thumbnail beside the label in the Services mega-menu / mobile menu.
 * Labels without a verified photo fall back to their Lucide icon.
 */
export const SERVICE_THUMBNAILS: Record<string, string> = {
  'simple wall decors': '/simple-wall-decor.jpg',
  'birthdays': '/birthday.jpg',
  'naming ceremonies': '/NAMING CERMERIONS CARD.jpeg',
  'annaprashan': '/ANNAPARAS CARD.jpeg',
  'photography & videography': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=200&q=80',
  'other services': '/activities-entertainment.jpeg',
  '1st birthday designs': '/1ss.jpeg',
  'baby showers': '/baby-shower.jpg',
  'welcome baby': '/welcome-baby.jpg',
  'anniversary celebrations': '/romantic-dinner.jpg',
  'pre & post wedding': '/PRE AND POST CARD.jpeg',
  'bike & car deliveries': '/BIKE AND CAR DELIVER CARD.jpeg',
  'national festivals': '/NATIONAL FISTIVAL CARD.jpeg',
  'opening decors': '/OPINING CARD.jpeg',
  'graduation': '/GRADUATION CARD.jpeg',
  'proposal setup': '/proposal set up.jpeg',
  'cabana setups': '/kkkk.jpeg',
  'car boot surprises': '/car bot.jpeg',
  'kids activities': '/kids-activities.jpeg',
  'live eateries / catering': '/food.jpeg',
};

/** Thumbnail for a top-level service label, or undefined to fall back to the icon. */
export function getServiceThumb(label: string): string | undefined {
  return SERVICE_THUMBNAILS[label.trim().toLowerCase()];
}

/**
 * Returns the themed photo gallery for a top-level service by fuzzy
 * (case-insensitive, either-direction substring) label match. Empty array
 * when the theme has no curated photos yet.
 */
export function getServiceGalleryImages(name: string): string[] {
  const norm = name.trim().toLowerCase();
  if (!norm) return [];
  if (SERVICE_GALLERY_IMAGES[norm]) return SERVICE_GALLERY_IMAGES[norm];
  const key = Object.keys(SERVICE_GALLERY_IMAGES).find(
    (k) => norm.includes(k) || k.includes(norm)
  );
  return key ? SERVICE_GALLERY_IMAGES[key] : [];
}

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
