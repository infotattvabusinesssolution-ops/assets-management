import mongoose from 'mongoose';

const assetClassSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  description: String,
  active: { type: Boolean, default: true }
}, { timestamps: true });

export const AssetClass = mongoose.model('AssetClass', assetClassSchema);
