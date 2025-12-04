import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEmailVerificationToken extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

const EmailVerificationTokenSchema = new Schema<IEmailVerificationToken>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  token: { 
    type: String, 
    required: true, 
    unique: true 
  },
  expiresAt: { 
    type: Date, 
    required: true,
    // Token expire après 24 heures
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000)
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

// Index pour nettoyer automatiquement les tokens expirés
EmailVerificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const EmailVerificationToken: Model<IEmailVerificationToken> = 
  mongoose.models.EmailVerificationToken || 
  mongoose.model<IEmailVerificationToken>("EmailVerificationToken", EmailVerificationTokenSchema);
