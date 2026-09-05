export interface CuratedPackage {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  badge?: string;
  inclusions: string[];
}

export const CURATED_EVENT_PACKAGES: CuratedPackage[] = [
  {
    id: "essential-celebration",
    name: "Essential Celebration",
    price: 14999,
    description:
      "A beautifully simple start — balloon backdrop, cake table styling, and fun activities for an intimate celebration.",
    image: "/kkkk-landscape.jpg",
    inclusions: [
      "Basic ring balloon backdrop decoration",
      "Cake table setup",
      "Baby name & age LED",
      "Tattoo artist / Balloon modelling / Face painting / Mascot (Any 2)",
      "Popcorn / Cotton candy / Chocolate fountain (Any 1)",
    ],
  },
  {
    id: "fun-fiesta",
    name: "Fun Fiesta",
    price: 24999,
    description:
      "Vibrant color-themed decor with entertainment and treats — perfect for a lively, memorable celebration.",
    image: "/hero-balloons.jpg",
    inclusions: [
      "Premium round arch / double U-arch",
      "Premium customised flex backdrop",
      "Color-theme balloon decoration",
      "Cake table setup with props",
      "Welcome board & balloon bunches",
      "Magician / Host / Games or Balloon modelling / Tattoo / Mascot",
      "Live Eateries: Popcorn / Cotton candy / Chocolate fountain (Any 2)",
    ],
  },
  {
    id: "premium-carnival",
    name: "Premium Carnival",
    price: 39999,
    badge: "Most Popular",
    description:
      "Our most-loved tier: premium stage decor, entertainment, treats, and complimentary photography included.",
    image: "/explore2-landscape.jpg",
    inclusions: [
      "Premium 3-U arch / up to 15 ft stage decor",
      "Welcome board & welcome arch",
      "Cake table setup & baby name/age LED",
      "Tattoo / Balloon Modelling / Mascot & Event Host / Magician",
      "Live Eateries: Popcorn / Cotton candy / Chocolate fountain",
      "Complimentary professional photography included (₹13,000 value)",
    ],
  },
  {
    id: "30k-theme-decor",
    name: "30K Theme Decor Package",
    price: 30000,
    description:
      "A fully themed stage setup with custom LED signage, activities, and live food counters.",
    image: "/tearce-landscape.jpg",
    inclusions: [
      "Customised theme decor — 12 × 15 ft stage",
      "Customised welcome board & theme-based welcome arch",
      "Cake tables, LED letters, Age LED letters, Focus lights, Balloon bunches",
      "Tattoo artist, Balloon modelling, Keychain making",
      "Popcorn, Chocolate fountain, Cotton candy",
    ],
  },
  {
    id: "theme-decor-birthday",
    name: "Theme Decor Birthday Package",
    price: 39999,
    description:
      "Grand themed decor with a milestone photo pathway and a showstopping car entry with cold fire.",
    image: "/birthday-landscape.jpg",
    inclusions: [
      "Customised theme decor — 18 × 24 ft stage",
      "Customised welcome board with balloon decor & color welcome arch",
      "Cake table setup with suitable props",
      "12-month milestone board & balloon baby photo pathway — 6 stands",
      "Warm lighting & grand car entry with cold fire",
      "Chocolate fountain, Popcorn, Mascot, Tattoo artist, Music system",
    ],
  },
  {
    id: "grand-celebration",
    name: "Grand Celebration Package",
    price: 50000,
    badge: "Luxury",
    description:
      "An opulent full-scale celebration with a grand entry, live counters, and complimentary extras.",
    image: "/cabana.jpg",
    inclusions: [
      "20–24 ft theme-based backdrop & customised theme decor",
      "Customised welcome board, welcome arch, cake tables",
      "Age LED letter, Name LED letter, focus lights, balloon bunches, theme-matched props",
      "Customised floor flex & pathway baby cutouts",
      "Grand car entry with fog & cold fire (6) OR cart entry",
      "Bouncy castle / caricature & magician / balloon shooting",
      "Chocolate fountain, Popcorn, Cotton candy, Turkish ice cream",
      "Complimentary: Tattoo artist, Balloon modelling, Free transport, Digital invitation",
    ],
  },
  {
    id: "1-lakh-custom-stage",
    name: "₹1 Lakh Custom Stage Package",
    price: 100000,
    badge: "Custom",
    description:
      "Fully bespoke staging and entry experience, tailored end-to-end to your vision.",
    image: "/romantic-dinner-landscape.jpg",
    inclusions: [
      "Custom theme decoration & 25–30 ft stage decor",
      "Welcome board, entrance arch, balloon bunches",
      "12-month milestone board & baby pathway photos with balloon standees",
      "Photobooth & balloon tunnel arch pathway — 4",
      "Grand car entry OR cart entry with fog & cold fire",
    ],
  },
];

export function getCuratedPackageByIdOrName(query: string): any | null {
  if (!query || typeof query !== "string") return null;
  const q = query.trim().toLowerCase();
  const slugified = q.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  const pkg = CURATED_EVENT_PACKAGES.find(
    (p) =>
      p.id === q ||
      p.id === slugified ||
      p.name.toLowerCase() === q ||
      slugified.includes(p.id) ||
      p.id.includes(slugified)
  );

  if (!pkg) return null;

  return {
    _id: pkg.id,
    id: pkg.id,
    name: pkg.name,
    categoryId: "cat-event-packages",
    categoryName: "Event Packages",
    subcategory: "",
    price: pkg.price,
    originalPrice: undefined,
    description: pkg.description,
    inclusions: pkg.inclusions || [],
    image: pkg.image,
    moreImages: [],
    badge: pkg.badge,
    badgeColor: undefined,
    rating: 5,
    reviewCount: 28,
    active: true,
    featured: true,
    orderCount: 15,
    addOns: [],
    activities: [],
    addons: [],
  };
}
