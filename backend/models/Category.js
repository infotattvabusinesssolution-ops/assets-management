import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  description: String,
  depreciationMethod: { type: String, enum: ['STRAIGHT_LINE', 'DECLINING_BALANCE'], default: 'STRAIGHT_LINE' },
  defaultUsefulLifeMonths: { type: Number, default: 60 },
  defaultResidualValuePercent: { type: Number, default: 0 },
  isSerialized: { type: Boolean, default: true },
  active: { type: Boolean, default: true }
}, { timestamps: true });

export const Category = mongoose.model('Category', categorySchema);
