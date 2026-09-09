import mongoose from 'mongoose';

const assetTransferSchema = new mongoose.Schema({
  transferNumber: { type: String, required: true, unique: true, index: true },
  assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true, index: true },
  transferType: { type: String, enum: ['INTRA_SITE', 'INTER_SITE', 'INTER_COMPANY', 'INTER_DEPARTMENT'], required: true },
  
  // From
  fromCompanyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  fromSiteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site' },
  fromRoomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  fromCustodianId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  
  // To
  toCompanyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  toSiteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site' },
  toRoomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  toCustodianId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  
  status: { type: String, enum: ['DRAFT', 'SUBMITTED', 'APPROVED', 'DISPATCHED', 'IN_TRANSIT', 'RECEIVED', 'REJECTED'], default: 'DRAFT' },
  reason: String,
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dispatchDate: Date,
  receiveDate: Date
}, { timestamps: true });

export const AssetTransfer = mongoose.model('AssetTransfer', assetTransferSchema);
