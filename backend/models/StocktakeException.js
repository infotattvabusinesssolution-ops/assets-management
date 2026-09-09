import mongoose from 'mongoose';

const stocktakeExceptionSchema = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'StocktakeCampaign', required: true, index: true },
  assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', index: true },
  exceptionType: {
    type: String,
    enum: ['RELOCATED', 'WRONG_CUSTODIAN', 'UNREGISTERED', 'MISSING', 'DAMAGED', 'DUPLICATE'],
    required: true
  },
  details: mongoose.Schema.Types.Mixed,
  resolutionStatus: { type: String, enum: ['OPEN', 'RESOLVED', 'IGNORED'], default: 'OPEN' },
  resolutionNotes: String,
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: Date
}, { timestamps: true });

export const StocktakeException = mongoose.model('StocktakeException', stocktakeExceptionSchema);
