import express, { Request, Response } from "express";
import { CartRepository, ProductRepository } from "../src/db/repositories";
import { requireAuth, type AuthedRequest } from "../utils/auth";
import { priceSelections } from "../utils/pricing";

const router = express.Router();
router.use(requireAuth);

const toNum = (v: unknown) => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
};
const clampQty = (v: unknown) => Math.max(1, Math.min(99, Math.round(toNum(v) || 1)));
const uid = (req: Request) => (req as AuthedRequest).user!.id;

async function priceCart(rawItems: any[]) {
  const productIds = rawItems.map((i) => String(i.productId)).filter(Boolean);
  if (!productIds.length) {
    return { items: [], subtotal: 0, total: 0, count: 0 };
  }

  const products = await Promise.all(productIds.map((id) => ProductRepository.findById(id)));
  const productMap = new Map(products.filter(Boolean).map((p: any) => [String(p.id || p._id), p]));

  const items = [];
  let subtotal = 0;

  for (const raw of rawItems) {
    const product = productMap.get(String(raw.productId));
    if (!product || product.active === false) continue;

    const qty = clampQty(raw.qty);

    const book = new Map<string, { id?: string; name: string; price: number }>();
    for (const a of Array.isArray(product.addOns) ? product.addOns : []) {
      if (a?.name) book.set(a.name.toLowerCase(), { name: a.name, price: toNum(a.price) });
    }
    for (const a of Array.isArray(product.addons) ? product.addons : []) {
      const id = a._id || a.id;
      if (id) {
        book.set(String(id), { id: String(id), name: a.name, price: toNum(a.price) });
      }
      if (a.name) {
        book.set(String(a.name).toLowerCase(), { id: String(id || ""), name: a.name, price: toNum(a.price) });
      }
    }

    // The storefront's addon/activity picker offers the whole active catalog,
    // not just items pre-linked to this product -- fall back to a global
    // lookup (by addonId, or activity id for kind:'activity' selections) so a
    // valid selection never silently disappears from the cart.
    const rawSelections = Array.isArray(raw.addons) ? raw.addons : [];
    const rawAddonSel = rawSelections.filter((ra: any) => ra.kind !== "activity").map((ra: any) => ({ id: ra.addonId, name: ra.name, price: toNum(ra.price), qty: ra.qty }));
    const rawActivitySel = rawSelections.filter((ra: any) => ra.kind === "activity").map((ra: any) => ({ id: ra.addonId, name: ra.name, price: toNum(ra.price), qty: ra.qty }));
    const priced = await priceSelections(rawAddonSel, rawActivitySel, book);

    const addons = [];
    for (const match of [...priced.addons, ...priced.activities]) {
      if (!match) continue;
      addons.push({ addonId: match.id, name: match.name, price: match.price, qty: match.qty });
      subtotal += match.price * match.qty;
    }

    const linePrice = toNum(product.price);
    subtotal += linePrice * qty;

    items.push({
      productId: String(product.id || product._id),
      name: product.name,
      image: product.image,
      price: linePrice,
      originalPrice: toNum(product.originalPrice) || undefined,
      categoryName: product.categoryName,
      badge: product.badge,
      badgeColor: product.badgeColor,
      qty,
      addons,
      lineTotal: linePrice * qty + addons.reduce((s, a) => s + a.price * a.qty, 0),
    });
  }

  return {
    items,
    subtotal,
    total: subtotal,
    count: items.reduce((s, i) => s + i.qty, 0),
  };
}

router.get("/", async (req: Request, res: Response) => {
  try {
    const rawItems = await CartRepository.getByUserId(uid(req));
    const priced = await priceCart(rawItems);
    return res.json({ success: true, data: priced });
  } catch (err: any) {
    console.error("[cart] get failed", err);
    return res.status(500).json({ success: false, message: "Could not load cart." });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { productId, qty = 1, addons = [] } = req.body || {};
    if (!productId) {
      return res.status(400).json({ success: false, message: "productId is required." });
    }

    const product = await ProductRepository.findById(String(productId));
    if (!product || product.active === false) {
      return res.status(404).json({ success: false, message: "Product not found or unavailable." });
    }

    const items = await CartRepository.getByUserId(uid(req));
    const existingIndex = items.findIndex((i: any) => String(i.productId) === String(productId));

    const cleanAddons = (Array.isArray(addons) ? addons : []).map((a: any) => ({
      addonId: a.addonId || a.id || a._id,
      name: a.name,
      price: toNum(a.price),
      qty: clampQty(a.qty),
      kind: a.kind === "activity" ? "activity" : "addon",
    }));

    const addQty = toNum(qty);
    if (existingIndex >= 0) {
      if (addQty > 0) {
        items[existingIndex].qty = clampQty(items[existingIndex].qty + addQty);
      }
      if (cleanAddons.length) {
        const existingMap = new Map((items[existingIndex].addons || []).map((a: any) => [String(a.addonId || a.name), a]));
        for (const ca of cleanAddons) {
          existingMap.set(String(ca.addonId || ca.name), ca);
        }
        items[existingIndex].addons = Array.from(existingMap.values());
      }
    } else {
      items.push({ productId: String(productId), qty: clampQty(qty || 1), addons: cleanAddons });
    }

    await CartRepository.save(uid(req), items);
    const priced = await priceCart(items);
    return res.status(200).json({ success: true, data: priced });
  } catch (err: any) {
    console.error("[cart] add failed", err);
    return res.status(500).json({ success: false, message: "Could not update cart." });
  }
});

