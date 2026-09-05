import express, { Request, Response } from "express";
import { SliderRepository } from "../src/db/repositories";
import { requirePermission } from "../utils/auth";

const router = express.Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const sliders = await SliderRepository.listAll();
    res.json(sliders);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to load sliders" });
  }
});

router.post("/", requirePermission("sliders"), async (req: Request, res: Response) => {
  try {
    const slider = await SliderRepository.create(req.body);
    res.json(slider);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to create slider" });
  }
});

router.put("/:id", requirePermission("sliders"), async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const updated = await SliderRepository.update(id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update slider" });
  }
});

router.put("/reorder/all", requirePermission("sliders"), async (req: Request, res: Response) => {
  try {
    const { sliders } = req.body;
    if (Array.isArray(sliders)) {
      await SliderRepository.reorder(sliders);
    }
    const updated = await SliderRepository.listAll();
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to reorder sliders" });
  }
});

router.delete("/:id", requirePermission("sliders"), async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await SliderRepository.delete(id);
    res.json({ message: "Slider deleted" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to delete slider" });
  }
});

export default router;
