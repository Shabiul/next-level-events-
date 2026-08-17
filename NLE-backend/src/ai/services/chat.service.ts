import Chat, { IMessage } from "../../models/chat.model";

class ChatService {
  /**
   * Find an existing chat by sessionId.
   * If it doesn't exist, create a new one.
   */
  async getOrCreateChat(sessionId: string) {
    let chat = await Chat.findOne({ sessionId });

    if (!chat) {
      chat = await Chat.create({
        sessionId,
        messages: [],
      });
    }

    return chat;
  }

  /**
   * Save a new message to the conversation.
   */
  async saveMessage(
    sessionId: string,
    role: "user" | "assistant",
    content: string
  ) {
    await this.getOrCreateChat(sessionId);

    return Chat.findOneAndUpdate(
      { sessionId },
      {
        $push: {
          messages: {
            role,
            content,
          },
        },
      },
      { returnDocument: "after" }
    );
  }

  /**
   * Return all previous messages.
   */
  async getConversation(sessionId: string): Promise<IMessage[]> {
    const chat = await this.getOrCreateChat(sessionId);

    return chat.messages;
  }

  /**
   * Delete conversation.
   */
  async clearConversation(sessionId: string) {
    return Chat.findOneAndUpdate(
      { sessionId },
      {
        messages: [],
      },
      {
        returnDocument: "after",
      }
    );
  }
}

export const chatService = new ChatService();