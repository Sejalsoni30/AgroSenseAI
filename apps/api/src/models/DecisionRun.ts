import mongoose, { Schema, Document } from 'mongoose';

export interface IDecisionRun extends Document {
  farmId: mongoose.Types.ObjectId;
  zoneId: mongoose.Types.ObjectId;
  timestamp: Date;
  engineVersion: string;
  decision: 'IRRIGATE' | 'NO_IRRIGATION_NEEDED' | 'INSUFFICIENT_DATA_VERIFY_MANUALLY';
  confidenceBand: string;
  abstentionReason?: string;
  reliabilityScore: number;
  reliabilityStatus: string;
  penalties: any[];
  waterBalance: {
    drMm: number;
    rawMm: number;
    tawMm: number;
    etcMm: number;
    pEffMm: number;
    netIrrigationReqMm: number;
    stressRatio: number;
    underwateringRiskPct: number;
    overwateringRiskPct: number;
  };
  uncertainty: {
    pIrrigate: number;
    drInterval90: {
      lower: number;
      median: number;
      upper: number;
      widthMm: number;
    };
    straddlesRawThreshold: boolean;
  };
  explanation: {
    summary: { en: string; hi: string };
    drivers: any[];
    counterfactuals: any[];
    uncertainInputs: any[];
  };
  inputsSnapshot: Record<string, any>;
  isDemo: boolean;
  createdAt: Date;
}

const DecisionRunSchema = new Schema<IDecisionRun>({
  farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
  zoneId: { type: Schema.Types.ObjectId, ref: 'Zone', required: true },
  timestamp: { type: Date, required: true, default: Date.now },
  engineVersion: { type: String, default: '1.0.0-fao56' },
  decision: {
    type: String,
    enum: ['IRRIGATE', 'NO_IRRIGATION_NEEDED', 'INSUFFICIENT_DATA_VERIFY_MANUALLY'],
    required: true
  },
  confidenceBand: { type: String, required: true },
  abstentionReason: { type: String },
  reliabilityScore: { type: Number, required: true },
  reliabilityStatus: { type: String, required: true },
  penalties: [Schema.Types.Mixed],
  waterBalance: {
    drMm: { type: Number, required: true },
    rawMm: { type: Number, required: true },
    tawMm: { type: Number, required: true },
    etcMm: { type: Number, required: true },
    pEffMm: { type: Number, required: true },
    netIrrigationReqMm: { type: Number, required: true },
    stressRatio: { type: Number, default: 0 },
    underwateringRiskPct: { type: Number, default: 0 },
    overwateringRiskPct: { type: Number, default: 0 }
  },
  uncertainty: {
    pIrrigate: { type: Number, default: 0 },
    drInterval90: {
      lower: { type: Number },
      median: { type: Number },
      upper: { type: Number },
      widthMm: { type: Number }
    },
    straddlesRawThreshold: { type: Boolean, default: false }
  },
  explanation: {
    summary: {
      en: { type: String },
      hi: { type: String }
    },
    drivers: [Schema.Types.Mixed],
    counterfactuals: [Schema.Types.Mixed],
    uncertainInputs: [Schema.Types.Mixed]
  },
  inputsSnapshot: { type: Schema.Types.Mixed, default: {} },
  isDemo: { type: Boolean, default: false }
}, {
  timestamps: true
});

DecisionRunSchema.index({ zoneId: 1, timestamp: -1 });

export const DecisionRun = mongoose.model<IDecisionRun>('DecisionRun', DecisionRunSchema);
