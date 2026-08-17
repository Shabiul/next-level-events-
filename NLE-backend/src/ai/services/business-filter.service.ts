import { Document } from "@langchain/core/documents";
import { ExtractedEntities } from "./entity-extractor.service";

class BusinessFilterService {
  filter(
    documents: Document[],
    entities: ExtractedEntities
  ): Document[] {
    console.log("\n========== BUSINESS FILTER ==========");
    console.log("Entities:", entities);

    const filteredDocs = documents.filter((doc) => {
      const meta = doc.metadata ?? {};

      const category = String(meta.category ?? "")
        .trim()
        .toLowerCase();

      const theme = String(meta.theme ?? "")
        .trim()
        .toLowerCase();

      const colour = String(meta.colour ?? "")
        .trim()
        .toLowerCase();

      const price =
        typeof meta.price === "number"
          ? meta.price
          : Number(meta.price);

      console.log({
        name: meta.name,
        category,
        price,
        featured: meta.featured,
      });

      // Active products only
      if (meta.active === false) {
        console.log(`❌ ${meta.name} -> inactive`);
        return false;
      }

      // Category filter
      if (
        entities.category &&
        category !== entities.category.trim().toLowerCase()
      ) {
        console.log(
          `❌ ${meta.name} -> category mismatch (${category})`
        );
        return false;
      }

      // Theme filter
      if (
        entities.theme &&
        theme &&
        theme !== entities.theme.trim().toLowerCase()
      ) {
        console.log(
          `❌ ${meta.name} -> theme mismatch`
        );
        return false;
      }

      // Colour filter
      if (
        entities.colour &&
        colour &&
        colour !== entities.colour.trim().toLowerCase()
      ) {
        console.log(
          `❌ ${meta.name} -> colour mismatch`
        );
        return false;
      }

      // Minimum budget
      if (
        entities.minBudget &&
        !Number.isNaN(price) &&
        price < entities.minBudget
      ) {
        console.log(
          `❌ ${meta.name} -> below minimum budget`
        );
        return false;
      }

      // Maximum budget
      if (
        entities.maxBudget &&
        !Number.isNaN(price) &&
        price > entities.maxBudget
      ) {
        console.log(
          `❌ ${meta.name} -> above maximum budget`
        );
        return false;
      }

      // Exact budget
      if (
        entities.budget &&
        !Number.isNaN(price) &&
        price > entities.budget
      ) {
        console.log(
          `❌ ${meta.name} -> exceeds budget`
        );
        return false;
      }

      // Featured products only
      if (
        entities.featured &&
        meta.featured !== true
      ) {
        console.log(
          `❌ ${meta.name} -> not featured`
        );
        return false;
      }

      console.log(`✅ ${meta.name} -> accepted`);
      return true;
    });

    console.log(
      "Final Products:",
      filteredDocs.map((doc) => doc.metadata.name)
    );
    console.log("========== END FILTER ==========\n");

    return filteredDocs;
  }
}

export const businessFilterService =
  new BusinessFilterService();