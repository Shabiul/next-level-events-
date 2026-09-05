import { Request, Response } from "express";
import { aiService } from "../src/ai/services/ai.service";

export class AIController {
  async chat(req: Request, res: Response) {
    console.log("🔥 AI CONTROLLER HIT");
    console.log("Body:", req.body);

    try {
      const { sessionId, message } = req.body;

      // Validate request
      if (!sessionId || !message) {
        return res.status(400).json({
          success: false,
          message: "sessionId and message are required",
        });
      }

      console.log("[AI CONTROLLER] Session:", sessionId);
      console.log("[AI CONTROLLER] Message:", message);

      const response = await aiService.chat(sessionId, message);

      return res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      console.error("[AI CONTROLLER ERROR]", error);

      return res.status(500).json({
        success: false,
        message: "AI Error",
      });
    }
  }
}

export const aiController = new AIController();