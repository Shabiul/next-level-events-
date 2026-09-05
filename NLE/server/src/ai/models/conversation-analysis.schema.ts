import { z } from "zod";

export const ConversationAnalysisSchema = z.object({
  intent: z.enum([
    "GREETING",
    "FAQ",
    "RECOMMENDATION",
  ]),

  category: z.string().nullable(),

  budget: z.number().nullable(),

  audience: z.string().nullable(),

  venue: z.string().nullable(),

  city: z.string().nullable(),

  theme: z.string().nullable(),

  eventDate: z.string().nullable(),

  guests: z.number().nullable(),

  confidence: z.number().min(0).max(1),
});

export type ConversationAnalysis = z.infer<
  typeof ConversationAnalysisSchema
>;