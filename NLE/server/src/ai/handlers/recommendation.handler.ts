import { entityExtractorService } from "../services/entity-extractor.service";
import { businessFilterService } from "../services/business-filter.service";
import { recommendationService } from "../services/recommendation.service";
import { retrieverService } from "../retriever/retriever.service";
import { chatService } from "../services/chat.service";
import { Document } from "@langchain/core/documents";

export class RecommendationHandler {
  async handle(message: string, sessionId: string, sourceDocuments?: Document[]) {
    console.log("Recommendation Handler Started");

    // Load conversation history (for future use if needed)
    await chatService.getConversation(sessionId);

    // Extract entities from the user query
    const entities = entityExtractorService.extract(message);

    const docs = sourceDocuments ?? await retrieverService.retrieve(message);

    // Keep only product documents
    const productDocs = docs.filter(
      (doc) => doc.metadata?.collection === "products"
    );

    // Apply business rules (budget, category, theme, etc.)
    const filteredDocs = businessFilterService.filter(
    productDocs,
    entities
    );

    // Generate AI recommendation
    const answer = await recommendationService.recommend({
      category: entities.category ?? null,
      budget: entities.budget ?? entities.maxBudget ?? null,
      theme: entities.theme ?? null,
      audience: null,
      guests: null,
      venue: null,
      city: null,
      documents: filteredDocs as any,
    });

    // Return product cards to frontend
    const products = filteredDocs.map((doc: any) => ({
      id: doc.metadata.id,
      slug: doc.metadata.slug ?? doc.metadata.id,
      name: doc.metadata.name,
      image: doc.metadata.image,
      price: Number(doc.metadata.price),
      description: doc.metadata.description ?? "",
    }));

    console.log("Products:", products.length);
    filteredDocs.forEach((product) => {
      console.log(product.metadata?.name);
    });

    return {
      answer,
      products,
    };
  }
}

export const recommendationHandler = new RecommendationHandler();