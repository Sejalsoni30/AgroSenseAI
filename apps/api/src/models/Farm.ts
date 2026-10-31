import mongoose, { Schema, Document } from 'mongoose';

export interface IFarm extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
    altitudeM: number;
  };
  totalAreaHa: number;
  isDemo: boolean;
  source: 'measured' | 'manual' | 'demo';
  createdAt: Date;
}

const FarmSchema = new Schema<IFarm>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  location: {
    address: { type: String, default: 'Green Valley Field Station' },
    latitude: { type: Number, required: true, default: 28.6139 },
    longitude: { type: Number, required: true, default: 77.2090 },
    altitudeM: { type: Number, default: 216 }
  },
  totalAreaHa: { type: Number, default: 10.5 },
  isDemo: { type: Boolean, default: false },
  source: { type: String, enum: ['measured', 'manual', 'demo'], default: 'manual' }
}, {
  timestamps: true
});

export const Farm = mongoose.model<IFarm>('Farm', FarmSchema);

