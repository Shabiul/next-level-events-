import SiteContent from "../../../models/SiteContent";
import Product from "../../../models/Product";
import Category from "../../../models/Category";
import { Document } from "@langchain/core/documents";

export class MongoLoader {
  async loadKnowledge(): Promise<Document[]> {
    const [products, categories, siteContents] = await Promise.all([
      Product.find({ active: true }).lean().exec(),
      Category.find({ active: true }).lean().exec(),
      SiteContent.find().lean().exec(),
    ]);

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

    const categoryDocuments = categories.map((category: any) =>
      new Document({
        pageContent: [
          `Category Name: ${category.name}`,
          `Slug: ${category.slug}`,
          `Active: ${category.active}`,
          `Subcategories: ${(category.subcategories ?? []).map((sub: any) => sub.name || sub).join(", ")}`,
        ].join("\n\n"),
        metadata: {
          collection: "categories",
          id: category._id.toString(),
          slug: category.slug,
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
          id: content._id?.toString() ?? content.key,
          title: content.title || content.key,
          key: content.key,
        },
      })
    );

    return [...productDocuments, ...categoryDocuments, ...siteContentDocuments];
  }
}

export const mongoLoader = new MongoLoader();