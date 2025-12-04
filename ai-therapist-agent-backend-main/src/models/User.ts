import mongoose, { Schema, Document, models, model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  gender?: string;
  emailVerified?: Date | null;
  totpSecret?: string;
  totpEnabled?: boolean;
  profileImage?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    gender: { type: String, enum: ['male', 'female'], required: false },
    emailVerified: { type: Date, default: null },
    totpSecret: { type: String },
    totpEnabled: { type: Boolean, default: false },
    profileImage: { type: String },
  },
  { timestamps: true }
);

export const User = models.User || model<IUser>("User", UserSchema);
