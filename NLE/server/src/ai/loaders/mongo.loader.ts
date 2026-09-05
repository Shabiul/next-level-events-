import { Document } from "@langchain/core/documents";
import { ProductRepository, CategoryRepository } from "../../db/repositories";
import { supabase } from "../../db/supabase";

export class MongoLoader {
  async loadKnowledge(): Promise<Document[]> {
    try {
      const [products, categories, siteContentsRes] = await Promise.all([
        ProductRepository.listAll({ activeOnly: true }),
        CategoryRepository.listAll(),
        supabase.from("site_content").select("*"),
      ]);

      const siteContents = siteContentsRes.data || [];

      const productDocuments = products.map((product: any) =>
        new Document({
          pageContent: [
            `Decoration Name: ${product.name}`,
            `Category: ${product.categoryName ?? ""}`,
            `Subcategory: ${product.subcategory ?? ""}`,
            `Price: ₹${product.price}`,
            `Description: ${product.description ?? ""}`,
            `Inclusions: ${(product.inclusions ?? []).join(", ")}`,
            `Image: ${product.image ?? ""}`,
          ].join("\n\n"),
          metadata: {
            collection: "products",
            id: String(product._id || product.id),
            slug: String(product._id || product.id),
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

      const categoryDocuments = categories.map((category: any) =>
        new Document({
          pageContent: [
            `Category Name: ${category.name}`,
            `Slug: ${category.slug || ""}`,
            `Active: ${category.active}`,
            `Subcategories: ${(category.subcategories ?? []).map((sub: any) => sub.name || sub).join(", ")}`,
          ].join("\n\n"),
          metadata: {
            collection: "categories",
            id: String(category._id || category.id),
            slug: category.slug || "",
            name: category.name,
            active: category.active,
            productCount: category.productCount ?? 0,
          },
        })
      );

      const siteContentDocuments = siteContents.map((content: any) =>
        new Document({
          pageContent: [
            `Title: ${content.title ?? content.key}`,
            `Content: ${content.content ?? ""}`,
          ].join("\n\n"),
          metadata: {
            collection: "siteContent",
            id: content.id ?? content.key,
            title: content.title || content.key,
            key: content.key,
          },
        })
      );

      return [...productDocuments, ...categoryDocuments, ...siteContentDocuments];
    } catch (err) {
      console.warn("⚠️ Failed to load AI knowledge base from Supabase:", err);
      return [];
    }
  }
}

export const mongoLoader = new MongoLoader();