import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true },
  description: String,
  permissions: [{ type: String }],
  isSystem: { type: Boolean, default: false },
  active: { type: Boolean, default: true }
}, { timestamps: true });

export const Role = mongoose.model('Role', roleSchema);
