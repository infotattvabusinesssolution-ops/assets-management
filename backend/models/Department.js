import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  code: { type: String, required: true },
  name: { type: String, required: true },
  active: { type: Boolean, default: true }
}, { timestamps: true });

export const Department = mongoose.model('Department', departmentSchema);
