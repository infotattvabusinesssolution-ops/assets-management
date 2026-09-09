import mongoose from 'mongoose';

const warrantySchema = new mongoose.Schema({
  assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true, unique: true, index: true },
  providerName: String,
  warrantyNumber: String,
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true, index: true },
  terms: String,
  coverageType: { type: String, enum: ['FULL', 'PARTS_ONLY', 'LABOR_ONLY', 'EXTENDED'], default: 'FULL' }
}, { timestamps: true });

export const Warranty = mongoose.model('Warranty', warrantySchema);
