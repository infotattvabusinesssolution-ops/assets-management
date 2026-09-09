import mongoose from 'mongoose';

const stocktakeCampaignSchema = new mongoose.Schema({
  campaignNumber: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  scope: {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true },
    buildingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Building' },
    floorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Floor' },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }
  },
  mode: { type: String, enum: ['FULL_CENSUS', 'CYCLE_COUNT', 'SAMPLE'], default: 'FULL_CENSUS' },
  status: { type: String, enum: ['DRAFT', 'ACTIVE', 'RECONCILIATION', 'CLOSED'], default: 'DRAFT' },
  startDate: Date,
  endDate: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stats: {
    totalExpected: { type: Number, default: 0 },
    totalVerified: { type: Number, default: 0 },
    totalRelocated: { type: Number, default: 0 },
    totalMissing: { type: Number, default: 0 },
    totalUnregistered: { type: Number, default: 0 }
  }
}, { timestamps: true });

export const StocktakeCampaign = mongoose.model('StocktakeCampaign', stocktakeCampaignSchema);
