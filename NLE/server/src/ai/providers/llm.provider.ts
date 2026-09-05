import { ChatGroq } from "@langchain/groq";
import { AI_CONFIG } from "../config";

const fallbackLlm = {
  async invoke(prompt: unknown) {
    return {
      content: "The AI assistant is currently unavailable. Please contact The Decor Party team directly.",
      prompt,
    };
  },
};

export const llm = AI_CONFIG.llm.apiKey
  ? new ChatGroq({
      apiKey: AI_CONFIG.llm.apiKey,
      model: AI_CONFIG.llm.model,
      temperature: AI_CONFIG.llm.temperature,
    })
  : (fallbackLlm as unknown as ChatGroq);