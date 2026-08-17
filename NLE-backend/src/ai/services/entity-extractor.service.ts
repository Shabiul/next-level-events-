export interface ExtractedEntities {
  category?: string;
  occasion?: string;
  theme?: string;
  budget?: number;
  minBudget?: number;
  maxBudget?: number;
  colour?: string;
  productName?: string;
  featured?: boolean;
  premium?: boolean;
}

class EntityExtractorService {
  private readonly categories = [
    "birthday",
    "anniversary",
    "baby shower",
    "welcome baby",
    "engagement",
    "wedding",
    "haldi",
    "mehendi",
    "proposal",
    "room decoration",
    "balloon decoration",
  ];

  private readonly themes = [
    "boss baby",
    "unicorn",
    "frozen",
    "spiderman",
    "avengers",
    "princess",
    "jungle",
    "cocomelon",
    "minnie",
    "mickey",
    "car",
    "dinosaur",
  ];

  private readonly colours = [
    "red",
    "blue",
    "pink",
    "black",
    "white",
    "gold",
    "silver",
    "purple",
    "green",
    "yellow",
    "orange",
    "brown",
  ];

  extract(query: string): ExtractedEntities {
    const text = query.toLowerCase();

    const entities: ExtractedEntities = {};

    // -------------------------
    // Category
    // -------------------------
    entities.category = this.categories.find((category) =>
      text.includes(category)
    );

    // -------------------------
    // Theme
    // -------------------------
    entities.theme = this.themes.find((theme) =>
      text.includes(theme)
    );

    // -------------------------
    // Colour
    // -------------------------
    entities.colour = this.colours.find((colour) =>
      text.includes(colour)
    );

    // -------------------------
    // Budget
    // under 3000
    // below 5000
    // ₹4500
    // between 2000 and 5000
    // -------------------------

    let match = text.match(/under\s*₹?\s*(\d+)/i);

    if (match) {
      entities.maxBudget = Number(match[1]);
      entities.budget = Number(match[1]);
    }

    match = text.match(/below\s*₹?\s*(\d+)/i);

    if (match) {
      entities.maxBudget = Number(match[1]);
      entities.budget = Number(match[1]);
    }

    match = text.match(/above\s*₹?\s*(\d+)/i);

    if (match) {
      entities.minBudget = Number(match[1]);
    }

    match = text.match(/between\s*₹?\s*(\d+)\s*and\s*₹?\s*(\d+)/i);

    if (match) {
      entities.minBudget = Number(match[1]);
      entities.maxBudget = Number(match[2]);
    }

    match = text.match(/₹\s*(\d+)/);

    if (match && !entities.budget) {
      entities.budget = Number(match[1]);
    }

    // -------------------------
    // Premium
    // -------------------------

    if (
      text.includes("premium") ||
      text.includes("luxury")
    ) {
      entities.premium = true;
    }

    // -------------------------
    // Featured
    // -------------------------

    if (
      text.includes("best") ||
      text.includes("popular") ||
      text.includes("featured")
    ) {
      entities.featured = true;
    }

    return entities;
  }
}

export const entityExtractorService =
  new EntityExtractorService();