import { AssistantGraphState } from "../graph_backup/state/assistant.state";
/**
 * First router after Analyze Query Node
 */
export function intentRouter(state: AssistantGraphState): string {
  switch (state.intent) {
    case "GREETING":
      return "greeting";

    case "RECOMMENDATION":
      return "retrieve-products";

    default:
      return "response";
  }
}

/**
 * Router after Missing Information Node
 */
export function missingInfoRouter(
  state: AssistantGraphState
): string {
  if (state.missingFields.length > 0) {
    return "follow-up";
  }

  return "retrieve-products";
}