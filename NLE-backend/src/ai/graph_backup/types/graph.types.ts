// Conversation intents
export enum IntentType {
  GREETING = "GREETING",
  FAQ = "FAQ",
  RECOMMENDATION = "RECOMMENDATION",
  UNKNOWN = "UNKNOWN",
}

// Information collected from the user
export interface EventDetails {
  eventType?: string;
  audience?: string;
  budget?: string;
  venue?: string;
  city?: string;
  theme?: string;
  eventDate?: string;
}

// Product returned to the frontend
export interface AIProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  category?: string;
  description?: string;
}

// Standard API response
export interface AIResponse {
  message: string;
  showProducts: boolean;
  products: AIProduct[];
}