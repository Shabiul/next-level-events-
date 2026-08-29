import express, { Request, Response } from "express";
import mongoose from "mongoose";
import Cart from "../models/Cart";
import Product from "../models/Product";
import Addon from "../models/Addon";
import { requireAuth, type AuthedRequest } from "../utils/auth";

const router = express.Router();
router.use(requireAuth);

const toNum = (v: unknown) => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
};
const clampQty = (v: unknown) => Math.max(1, Math.min(99, Math.round(toNum(v) || 1)));
const uid = (req: Request) => (req as AuthedRequest).user!.id;

/**
 * Resolve a raw cart document into a priced view. Every price is taken from the
 * live Product / Addon documents -- the stored cart holds ids + quantities
 * only, never money. Items whose product no longer exists / is inactive are
 * silently dropped.
 */
async function priceCart(rawItems: any[]) {
  const productIds = rawItems
    .map((i) => String(i.productId))
    .filter((id) => mongoose.Types.ObjectId.isValid(id));
  const products = await Product.find({ _id: { $in: productIds }, active: { $ne: false } })
    .populate("addons")
    .lean<any[]>();
  const productMap = new Map(products.map((p) => [String(p._id), p]));

  const items = [];
  let subtotal = 0;

  for (const raw of rawItems) {
    const product = productMap.get(String(raw.productId));
    if (!product) continue;

    const qty = clampQty(raw.qty);

    // price book for this product's legitimate add-ons
    const book = new Map<string, { id?: string; name: string; price: number }>();
    for (const a of Array.isArray(product.addOns) ? product.addOns : []) {
      if (a?.name) book.set(a.name.toLowerCase(), { name: a.name, price: toNum(a.price) });
    }
    for (const a of Array.isArray(product.addons) ? product.addons : []) {
      if (a && a._id) {
        book.set(String(a._id), { id: String(a._id), name: a.name, price: toNum(a.price) });
        if (a.name) book.set(String(a.name).toLowerCase(), { id: String(a._id), name: a.name, price: toNum(a.price) });
      }
    }

    const addons = [];
    for (const ra of Array.isArray(raw.addons) ? raw.addons : []) {
      const match =
        (ra.addonId && book.get(String(ra.addonId))) ||
        (ra.name && book.get(String(ra.name).toLowerCase()));
      if (!match) continue;
      const aQty = clampQty(ra.qty);
      addons.push({ addonId: match.id, name: match.name, price: match.price, qty: aQty });
      subtotal += match.price * aQty;
    }

    const linePrice = toNum(product.price);
    subtotal += linePrice * qty;

    items.push({
      productId: String(product._id),
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

async function loadRawCart(userId: string): Promise<any[]> {
  const cart = await Cart.findOne({ userId }).lean<any>();
  return Array.isArray(cart?.items) ? (cart!.items as any[]).map((i) => ({ ...i })) : [];
}

async function saveRawCart(userId: string, items: any[]) {
  await Cart.findOneAndUpdate(
    { userId },
    { $set: { items } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

/** GET /api/cart -- current cart, priced from the DB. */
router.get("/", async (req: Request, res: Response) => {
  try {
    const priced = await priceCart(await loadRawCart(uid(req)));
    res.json({ success: true, data: priced });
  } catch (err) {
    console.error("[cart] load failed", err);
    res.status(500).json({ success: false, message: "Failed to load cart" });
  }
});

/** POST /api/cart/items { productId, qty?, addons?:[{addonId?,name?,qty?}] } -- add or increment. */
router.post("/items", async (req: Request, res: Response) => {
  try {
    const { productId } = req.body;
    if (!productId || !mongoose.Types.ObjectId.isValid(String(productId))) {
      return res.status(400).json({ success: false, message: "Invalid product reference" });
    }
    const product = await Product.findById(productId).lean<any>();
    if (!product || product.active === false) {
      return res.status(400).json({ success: false, message: "This package is unavailable." });
    }

    const items = await loadRawCart(uid(req));
    const addQty = clampQty(req.body.qty ?? 1);
    const addAddons = Array.isArray(req.body.addons)
      ? req.body.addons
          .filter((a: any) => a && (a.addonId || a.name))
          .map((a: any) => ({ addonId: a.addonId, name: a.name, qty: clampQty(a.qty ?? 1) }))
      : [];

    const existing = items.find((i: any) => String(i.productId) === String(productId));
    if (existing) {
      existing.qty = clampQty(existing.qty + addQty);
      if (addAddons.length) existing.addons = addAddons;
    } else {
      items.push({ productId, qty: addQty, addons: addAddons });
    }

    await saveRawCart(uid(req), items);
    res.json({ success: true, data: await priceCart(items) });
  } catch (err) {
    console.error("[cart] add failed", err);
    res.status(500).json({ success: false, message: "Failed to add to cart" });
  }
});

/** PATCH /api/cart/items/:productId { qty } -- set quantity (qty<1 removes). */
router.patch("/items/:productId", async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const items = await loadRawCart(uid(req));
    const idx = items.findIndex((i: any) => String(i.productId) === String(productId));
    if (idx === -1) return res.status(404).json({ success: false, message: "Item not in cart" });

    const nextQty = Math.round(toNum(req.body.qty));
    if (nextQty < 1) items.splice(idx, 1);
    else items[idx].qty = clampQty(nextQty);

    await saveRawCart(uid(req), items);
    res.json({ success: true, data: await priceCart(items) });
  } catch (err) {
    console.error("[cart] update failed", err);
    res.status(500).json({ success: false, message: "Failed to update cart" });
  }
});

/** DELETE /api/cart/items/:productId */
router.delete("/items/:productId", async (req: Request, res: Response) => {
  try {
    const items = (await loadRawCart(uid(req))).filter(
      (i: any) => String(i.productId) !== String(req.params.productId)
    );
    await saveRawCart(uid(req), items);
    res.json({ success: true, data: await priceCart(items) });
  } catch (err) {
    console.error("[cart] remove failed", err);
    res.status(500).json({ success: false, message: "Failed to remove item" });
  }
});

/** DELETE /api/cart -- empty the cart. */
router.delete("/", async (req: Request, res: Response) => {
  try {
    await saveRawCart(uid(req), []);
    res.json({ success: true, data: { items: [], subtotal: 0, total: 0, count: 0 } });
  } catch (err) {
    console.error("[cart] clear failed", err);
    res.status(500).json({ success: false, message: "Failed to clear cart" });
  }
});

/**
 * POST /api/cart/merge { items:[{productId, qty, addons}] }
 * Fold a guest (localStorage) cart into the signed-in user's cart on login.
 */
router.post("/merge", async (req: Request, res: Response) => {
  try {
    const guest = Array.isArray(req.body.items) ? req.body.items : [];
    const items = await loadRawCart(uid(req));

    for (const g of guest) {
      const gid = String(g.productId || g._id || "");
      if (!mongoose.Types.ObjectId.isValid(gid)) continue;
      const existing = items.find((i: any) => String(i.productId) === gid);
      const gQty = clampQty(g.qty ?? 1);
      if (existing) existing.qty = clampQty(existing.qty + gQty);
      else items.push({ productId: gid, qty: gQty, addons: [] });
    }

    await saveRawCart(uid(req), items);
    res.json({ success: true, data: await priceCart(items) });
  } catch (err) {
    console.error("[cart] merge failed", err);
    res.status(500).json({ success: false, message: "Failed to merge cart" });
  }
});

export default router;
