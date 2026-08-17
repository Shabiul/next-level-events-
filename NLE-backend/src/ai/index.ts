import { aiService } from "./services/ai.service";
import { categoryService } from "./services/category.service";

export async function initializeAI() {
  try {
    console.log("🚀 Initializing AI...");

    await aiService.initialize();

    // Load all active categories into memory
    await categoryService.initialize();

    console.log("🎉 AI Initialized Successfully");

    return true;
  } catch (error: any) {
    console.warn("⚠️ AI Initialization deferred/skipped:", error?.message || error);
    return false;
  }
}