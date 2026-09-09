import mongoose from 'mongoose';

const aiRecommendationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['DOCUMENT_OCR', 'DUPLICATE_DETECTION', 'PREDICTIVE_MAINTENANCE', 'HEALTH_SCORE', 'DISCOVERY_MATCH', 'EOL_FORECAST'],
    required: true,
    index: true
  },
  assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', index: true },
  confidenceScore: { type: Number, required: true }, // 0 to 100
  recommendationPayload: mongoose.Schema.Types.Mixed,
  explanation: String,
  status: { type: String, enum: ['PENDING', 'ACCEPTED', 'REJECTED'], default: 'PENDING', index: true },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date
}, { timestamps: true });

export const AIRecommendation = mongoose.model('AIRecommendation', aiRecommendationSchema);
