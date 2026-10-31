import mongoose, { Schema, Document } from 'mongoose';

export interface IFarmerFeedback extends Document {
  runId: mongoose.Types.ObjectId;
  zoneId: mongoose.Types.ObjectId;
  farmId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  agreedWithRecommendation: boolean;
  actualActionTaken: 'IRRIGATED' | 'DID_NOT_IRRIGATE' | 'OTHER';
  waterAppliedMm?: number;
  farmerObservation?: string;
  verifiedByAgronomist: boolean;
  usedForRetraining: boolean; // Must always be FALSE per integrity rules
  isDemo: boolean;
  createdAt: Date;
}

const FarmerFeedbackSchema = new Schema<IFarmerFeedback>({
  runId: { type: Schema.Types.ObjectId, ref: 'DecisionRun', required: true },
  zoneId: { type: Schema.Types.ObjectId, ref: 'Zone', required: true },
  farmId: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  agreedWithRecommendation: { type: Boolean, required: true },
  actualActionTaken: {
    type: String,
    enum: ['IRRIGATED', 'DID_NOT_IRRIGATE', 'OTHER'],
    required: true
  },
  waterAppliedMm: { type: Number },
  farmerObservation: { type: String, trim: true },
  verifiedByAgronomist: { type: Boolean, default: false },
  usedForRetraining: { type: Boolean, default: false }, // Enforce Rule #6
  isDemo: { type: Boolean, default: false }
}, {
  timestamps: true
});

export const FarmerFeedback = mongoose.model<IFarmerFeedback>('FarmerFeedback', FarmerFeedbackSchema);

