export enum IntentType {
  GREETING = "GREETING",
  PRODUCT_SEARCH = "PRODUCT_SEARCH",
  RECOMMENDATION = "RECOMMENDATION",
  GENERAL_INFORMATION = "GENERAL_INFORMATION",
  BOOKING = "BOOKING",
  FAQ = "FAQ",
  SUPPORT = "SUPPORT",
  CONTACT = "CONTACT",
  THANK_YOU = "THANK_YOU",
  GOODBYE = "GOODBYE",
  UNKNOWN = "UNKNOWN",
}

export interface IntentResult {
  intent: IntentType;
  confidence: number;
}