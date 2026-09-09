import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  currency: { type: String, default: 'USD' },
  taxId: String,
  address: String,
  active: { type: Boolean, default: true }
}, { timestamps: true });

export const Company = mongoose.model('Company', companySchema);
