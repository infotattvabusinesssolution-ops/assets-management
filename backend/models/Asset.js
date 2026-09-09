import mongoose from 'mongoose';

export const ASSET_STATUSES = [
  'REQUESTED',
  'ORDERED',
  'RECEIVED',
  'TAGGED',
  'IN_STORE',
  'IN_SERVICE',
  'ASSIGNED',
  'IN_TRANSIT',
  'UNDER_MAINTENANCE',
  'MISSING',
  'LOST_STOLEN',
  'DAMAGED',
  'RETIRED',
  'DISPOSED'
];

export const ASSET_CONDITIONS = [
  'NEW',
  'GOOD',
  'FAIR',
  'POOR',
  'DAMAGED',
  'UNSERVICEABLE'
];

const assetSchema = new mongoose.Schema({
  // Identity
  assetId: { type: String, required: true, unique: true, index: true },
  legacyId: { type: String, index: true },
  tagNumber: { type: String, unique: true, sparse: true, index: true },
  barcode: { type: String, index: true },
  qrCode: { type: String, index: true },
  rfidEpc: { type: String, index: true },
  rfidTid: { type: String, index: true },
  serialNumber: { type: String, index: true },
  description: { type: String, required: true, index: true },
  
  // Classification
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
  assetClassId: { type: mongoose.Schema.Types.ObjectId, ref: 'AssetClass' },
  manufacturerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Manufacturer' },
  modelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Model' },
  parentAssetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset' },
  
  // Status & Condition
  lifecycleStatus: { type: String, enum: ASSET_STATUSES, default: 'RECEIVED', required: true, index: true },
  condition: { type: String, enum: ASSET_CONDITIONS, default: 'NEW', required: true },
  criticality: { type: String, enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'], default: 'MEDIUM' },
  
  // Organizational Scope
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true, index: true },
  buildingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Building' },
  floorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Floor' },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  zoneId: { type: mongoose.Schema.Types.ObjectId, ref: 'Zone' },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  costCenterId: { type: mongoose.Schema.Types.ObjectId, ref: 'CostCenter' },
  
  // Custody
  custodianId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', index: true },
  assignedDate: Date,
  
  // Acquisition & PO
  poNumber: String,
  supplierName: String,
  purchaseDate: Date,
  inServiceDate: Date,
  acquisitionValue: { type: mongoose.Schema.Types.Decimal128, default: 0 },
  currency: { type: String, default: 'USD' },
  
  // Custom Dynamic Fields
  customFields: { type: Map, of: mongoose.Schema.Types.Mixed },
  
  // Technical / IT Discovery Hint
  hostname: { type: String, index: true },
  macAddress: { type: String, index: true },
  ipAddress: { type: String, index: true },
  discoveryId: String,
  
  // Health & AI Score
  healthScore: { type: Number, default: 100 }, // 0 to 100
  
  // System Metadata
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  active: { type: Boolean, default: true }
}, { timestamps: true });

assetSchema.index({ companyId: 1, siteId: 1, categoryId: 1, lifecycleStatus: 1 });
assetSchema.index({ description: 'text', assetId: 'text', serialNumber: 'text', tagNumber: 'text', hostname: 'text' });

export const Asset = mongoose.model('Asset', assetSchema);
