import { ChatPromptTemplate } from "@langchain/core/prompts";

export const rewritePrompt = ChatPromptTemplate.fromTemplate(`
You are a query rewriting assistant.

Given the conversation history and the user's latest question,
rewrite the latest question into a standalone search query.

Do NOT answer the question.

Only return the rewritten search query.

Conversation History:
{history}

Current Question:
{question}

Rewritten Query:
`);