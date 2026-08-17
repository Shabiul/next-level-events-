import express, { Request, Response } from "express";
import Product from "../models/Product";
import { aiReindexService } from "../src/ai/services/ai-reindex.service";

const router = express.Router();

const normalizeProductAddons = (product: any) => {
  const obj: any = typeof product.toObject === 'function' ? product.toObject() : product;

  const inlineAddons = Array.isArray(obj.addOns) ? obj.addOns : [];
  const referencedAddons = Array.isArray(obj.addons) ? obj.addons : [];
  const activities = Array.isArray(obj.activities) ? obj.activities : [];

  const normalizedInline = inlineAddons
    .filter((a: any) => a && typeof a === 'object')
    .map((a: any) => ({
      _id: a._id || a.id || null,
      name: a.name,
      price: a.price,
      description: a.description || '',
      image: a.image || '',
      active: a.active !== false,
    }));

  const normalizedReferenced = referencedAddons
    .filter((a: any) => a && typeof a === 'object' && typeof a.name === 'string' && typeof a.price === 'number')
    .map((a: any) => ({
      _id: a._id || a.id || null,
      name: a.name,
      price: a.price,
      description: a.description || '',
      image: a.image || '',
      active: a.active !== false,
    }));

  const normalized = [...normalizedInline, ...normalizedReferenced];

  if (normalized.length > 0) {
    obj.addOns = normalizedInline;
    obj.addons = normalized;
  }

  obj.activities = activities;
  return obj;
};

router.get("/", async (_req: Request, res: Response) => {
  try {
    const products = await Product.find().populate('addons').sort({ orderCount: -1, createdAt: -1 });
    const normalized = products.map(normalizeProductAddons);
    res.json(normalized);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id).populate('addons');
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.json(normalizeProductAddons(product));
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/:id/order', async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { orderCount: 1 } },
      { new: true }
    );
    res.json({ orderCount: product?.orderCount });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/category/:categoryId", async (req: Request, res: Response) => {
  try {
    const products = await Product.find({ categoryId: req.params.categoryId }).populate('addons');
    const normalized = products.map(normalizeProductAddons);
    res.json(normalized);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const payload = {
      ...req.body,
      addons: Array.isArray(req.body.addons) ? req.body.addons : [],
      addOns: Array.isArray(req.body.addOns) ? req.body.addOns : [],
      activities: Array.isArray(req.body.activities) ? req.body.activities : [],
    };
    const product = new Product(payload);
    await product.save();
    await product.populate('addons');
    aiReindexService.scheduleReindex();
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const payload = {
      ...req.body,
      addons: Array.isArray(req.body.addons) ? req.body.addons : [],
      addOns: Array.isArray(req.body.addOns) ? req.body.addOns : [],
      activities: Array.isArray(req.body.activities) ? req.body.activities : [],
    };
    const updated = await Product.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true }).populate('addons');
    if (updated) {
      aiReindexService.scheduleReindex();
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (deleted) {
      aiReindexService.scheduleReindex();
    }
    res.json({ message: "Product deleted" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
