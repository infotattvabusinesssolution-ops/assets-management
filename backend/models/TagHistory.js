import mongoose from 'mongoose';

const tagHistorySchema = new mongoose.Schema({
  assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true, index: true },
  oldTagNumber: String,
  newTagNumber: { type: String, required: true },
  reason: { type: String, required: true },
  replacedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

export const TagHistory = mongoose.model('TagHistory', tagHistorySchema);
