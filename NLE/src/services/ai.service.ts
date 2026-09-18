import { getApiUrl } from "../lib/api";
import { DEFAULT_PRODUCTS } from "../data/fallbackCatalog";

export interface AIProduct {
  id: string;
  slug?: string;
  name: string;
  image?: string;
  category?: string;
  price?: number;
  featured?: boolean;
  description?: string;
}

export interface AIResponse {
  answer: string;
  products: AIProduct[];
  showProducts?: boolean;
  followUpRequired?: boolean;
}

export class AITimeoutError extends Error {
  constructor() {
    super("The planner took too long to respond. Please try again.");
    this.name = "AITimeoutError";
  }
}

function matchLocalProducts(query: string): AIProduct[] {
  const clean = query.trim().toLowerCase();
  const tokens = clean.split(/\s+/).filter((t) => t.length > 2 && !["the", "for", "and", "with", "want", "need"].includes(t));

  const scored = DEFAULT_PRODUCTS.map((p) => {
    let score = 0;
    const name = (p.name || '').toLowerCase();
    const cat = (p.categoryName || '').toLowerCase();
    const sub = (p.subcategory || '').toLowerCase();
    const desc = (p.description || '').toLowerCase();

    tokens.forEach((t) => {
      if (name.includes(t)) score += 10;
      if (cat.includes(t)) score += 8;
      if (sub.includes(t)) score += 6;
      if (desc.includes(t)) score += 2;
    });
    if (p.featured) score += 1;
    return { p, score };
  }).filter((x) => tokens.length === 0 || x.score > 0);

  scored.sort((a, b) => b.score - a.score);
  const topProducts = (scored.length > 0 ? scored.map((s) => s.p) : DEFAULT_PRODUCTS).slice(0, 4);

  return topProducts.map((p) => ({
    id: String(p._id || (p as any).id),
    name: p.name,
    image: p.image,
    category: p.categoryName,
    price: p.price,
    featured: p.featured,
    description: p.description,
  }));
}

export async function chatWithAI(
  sessionId: string,
  message: string,
  { timeoutMs = 8000 }: { timeoutMs?: number } = {}
): Promise<AIResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(getApiUrl("/api/ai/chat"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, message }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (response.ok) {
      const result = await response.json().catch(() => null);
      const data = result?.data;
      if (data && typeof data.answer === "string") {
        return { ...data, products: Array.isArray(data.products) ? data.products : [] };
      }
    }
  } catch {
    clearTimeout(timer);
  }

  // Standalone offline AI assistant matching
  const matched = matchLocalProducts(message);
  const greetings = ['hi', 'hello', 'hey', 'start', 'help'];
  const isGreeting = greetings.some((g) => message.trim().toLowerCase().startsWith(g));

  let answer: string;
  if (isGreeting) {
    answer = "Hello! I am your celebration planner. Whether you're planning a birthday, romantic anniversary, or grand proposal, I'm here to help you pick the perfect setup!";
  } else if (matched.length > 0) {
    answer = `Here are some beautiful setups tailored for your celebration! You can view details, customize themes, and book instantly.`;
  } else {
    answer = "I'd love to help plan your celebration! Tell me about the occasion (birthday, anniversary, baby shower) or budget you have in mind.";
  }

  return {
    answer,
    products: matched,
    showProducts: matched.length > 0,
    followUpRequired: false,
  };
}