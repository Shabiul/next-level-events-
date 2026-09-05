import { Router } from "express";
import { aiController } from "../controllers/ai.controller.js";
import { rateLimit } from "../middleware/rateLimit.js";

const router = Router();

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15,
  message: "Too many AI chat requests. Please slow down.",
});

router.post("/chat", aiLimiter, (req, res) => aiController.chat(req, res));

export default router;