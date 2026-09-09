import mongoose from 'mongoose';

const depreciationRunSchema = new mongoose.Schema({
  runNumber: { type: String, required: true, unique: true, index: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  fiscalPeriodId: { type: mongoose.Schema.Types.ObjectId, ref: 'FiscalPeriod', required: true, index: true },
  bookType: { type: String, enum: ['CORPORATE', 'TAX', 'MANAGEMENT'], default: 'CORPORATE' },
  status: { type: String, enum: ['DRAFT', 'POSTED', 'CANCELLED'], default: 'DRAFT' },
  totalAssetsProcessed: { type: Number, default: 0 },
  totalDepreciationAmount: { type: mongoose.Schema.Types.Decimal128, default: 0 },
  postedAt: Date,
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export const DepreciationRun = mongoose.model('DepreciationRun', depreciationRunSchema);