// Folds a just-logged-in guest's localStorage cart into their server cart
// (quantities summed for products already present). Called once per login.
router.post("/merge", async (req: Request, res: Response) => {
  try {
    const guestItems = Array.isArray(req.body?.items) ? req.body.items : [];
    const items = await CartRepository.getByUserId(uid(req));

    for (const g of guestItems) {
      const productId = String(g?.productId || "");
      if (!productId) continue;
      const qty = clampQty(g?.qty);
      const existingIndex = items.findIndex((i: any) => String(i.productId) === productId);
      const gAddons = (Array.isArray(g?.addons) ? g.addons : []).map((a: any) => ({
        addonId: a.addonId || a.id || a._id,
        name: a.name,
        price: toNum(a.price),
        qty: clampQty(a.qty),
        kind: a.kind === "activity" ? "activity" : "addon",
      }));
      if (existingIndex >= 0) {
        items[existingIndex].qty = clampQty(items[existingIndex].qty + qty);
        if (gAddons.length) {
          const existingAddonIds = new Set((items[existingIndex].addons || []).map((a: any) => String(a.addonId || a.name)));
          for (const ga of gAddons) {
            if (!existingAddonIds.has(String(ga.addonId || ga.name))) {
              items[existingIndex].addons = [...(items[existingIndex].addons || []), ga];
            }
          }
        }
      } else {
        items.push({ productId, qty, addons: gAddons });
      }
    }

    await CartRepository.save(uid(req), items);
    const priced = await priceCart(items);
    return res.status(200).json({ success: true, data: priced });
  } catch (err: any) {
    console.error("[cart] merge failed", err);
    return res.status(500).json({ success: false, message: "Could not merge cart." });
  }
});

router.put("/items/:productId", async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { qty, addons } = req.body || {};
    const items = await CartRepository.getByUserId(uid(req));

    const targetIndex = items.findIndex((i: any) => String(i.productId) === String(productId));
    if (targetIndex < 0) {
      return res.status(404).json({ success: false, message: "Item not in cart." });
    }

    if (qty !== undefined) {
      const nextQty = toNum(qty);
      if (nextQty <= 0) {
        items.splice(targetIndex, 1);
      } else {
        items[targetIndex].qty = clampQty(nextQty);
      }
    }

    if (addons !== undefined && items[targetIndex]) {
      items[targetIndex].addons = (Array.isArray(addons) ? addons : []).map((a: any) => ({
        addonId: a.addonId || a.id || a._id,
        name: a.name,
        price: toNum(a.price),
        qty: clampQty(a.qty),
        kind: a.kind === "activity" ? "activity" : "addon",
      }));
    }

    await CartRepository.save(uid(req), items);
    const priced = await priceCart(items);
    return res.json({ success: true, data: priced });
  } catch (err: any) {
    console.error("[cart] update failed", err);
    return res.status(500).json({ success: false, message: "Could not update cart." });
  }
});

router.delete("/items/:productId", async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const items = await CartRepository.getByUserId(uid(req));
    const filtered = items.filter((i: any) => String(i.productId) !== String(productId));

    await CartRepository.save(uid(req), filtered);
    const priced = await priceCart(filtered);
    return res.json({ success: true, data: priced });
  } catch (err: any) {
    console.error("[cart] remove failed", err);
    return res.status(500).json({ success: false, message: "Could not remove item." });
  }
});

router.delete("/", async (req: Request, res: Response) => {
  try {
    await CartRepository.save(uid(req), []);
    return res.json({ success: true, data: { items: [], subtotal: 0, total: 0, count: 0 } });
  } catch (err: any) {
    console.error("[cart] clear failed", err);
    return res.status(500).json({ success: false, message: "Could not clear cart." });
  }
});

export default router;
