import express, { Request, Response } from "express";
import GlobalCatalog from "../models/GlobalCatalog";
import Addon from "../models/Addon";
import Activity from "../models/Activity";

const router = express.Router();

const FALLBACK_CATALOG = {
  addons: [
    { name: "Fun Entertainers", description: "Live performers for your celebration", price: 1200, category: "Entertainment" },
    { name: "Photography", description: "Professional photoshoot add-on", price: 1800, category: "Media" },
    { name: "Kids Play Rentals", description: "Kids play zone for the event", price: 900, category: "Kids" },
  ],
  activities: [
    { name: "Magic Show", description: "Interactive magic performance", category: "Entertainment" },
    { name: "Photo Booth", description: "Fun instant photo corner", category: "Media" },
    { name: "Balloon Twister", description: "Balloon sculpting performance", category: "Kids" },
  ],
};

const normalizeCatalog = (catalog: any) => ({
  addons: (catalog?.addons || []).filter((item: any) => item && item.active !== false),
  activities: (catalog?.activities || []).filter((item: any) => item && item.active !== false),
});

const mapActivityToCatalogItem = (activity: any) => {
  const product = activity.product;
  if (!product || typeof product !== 'object' || !product.name) {
    return null;
  }

  return {
    _id: activity._id,
    name: product.name,
    description: product.description || "",
    image: product.image || "",
    price: product.price || 0,
    active: activity.active !== false,
    category: product.categoryName || product.category || product.subcategory || "General",
  };
};

router.get("/", async (_req: Request, res: Response) => {
  try {
    const catalog = await GlobalCatalog.findOne({}).lean();
    const globalCatalog = catalog ? normalizeCatalog(catalog) : { addons: [], activities: [] };

    const activeAddons = await Addon.find({ active: true }).sort({ createdAt: -1 }).lean();
    const activeActivitiesRaw = await Activity.find({ active: true }).populate("product").sort({ createdAt: -1 });
    const activeActivities = activeActivitiesRaw
      .map(mapActivityToCatalogItem)
      .filter((item): item is NonNullable<typeof item> => item !== null);

    // The GlobalCatalog fallback/seed doc and the actively-managed
    // Addon/Activity collections are two independent data sources with no
    // built-in relationship -- if an admin adds a real record whose name
    // happens to match a seeded fallback entry (e.g. "Photography"), both
    // used to render as two separate cards. Dedupe by normalized name,
    // keeping the actively-managed record (listed second, so it wins).
    const dedupeByName = <T extends { name?: string }>(items: T[]): T[] => {
      const seen = new Map<string, T>();
      for (const item of items) {
        const key = (item?.name || '').trim().toLowerCase();
        if (!key) continue;
        seen.set(key, item);
      }
      return Array.from(seen.values());
    };

    const mergedCatalog = {
      addons: dedupeByName([...globalCatalog.addons, ...activeAddons]),
      activities: dedupeByName([...globalCatalog.activities, ...activeActivities]),
    };

    if (!catalog && mergedCatalog.addons.length === 0 && mergedCatalog.activities.length === 0) {
      return res.json(normalizeCatalog(FALLBACK_CATALOG));
    }

    return res.json(mergedCatalog);
  } catch (err: any) {
    return res.json(normalizeCatalog(FALLBACK_CATALOG));
  }
});

router.post("/seed", async (_req: Request, res: Response) => {
  try {
    const existing = await GlobalCatalog.findOne({});
    if (existing) {
      return res.json(existing);
    }

    const created = await GlobalCatalog.create(FALLBACK_CATALOG);
    return res.status(201).json(created);
  } catch (err: any) {
    return res.json(FALLBACK_CATALOG);
  }
});

export default router;
