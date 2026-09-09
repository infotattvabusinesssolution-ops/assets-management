import mongoose from 'mongoose';

const maintenanceScheduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true, index: true },
  frequencyMonths: { type: Number, default: 6 },
  lastPerformedDate: Date,
  nextDueDate: { type: Date, required: true, index: true },
  active: { type: Boolean, default: true }
}, { timestamps: true });

export const MaintenanceSchedule = mongoose.model('MaintenanceSchedule', maintenanceScheduleSchema);
