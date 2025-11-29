import mongoose, { Schema, Document } from "mongoose";

export interface IQRSession extends Document {
  userId: mongoose.Types.ObjectId;
  qrCode?: string;
  token: string;
  totpSecret: string;
  verified: boolean;
  expiresAt: Date;
  createdAt: Date;
}

const QRSessionSchema = new Schema<IQRSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    qrCode: { type: String },
    token: { type: String, required: true, unique: true },
    totpSecret: { type: String, required: true },
    verified: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// Index pour nettoyer automatiquement les sessions expirées
QRSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const QRSession = mongoose.model<IQRSession>("QRSession", QRSessionSchema);
