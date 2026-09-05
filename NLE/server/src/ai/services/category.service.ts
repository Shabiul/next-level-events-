import { CategoryRepository } from "../../db/repositories.js";

class CategoryService {
  private categories: string[] = [];

  /**
   * Load categories from Supabase into memory.
   * Call this once when the server starts.
   */
  async initialize() {
    try {
      const docs = await CategoryRepository.listAll();
      this.categories = docs.filter((c: any) => c.active !== false).map((doc: any) => doc.name);

      console.log("========== CATEGORY CACHE ==========");
      console.log(this.categories);
      console.log("====================================");
    } catch (err: any) {
      console.warn("⚠️ Could not load categories into memory:", err?.message || err);
      this.categories = [];
    }
  }

  /**
   * Returns cached categories.
   */
  getCategoryNames(): string[] {
    return this.categories;
  }

  /**
   * Refresh cache if admin changes categories.
   */
  async refresh() {
    await this.initialize();
  }
}

export const categoryService = new CategoryService();