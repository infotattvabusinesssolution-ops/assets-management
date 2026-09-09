import mongoose from 'mongoose';

const depreciationEntrySchema = new mongoose.Schema({
  depreciationRunId: { type: mongoose.Schema.Types.ObjectId, ref: 'DepreciationRun', required: true, index: true },
  assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true, index: true },
  fiscalPeriodId: { type: mongoose.Schema.Types.ObjectId, ref: 'FiscalPeriod', required: true, index: true },
  openingNetBookValue: { type: mongoose.Schema.Types.Decimal128, required: true },
  depreciationAmount: { type: mongoose.Schema.Types.Decimal128, required: true },
  accumulatedDepreciation: { type: mongoose.Schema.Types.Decimal128, required: true },
  closingNetBookValue: { type: mongoose.Schema.Types.Decimal128, required: true },
  isPosted: { type: Boolean, default: false }
}, { timestamps: true });

depreciationEntrySchema.index({ depreciationRunId: 1, assetId: 1 }, { unique: true });

export const DepreciationEntry = mongoose.model('DepreciationEntry', depreciationEntrySchema);
