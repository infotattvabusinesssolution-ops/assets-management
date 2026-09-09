import mongoose from 'mongoose';

const costCenterSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  code: { type: String, required: true },
  name: { type: String, required: true },
  active: { type: Boolean, default: true }
}, { timestamps: true });

export const CostCenter = mongoose.model('CostCenter', costCenterSchema);
