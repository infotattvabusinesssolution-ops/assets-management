import mongoose from 'mongoose';

const assetBookValueSchema = new mongoose.Schema({
  assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true, index: true },
  bookType: { type: String, enum: ['CORPORATE', 'TAX', 'MANAGEMENT'], default: 'CORPORATE', required: true },
  capitalizationDate: Date,
  capitalizationValue: { type: mongoose.Schema.Types.Decimal128, required: true },
  usefulLifeMonths: { type: Number, required: true },
  depreciationMethod: { type: String, enum: ['STRAIGHT_LINE', 'DECLINING_BALANCE'], default: 'STRAIGHT_LINE' },
  residualValue: { type: mongoose.Schema.Types.Decimal128, default: 0 },
  accumulatedDepreciation: { type: mongoose.Schema.Types.Decimal128, default: 0 },
  netBookValue: { type: mongoose.Schema.Types.Decimal128, required: true },
  isLocked: { type: Boolean, default: false }
}, { timestamps: true });

assetBookValueSchema.index({ assetId: 1, bookType: 1 }, { unique: true });

export const AssetBookValue = mongoose.model('AssetBookValue', assetBookValueSchema);
