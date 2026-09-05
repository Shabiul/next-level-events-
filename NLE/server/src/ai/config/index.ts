import "dotenv/config";

function optional(name: string, fallback: string): string {
  const value = process.env[name];
  return value && value.trim() !== "" ? value.trim() : fallback;
}

export const AI_CONFIG = {
  llm: {
    provider: optional("LLM_PROVIDER", "native"),
    model: optional("LLM_MODEL", "native"),
    temperature: Number(optional("AI_TEMPERATURE", "0")),
    apiKey: optional("GROQ_API_KEY", ""),
  },

  embedding: {
    provider: optional("EMBEDDING_PROVIDER", "native"),
    model: optional("EMBEDDING_MODEL", "native"),
    apiKey: optional("HUGGINGFACE_API_KEY", ""),
  },

  retriever: {
    topK: Number(optional("AI_TOP_K", "4")),
  },
} as const;