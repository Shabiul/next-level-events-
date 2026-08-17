import express, { Request, Response } from "express";
import authMiddleware from "../middleware/authMiddleware";
import User from "../models/User";
import Product from "../models/Product";

const router = express.Router();

interface AuthRequest extends Request {
  user?: { id?: string };
}

router.get("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) return res.status(401).json({ msg: "Unauthorized" });

    const user = await User.findById(userId).populate("wishlist");
    if (!user) return res.status(404).json({ msg: "User not found" });

    const wishlist = Array.isArray(user.wishlist)
      ? user.wishlist.filter(Boolean)
      : [];

    res.json({ wishlist });
  } catch (err: any) {
    res.status(500).json({ msg: err.message || "Failed to load wishlist" });
  }
});

router.post("/:productId", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.id;
    const { productId } = req.params;
    if (!userId) return res.status(401).json({ msg: "Unauthorized" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ msg: "Product not found" });

    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { wishlist: productId } },
      { new: true }
    ).populate("wishlist");

    if (!user) return res.status(404).json({ msg: "User not found" });

    const wishlist = Array.isArray(user.wishlist)
      ? user.wishlist.filter(Boolean)
      : [];

    res.json({ wishlist });
  } catch (err: any) {
    res.status(500).json({ msg: err.message || "Failed to add to wishlist" });
  }
});

router.delete("/:productId", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.id;
    const { productId } = req.params;
    if (!userId) return res.status(401).json({ msg: "Unauthorized" });

    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { wishlist: productId } },
      { new: true }
    ).populate("wishlist");

    if (!user) return res.status(404).json({ msg: "User not found" });

    const wishlist = Array.isArray(user.wishlist)
      ? user.wishlist.filter(Boolean)
      : [];

    res.json({ wishlist });
  } catch (err: any) {
    res.status(500).json({ msg: err.message || "Failed to remove from wishlist" });
  }
});

export default router;
