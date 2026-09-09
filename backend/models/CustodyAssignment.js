import mongoose from 'mongoose';

const custodyAssignmentSchema = new mongoose.Schema({
  assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true, index: true },
  custodianId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
  issuedDate: { type: Date, default: Date.now },
  expectedReturnDate: Date,
  actualReturnDate: Date,
  conditionAtIssue: String,
  conditionAtReturn: String,
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  acknowledged: { type: Boolean, default: false },
  acknowledgementDate: Date,
  active: { type: Boolean, default: true }
}, { timestamps: true });

export const CustodyAssignment = mongoose.model('CustodyAssignment', custodyAssignmentSchema);
