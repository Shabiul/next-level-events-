import { llm } from "../providers/llm.provider";
import { eventPrompt } from "../prompts/event.prompt";
import { categoryService } from "./category.service";

export interface ExtractedIntent {
  intent: "GREETING" | "FAQ" | "RECOMMENDATION";

  category: string | null;

  budget: number | null;

  audience: string | null;

  venue: string | null;

  city: string | null;

  theme: string | null;

  eventDate: string | null;

  guests: number | null;

  confidence: number;
}

class EventExtractorService {
  async extract(
    history: string,
    question: string
  ): Promise<ExtractedIntent> {
    const categories = categoryService.getCategoryNames();

    const prompt = await eventPrompt.invoke({
      categories: categories.join("\n"),
      history,
      question,
    });

    const response = await llm.invoke(prompt);

    const content =
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

    let extracted: ExtractedIntent = {
      intent: "FAQ",
      category: null,
      budget: null,
      audience: null,
      venue: null,
      city: null,
      theme: null,
      eventDate: null,
      guests: null,
      confidence: 0,
    };

    try {
      extracted = JSON.parse(content);
    } catch (error) {
      console.error(
        "Failed to parse Event Extractor response:",
        content
      );
    }

    console.log("Conversation Analysis");
    console.log(extracted);

    return extracted;
  }
}

export const eventExtractorService = new EventExtractorService();