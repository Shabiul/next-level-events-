import express, { Request, Response } from "express";
import Slider from "../models/Slider";

const router = express.Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const sliders = await Slider.find().sort({ order: 1 });
    res.json(sliders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const maxOrder = await Slider.findOne().sort({ order: -1 }).select("order");
    const newOrder = maxOrder ? maxOrder.order + 1 : 0;

    const slider = new Slider({
      ...req.body,
      order: newOrder,
    });
    await slider.save();
    res.json(slider);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const updated = await Slider.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/reorder/all", async (req: Request, res: Response) => {
  try {
    const { sliders } = req.body;
    const updatePromises = sliders.map((item: { id: string; order: number }) => Slider.findByIdAndUpdate(item.id, { order: item.order }));

    await Promise.all(updatePromises);
    const updated = await Slider.find().sort({ order: 1 });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await Slider.findByIdAndDelete(req.params.id);
    res.json({ message: "Slider deleted" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
