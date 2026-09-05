import { retrieverService } from "../retriever/retriever.service.js";
import { chatService } from "./chat.service.js";
import { intentClassifier } from "../classifier/intent.classifier.js";
import { intentRouter } from "../router/intent.router.js";

export class AIService {
  private initialized = false;

  async initialize() {
    if (this.initialized) {
      return;
    }

    retrieverService.initialize(3);
    this.initialized = true;
    console.log("✅ AI Assistant Service Ready");
  }

  async chat(sessionId: string, message: string) {
    await this.initialize();

    try {
      // Save user message
      await chatService.saveMessage(sessionId, "user", message);

      // Detect intent
      const { intent } = intentClassifier.classify(message);
      console.log("Intent:", intent);

      // Route request
      const response = await intentRouter.route(
        intent,
        message,
        sessionId
      );

      // Save assistant response
      await chatService.saveMessage(
        sessionId,
        "assistant",
        response.answer
      );

      return response;
    } catch (error) {
      console.error("AI Service Error:", error);

      return {
        answer: "Sorry, something went wrong. Please try again later.",
        products: [],
      };
    }
  }
}

export const aiService = new AIService();