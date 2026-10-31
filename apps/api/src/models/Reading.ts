import mongoose, { Schema, Document } from 'mongoose';

export interface ITelemetryValue {
  value: number | null;
  unit: string;
  source: 'measured' | 'manual' | 'api' | 'estimated' | 'simulated' | 'demo';
  ageSeconds?: number;
  isEstimated?: boolean;
}

export interface IReading extends Document {
  zoneId: mongoose.Types.ObjectId;
  farmId: mongoose.Types.ObjectId;
  timestamp: Date;
  soilMoisture: ITelemetryValue;
  temperature: ITelemetryValue;
  humidity: ITelemetryValue;
  rainfall: ITelemetryValue;
  solarRadiation?: ITelemetryValue;
  windSpeed?: ITelemetryValue;
  isDemo: boolean;
  notes?: string;
  createdAt: Date;
}

const TelemetryValueSchema = new Schema<ITelemetryValue>({
  value: { type: Number, default: null },
  unit: { type: String, required: true },
  source: {
    type: String,
    enum: ['measured', 'manual', 'api', 'estimated', 'simulated', 'demo'],
    default: 'measured'
  },
  ageSeconds: { type: Number, default: 0 },
  isEstimated: { type: Boolean, default: false }
}, { _id: false });

const ReadingSchema = new Schema<IReading>({
  zoneId: { type: Schema.Types.ObjectId, ref: 'Zone', required: true },
  farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
  timestamp: { type: Date, required: true, default: Date.now },
  soilMoisture: { type: TelemetryValueSchema, required: true },
  temperature: { type: TelemetryValueSchema, required: true },
  humidity: { type: TelemetryValueSchema, required: true },
  rainfall: { type: TelemetryValueSchema, required: true },
  solarRadiation: { type: TelemetryValueSchema },
  windSpeed: { type: TelemetryValueSchema },
  isDemo: { type: Boolean, default: false },
  notes: { type: String }
}, {
  timestamps: true
});

ReadingSchema.index({ zoneId: 1, timestamp: -1 });

export const Reading = mongoose.model<IReading>('Reading', ReadingSchema);

