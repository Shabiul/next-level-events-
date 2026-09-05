export type SessionIntent =
  | "CATEGORY_LIST"
  | "SEMANTIC_SEARCH"
  | "GENERAL_INFORMATION"
  | "BOOKING"
  | "FAQ"
  | "SUPPORT"
  | "GREETING"
  | "UNKNOWN";

export interface SessionMemoryState {
  lastCategory: string | null;
  lastCategoryId: string | null;
  lastIntent: SessionIntent;
  lastBudget: number | null;
  minBudget: number | null;
  maxBudget: number | null;
  lastProducts: string[];
  lastRecommendation: string | null;
  expiresAt: number;
}

const DEFAULT_TIMEOUT_MS = 1000 * 60 * 30; // 30 minutes

class SessionMemoryService {
  private cache = new Map<string, SessionMemoryState>();
  private timeoutMs = DEFAULT_TIMEOUT_MS;

  get(sessionId: string): SessionMemoryState | null {
    const state = this.cache.get(sessionId);

    if (!state) {
      return null;
    }

    if (Date.now() > state.expiresAt) {
      this.cache.delete(sessionId);
      return null;
    }

    return state;
  }

  update(sessionId: string, partial: Partial<Omit<SessionMemoryState, "expiresAt">>) {
    const existing = this.get(sessionId) ?? {
      lastCategory: null,
      lastCategoryId: null,
      lastIntent: "UNKNOWN" as SessionIntent,
      lastBudget: null,
      minBudget: null,
      maxBudget: null,
      lastProducts: [],
      lastRecommendation: null,
      expiresAt: Date.now() + this.timeoutMs,
    };

    const merged = {
      ...existing,
      ...partial,
      expiresAt: Date.now() + this.timeoutMs,
    };

    this.cache.set(sessionId, merged);
    return merged;
  }

  clear(sessionId: string) {
    this.cache.delete(sessionId);
  }
}

export const sessionMemoryService = new SessionMemoryService();