import { AssistantGraphState } from "../state/assistant.state";

export async function missingInfoNode(
  state: AssistantGraphState
): Promise<Partial<AssistantGraphState>> {
  const missingFields: string[] = [];

  // Only mandatory field
  if (!state.category) {
    missingFields.push("category");
  }

  return {
    missingFields,
  };
}