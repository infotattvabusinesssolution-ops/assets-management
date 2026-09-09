import mongoose from 'mongoose';

const assetModelSchema = new mongoose.Schema({
  modelNumber: { type: String, required: true, index: true },
  name: { type: String, required: true },
  manufacturerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Manufacturer', required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  specifications: mongoose.Schema.Types.Mixed,
  active: { type: Boolean, default: true }
}, { timestamps: true });

export const AssetModel = mongoose.model('AssetModel', assetModelSchema);
