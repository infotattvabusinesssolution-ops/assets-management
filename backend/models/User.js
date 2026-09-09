import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  fullName: { type: String, required: true },
  roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site' },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  costCenterId: { type: mongoose.Schema.Types.ObjectId, ref: 'CostCenter' },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  dataScopes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DataScope' }],
  active: { type: Boolean, default: true },
  lastLogin: Date
}, { timestamps: true });

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

export const User = mongoose.model('User', userSchema);
