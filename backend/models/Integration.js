import mongoose from 'mongoose';

const webhookSubscriptionSchema = new mongoose.Schema({
  targetUrl: { type: String, required: true },
  events: [{ type: String, required: true }],
  secret: String,
  active: { type: Boolean, default: true }
}, { timestamps: true });

const webhookDeliverySchema = new mongoose.Schema({
  subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'WebhookSubscription', required: true },
  event: String,
  payload: mongoose.Schema.Types.Mixed,
  responseStatus: Number,
  success: Boolean,
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

const importJobSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  entityType: { type: String, required: true },
  totalRows: { type: Number, default: 0 },
  processedRows: { type: Number, default: 0 },
  successRows: { type: Number, default: 0 },
  failedRows: { type: Number, default: 0 },
  errors: [{ row: Number, error: String }],
  status: { type: String, enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'], default: 'PENDING' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true, suppressReservedKeysWarning: true });

export const WebhookSubscription = mongoose.model('WebhookSubscription', webhookSubscriptionSchema);
export const WebhookDelivery = mongoose.model('WebhookDelivery', webhookDeliverySchema);
export const ImportJob = mongoose.model('ImportJob', importJobSchema);
