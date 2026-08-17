import express, { Request, Response } from "express";
import mongoose from "mongoose";
import Category from "../models/Category";
import Product from "../models/Product";
import { aiReindexService } from "../src/ai/services/ai-reindex.service";

const router = express.Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const categories = await Category.find().sort({ order: 1, _id: 1 }).lean();
    const counts = await Product.aggregate([
      { $group: { _id: "$categoryId", count: { $sum: 1 } } }
    ]);
    const countMap = new Map(counts.map((item: any) => [String(item._id), item.count]));
    const categoriesWithCounts = categories.map((category: any) => ({
      ...category,
      productCount: countMap.get(String(category._id)) || 0,
    }));
    res.json(categoriesWithCounts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const existing = await Category.findOne({ name });

    if (existing) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const count = await Category.countDocuments();
    const category = new Category({ ...req.body, order: count });
    await category.save();
    aiReindexService.scheduleReindex();

    res.json(category);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

const handleReorder = async (req: Request, res: Response) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return res.status(400).json({ error: "orderedIds must be a non-empty array" });
    }

    const validIds = orderedIds.filter(
      (id) => typeof id === "string" && id.trim().length > 0 && id !== "undefined" && id !== "null"
    );

    await Promise.all(
      validIds.map((id: string, index: number) =>
        Category.findByIdAndUpdate(id, { order: index }, { new: true }).catch((err) => {
          console.error(`Failed to update order for category ID ${id}:`, err);
          return null;
        })
      )
    );

    try {
      aiReindexService.scheduleReindex();
    } catch (aiErr) {
      console.warn("AI reindex failed during category reorder:", aiErr);
    }

    return res.json({ message: "Category order updated successfully" });
  } catch (err: any) {
    console.error("Error in /api/categories/reorder:", err);
    return res.status(500).json({ error: err.message });
  }
};

router.put("/reorder", handleReorder);

router.put("/:id", async (req: Request, res: Response) => {
  const id = String(req.params.id);
  if (id === "reorder") {
    return handleReorder(req, res);
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid category ID format" });
  }

  try {
    const updated = await Category.findByIdAndUpdate(id, req.body, { new: true });
    if (updated) {
      aiReindexService.scheduleReindex();
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  const id = String(req.params.id);
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid category ID format" });
  }

  try {
    const deleted = await Category.findByIdAndDelete(id);
    if (deleted) {
      aiReindexService.scheduleReindex();
    }
    res.json({ message: "Category deleted" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
