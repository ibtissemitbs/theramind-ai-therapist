import mongoose, { Schema, Document } from "mongoose";
import { encrypt, decrypt, isEncrypted } from "../utils/encryption";

export interface IChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  metadata?: {
    technique?: string;
    goal?: string;
    progress?: any[];
    analysis?: {
      emotionalState: string;
      themes: string[];
      riskLevel: number;
      recommendedApproach: string;
      progressIndicators: string[];
    };
  };
}

export interface IChatSession extends Document {
  // userId FACULTATIF pour ne pas tout casser si l’auth n’est pas encore branchée
  userId?: mongoose.Types.ObjectId | null;
  messages: IChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
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
    timestamp: { type: Date, default: Date.now },
    metadata: {
      technique: { type: String },
      goal: { type: String },
      progress: { type: [Schema.Types.Mixed], default: [] },
      analysis: {
        emotionalState: String,
        themes: [String],
        riskLevel: Number,
        recommendedApproach: String,
        progressIndicators: [String],
      },
    },
  },
  { _id: false }
);

const ChatSessionSchema = new Schema<IChatSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: false },
    messages: { type: [ChatMessageSchema], default: [] },
  },
  { 
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);

export const ChatSession = mongoose.model<IChatSession>(
  "ChatSession",
  ChatSessionSchema
);
