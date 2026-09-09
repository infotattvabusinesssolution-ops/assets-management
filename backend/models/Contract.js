import mongoose from 'mongoose';

const contractSchema = new mongoose.Schema({
  contractNumber: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  contractType: { type: String, enum: ['AMC', 'LEASE', 'INSURANCE', 'SOFTWARE_LICENSE', 'SERVICE_SLA'], required: true },
  providerName: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true, index: true },
  cost: { type: mongoose.Schema.Types.Decimal128, default: 0 },
  coveredAssetIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Asset' }],
  slaDetails: String,
  active: { type: Boolean, default: true }
}, { timestamps: true });

export const Contract = mongoose.model('Contract', contractSchema);
