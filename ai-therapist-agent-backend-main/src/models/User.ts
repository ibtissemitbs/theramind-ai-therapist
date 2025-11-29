import mongoose, { Schema, Document, models, model } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  emailVerified?: Date | null;
  totpSecret?: string;
  totpEnabled?: boolean;
  // autres champs si besoin
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    emailVerified: { type: Date, default: null },
    totpSecret: { type: String },
    totpEnabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const User = models.User || model<IUser>("User", UserSchema);
