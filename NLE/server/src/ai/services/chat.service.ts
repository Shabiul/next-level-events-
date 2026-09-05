import { ChatRepository } from "../../db/repositories.js";

export interface IMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

class ChatService {
  /**
   * Find an existing chat by sessionId.
   * If it doesn't exist, create a new one in Supabase.
   */
  async getOrCreateChat(sessionId: string) {
    return ChatRepository.getOrCreate(sessionId);
  }

  /**
   * Save a new message to the conversation.
   */
  async saveMessage(
    sessionId: string,
    role: "user" | "assistant",
    content: string
  ) {
    return ChatRepository.saveMessage(sessionId, role, content);
  }

  /**
   * Return all previous messages.
   */
  async getConversation(sessionId: string): Promise<IMessage[]> {
    return ChatRepository.getConversation(sessionId);
  }

  /**
   * Delete conversation.
   */
  async clearConversation(sessionId: string) {
    return ChatRepository.clearConversation(sessionId);
  }
}

export const chatService = new ChatService();