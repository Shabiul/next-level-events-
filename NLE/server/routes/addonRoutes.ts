import express, { Request, Response } from "express";
import { AddonRepository } from "../src/db/repositories.js";
import { requirePermission } from "../utils/auth.js";

const router = express.Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const addons = await AddonRepository.listAll();
    res.json(addons);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to load add-ons" });
  }
});

router.get("/with-products", async (_req: Request, res: Response) => {
  try {
    const addons = await AddonRepository.listAll();
    res.json(addons);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to load add-on product links" });
  }
});

router.get("/active", async (_req: Request, res: Response) => {
  try {
    const addons = await AddonRepository.listActive();
    res.json(addons);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to load active add-ons" });
  }
});

router.post("/", requirePermission("addons"), async (req: Request, res: Response) => {
  try {
    const addon = await AddonRepository.create({
      name: req.body.name,
      price: Number(req.body.price || 0),
      image: req.body.image || "",
      description: req.body.description || "",
      category: req.body.category || "",
      active: req.body.active !== false,
    });
    res.status(201).json(addon);
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Failed to create add-on" });
  }
});

router.put("/:id", requirePermission("addons"), async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const addon = await AddonRepository.update(id, req.body);
    if (!addon) {
      return res.status(404).json({ error: "Add-on not found" });
    }
    return res.json(addon);
  } catch (err: any) {
    return res.status(400).json({ error: err.message || "Failed to update add-on" });
  }
});

router.delete("/:id", requirePermission("addons"), async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const deleted = await AddonRepository.delete(id);
    if (!deleted) {
      return res.status(404).json({ error: "Add-on not found" });
    }
    return res.json({ message: "Add-on deleted" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to delete add-on" });
  }
});

export default router;
