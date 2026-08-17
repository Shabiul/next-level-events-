import { Embeddings } from "@langchain/core/embeddings";
import { InferenceClient } from "@huggingface/inference";
import { AI_CONFIG } from "../config";

const client = new InferenceClient(AI_CONFIG.embedding.apiKey);

export class HuggingFaceEmbeddings extends Embeddings {
  constructor() {
    super({});
  }

  async embedQuery(text: string): Promise<number[]> {
    return (await client.featureExtraction({
      model: AI_CONFIG.embedding.model,
      inputs: text,
    })) as number[];
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((text) => this.embedQuery(text)));
  }
}

export const embeddingProvider = new HuggingFaceEmbeddings();