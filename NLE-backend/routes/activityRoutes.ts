import express, { Request, Response } from "express";
import Activity from "../models/Activity";

const router = express.Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const activities = await Activity.find().populate({ path: 'product' });
    const filtered = activities
      .map((activity) => activity.toObject())
      .filter((activity: any) => activity.product);
    res.json(filtered);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const rawIds = Array.isArray(req.body.products) ? req.body.products : [req.body.product];
    const productIds = Array.from(new Set(rawIds.map((id: string) => id?.trim()).filter(Boolean)));

    if (productIds.length === 0) {
      return res.status(400).json({ error: "At least one product must be selected" });
    }

    const activitiesToCreate = productIds.map((productId) => ({ product: productId }));
    const created = await Activity.insertMany(activitiesToCreate);
    const populated = await Activity.find({ _id: { $in: created.map((doc) => doc._id) } }).populate('product');
    res.status(201).json(populated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const update: any = {};
    if (typeof req.body.active === 'boolean') {
      update.active = req.body.active;
    }

    if (typeof req.body.product === 'string' && req.body.product.trim()) {
      update.product = req.body.product.trim();
    }

    const updated = await Activity.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    ).populate('product');

    if (!updated) {
      return res.status(404).json({ error: "Activity not found" });
    }

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await Activity.findByIdAndDelete(req.params.id);
    res.json({ message: "Activity deleted" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
