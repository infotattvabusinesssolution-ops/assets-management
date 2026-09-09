import mongoose from 'mongoose';

const discoveryMatchSchema = new mongoose.Schema({
  observationId: { type: mongoose.Schema.Types.ObjectId, ref: 'DiscoveryObservation', required: true, index: true },
  matchedAssetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', index: true },
  confidenceScore: { type: Number, required: true }, // 0 to 100
  matchRule: { type: String, enum: ['EXACT_SERIAL', 'MAC_ADDRESS', 'HOSTNAME', 'FUZZY_AI'], required: true },
  status: { type: String, enum: ['MATCHED', 'SUGGESTED', 'UNKNOWN', 'CONFLICT', 'IGNORED'], default: 'SUGGESTED', index: true },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date
}, { timestamps: true });

export const DiscoveryMatch = mongoose.model('DiscoveryMatch', discoveryMatchSchema);
