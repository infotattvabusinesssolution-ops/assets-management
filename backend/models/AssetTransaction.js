import mongoose from 'mongoose';

const assetTransactionSchema = new mongoose.Schema({
  assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true, index: true },
  transactionType: {
    type: String,
    enum: [
      'RECEIVE',
      'CAPITALIZE',
      'TAG',
      'ASSIGN',
      'UNASSIGN',
      'TRANSFER_LOCATION',
      'TRANSFER_CUSTODY',
      'MAINTENANCE_START',
      'MAINTENANCE_COMPLETE',
      'STOCKTAKE_VERIFY',
      'DISCOVERY_UPDATE',
      'REVALUE',
      'RETIRE',
      'DISPOSE'
    ],
    required: true
  },
  fromStatus: String,
  toStatus: String,
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now, index: true },
  notes: String,
  payload: mongoose.Schema.Types.Mixed
}, { timestamps: true });

export const AssetTransaction = mongoose.model('AssetTransaction', assetTransactionSchema);
