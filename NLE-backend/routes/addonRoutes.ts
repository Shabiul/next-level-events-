import express, { Request, Response } from "express";
import Addon from "../models/Addon";

const router = express.Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const addons = await Addon.find().sort({ createdAt: -1 });
    res.json(addons);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to load add-ons" });
  }
});

router.get("/with-products", async (_req: Request, res: Response) => {
  try {
    const addons = await Addon.find().sort({ createdAt: -1 }).lean();
    res.json(addons);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to load add-on product links" });
  }
});

router.get("/active", async (_req: Request, res: Response) => {
  try {
    const addons = await Addon.find({ active: true }).sort({ createdAt: -1 });
    res.json(addons);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to load active add-ons" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const addon = new Addon(req.body);
    await addon.save();
    res.status(201).json(addon);
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Failed to create add-on" });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const addon = await Addon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!addon) {
      return res.status(404).json({ error: "Add-on not found" });
    }
    return res.json(addon);
  } catch (err: any) {
    return res.status(400).json({ error: err.message || "Failed to update add-on" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const addon = await Addon.findByIdAndDelete(req.params.id);
    if (!addon) {
      return res.status(404).json({ error: "Add-on not found" });
    }
    return res.json({ message: "Add-on deleted" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to delete add-on" });
  }
});

export default router;
