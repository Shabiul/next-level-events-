import { AssistantGraphState } from "../state/assistant.state";

import { recommendationService } from "../../services/recommendation.service";

export async function recommendationNode(
  state: AssistantGraphState
): Promise<Partial<AssistantGraphState>> {

  const recommendation = await recommendationService.recommend({
    category: state.category,
    budget: state.budget,
    theme: state.theme,
    audience: state.audience,
    guests: state.guests,
    venue: state.venue,
    city: state.city,
    documents: state.retrievedDocuments,
  });

  return {
    answer: recommendation,
    showProducts: true,
    followUpRequired: false,
  };
}