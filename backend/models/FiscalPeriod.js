import mongoose from 'mongoose';

const fiscalPeriodSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  year: { type: Number, required: true },
  periodNumber: { type: Number, required: true }, // 1 - 12
  periodName: String, // e.g. "2026-08"
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isClosed: { type: Boolean, default: false },
  closedAt: Date,
  closedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

fiscalPeriodSchema.index({ companyId: 1, year: 1, periodNumber: 1 }, { unique: true });

export const FiscalPeriod = mongoose.model('FiscalPeriod', fiscalPeriodSchema);
