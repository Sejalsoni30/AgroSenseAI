import mongoose, { Schema, Document } from 'mongoose';

export interface IContactMessage extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  ipAddress?: string;
  status: 'new' | 'reviewed' | 'resolved';
  createdAt: Date;
}

const ContactMessageSchema = new Schema<IContactMessage>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  subject: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  ipAddress: { type: String },
  status: { type: String, enum: ['new', 'reviewed', 'resolved'], default: 'new' }
}, {
  timestamps: true
});

export const ContactMessage = mongoose.model<IContactMessage>('ContactMessage', ContactMessageSchema);

