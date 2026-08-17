import { AssistantGraphState } from "../state/assistant.state";
import { categoryService } from "../../services/category.service";

const GREETING_PATTERNS = [
  /^hi$/,
  /^hello$/,
  /^hey$/,
  /^good morning$/,
  /^good afternoon$/,
  /^good evening$/,
  /^how are you$/,
  /^how are you doing$/,
  /^what's up$/,
  /^whats up$/,
  /^thanks$/,
  /^thank you$/,
  /^bye$/,
  /^goodbye$/,
  /^who are you$/,
  /^what are you$/,
  /^what can you do$/,
  /^help$/,
  /^tell me about yourself$/,
];

function normalize(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[.,!?]/g, "")
    .replace(/\s+/g, " ");
}

function isGreetingQuestion(question: string) {
  const normalized = normalize(question);

  return GREETING_PATTERNS.some((pattern) => pattern.test(normalized));
}

function isIdentityQuestion(question: string) {
  const normalized = normalize(question);

  return [
    /who are you\??$/,
    /what are you\??$/,
    /tell me about yourself\??$/,
    /what can you do\??$/,
  ].some((pattern) => pattern.test(normalized));
}

function extractCategory(normalizedQuestion: string) {
  const categories = categoryService.getCategoryNames();

  return (
    categories.find((category) =>
      normalizedQuestion.includes(category.toLowerCase())
    ) ?? null
  );
}

function extractBudget(normalizedQuestion: string) {
  const budgetMatch = normalizedQuestion.match(/(?:under|below|less than|around|approximately|approx|about|₹)?\s*₹?\s*([0-9]{3,7})(?:\s*k)?/i);

  if (!budgetMatch) {
    return null;
  }

  const value = Number(budgetMatch[1].replace(/,/g, ""));

  return Number.isFinite(value) ? value : null;
}

function extractGuests(normalizedQuestion: string) {
  const match = normalizedQuestion.match(/([0-9]{1,4})\s*(guests|people|attendees)/);

  if (!match) {
    return null;
  }

  return Number(match[1]);
}

function extractTheme(normalizedQuestion: string) {
  const themeMatch = normalizedQuestion.match(/(?:theme|themed|style)\s*(?:is\s*)?:?\s*([a-zA-Z ]{3,40})/);

  return themeMatch ? themeMatch[1].trim() : null;
}

function extractVenue(normalizedQuestion: string) {
  const venueMatch = normalizedQuestion.match(/(?:at|venue|location)\s+([a-zA-Z ]{3,40})/);

  return venueMatch ? venueMatch[1].trim() : null;
}

function extractCity(normalizedQuestion: string) {
  const cityMatch = normalizedQuestion.match(/in\s+([a-zA-Z ]{3,40})$/);

  return cityMatch ? cityMatch[1].trim() : null;
}

function extractAudience(normalizedQuestion: string) {
  const audiences = [
    "bride",
    "groom",
    "kids",
    "parents",
    "friends",
    "corporate",
    "family",
    "couple",
    "couples",
  ];

  return audiences.find((audience) => normalizedQuestion.includes(audience)) ?? null;
}

export async function analyzeQueryNode(
  state: AssistantGraphState
): Promise<Partial<AssistantGraphState>> {
  if (isGreetingQuestion(state.question)) {
    return {
      intent: "GREETING",
    };
  }

  const normalizedQuestion = normalize(state.question);

  return {
    intent: "RECOMMENDATION",
    category: extractCategory(normalizedQuestion),
    budget: extractBudget(normalizedQuestion),
    audience: extractAudience(normalizedQuestion),
    venue: extractVenue(normalizedQuestion),
    city: extractCity(normalizedQuestion),
    theme: extractTheme(normalizedQuestion),
    guests: extractGuests(normalizedQuestion),
    confidence: 1,
  };
}