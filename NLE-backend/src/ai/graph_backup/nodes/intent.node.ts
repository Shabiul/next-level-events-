import { AssistantGraphState } from "../state/assistant.state";
import { intentPrompt } from "../graph_prompts/intent.prompt";
import { llm } from "../../providers/llm.provider";
import { IntentType } from "../types/graph.types";

export async function intentNode(
  state: AssistantGraphState
): Promise<Partial<AssistantGraphState>> {
  const chain = intentPrompt.pipe(llm);

  const response = await chain.invoke({
    question: state.question,
  });

  const intent = response.content.toString().trim().toUpperCase();

  switch (intent) {
    case IntentType.GREETING:
      return {
        intent: IntentType.GREETING,
      };

    case IntentType.RECOMMENDATION:
      return {
        intent: IntentType.RECOMMENDATION,
      };

    default:
      return {
        intent: IntentType.FAQ,
      };
  }
}