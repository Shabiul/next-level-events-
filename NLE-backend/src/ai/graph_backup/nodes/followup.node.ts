import { AssistantGraphState } from "../state/assistant.state";

const FOLLOW_UP_QUESTIONS: Record<string, string> = {
  category:
    "What type of event are you planning? (Birthday, Wedding, Baby Shower, Haldi, etc.)",

  budget:
    "What is your approximate budget for the decoration?",

  guests:
    "Approximately how many guests are you expecting?",

  venue:
    "Where will the event be held?",

  city:
    "Which city is the event in?",

  theme:
    "Do you have any preferred theme or color combination?",

  audience:
    "Who is the event mainly for?",

  eventDate:
    "When is your event scheduled?",
};

export async function followUpNode(
  state: AssistantGraphState
): Promise<Partial<AssistantGraphState>> {
  const firstMissing = state.missingFields[0];

  return {
    answer:
      FOLLOW_UP_QUESTIONS[firstMissing] ??
      "Could you provide a few more details about your event?",
    followUpRequired: true,
    showProducts: false,
  };
}