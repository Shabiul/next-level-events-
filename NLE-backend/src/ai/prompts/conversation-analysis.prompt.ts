import { ChatPromptTemplate } from "@langchain/core/prompts";

export const conversationAnalysisPrompt =
  ChatPromptTemplate.fromTemplate(`
You are the AI assistant for The Decor Party.

Analyze the user's latest message together with the conversation history.

Available Categories:
{categories}

Conversation History:
{history}

Current User Message:
{question}

Determine:

- intent
- category
- budget
- audience
- venue
- city
- theme
- eventDate
- guests
- confidence

Rules:

Intent must be one of:

- GREETING
- FAQ
- RECOMMENDATION

Category MUST come only from Available Categories.

Budget must be numeric.

Guests must be numeric.

Confidence must be between 0 and 1.

Never invent information.

Use null whenever information is unavailable.
`);