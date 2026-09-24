import express, { Request, Response } from "express";
import { GalleryRepository } from "../src/db/repositories.js";
import { requirePermission } from "../utils/auth.js";
import { broadcastCatalogUpdate } from "../services/catalogSyncService.js";

const router = express.Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const images = await GalleryRepository.listAll();
    res.json(images);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to load gallery images" });
  }
});

router.post("/", requirePermission("gallery"), async (req: Request, res: Response) => {
  try {
    if (!req.body?.imageUrl?.trim()) {
      return res.status(400).json({ error: "imageUrl is required" });
    }
    const image = await GalleryRepository.create(req.body);
    broadcastCatalogUpdate();
    res.json(image);
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ error: err.message || "Failed to create gallery image" });
  }
});

router.put("/reorder", requirePermission("gallery"), async (req: Request, res: Response) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return res.status(400).json({ error: "orderedIds must be a non-empty array" });
    }
    await GalleryRepository.reorder(orderedIds);
    broadcastCatalogUpdate();
    res.json({ message: "Gallery order updated" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to reorder gallery images" });
  }
});

router.put("/:id", requirePermission("gallery"), async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const updated = await GalleryRepository.update(id, req.body);
    broadcastCatalogUpdate();
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update gallery image" });
  }
});

router.delete("/:id", requirePermission("gallery"), async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await GalleryRepository.delete(id);
    broadcastCatalogUpdate();
    res.json({ message: "Gallery image deleted" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to delete gallery image" });
  }
});

export default router;
