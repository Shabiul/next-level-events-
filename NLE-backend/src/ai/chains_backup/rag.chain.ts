import { ChatPromptTemplate } from "@langchain/core/prompts";
import { retrieverService } from "../retriever/retriever.service";
import { llm } from "../providers/llm.provider";
import { queryRewriterService } from "../services/query-rewriter.service";
import { IMessage } from "../../models/chat.model";
import { eventExtractorService } from "../services/event-extractor.service";
const ragPrompt = ChatPromptTemplate.fromTemplate(`
You are The Decor Party AI Assistant.
RecommendationCard.tsx
Your job is to help customers discover decoration packages.

IMPORTANT RULES:

- Keep responses between 3 and 5 short lines.
- Never write long paragraphs.
- Never explain every product.
- Never mention ratings or reviews.
- Never repeat product descriptions because product cards already display them.
- If products are found:
    • Tell the user how many packages were found.
    • Mention only the best recommendation.
    • End with:
      "👇 Explore the recommended packages below."
- If no products are found:
    "I couldn't find an exact match, but here are some similar decoration packages."

Conversation History:
{history}

Context:
{context}

Question:
{question}

Response:
`);
export class RagChain {
  async invoke(input: {
    history: IMessage[];
    question: string;
  }) {
    const { history, question } = input;

    // Convert conversation history into text
    const conversationHistory = history
      .slice(-6) // Keep only the last 6 messages
      .map(
        (message) =>
          `${message.role === "user" ? "User" : "Assistant"}: ${message.content}`
      )
      .join("\n");

    console.log("[RAG] Conversation History:\n", conversationHistory);

    // Rewrite follow-up question into a standalone query
    const rewrittenQuery = await queryRewriterService.rewrite(
      conversationHistory,
      question
    );

    console.log("[RAG] Rewritten Query:\n", rewrittenQuery);

    const extracted = await eventExtractorService.extract(
  conversationHistory,
  rewrittenQuery
);

const detectedCategory = extracted.category;
const detectedBudget = extracted.budget;

    console.log("[RAG] Detected Category:", detectedCategory);
    console.log("[RAG] Detected Budget:", detectedBudget);

    // Retrieve relevant documents
    const retrievedDocs = await retrieverService.retrieve(rewrittenQuery);

    console.log("Retrieved Docs Count:", retrievedDocs.length);
console.log("Retrieved Docs:", retrievedDocs);

    const docs = retrievedDocs.filter((doc) => {
  if (doc.metadata.collection !== "products") {
    return false;
  }

  if (
    detectedCategory &&
    detectedCategory.toLowerCase() !== "none" &&
    doc.metadata.category?.toLowerCase() !==
      detectedCategory.toLowerCase()
  ) {
    return false;
  }

  if (
    detectedBudget !== null &&
    Number(doc.metadata.price) > detectedBudget
  ) {
    return false;
  }

  return true;
});

      retrievedDocs.forEach((doc, i) => {
  console.log(`Doc ${i + 1} Metadata:`, doc.metadata);
});
      console.log("Documents After Category Filter:", docs.length);

    console.log("========== RAG DEBUG ==========");
    console.log("Original Question:", question);
    console.log("Rewritten Query:", rewrittenQuery);
    console.log("Retrieved:", docs.length);

    docs.forEach((doc, i) => {
      console.log(`Doc ${i + 1}:`, doc.metadata);
    });

    console.log("===============================");

    // Convert retrieved documents into one string
    const context = docs
      .map(
        (doc) => `
    Name: ${doc.metadata.name}
    Category: ${doc.metadata.category}
    Price: ₹${doc.metadata.price}
    Description: ${doc.metadata.description ?? ""}
    `
      )
      .join("\n\n");

    console.log("[RAG] Context:\n", context);

    // Build prompt
    const prompt = await ragPrompt.invoke({
      history: conversationHistory,
      context,
      question,
    });

    // Call LLM
    const response = await llm.invoke(prompt);

    console.log("[RAG] Raw Response:", response);

    // Normalize response
    const answer =
      typeof response.content === "string"
        ? response.content
        : response.content
            .map((block: any) =>
              typeof block === "string"
                ? block
                : "text" in block
                ? block.text
                : ""
            )
            .join("");

    const products = docs.map((doc) => ({
  id: doc.metadata.id,
  slug: doc.metadata.slug ?? doc.metadata.id,
  name: doc.metadata.name,
  image: doc.metadata.image,
  price: Number(doc.metadata.price) || 0,
  description: doc.metadata.description ?? "",
}));

    return {
      answer,
      products,
      showProducts: products.length > 0,
      followUpRequired: false,
    };
  }
}

export const ragChain = new RagChain();