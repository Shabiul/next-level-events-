import { llm } from "../providers/llm.provider.js";
import { categoryService } from "./category.service.js";
import { conversationAnalysisPrompt } from "../prompts/conversation-analysis.prompt.js";
import {
  ConversationAnalysis,
  ConversationAnalysisSchema,
} from "../models/conversation-analysis.schema.js";

class ConversationAnalyzerService {
  private structuredModel =
    llm.withStructuredOutput(
      ConversationAnalysisSchema
    );

  async analyze(
    history: string,
    question: string
  ): Promise<ConversationAnalysis> {
    const categories =
      categoryService.getCategoryNames();

    const prompt =
      await conversationAnalysisPrompt.invoke({
        categories: categories.join("\n"),
        history,
        question,
      });

    const analysis =
      await this.structuredModel.invoke(prompt);

    console.log("Conversation Analysis");
    console.log(analysis);

    return analysis;
  }
}

export const conversationAnalyzerService =
  new ConversationAnalyzerService();