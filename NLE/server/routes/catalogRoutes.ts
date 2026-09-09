import express, { Request, Response } from "express";
import { AddonRepository, ProductRepository } from "../src/db/repositories.js";
import { supabase } from "../src/db/supabase.js";
import { registerSseClient, getCatalogVersion } from "../services/catalogSyncService.js";

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

router.get("/", async (_req: Request, res: Response) => {
  try {
    const activeAddons = await AddonRepository.listActive();

    const { data: activeActivitiesRaw } = await supabase
      .from("activities")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false });

    const activeActivities = (
      await Promise.all(
        (activeActivitiesRaw || []).map(async (act) => {
          const product = act.product_id ? await ProductRepository.findById(act.product_id) : null;
          if (!product) return null;
          return {
            _id: act.id,
            id: act.id,
            name: product.name,
            description: product.description || "",
            image: product.image || "",
            price: product.price || 0,
            active: act.active !== false,
            category: product.categoryName || "General",
          };
        })
      )
    ).filter(Boolean);

    const dedupeByName = <T extends { name?: string }>(items: T[]): T[] => {
      const seen = new Map<string, T>();
      for (const item of items) {
        const key = (item?.name || "").trim().toLowerCase();
        if (!key) continue;
        seen.set(key, item);
      }
      return Array.from(seen.values());
    };

    const addons = dedupeByName(activeAddons);
    const activities = dedupeByName(activeActivities as any[]);

    if (addons.length === 0 && activities.length === 0) {
      return res.json(FALLBACK_CATALOG);
    }

    return res.json({ addons, activities });
  } catch (err: any) {
    return res.json(FALLBACK_CATALOG);
  }
});

router.post("/seed", async (_req: Request, res: Response) => {
  return res.json(FALLBACK_CATALOG);
});

// Real-time SSE stream for 0ms cross-tab and cross-app synchronization
router.get("/live", (req: Request, res: Response) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "X-Accel-Buffering": "no",
  });

  const initialPayload = JSON.stringify({
    type: "INIT",
    version: getCatalogVersion(),
    timestamp: Date.now(),
  });
  res.write(`event: init\ndata: ${initialPayload}\n\n`);

  const unregister = registerSseClient(res);

  req.on("close", () => {
    unregister();
  });
});

// Version check endpoint
router.get("/version", (_req: Request, res: Response) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.json({
    version: getCatalogVersion(),
    timestamp: Date.now(),
  });
});

export default router;
