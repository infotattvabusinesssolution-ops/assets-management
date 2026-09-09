import mongoose from 'mongoose';

const maintenanceWorkOrderSchema = new mongoose.Schema({
  workOrderNumber: { type: String, required: true, unique: true, index: true },
  assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true, index: true },
  workType: { type: String, enum: ['PREVENTIVE', 'CORRECTIVE', 'INSPECTION', 'CALIBRATION'], default: 'CORRECTIVE' },
  priority: { type: String, enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'], default: 'MEDIUM' },
  status: { type: String, enum: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'VERIFIED', 'CANCELLED'], default: 'OPEN' },
  
  description: { type: String, required: true },
  failureCode: String,
  rootCause: String,
  
  assignedTechnicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  vendorId: String,
  vendorName: String,
  
  scheduledDate: Date,
  startedDate: Date,
  completedDate: Date,
  completionTargetDate: Date,
  
  laborHours: { type: Number, default: 0 },
  laborCost: { type: Number, default: 0 },
  partsCost: { type: Number, default: 0 },
  cost: { type: mongoose.Schema.Types.Decimal128, default: 0 },
  meterReading: Number,
  
  partsUsed: [{
    partName: String,
    quantity: { type: Number, default: 1 },
    unitCost: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 }
  }],

  checklist: [{
    task: String,
    completed: { type: Boolean, default: false },
    notes: String
  }],
  
  notes: String,
  photoUrls: [String],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export const MaintenanceWorkOrder = mongoose.model('MaintenanceWorkOrder', maintenanceWorkOrderSchema);
