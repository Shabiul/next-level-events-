import { Document } from "@langchain/core/documents";
import { llm } from "../providers/llm.provider.js";
import { recommendationPrompt } from "../prompts/recommendation.prompt.js";

interface RecommendationInput {
  category: string | null;
  budget: number | null;
  theme: string | null;
  audience: string | null;
  guests: number | null;
  venue: string | null;
  city: string | null;
  documents: Document[];
}

class RecommendationService {
  private rankDocuments(
    docs: Document[],
    input: RecommendationInput
  ): Document[] {
    return [...docs]
      .map((doc) => {
        let score = 0;
        const meta = doc.metadata ?? {};

        // Category match
        if (
          input.category &&
          String(meta.category).toLowerCase() === input.category.toLowerCase()
        ) {
          score += 40;
        }

        // Theme match
        if (
          input.theme &&
          String(meta.theme).toLowerCase() === input.theme.toLowerCase()
        ) {
          score += 20;
        }

        // Budget match
        const price = Number(meta.price);

        if (
          input.budget &&
          !isNaN(price) &&
          price <= input.budget
        ) {
          score += 30;
        }

        // Featured
        if (meta.featured === true) {
          score += 5;
        }

        // Popularity
        if (meta.popularity) {
          score += Number(meta.popularity);
        }

        return { doc, score };
      })
      .sort((a, b) => b.score - a.score)
      .map((x) => x.doc);
  }

  async recommend(input: RecommendationInput): Promise<string> {
    if (!input.documents.length) {
      return "Sorry, I couldn't find any matching decoration packages.";
    }

    const rankedDocs = this.rankDocuments(
      input.documents,
      input
    );

    const documents = rankedDocs
      .slice(0, 5)
      .map((doc, index) => {
        const meta = doc.metadata ?? {};

        return `
Product ${index + 1}

Name: ${meta.name ?? "N/A"}

Category: ${meta.category ?? "N/A"}

Theme: ${meta.theme ?? "N/A"}

Price: ₹${meta.price ?? "N/A"}

Description:
${String(meta.description ?? "").slice(0, 180)}
`;
      })
      .join("\n");

    try {
      if (process.env.GROQ_API_KEY) {
        const prompt = await recommendationPrompt.invoke({
          category: input.category ?? "Not specified",
          budget: input.budget ?? "Not specified",
          theme: input.theme ?? "Not specified",
          audience: input.audience ?? "Not specified",
          guests: input.guests ?? "Not specified",
          venue: input.venue ?? "Not specified",
          city: input.city ?? "Not specified",
          documents,
        });

        const response = await llm.invoke(prompt);
        if (response?.content) {
          return String(response.content);
        }
      }
    } catch {
      // Fallback below
    }

    const catText = input.category ? ` for ${input.category}` : "";
    const budgetText = input.budget ? ` within ₹${input.budget}` : "";
    return `Here are the top decoration packages${catText}${budgetText} recommended for your celebration:`;
  }
}

export const recommendationService = new RecommendationService();