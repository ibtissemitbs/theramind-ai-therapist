import mongoose, { Document, Schema } from "mongoose";

export interface ICrisisAlert extends Document {
  userId: string;
  sessionId: string;
  level: "low" | "medium" | "high" | "critical";
  message: string;
  keywords: string[];
  userMessage: string;
  resources: Array<{
    title: string;
    phone?: string;
    description: string;
    link?: string;
  }>;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CrisisAlertSchema = new Schema<ICrisisAlert>(
  {
    userId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true },
    level: { 
      type: String, 
      enum: ["low", "medium", "high", "critical"],
      required: true 
    },
    message: { type: String, required: true },
    keywords: [{ type: String }],
    userMessage: { type: String, required: true },
    resources: [{
      title: { type: String, required: true },
      phone: { type: String },
      description: { type: String, required: true },
      link: { type: String }
    }],
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Index pour requêtes rapides
CrisisAlertSchema.index({ userId: 1, createdAt: -1 });
CrisisAlertSchema.index({ userId: 1, isRead: 1 });

export const CrisisAlert = mongoose.model<ICrisisAlert>("CrisisAlert", CrisisAlertSchema);
