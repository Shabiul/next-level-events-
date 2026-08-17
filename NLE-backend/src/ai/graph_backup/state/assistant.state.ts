import { Annotation, messagesStateReducer } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";
import { Document } from "@langchain/core/documents";

export const AssistantState = Annotation.Root({
  // User Input
  question: Annotation<string>(),

  // Conversation History
  messages: Annotation<BaseMessage[]>({
    reducer: messagesStateReducer,
    default: () => [],
  }),

  // Analysis
  intent: Annotation<"GREETING" | "FAQ" | "RECOMMENDATION">(),

  category: Annotation<string | null>(),

  budget: Annotation<number | null>(),

  audience: Annotation<string | null>(),

  venue: Annotation<string | null>(),

  city: Annotation<string | null>(),

  theme: Annotation<string | null>(),

  eventDate: Annotation<string | null>(),

  guests: Annotation<number | null>(),

  confidence: Annotation<number>(),

  // Follow-up
  missingFields: Annotation<string[]>({
    value: (_, next) => next,
    default: () => [],
  }),

  followUpRequired: Annotation<boolean>({
    value: (_, next) => next,
    default: () => false,
  }),

  // Retrieval
  retrievedDocuments: Annotation<Document[]>({
    value: (_, next) => next,
    default: () => [],
  }),

  products: Annotation<any[]>({
    value: (_, next) => next,
    default: () => [],
  }),

  // Final Response
  answer: Annotation<string | null>(),

  showProducts: Annotation<boolean>({
    value: (_, next) => next,
    default: () => false,
  }),
});

export type AssistantGraphState = typeof AssistantState.State;