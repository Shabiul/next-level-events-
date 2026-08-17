import Category from "../../../models/Category";

export type QueryType = "SEMANTIC_SEARCH" | "CATEGORY_LIST";

export interface QueryAnalysis {
  queryType: QueryType;
  category: string | null;
  categoryId: string | null;
}

class QueryAnalyzerService {
  private categories: Array<{
    id: string;
    name: string;
    normalizedName: string;
  }> = [];

  async refreshCategories(): Promise<void> {
    const categories = await Category.find(
      { active: true },
      { name: 1, _id: 1 }
    ).lean();

    this.categories = categories.map((category: { _id: unknown; name: string }) => ({
      id: String(category._id),
      name: category.name,
      normalizedName: this.normalizeCategoryName(category.name),
    }));

    console.log("[AI] Query Analyzer Refreshed");
  }

  async analyze(query: string): Promise<QueryAnalysis> {
    const normalizedQuery = this.normalizeCategoryName(query);

    console.log("[AI] Query Analyzer Original Query:", query);
    console.log("[AI] Query Analyzer Normalized Query:", normalizedQuery);

    if (!normalizedQuery) {
      return { queryType: "SEMANTIC_SEARCH", category: null, categoryId: null };
    }

    if (this.categories.length === 0) {
      await this.refreshCategories();
    }

    const category = [...this.categories]
      .sort((left, right) => right.normalizedName.length - left.normalizedName.length)
      .find((item) => normalizedQuery.includes(item.normalizedName));

    if (category) {
      console.log("[AI] Query Analyzer Matched Category:", category.name);
      console.log("[AI] Query Analyzer Normalized Category:", category.normalizedName);
    }

    const hasRecommendationIntent = this.isRecommendationQuery(normalizedQuery);
    const hasBrowsingIntent = category
      ? this.isBrowsingQuery(normalizedQuery, category.normalizedName)
      : false;

    const detectedIntent = category
      ? hasRecommendationIntent
        ? "RECOMMENDATION_SEARCH"
        : "BROWSE_CATEGORY"
      : "NO_CATEGORY_MATCH";

    const queryType = category
      ? hasRecommendationIntent
        ? "SEMANTIC_SEARCH"
        : "CATEGORY_LIST"
      : "SEMANTIC_SEARCH";

    console.log("[AI] Query Analyzer Detected Intent:", detectedIntent);
    console.log("[AI] Query Analyzer Final Query Type:", queryType);

    return {
      queryType,
      category: category?.name ?? null,
      categoryId: category?.id ?? null,
    };
  }

  private isBrowsingQuery(normalizedQuery: string, normalizedCategory: string): boolean {
    if (normalizedQuery === normalizedCategory) {
      return true;
    }

    const browsingKeywords = [
      "show",
      "showme",
      "list",
      "display",
      "browse",
      "open",
      "all",
      "every",
      "completelist",
      "entire",
    ].map((keyword) => this.normalizeCategoryName(keyword));

    return browsingKeywords.some((keyword) => normalizedQuery.includes(keyword));
  }

  private isRecommendationQuery(normalizedQuery: string): boolean {
    const recommendationKeywords = [
      "recommend",
      "best",
      "cheap",
      "budget",
      "under",
      "lessthan",
      "greaterthan",
      "similar",
      "like",
      "popular",
      "top",
      "premium",
      "luxury",
      "need",
      "something",
    ].map((keyword) => this.normalizeCategoryName(keyword));

    return recommendationKeywords.some((keyword) => normalizedQuery.includes(keyword));
  }

  private normalizeCategoryName(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[\s\-_]+/g, "")
      .replace(/[^a-z0-9]+/g, "")
      .trim();
  }
}

export const queryAnalyzerService = new QueryAnalyzerService();
