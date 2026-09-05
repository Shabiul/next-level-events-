import { Document } from "@langchain/core/documents";
import { embeddingProvider } from "../providers/embedding.provider";

export class EmbeddingService {
  async embedDocuments(documents: Document[]) {
    return embeddingProvider.embedDocuments(
      documents.map((doc) => doc.pageContent)
    );
  }

  async embedQuery(query: string) {
    return embeddingProvider.embedQuery(query);
  }
}

export const embeddingService = new EmbeddingService();