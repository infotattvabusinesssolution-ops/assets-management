import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema({
  entityType: { type: String, required: true, index: true }, // ASSET, WORK_ORDER, CONTRACT, RECEIPT, DISPOSAL
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  fileName: { type: String, required: true },
  fileType: String,
  fileSize: Number,
  storageKey: { type: String, required: true },
  url: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export const Attachment = mongoose.model('Attachment', attachmentSchema);
