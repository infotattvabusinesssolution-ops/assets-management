import mongoose from 'mongoose';

const stocktakeExpectedAssetSchema = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'StocktakeCampaign', required: true, index: true },
  assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true, index: true },
  expectedSiteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site' },
  expectedRoomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  expectedCustodianId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  status: {
    type: String,
    enum: ['PENDING', 'VERIFIED_CORRECT', 'RELOCATED', 'WRONG_CUSTODIAN', 'MISSING', 'DAMAGED'],
    default: 'PENDING',
    index: true
  }
}, { timestamps: true });

stocktakeExpectedAssetSchema.index({ campaignId: 1, assetId: 1 }, { unique: true });

export const StocktakeExpectedAsset = mongoose.model('StocktakeExpectedAsset', stocktakeExpectedAssetSchema);
