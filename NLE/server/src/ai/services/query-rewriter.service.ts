import { llm } from "../providers/llm.provider";
import { rewritePrompt } from "../prompts/rewrite.prompt";

class QueryRewriterService {
  async rewrite(history: string, question: string): Promise<string> {
    const prompt = await rewritePrompt.invoke({
      history,
      question,
    });

    const response = await llm.invoke(prompt);

    const rewritten =
      typeof response.content === "string"
        ? response.content
        : response.content
            .map((block: any) =>
              typeof block === "string"
                ? block
                : "text" in block
                ? block.text
                : ""
            )
            .join("");

    console.log("========== QUERY REWRITER ==========");
    console.log("Original:", question);
    console.log("Rewritten:", rewritten);
    console.log("===================================");

    return rewritten.trim();
  }
}

export const queryRewriterService = new QueryRewriterService();