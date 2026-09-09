import mongoose from 'mongoose';

const assetMapPositionSchema = new mongoose.Schema({
  assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true, index: true },
  floorMapId: { type: mongoose.Schema.Types.ObjectId, ref: 'FloorMap', required: true, index: true },
  xRatio: { type: Number, required: true }, // Normalized 0.0 - 1.0
  yRatio: { type: Number, required: true }, // Normalized 0.0 - 1.0
  zoneId: { type: mongoose.Schema.Types.ObjectId, ref: 'Zone' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  active: { type: Boolean, default: true }
}, { timestamps: true });

assetMapPositionSchema.index({ assetId: 1, active: 1 });

export const AssetMapPosition = mongoose.model('AssetMapPosition', assetMapPositionSchema);
