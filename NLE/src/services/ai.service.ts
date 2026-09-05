import { getApiUrl } from "../lib/api";

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

export async function chatWithAI(
  sessionId: string,
  message: string,
  { timeoutMs = 30000 }: { timeoutMs?: number } = {}
): Promise<AIResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(getApiUrl("/api/ai/chat"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, message }),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    if ((err as Error)?.name === "AbortError") throw new AITimeoutError();
    throw new Error("Couldn't reach the planner. Check your connection and try again.");
  }
  clearTimeout(timer);

  if (!response.ok) {
    throw new Error(
      response.status === 429
        ? "You're sending messages a little fast — give it a moment and try again."
        : "The planner had trouble with that. Please try again."
    );
  }

  const result = await response.json().catch(() => null);
  const data = result?.data;
  if (!data || typeof data.answer !== "string") {
    throw new Error("Got an unexpected response from the planner. Please try again.");
  }
  return { ...data, products: Array.isArray(data.products) ? data.products : [] };
}