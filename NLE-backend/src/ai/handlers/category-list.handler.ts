import { Document } from "@langchain/core/documents";
import Product from "../../../models/Product";
import { sessionMemoryService } from "../services/session-memory.service";
import { normalizeText } from "../services/text-utils.service";

export class CategoryListHandler {
  async handle(message: string, sessionId: string, category: string, categoryId: string | null) {
    const filter = categoryId
      ? { categoryId }
      : this.buildCategoryFilter(category);

    const products = await Product.find({
      ...filter,
      active: true,
    })
      .lean()
      .exec();

    console.log("[AI] CATEGORY_LIST Retrieved Mongo Products:", products.length);

    const documents = products.map(
      (product) =>
        new Document({
          pageContent: [
            `Decoration Name: ${product.name}`,
            `Category: ${product.categoryName ?? ""}`,
            `Price: ₹${product.price}`,
            `Description: ${product.description ?? ""}`,
            `Inclusions: ${(product.inclusions ?? []).join(", ")}`,
          ].join("\n\n"),
          metadata: {
            collection: "products",
            id: product._id.toString(),
            slug: product._id.toString(),
            name: product.name,
            image: product.image,
            category: product.categoryName,
            categoryId: product.categoryId?.toString(),
            price: product.price,
            featured: product.featured,
            description: product.description ?? "",
            active: product.active,
          },
        })
    );

    sessionMemoryService.update(sessionId, {
      lastCategory: category,
      lastCategoryId: categoryId,
      lastIntent: "CATEGORY_LIST",
      lastProducts: documents.map((doc) => String(doc.metadata.id)),
      lastRecommendation: null,
    });

    return {
      answer: `Here are all products for ${category}.`, 
      products: products.map((product) => ({
        id: product._id.toString(),
        slug: product._id.toString(),
        name: product.name,
        image: product.image,
        price: Number(product.price),
        description: product.description ?? "",
      })),
      showProducts: true,
    };
  }

  private buildCategoryFilter(category: string) {
    return {
      categoryName: {
        $regex: new RegExp(category.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
      },
    };
  }
}

export const categoryListHandler = new CategoryListHandler();