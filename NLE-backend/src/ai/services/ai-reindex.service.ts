import { mongoLoader } from "../loaders/mongo.loader";
import { retrieverService } from "../retriever/retriever.service";
import { textSplitterService } from "./text-splitter.service";
import { vectorStoreService } from "../vectorstore/faiss.store";
import { queryAnalyzerService } from "./query-analyzer.service";

const REINDEX_DEBOUNCE_MS = 10_000;

export class AIReindexService {
  private scheduledTimer: ReturnType<typeof setTimeout> | null = null;
  private rebuilding = false;
  private rerunRequested = false;

  /** Schedule one rebuild for a burst of related CRUD operations. */
  scheduleReindex(): void {
    if (this.rebuilding) {
      console.log("[AI] Reindex Scheduled");
      this.rerunRequested = true;
      return;
    }

    if (this.scheduledTimer) {
      clearTimeout(this.scheduledTimer);
    }

    console.log("[AI] Reindex Scheduled");
    this.scheduledTimer = setTimeout(() => {
      this.scheduledTimer = null;
      void this.rebuildKnowledge();
    }, REINDEX_DEBOUNCE_MS);
  }

  async rebuildKnowledge(): Promise<void> {
    if (this.rebuilding) {
      this.rerunRequested = true;
      return;
    }

    if (this.scheduledTimer) {
      clearTimeout(this.scheduledTimer);
      this.scheduledTimer = null;
    }

    this.rebuilding = true;
    let previousStore = null;

    try {
      console.log("[AI] Loading MongoDB");
      const documents = await mongoLoader.loadKnowledge();
      console.log("[AI] Documents Loaded:", documents.length);
      console.log("[AI] Mongo Loader Refreshed");

      console.log("[AI] Splitting documents");
      const chunks = await textSplitterService.splitDocuments(documents);

      console.log("[AI] Rebuilding FAISS");
      const newStore = await vectorStoreService.createTemporaryStore(chunks);

      console.log("[AI] Replacing Vector Store");
      previousStore = vectorStoreService.replaceStore(newStore);
      console.log("[AI] Vector Store Swapped");

      retrieverService.initialize(3);
      console.log("[AI] Retriever Refreshed");

      await queryAnalyzerService.refreshCategories();
      console.log("[AI] Category Cache Refreshed");

      console.log("[AI] Reindex Completed");
      console.log("[AI] AI Ready");
    } catch (error) {
      if (previousStore) {
        vectorStoreService.replaceStore(previousStore);
        retrieverService.initialize(3);
      }

      console.error("[AI] Reindex failed", error);
    } finally {
      this.rebuilding = false;

      if (this.rerunRequested) {
        this.rerunRequested = false;
        this.scheduleReindex();
      }
    }
  }
}

export const aiReindexService = new AIReindexService();