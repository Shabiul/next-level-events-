import "dotenv/config";
import { supabase } from "../db/supabase";

export const CURATED_PACKAGES_DATA = [
  {
    id: "essential-celebration",
    name: "Essential Celebration",
    price: 14999,
    numericPrice: 14999,
    description:
      "A beautifully simple start — balloon backdrop, cake table styling, and fun activities for an intimate celebration.",
    image: "/kkkk-landscape.jpg",
    badge: undefined,
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
    numericPrice: 24999,
    description:
      "Vibrant color-themed decor with entertainment and treats — perfect for a lively, memorable celebration.",
    image: "/hero-balloons.jpg",
    badge: undefined,
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
    numericPrice: 39999,
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
    numericPrice: 30000,
    description:
      "A fully themed stage setup with custom LED signage, activities, and live food counters.",
    image: "/tearce-landscape.jpg",
    badge: undefined,
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
    numericPrice: 39999,
    description:
      "Grand themed decor with a milestone photo pathway and a showstopping car entry with cold fire.",
    image: "/birthday-landscape.jpg",
    badge: undefined,
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
    numericPrice: 50000,
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
    numericPrice: 100000,
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

async function main() {
  console.log("Seeding Event Packages category and products into Supabase...");

  // 1. Ensure category exists
  let { data: cat } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", "event-packages")
    .maybeSingle();

  if (!cat) {
    const { data: newCat, error: catErr } = await supabase
      .from("categories")
      .insert({
        id: "cat-event-packages",
        legacy_mongo_id: "cat-event-packages",
        name: "Event Packages",
        slug: "event-packages",
        image: "/exploreee.jpg",
        order_num: 0,
        active: true,
        subcategories: [],
      })
      .select("*")
      .single();

    if (catErr) {
      console.error("Error creating category:", catErr);
      process.exit(1);
    }
    cat = newCat;
    console.log("Created 'Event Packages' category:", cat.id);
  } else {
    console.log("Found existing 'Event Packages' category:", cat.id);
  }

  // 2. Upsert each curated package
  for (const pkg of CURATED_PACKAGES_DATA) {
    const productPayload = {
      id: pkg.id,
      legacy_mongo_id: pkg.id,
      name: pkg.name,
      category_id: cat.id,
      category_name: "Event Packages",
      subcategory: "",
      price: pkg.numericPrice,
      original_price: null,
      description: pkg.description,
      inclusions: pkg.inclusions,
      image: pkg.image,
      more_images: [],
      badge: pkg.badge || null,
      badge_color: null,
      rating: 5,
      review_count: 28,
      active: true,
      featured: true,
      order_count: 10,
      add_ons_inline: [],
      activities_inline: [],
      updated_at: new Date().toISOString(),
    };

    const { error: prodErr } = await supabase
      .from("products")
      .upsert(productPayload, { onConflict: "id" });

    if (prodErr) {
      console.error(`Failed to upsert ${pkg.name}:`, prodErr);
    } else {
      console.log(`✓ Upserted product: ${pkg.name} (${pkg.id})`);
    }
  }

  console.log("Done seeding curated packages!");
}

main().catch(console.error);
