import express, { Request, Response } from "express";
import User from "../models/User";
import Product from "../models/Product";
import Category from "../models/Category";
import Slider from "../models/Slider";

const router = express.Router();

router.get("/stats", async (_req: Request, res: Response) => {
  try {
    const [
      totalUsers,
      totalProducts,
      activeProducts,
      totalCategories,
      totalSliders,
      recentUsers,
      topProducts,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      Product.countDocuments(),
      Product.countDocuments({ active: true }),
      Category.countDocuments({ active: true }),
      Slider.countDocuments({ active: true }),
      User.find({ role: "user" }).sort({ createdAt: -1 }).limit(5).select("firstName lastName email createdAt"),
      Product.find({ active: true }).sort({ orderCount: -1 }).limit(5).select("name categoryName price orderCount image"),
    ]);

    res.json({
      totalUsers,
      totalProducts,
      activeProducts,
      totalCategories,
      totalSliders,
      recentUsers,
      topProducts,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/users", async (_req: Request, res: Response) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select("firstName lastName email role createdAt");
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/users/:id/role", async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    if (!role || !["user", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role specified" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select("firstName lastName email role createdAt");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(updatedUser);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/users/:id", async (req: Request, res: Response) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User deleted successfully", id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
