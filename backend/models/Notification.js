import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['APPROVAL_REQUIRED', 'MAINTENANCE_DUE', 'WARRANTY_EXPIRING', 'DISCOVERY_ANOMALY', 'STOCKTAKE_ALERT', 'INFO'], default: 'INFO' },
  read: { type: Boolean, default: false },
  link: String
}, { timestamps: true });

export const Notification = mongoose.model('Notification', notificationSchema);
