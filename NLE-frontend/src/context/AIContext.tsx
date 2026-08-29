import {
  createContext,
  useContext,
  useRef,
  useState,
  ReactNode,
} from "react";
import { chatWithAI } from "../services/ai.service";
import type { AssistantMessage } from "../components/ai/AssistantPanel";
import { trackAssistantQuestion } from "../utils/analytics";

interface AIContextType {
  messages: AssistantMessage[];
  input: string;
  inputRef: React.RefObject<HTMLInputElement>;
  setInput: (value: string) => void;
  sendMessage: (e?: React.FormEvent | string) => Promise<void>;
  retryLast: () => void;
  canRetry: boolean;
  loading: boolean;
}

const AIContext = createContext<AIContextType | null>(null);

export const AIProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 1,
      sender: "bot",
      text: "Hi! I am your AI event concierge. Tell me what occasion, budget, or theme you have in mind and I will style it for you.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastFailedQuestion, setLastFailedQuestion] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sessionId = useRef(
    localStorage.getItem("ai-session") ?? crypto.randomUUID()
  );

  if (!localStorage.getItem("ai-session")) {
    localStorage.setItem("ai-session", sessionId.current);
  }

  const sendMessage = async (eventOrText?: React.FormEvent | string) => {
    let questionText = "";
    if (typeof eventOrText === "string") {
      questionText = eventOrText.trim();
    } else if (eventOrText && "preventDefault" in eventOrText) {
      eventOrText.preventDefault();
      questionText = input.trim();
    } else {
      questionText = input.trim();
    }

    if (!questionText || loading) return;

    const userMessage: AssistantMessage = {
      id: Date.now(),
      sender: "user",
      text: questionText,
    };

    setMessages((prev) => [...prev, userMessage]);
    trackAssistantQuestion(questionText);
    setInput("");
    setLastFailedQuestion(null);
    setLoading(true);

    const loadingId = Date.now() + 1;
    setMessages((prev) => [
      ...prev,
      { id: loadingId, sender: "bot", text: "Thinking...", loading: true },
    ]);

    try {
      const response = await chatWithAI(sessionId.current, questionText);

      const botMessage: AssistantMessage = {
        id: Date.now() + 2,
        sender: "bot",
        text: response.answer,
        products: response.products.map((product) => ({
          id: product.id,
          name: product.name,
          image: product.image ?? '',
          category: product.category ?? 'Recommended',
          price: product.price ?? 0,
          featured: product.featured ?? false,
          description: product.description ?? '',
        })),
      };

      setMessages((prev) => prev.map((m) => (m.id === loadingId ? botMessage : m)));
    } catch (err) {
      const text = err instanceof Error ? err.message : "I couldn't process that request right now. Please try again.";
      setLastFailedQuestion(questionText);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingId ? { id: Date.now(), sender: "bot", text } : m
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const retryLast = () => {
    if (lastFailedQuestion && !loading) void sendMessage(lastFailedQuestion);
  };

  return (
    <AIContext.Provider
      value={{
        messages,
        input,
        inputRef,
        setInput,
        sendMessage,
        retryLast,
        canRetry: !!lastFailedQuestion && !loading,
        loading,
      }}
    >
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);

  if (!context) {
    throw new Error("useAI must be used inside AIProvider");
  }

  return context;
};