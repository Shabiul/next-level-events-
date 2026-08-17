import { Document } from "@langchain/core/documents";
import Product from "../../../models/Product";

export class RetrieverService {
  initialize(_k: number = 4) {
    console.log("✅ Native Product Retriever Initialized");
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

    const regexConditions = tokens.map((token) => {
      const regex = new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      return {
        $or: [
          { name: regex },
          { categoryName: regex },
          { subcategory: regex },
          { description: regex },
          { inclusions: regex },
        ],
      };
    });

    const filter = regexConditions.length > 0
      ? { active: { $ne: false }, $or: regexConditions }
      : { active: { $ne: false } };

    const products = await Product.find(filter)
      .sort({ featured: -1, orderCount: -1, rating: -1 })
      .limit(10)
      .lean()
      .exec();

    console.log(`[RETRIEVER] Found ${products.length} products in MongoDB`);

    const scored = products.map((p) => {
      let score = 0;
      const lowerName = (p.name || "").toLowerCase();
      const lowerCat = (p.categoryName || "").toLowerCase();
      const lowerSub = (p.subcategory || "").toLowerCase();
      const lowerDesc = (p.description || "").toLowerCase();

      tokens.forEach((t) => {
        if (lowerName.includes(t)) score += 10;
        if (lowerCat.includes(t)) score += 8;
        if (lowerSub.includes(t)) score += 6;
        if (lowerDesc.includes(t)) score += 3;
      });

      if (p.featured) score += 2;
      return { p, score };
    });

    scored.sort((a, b) => b.score - a.score);

    return scored.map(({ p }) => {
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
          id: p._id.toString(),
          slug: p._id.toString(),
          name: p.name,
          image: p.image,
          category: p.categoryName,
          categoryId: p.categoryId?.toString(),
          price: p.price,
          featured: p.featured,
          description: p.description ?? "",
          active: p.active,
        },
      });
    });
  }
}

export const retrieverService = new RetrieverService();