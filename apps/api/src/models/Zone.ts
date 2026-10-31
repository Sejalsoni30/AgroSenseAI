import mongoose, { Schema, Document } from 'mongoose';

export interface IZone extends Document {
  farmId: mongoose.Types.ObjectId;
  name: string;
  soilType: 'sandy' | 'sandy_loam' | 'loam' | 'clay_loam' | 'silty_clay' | 'clay';
  cropName: string;
  growthStage: 'initial' | 'development' | 'mid' | 'late';
  areaHa: number;
  rootDepthM: number;
  irrigationType: 'drip' | 'sprinkler' | 'flood' | 'furrow';
  sensorId?: string;
  isDemo: boolean;
  source: 'measured' | 'manual' | 'demo';
  createdAt: Date;
}

const ZoneSchema = new Schema<IZone>({
  farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
  name: { type: String, required: true, trim: true },
  soilType: {
    type: String,
    enum: ['sandy', 'sandy_loam', 'loam', 'clay_loam', 'silty_clay', 'clay'],
    default: 'loam'
  },
  cropName: { type: String, default: 'wheat' },
  growthStage: {
    type: String,
    enum: ['initial', 'development', 'mid', 'late'],
    default: 'development'
  },
  areaHa: { type: Number, default: 2.5 },
  rootDepthM: { type: Number, default: 1.0 },
  irrigationType: {
    type: String,
    enum: ['drip', 'sprinkler', 'flood', 'furrow'],
    default: 'drip'
  },
  sensorId: { type: String },
  isDemo: { type: Boolean, default: false },
  source: { type: String, enum: ['measured', 'manual', 'demo'], default: 'manual' }
}, {
  timestamps: true
});

export const Zone = mongoose.model<IZone>('Zone', ZoneSchema);

