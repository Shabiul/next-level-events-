import { IntentResult, IntentType } from "../types/intent.types";

export class IntentClassifier {
  classify(message: string): IntentResult {
    const text = message
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();

    if (!text) {
      return {
        intent: IntentType.UNKNOWN,
        confidence: 0,
      };
    }

    const matchesWholeWord = (keyword: string) => {
      const normalizedKeyword = keyword
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim()
        .replace(/\s+/g, "\\s+");

      return new RegExp(`(?:^|\\s)${normalizedKeyword}(?=\\s|$)`).test(text);
    };

    const intentKeywords: Array<[IntentType, string[]]> = [
      [IntentType.GREETING, [
        "hi",
        "hello",
        "hey",
        "good morning",
        "good afternoon",
        "good evening",
      ]],
      [IntentType.GENERAL_INFORMATION, [
        "who are you",
        "what is your name",
        "who created you",
        "tell me about",
        "what do you do",
        "what services",
        "what is this website",
        "tell me about the company",
        "about us",
        "company information",
        "how can you help",
      ]],
      [IntentType.BOOKING, [
        "book",
        "booking",
        "reserve",
        "reservation",
        "schedule",
        "confirm booking",
        "book now",
      ]],
      [IntentType.FAQ, [
        "refund",
        "cancel",
        "policy",
        "payment",
        "pricing",
        "delivery",
        "contact",
        "hours",
        "address",
        "location",
      ]],
      [IntentType.SUPPORT, [
        "help",
        "problem",
        "issue",
        "error",
        "not working",
        "support",
        "agent",
      ]],
    ];

    for (const [intent, keywords] of intentKeywords) {
      if (keywords.some(matchesWholeWord)) {
        return {
          intent,
          confidence: 1,
        };
      }
    }

    // Unit-style examples:
    // "hi" -> GREETING
    // "hello" -> GREETING
    // "book birthday package" -> BOOKING
    // "refund policy" -> FAQ
    // "I need help" -> SUPPORT
    // "give me magician" -> PRODUCT_SEARCH
    // "magician" -> PRODUCT_SEARCH
    // "birthday decoration" -> PRODUCT_SEARCH
    // "kids activities" -> PRODUCT_SEARCH
    // "show products under 5000" -> PRODUCT_SEARCH
    // "wall decor" -> PRODUCT_SEARCH
    // "" -> UNKNOWN
    return {
      intent: IntentType.PRODUCT_SEARCH,
      confidence: 1,
    };
  }
}

export const intentClassifier = new IntentClassifier();