import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash?: string;
  name: string;
  role: 'farmer' | 'agronomist' | 'researcher' | 'admin';
  preferredLanguage: 'en' | 'hi';
  authProvider: 'local' | 'google';
  googleId?: string;
  avatar?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String }, // Optional for Google OAuth users
  name: { type: String, required: true, trim: true },
  role: { type: String, enum: ['farmer', 'agronomist', 'researcher', 'admin'], default: 'farmer' },
  preferredLanguage: { type: String, enum: ['en', 'hi'], default: 'en' },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  googleId: { type: String },
  avatar: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
}, {
  timestamps: true
});

export const User = mongoose.model<IUser>('User', UserSchema);
