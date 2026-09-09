import mongoose from 'mongoose';

const tagSchema = new mongoose.Schema({
  tagNumber: { type: String, required: true, unique: true, index: true },
  tagType: { type: String, enum: ['BARCODE_128', 'QR_CODE', 'RFID_EPC', 'HYBRID'], default: 'BARCODE_128' },
  rfidEpc: { type: String, unique: true, sparse: true },
  rfidTid: { type: String, unique: true, sparse: true },
  assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', index: true },
  status: { type: String, enum: ['UNASSIGNED', 'ACTIVE', 'DAMAGED', 'REPLACED', 'RETIRED'], default: 'UNASSIGNED' },
  printedDate: Date
}, { timestamps: true });

export const Tag = mongoose.model('Tag', tagSchema);
