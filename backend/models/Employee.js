import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  employeeCode: { type: String, required: true, unique: true, index: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  costCenterId: { type: mongoose.Schema.Types.ObjectId, ref: 'CostCenter' },
  active: { type: Boolean, default: true }
}, { timestamps: true });

export const Employee = mongoose.model('Employee', employeeSchema);
