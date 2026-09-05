import { Document } from "@langchain/core/documents";
import { ProductRepository } from "../../db/repositories.js";
import { sessionMemoryService } from "../services/session-memory.service.js";

export class CategoryListHandler {
  async handle(_message: string, sessionId: string, category: string, categoryId: string | null) {
    let allProducts: any[] = [];
    try {
      allProducts = await ProductRepository.listAll({ activeOnly: true });
    } catch (err: any) {
      console.warn("⚠️ Failed to load products from repository for category list:", err?.message || err);
      allProducts = [];
    }

    const targetCat = (category || "").toLowerCase().trim();
    const products = allProducts.filter((p: any) => {
      if (categoryId && (String(p.categoryId) === String(categoryId) || String(p.category_id) === String(categoryId))) {
        return true;
      }
      const catName = (p.categoryName || "").toLowerCase();
      return catName.includes(targetCat) || (targetCat.length > 3 && targetCat.includes(catName));
    });

    console.log(`[AI] CATEGORY_LIST Retrieved ${products.length} Products from Repository for "${category}"`);

    const documents = products.map((product) => {
      const pid = String(product._id || product.id);
      return new Document({
        pageContent: [
          `Decoration Name: ${product.name}`,
          `Category: ${product.categoryName ?? ""}`,
          `Price: ₹${product.price}`,
          `Description: ${product.description ?? ""}`,
          `Inclusions: ${(product.inclusions ?? []).join(", ")}`,
        ].join("\n\n"),
        metadata: {
          collection: "products",
          id: pid,
          slug: pid,
          name: product.name,
          image: product.image,
          category: product.categoryName,
          categoryId: product.categoryId?.toString(),
          price: Number(product.price || 0),
          featured: Boolean(product.featured),
          description: product.description ?? "",
          active: product.active !== false,
        },
      });
    });

    sessionMemoryService.update(sessionId, {
      lastCategory: category,
      lastCategoryId: categoryId,
      lastIntent: "CATEGORY_LIST",
      lastProducts: documents.map((doc) => String(doc.metadata.id)),
      lastRecommendation: null,
    });

    return {
      answer: `Here are all decoration packages for ${category}:`,
      products: products.map((product) => ({
        id: String(product._id || product.id),
        slug: String(product._id || product.id),
        name: product.name,
        image: product.image,
        price: Number(product.price),
        description: product.description ?? "",
      })),
      showProducts: true,
    };
  }
}

export const categoryListHandler = new CategoryListHandler();