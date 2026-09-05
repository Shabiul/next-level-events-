import express, { Request, Response } from "express";
import authMiddleware from "../middleware/authMiddleware";
import { WishlistRepository, ProductRepository } from "../src/db/repositories";

const router = express.Router();

interface AuthRequest extends Request {
  user?: { id?: string };
}

router.get("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) return res.status(401).json({ msg: "Unauthorized" });

    const productIds = await WishlistRepository.getByUserId(userId);
    const products = await Promise.all(productIds.map((id) => ProductRepository.findById(id)));
    const wishlist = products.filter(Boolean);

    res.json({ wishlist });
  } catch (err: any) {
    res.status(500).json({ msg: err.message || "Failed to load wishlist" });
  }
});

router.post("/:productId", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.id;
    const productId = String(req.params.productId);
    if (!userId) return res.status(401).json({ msg: "Unauthorized" });

    const product = await ProductRepository.findById(productId);
    if (!product) return res.status(404).json({ msg: "Product not found" });

    await WishlistRepository.add(userId, productId);

    const productIds = await WishlistRepository.getByUserId(userId);
    const products = await Promise.all(productIds.map((id) => ProductRepository.findById(id)));
    const wishlist = products.filter(Boolean);

    res.json({ wishlist });
  } catch (err: any) {
    res.status(500).json({ msg: err.message || "Failed to add to wishlist" });
  }
});

router.delete("/:productId", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.id;
    const productId = String(req.params.productId);
    if (!userId) return res.status(401).json({ msg: "Unauthorized" });

    await WishlistRepository.remove(userId, productId);

    const productIds = await WishlistRepository.getByUserId(userId);
    const products = await Promise.all(productIds.map((id) => ProductRepository.findById(id)));
    const wishlist = products.filter(Boolean);

    res.json({ wishlist });
  } catch (err: any) {
    res.status(500).json({ msg: err.message || "Failed to remove from wishlist" });
  }
});

export default router;
