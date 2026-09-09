import mongoose from 'mongoose';

const dataScopeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Company' }],
  siteIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Site' }],
  departmentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' }],
  costCenterIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CostCenter' }]
}, { timestamps: true });

export const DataScope = mongoose.model('DataScope', dataScopeSchema);
