import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";

export class TextSplitterService {
  private splitter: RecursiveCharacterTextSplitter;

  constructor() {
    this.splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
  }

  async splitDocuments(documents: Document[]): Promise<Document[]> {
    return this.splitter.splitDocuments(documents);
  }
}

export const textSplitterService = new TextSplitterService();