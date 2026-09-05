import express, { Request, Response } from "express";
import { ProductRepository } from "../src/db/repositories";
import { aiReindexService } from "../src/ai/services/ai-reindex.service";
import { requirePermission, attachUser, type AuthedRequest } from "../utils/auth";

const router = express.Router();

const normalizeProductAddons = (product: any) => {
  const inlineAddons = Array.isArray(product.addOns) ? product.addOns : [];
  const referencedAddons = Array.isArray(product.addons) ? product.addons : [];
  const activities = Array.isArray(product.activities) ? product.activities : [];

  const normalizedInline = inlineAddons
    .filter((a: any) => a && typeof a === "object")
    .map((a: any) => ({
      _id: a._id || a.id || null,
      name: a.name,
      price: a.price,
      description: a.description || "",
      image: a.image || "",
      active: a.active !== false,
    }));

  const normalizedReferenced = referencedAddons
    .filter((a: any) => a && typeof a === "object" && typeof a.name === "string")
    .map((a: any) => ({
      _id: a._id || a.id || null,
      name: a.name,
      price: Number(a.price || 0),
      description: a.description || "",
      image: a.image || "",
      active: a.active !== false,
    }));

  const normalized = [...normalizedInline, ...normalizedReferenced];

  return {
    ...product,
    _id: product.id || product._id,
    addOns: normalizedInline,
    addons: normalized.length > 0 ? normalized : normalizedReferenced,
    activities,
  };
};

// No requireAuth here -- this is the public storefront listing. `attachUser`
// only reads a token if one happens to be present (CRM calls this
// authenticated) so admins/staff still see hidden products in their own
// product table, while anonymous/customer traffic never sees inactive ones.
router.get("/", attachUser, async (req: Request, res: Response) => {
  try {
    const page = req.query.page ? Math.max(1, Number(req.query.page)) : undefined;
    const limit = req.query.limit ? Math.min(100, Math.max(1, Number(req.query.limit))) : undefined;
    const search = req.query.search ? String(req.query.search).trim() : undefined;
    const role = (req as AuthedRequest).user?.role;
    const activeOnly = role !== "admin" && role !== "staff";

    const products = await ProductRepository.listAll({ page, limit, search, activeOnly });
    const normalized = products.map(normalizeProductAddons);
    res.json(normalized);
  } catch (err: any) {
    console.error("[products] list failed", err);
    res.status(500).json({ error: "Failed to load products" });
  }
});

// Same rule for a direct product-detail fetch: an inactive product is only
// visible to the admin/staff who might be previewing it from the CRM.
router.get("/:id", attachUser, async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const product = await ProductRepository.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    const role = (req as AuthedRequest).user?.role;
    if (product.active === false && role !== "admin" && role !== "staff") {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.json(normalizeProductAddons(product));
  } catch (err: any) {
    console.error("[products] get failed", err);
    return res.status(500).json({ error: "Failed to load product" });
  }
});

// Popularity counter -- fired on every add-to-cart, guest or signed-in, so
// it must not require auth (most add-to-cart traffic is anonymous).
router.post("/:id/order", async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const orderCount = await ProductRepository.incrementOrderCount(id);
    res.json({ orderCount });
  } catch (err: any) {
    console.error("[products] increment order failed", err);
    res.status(500).json({ error: "Failed to update order count" });
  }
});

router.get("/category/:categoryId", async (req: Request, res: Response) => {
  try {
    const categoryId = String(req.params.categoryId);
    const page = req.query.page ? Math.max(1, Number(req.query.page)) : undefined;
    const limit = req.query.limit ? Math.min(100, Math.max(1, Number(req.query.limit))) : undefined;

    const products = await ProductRepository.listAll({ categoryId, page, limit });
    const normalized = products.map(normalizeProductAddons);
    res.json(normalized);
  } catch (err: any) {
    console.error("[products] category list failed", err);
    res.status(500).json({ error: "Failed to load products for category" });
  }
});

router.post("/", requirePermission("products"), async (req: Request, res: Response) => {
  try {
    const payload = {
      ...req.body,
      addons: Array.isArray(req.body.addons) ? req.body.addons : [],
      addOns: Array.isArray(req.body.addOns) ? req.body.addOns : [],
      activities: Array.isArray(req.body.activities) ? req.body.activities : [],
    };
    const product = await ProductRepository.create(payload);
    try {
      aiReindexService.scheduleReindex();
    } catch {}
    res.json(normalizeProductAddons(product));
  } catch (err: any) {
    console.error("[products] create failed", err);
    res.status(500).json({ error: "Failed to create product" });
  }
});

router.put("/:id", requirePermission("products"), async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const payload = {
      ...req.body,
      addons: Array.isArray(req.body.addons) ? req.body.addons : [],
      addOns: Array.isArray(req.body.addOns) ? req.body.addOns : [],
      activities: Array.isArray(req.body.activities) ? req.body.activities : [],
    };
    const updated = await ProductRepository.update(id, payload);
    if (updated) {
      try {
        aiReindexService.scheduleReindex();
      } catch {}
    }
    res.json(normalizeProductAddons(updated));
  } catch (err: any) {
    console.error("[products] update failed", err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

router.delete("/:id", requirePermission("products"), async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const deleted = await ProductRepository.delete(id);
    if (deleted) {
      try {
        aiReindexService.scheduleReindex();
      } catch {}
    }
    res.json({ message: "Product deleted" });
  } catch (err: any) {
    console.error("[products] delete failed", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;
