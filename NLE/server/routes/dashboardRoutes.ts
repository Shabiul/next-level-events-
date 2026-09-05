import express, { Request, Response } from "express";
import { UserRepository } from "../src/db/repositories.js";
import { requireAdmin, requirePermission } from "../utils/auth.js";
import { supabase } from "../src/db/supabase.js";
import { updateSupabaseAuthMetadata, deleteUserFromSupabaseAuth } from "../src/db/supabaseAuth.js";

const router = express.Router();

router.get("/stats", requirePermission("users"), async (_req: Request, res: Response) => {
  try {

    const [
      { count: totalUsers },
      { count: totalProducts },
      { count: activeProducts },
      { count: totalCategories },
      { count: totalSliders },
      { data: recentUsers },
      { data: topProducts },
    ] = await Promise.all([
      supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "user"),
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("products").select("*", { count: "exact", head: true }).eq("active", true),
      supabase.from("categories").select("*", { count: "exact", head: true }).eq("active", true),
      supabase.from("sliders").select("*", { count: "exact", head: true }).eq("active", true),
      supabase
        .from("users")
        .select("first_name, last_name, email, created_at")
        .eq("role", "user")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("products")
        .select("name, category_name, price, order_count, image")
        .eq("active", true)
        .order("order_count", { ascending: false })
        .limit(5),
    ]);

    const formattedRecent = (recentUsers || []).map((u) => ({
      firstName: u.first_name,
      lastName: u.last_name,
      email: u.email,
      createdAt: u.created_at,
    }));

    const formattedTop = (topProducts || []).map((p) => ({
      name: p.name,
      categoryName: p.category_name,
      price: Number(p.price),
      orderCount: Number(p.order_count || 0),
      image: p.image,
    }));

    return res.json({
      totalUsers: totalUsers || 0,
      totalProducts: totalProducts || 0,
      activeProducts: activeProducts || 0,
      totalCategories: totalCategories || 0,
      totalSliders: totalSliders || 0,
      recentUsers: formattedRecent,
      topProducts: formattedTop,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to load stats" });
  }
});

router.get("/users", requirePermission("users"), async (_req: Request, res: Response) => {
  try {
    const users = await UserRepository.listAll(100);
    const formatted = users.map((u) => ({
      _id: u.id,
      id: u.id,
      firstName: u.first_name,
      lastName: u.last_name,
      email: u.email,
      role: u.role,
      createdAt: u.created_at,
    }));
    return res.json(formatted);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to load users" });
  }
});

// Admin-only: updating role prevents privilege escalation by staff accounts
router.patch("/users/:id/role", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    if (!role || !["user", "admin", "staff"].includes(role)) {
      return res.status(400).json({ error: "Invalid role specified" });
    }

    const id = String(req.params.id);
    const updatedUser = await UserRepository.update(id, { role });
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (updatedUser.email) {
      void updateSupabaseAuthMetadata(updatedUser.email, { role: updatedUser.role });
    }

    return res.json({
      _id: updatedUser.id,
      id: updatedUser.id,
      firstName: updatedUser.first_name,
      lastName: updatedUser.last_name,
      email: updatedUser.email,
      role: updatedUser.role,
      createdAt: updatedUser.created_at,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to update role" });
  }
});

router.delete("/users/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const target = await UserRepository.findById(id);
    await UserRepository.delete(id);
    if (target?.email) {
      void deleteUserFromSupabaseAuth(target.email);
    }
    return res.json({ message: "User deleted successfully", id });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to delete user" });
  }
});

export default router;
