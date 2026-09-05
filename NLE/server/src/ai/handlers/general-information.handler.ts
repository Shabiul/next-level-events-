import { SiteContentRepository } from "../../db/repositories.js";
import { llm } from "../providers/llm.provider.js";

export class GeneralInformationHandler {
  async handle(message: string) {
    let contents: any[] = [];
    try {
      contents = await SiteContentRepository.listAll();
    } catch (err: any) {
      console.warn("⚠️ Failed to retrieve site contents for GeneralInformationHandler:", err?.message || err);
      contents = [];
    }

    const relevantContents = contents.filter((content) =>
      this.isRelevantContent(message, content)
    );

    console.log("[AI] Retrieved SiteContent documents:", relevantContents.length);

    if (relevantContents.length === 0) {
      return {
        answer:
          "I couldn't find a direct answer in the company information, but I can still help you with booking and decoration options.",
        products: [],
        showProducts: false,
      };
    }

    try {
      if (process.env.GROQ_API_KEY) {
        const prompt = this.buildPrompt(message, relevantContents);
        const response = await llm.invoke(prompt);
        const answer = this.extractAnswer(response);
        if (answer) {
          return { answer, products: [], showProducts: false };
        }
      }
    } catch {
      // Fallback to direct content
    }

    const firstMatch = relevantContents[0];
    const answer = String(firstMatch.content || firstMatch.title || "TheDecorParty offers premium surprise and decoration services in Bangalore.");

    return {
      answer,
      products: [],
      showProducts: false,
    };
  }

  private isRelevantContent(message: string, content: any) {
    const normalizedMessage = message.toLowerCase();
    const normalizedTitle = String(content.title ?? content.key ?? "").toLowerCase();
    const normalizedContent = String(content.content ?? "").toLowerCase();

    return (
      normalizedTitle.includes("about") ||
      normalizedTitle.includes("company") ||
      normalizedTitle.includes("service") ||
      normalizedTitle.includes("mission") ||
      normalizedTitle.includes("contact") ||
      normalizedMessage.includes("who are you") ||
      normalizedMessage.includes("what is your name") ||
      normalizedMessage.includes("who created you") ||
      normalizedMessage.includes("tell me about") ||
      normalizedMessage.includes("what do you do") ||
      normalizedMessage.includes("what services") ||
      normalizedMessage.includes("what is this website") ||
      normalizedMessage.includes("company information") ||
      normalizedMessage.includes("how can you help") ||
      normalizedMessage.includes("about us") ||
      normalizedContent.includes("about") ||
      normalizedContent.includes("company") ||
      normalizedContent.includes("services") ||
      normalizedContent.includes("mission")
    );
  }

  private buildPrompt(message: string, contents: any[]) {
    const contentText = contents
      .map(
        (content) =>
          `Title: ${content.title || content.key}\nContent:\n${content.content}`
      )
      .join("\n\n---\n\n");

    return `Use the following company information to answer the user question. Do not invent company-specific details beyond what is provided. If the question is asking about the business or the website, answer from the content below.

User question: ${message}

Company information:
${contentText}

Answer:`;
  }

  private extractAnswer(response: any) {
    if (typeof response === "string") {
      return response;
    }
    if (response?.content) {
      return String(response.content);
    }
    if (response?.text) {
      return String(response.text);
    }
    return "I'm sorry, I couldn't answer that right now.";
  }
}

export const generalInformationHandler = new GeneralInformationHandler();