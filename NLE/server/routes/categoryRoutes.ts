import express, { Request, Response } from "express";
import { CategoryRepository, ProductRepository } from "../src/db/repositories.js";
import { aiReindexService } from "../src/ai/services/ai-reindex.service.js";
import { requirePermission } from "../utils/auth.js";

const router = express.Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const categoriesWithCounts = await CategoryRepository.listAll();
    res.json(categoriesWithCounts);
  } catch (err: any) {
    console.error("[categories] list failed", err);
    res.status(500).json({ error: "Failed to load categories" });
  }
});

router.post("/", requirePermission("categories"), async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const existing = await CategoryRepository.findByName(name);
    if (existing) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = await CategoryRepository.create({
      name: name.trim(),
      slug: req.body.slug || name.trim().toLowerCase().replace(/\s+/g, "-"),
      image: req.body.image || "",
      active: req.body.active !== false,
      subcategories: req.body.subcategories || [],
    });

    try {
      aiReindexService.scheduleReindex();
    } catch {}

    res.json(category);
  } catch (err: any) {
    console.error("[categories] create failed", err);
    res.status(500).json({ error: "Failed to create category" });
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

    await CategoryRepository.reorder(validIds);

    try {
      aiReindexService.scheduleReindex();
    } catch (aiErr) {
      console.warn("AI reindex failed during category reorder:", aiErr);
    }

    return res.json({ message: "Category order updated successfully" });
  } catch (err: any) {
    console.error("Error in /api/categories/reorder:", err);
    return res.status(500).json({ error: "Failed to reorder categories" });
  }
};

router.put("/reorder", requirePermission("categories"), handleReorder);

router.put("/:id", requirePermission("categories"), async (req: Request, res: Response) => {
  const id = String(req.params.id);
  if (id === "reorder") {
    return handleReorder(req, res);
  }

  try {
    const updated = await CategoryRepository.update(id, {
      name: req.body.name,
      slug: req.body.slug,
      image: req.body.image,
      active: req.body.active,
      subcategories: req.body.subcategories,
    });

    if (updated) {
      try {
        aiReindexService.scheduleReindex();
      } catch {}
    }
    res.json(updated);
  } catch (err: any) {
    console.error("[categories] update failed", err);
    res.status(500).json({ error: "Failed to update category" });
  }
});

router.delete("/:id", requirePermission("categories"), async (req: Request, res: Response) => {
  const id = String(req.params.id);

  try {
    // Prevent orphaned products
    const assignedProducts = await ProductRepository.listAll({ categoryId: id });
    if (assignedProducts.length > 0) {
      return res.status(409).json({
        error: `Cannot delete category. ${assignedProducts.length} product(s) are still assigned to it. Reassign or delete these products first.`,
      });
    }

    const deleted = await CategoryRepository.delete(id);
    if (deleted) {
      try {
        aiReindexService.scheduleReindex();
      } catch {}
    }
    res.json({ message: "Category deleted" });
  } catch (err: any) {
    console.error("[categories] delete failed", err);
    res.status(500).json({ error: "Failed to delete category" });
  }
});

export default router;
