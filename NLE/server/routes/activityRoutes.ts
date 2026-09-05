import express, { Request, Response } from "express";
import { supabase } from "../src/db/supabase.js";
import { ProductRepository } from "../src/db/repositories.js";
import { requirePermission } from "../utils/auth.js";

const router = express.Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const { data: activities, error } = await supabase
      .from("activities")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;

    const populated = await Promise.all(
      (activities || []).map(async (act) => {
        const product = act.product_id ? await ProductRepository.findById(act.product_id) : null;
        return {
          _id: act.id,
          id: act.id,
          active: act.active,
          product,
        };
      })
    );

    const filtered = populated.filter((act) => act.product);
    res.json(filtered);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to load activities" });
  }
});

router.post("/", requirePermission("activities"), async (req: Request, res: Response) => {
  try {
    const rawIds = Array.isArray(req.body.products) ? req.body.products : [req.body.product];
    const productIds = Array.from(new Set(rawIds.map((id: string) => id?.trim()).filter(Boolean)));

    if (productIds.length === 0) {
      return res.status(400).json({ error: "At least one product must be selected" });
    }

    const rows = productIds.map((productId) => ({ product_id: productId }));
    const { data: created, error } = await supabase.from("activities").insert(rows).select("*");
    if (error) throw error;

    const populated = await Promise.all(
      (created || []).map(async (act) => ({
        _id: act.id,
        id: act.id,
        active: act.active,
        product: await ProductRepository.findById(act.product_id),
      }))
    );

    res.status(201).json(populated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to create activities" });
  }
});

router.put("/:id", requirePermission("activities"), async (req: Request, res: Response) => {
  try {
    const update: any = { updated_at: new Date().toISOString() };
    if (typeof req.body.active === "boolean") {
      update.active = req.body.active;
    }
    if (typeof req.body.product === "string" && req.body.product.trim()) {
      update.product_id = req.body.product.trim();
    }

    const { data: updated, error } = await supabase
      .from("activities")
      .update(update)
      .eq("id", req.params.id)
      .select("*")
      .maybeSingle();
    if (error) throw error;

    if (!updated) {
      return res.status(404).json({ error: "Activity not found" });
    }

    const product = updated.product_id ? await ProductRepository.findById(updated.product_id) : null;
    res.json({
      _id: updated.id,
      id: updated.id,
      active: updated.active,
      product,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update activity" });
  }
});

router.delete("/:id", requirePermission("activities"), async (req: Request, res: Response) => {
  try {
    const { error } = await supabase.from("activities").delete().eq("id", req.params.id);
    if (error) throw error;
    res.json({ message: "Activity deleted" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to delete activity" });
  }
});

export default router;
