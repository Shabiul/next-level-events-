import { Router } from "express";
import { aiController } from "../controllers/ai.controller";

const router = Router();

router.post("/chat", (req, res) => aiController.chat(req, res));

export default router;