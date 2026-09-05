import { AddonRepository, ProductRepository } from "../src/db/repositories";
import { supabase } from "../src/db/supabase";

export interface PricedSelection {
  id: string;
  name: string;
  price: number;
  qty: number;
  kind: "addon" | "activity";
}

function toNumber(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}
function clampQty(value: unknown) {
  return Math.max(1, Math.min(99, Math.round(toNumber(value) || 1)));
}

export const AVAILABLE_ADDONS_PRESETS: Array<{
  id: string;
  name: string;
  price: number;
  kind: "addon" | "activity";
}> = [
  { id: "preset-photography", name: "Photography", price: 5000, kind: "addon" },
  { id: "preset-videography", name: "Videography", price: 7500, kind: "addon" },
  { id: "preset-live-catering", name: "Live Catering", price: 3500, kind: "activity" },
  { id: "preset-flower-decoration", name: "Flower Decoration", price: 3000, kind: "addon" },
  { id: "preset-led-numbers", name: "LED Numbers", price: 1500, kind: "addon" },
  { id: "preset-custom-cake", name: "Custom Cake", price: 2500, kind: "addon" },
  { id: "preset-return-gifts", name: "Return Gifts", price: 1500, kind: "addon" },
  { id: "preset-premium-balloon-upgrade", name: "Premium Balloon Upgrade", price: 2500, kind: "addon" },
];

/**
 * Prices one addon/activity selection against a product-scoped price book
 * first (so a product's own custom-priced add-ons still win), then checks
 * the standard platform presets (e.g. Photography, Flower Decoration), then
 * falls back to the GLOBAL addons table / activities catalog.
 */
async function priceOne(
  item: any,
  kind: "addon" | "activity",
  productPriceBook: Map<string, { name: string; price: number }>
): Promise<PricedSelection | null> {
  const itemId = item?.id ? String(item.id) : "";
  const rawName = String(item?.name || "").trim();
  const lowerName = rawName.toLowerCase();

  // 1. Check product-specific price book
  const byId = itemId ? productPriceBook.get(itemId) : undefined;
  const byName = lowerName ? productPriceBook.get(lowerName) : undefined;
  let match: { name: string; price: number; id?: string } | undefined = byId || byName;

  // 2. Check standard platform presets (Checkout page popular celebration upgrades)
  if (!match && (lowerName || itemId)) {
    const preset = AVAILABLE_ADDONS_PRESETS.find(
      (p) =>
        (itemId && p.id.toLowerCase() === itemId.toLowerCase()) ||
        (lowerName && p.name.toLowerCase() === lowerName)
    );
    if (preset) {
      match = { id: preset.id, name: preset.name, price: preset.price };
    }
  }

  // 3. Check global database repositories (addons table & activities table)
  if (!match) {
    if (kind === "addon") {
      if (itemId) {
        const addon = await AddonRepository.findById(itemId);
        if (addon && addon.active !== false) {
          match = { id: addon.id, name: addon.name, price: toNumber(addon.price) };
        }
      }
      if (!match && rawName) {
        const addonByName = await AddonRepository.findByName(rawName);
        if (addonByName && addonByName.active !== false) {
          match = { id: addonByName.id, name: addonByName.name, price: toNumber(addonByName.price) };
        }
      }
    } else if (kind === "activity") {
      if (itemId) {
        const { data: act } = await supabase
          .from("activities")
          .select("*")
          .or(`id.eq.${itemId},legacy_mongo_id.eq.${itemId}`)
          .eq("active", true)
          .maybeSingle();
        if (act?.product_id) {
          const product = await ProductRepository.findById(act.product_id);
          if (product && product.active !== false) {
            match = { id: act.id, name: product.name, price: toNumber(product.price) };
          }
        }
      }
      if (!match && rawName) {
        const { data: actProduct } = await supabase
          .from("products")
          .select("id, name, price, active")
          .ilike("name", rawName)
          .eq("active", true)
          .maybeSingle();
        if (actProduct) {
          match = { id: actProduct.id, name: actProduct.name, price: toNumber(actProduct.price) };
        }
      }
    }
  }

  // 4. Safe fallback for catalog items with valid positive price
  if (!match && rawName && toNumber(item?.price) > 0) {
    match = { id: itemId || `custom-${lowerName.replace(/\s+/g, "-")}`, name: rawName, price: toNumber(item.price) };
  }

  if (!match) return null;
  return {
    id: String(match.id || itemId || ""),
    name: match.name,
    price: match.price,
    qty: clampQty(item?.qty),
    kind,
  };
}

export async function priceSelections(
  rawAddons: any[],
  rawActivities: any[],
  productPriceBook: Map<string, { name: string; price: number }>
): Promise<{ addons: (PricedSelection | null)[]; activities: (PricedSelection | null)[] }> {
  const addons = await Promise.all(rawAddons.map((i) => priceOne(i, "addon", productPriceBook)));
  const activities = await Promise.all(rawActivities.map((i) => priceOne(i, "activity", productPriceBook)));
  return { addons, activities };
}
