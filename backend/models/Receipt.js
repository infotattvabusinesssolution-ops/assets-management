import mongoose from 'mongoose';

const receiptSchema = new mongoose.Schema({
  receiptNumber: { type: String, required: true, unique: true, index: true },
  poNumber: { type: String, required: true, index: true },
  vendorName: { type: String, required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true },
  receivedDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['STAGED', 'COMPLETED', 'PARTIAL'], default: 'STAGED' },
  receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lineItems: [{
    description: String,
    quantity: Number,
    unitPrice: mongoose.Schema.Types.Decimal128,
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    serialNumbers: [String],
    createdAssetIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Asset' }]
  }]
}, { timestamps: true });

export const Receipt = mongoose.model('Receipt', receiptSchema);
