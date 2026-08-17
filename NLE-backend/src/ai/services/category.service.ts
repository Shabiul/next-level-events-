import Category from "../../../models/Category";

class CategoryService {
  private categories: string[] = [];

  /**
   * Load categories from MongoDB into memory.
   * Call this once when the server starts.
   */
  async initialize() {
    const docs = await Category.find(
      { active: true },
      { name: 1, _id: 0 }
    ).lean();

    this.categories = docs.map((doc: { name: string }) => doc.name);

    console.log("========== CATEGORY CACHE ==========");
    console.log(this.categories);
    console.log("====================================");
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