import { Document } from "@langchain/core/documents";
import { ProductRepository } from "../../db/repositories";

export class RetrieverService {
  initialize(_k: number = 4) {
    console.log("✅ Native Product Retriever Initialized (Supabase Connected)");
  }

  async retrieve(query: string): Promise<Document[]> {
    console.log("========== RETRIEVER ==========");
    console.log("Query:", query);

    const cleanQuery = query.trim();
    if (!cleanQuery) return [];

    const tokens = cleanQuery
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 1 && !["the", "for", "and", "with", "a", "an", "in", "to"].includes(t));

    // Retrieve active products from Supabase repository
    let products: any[] = [];
    try {
      products = await ProductRepository.listAll({ activeOnly: true });
    } catch (err: any) {
      console.warn("⚠️ Failed to load products from repository for retriever:", err?.message || err);
      return [];
    }

    console.log(`[RETRIEVER] Scanning ${products.length} products from repository`);

    const scored = products
      .map((p: any) => {
        let score = 0;
        const lowerName = (p.name || "").toLowerCase();
        const lowerCat = (p.categoryName || "").toLowerCase();
        const lowerSub = (p.subcategory || "").toLowerCase();
        const lowerDesc = (p.description || "").toLowerCase();
        const lowerInclusions = Array.isArray(p.inclusions) ? p.inclusions.join(" ").toLowerCase() : "";

        tokens.forEach((t) => {
          if (lowerName.includes(t)) score += 10;
          if (lowerCat.includes(t)) score += 8;
          if (lowerSub.includes(t)) score += 6;
          if (lowerDesc.includes(t)) score += 3;
          if (lowerInclusions.includes(t)) score += 4;
        });

        if (p.featured) score += 2;
        return { p, score };
      })
      .filter((item) => tokens.length === 0 || item.score > 0);

    scored.sort((a, b) => b.score - a.score);

    const topResults = scored.slice(0, 10);

    return topResults.map(({ p }) => {
      const pid = String(p._id || p.id);
      return new Document({
        pageContent: [
          `Decoration Name: ${p.name}`,
          `Category: ${p.categoryName ?? ""}`,
          `Price: ₹${p.price}`,
          `Description: ${p.description ?? ""}`,
          `Inclusions: ${(p.inclusions ?? []).join(", ")}`,
        ].join("\n\n"),
        metadata: {
          collection: "products",
          id: pid,
          slug: pid,
          name: p.name,
          image: p.image,
          category: p.categoryName,
          categoryId: p.categoryId?.toString() || p.category_id?.toString(),
          price: Number(p.price || 0),
          featured: Boolean(p.featured),
          description: p.description ?? "",
          active: p.active !== false,
        },
      });
    });
  }
}

export const retrieverService = new RetrieverService();