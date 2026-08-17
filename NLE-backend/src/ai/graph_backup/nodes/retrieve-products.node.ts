import { Document } from "@langchain/core/documents";

import { AssistantGraphState } from "../state/assistant.state";

import { retrieverService } from "../../retriever/retriever.service";

export async function retrieveProductsNode(
  state: AssistantGraphState
): Promise<Partial<AssistantGraphState>> {

  const query = [
    state.category,
    state.theme,
    state.budget ? `Budget ${state.budget}` : "",
    state.audience,
    state.venue,
    state.city,
  ]
    .filter(Boolean)
    .join(" ");

  const documents: Document[] =
    await retrieverService.retrieve(query);

  return {
    retrievedDocuments: documents,
  };
}