import mongoose from 'mongoose';

const stocktakeObservationSchema = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'StocktakeCampaign', required: true, index: true },
  assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', index: true },
  scannedTagNumber: String,
  scannedSerial: String,
  scanType: { type: String, enum: ['BARCODE', 'QR', 'RFID', 'MANUAL'], default: 'BARCODE' },
  observedRoomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  observedCustodianId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  observedCondition: String,
  observedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now },
  deviceTimestamp: Date,
  offlineTransactionUUID: String,
  photoUrl: String
}, { timestamps: true });

export const StocktakeObservation = mongoose.model('StocktakeObservation', stocktakeObservationSchema);
