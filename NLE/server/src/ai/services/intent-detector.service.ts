// src/ai/services/intent-detector.service.ts

import { INTENT_KEYWORDS } from "../constants/intents";
import { IntentType, IntentResult } from "../types/intent.types";




const INTENT_PRIORITY: IntentType[] = [
  IntentType.BOOKING,
  IntentType.RECOMMENDATION,
  IntentType.PRODUCT_SEARCH,
  IntentType.FAQ,
  IntentType.SUPPORT,
  IntentType.CONTACT,
  IntentType.GREETING,
  IntentType.THANK_YOU,
  IntentType.GOODBYE,
];

class IntentDetectorService {
  detect(query: string): IntentResult {
    const text = query.toLowerCase().trim();

    let bestIntent = IntentType.UNKNOWN;
    let bestScore = 0;

    for (const intent of INTENT_PRIORITY) {
      const keywords = INTENT_KEYWORDS[intent] ?? [];

      const score = keywords.reduce((count: number, keyword: string) => {
        return text.includes(keyword.toLowerCase()) ? count + 1 : count;
      }, 0);

      if (score > bestScore) {
        bestScore = score;
        bestIntent = intent;
      }
    }

    if (bestScore === 0) {
      return {
        intent: IntentType.UNKNOWN,
        confidence: 0,
      };
    }

    const totalKeywords = INTENT_KEYWORDS[bestIntent].length;

    return {
      intent: bestIntent,
      confidence: Number((bestScore / totalKeywords).toFixed(2)),
    };
  }
}

export const intentDetectorService = new IntentDetectorService();