import { Document, Schema, model, Types } from "mongoose";
import { encrypt, decrypt, isEncrypted } from "../utils/encryption";

export interface IChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  metadata?: {
    analysis?: any;
    currentGoal?: string | null;
    progress?: {
      emotionalState?: string;
      riskLevel?: number;
    };
  };
}

export interface IChatSession extends Document {
  _id: Types.ObjectId;
  sessionId: string;
  userId: Types.ObjectId;
  startTime: Date;
  status: "active" | "completed" | "archived";
  messages: IChatMessage[];
}

const chatMessageSchema = new Schema<IChatMessage>({
  role: { type: String, required: true, enum: ["user", "assistant"] },
  content: { 
    type: String, 
    required: true,
    // Chiffrer avant sauvegarde
    set: function(value: string) {
      if (value && !isEncrypted(value)) {
        return encrypt(value);
      }
      return value;
    },
    // Déchiffrer à la lecture
    get: function(value: string) {
      if (value && isEncrypted(value)) {
        try {
          return decrypt(value);
        } catch (error) {
          console.error('Error decrypting message:', error);
          return '[Message chiffré - erreur de déchiffrement]';
        }
      }
      return value;
    }
  },
  timestamp: { type: Date, required: true },
  metadata: {
    analysis: Schema.Types.Mixed,
    currentGoal: String,
    progress: {
      emotionalState: String,
      riskLevel: Number,
    },
  },
});

const chatSessionSchema = new Schema<IChatSession>({
  sessionId: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  startTime: { type: Date, required: true },
  status: {
    type: String,
    required: true,
    enum: ["active", "completed", "archived"],
  },
  messages: [chatMessageSchema],
}, {
  toJSON: { getters: true },
  toObject: { getters: true }
});

export const ChatSession = model<IChatSession>(
  "ChatSession",
  chatSessionSchema
);
