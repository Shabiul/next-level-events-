import mongoose, { Document, Schema } from "mongoose";

/**
 * Represents a single message in a conversation.
 */
export interface IMessage {
  role: "user" | "assistant";
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Represents an entire chat session.
 */
export interface IChat extends Document {
  sessionId: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Schema for each individual message.
 */
const MessageSchema = new Schema<IMessage>(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
    timestamps: true,
  }
);

/**
 * Schema for a complete conversation.
 */
const ChatSchema = new Schema<IChat>(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    messages: {
      type: [MessageSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Chat = mongoose.model<IChat>("Chat", ChatSchema);

export default Chat;