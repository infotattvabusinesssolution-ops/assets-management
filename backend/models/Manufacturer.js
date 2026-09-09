import mongoose from 'mongoose';

const manufacturerSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  supportContact: String,
  website: String,
  active: { type: Boolean, default: true }
}, { timestamps: true });

export const Manufacturer = mongoose.model('Manufacturer', manufacturerSchema);
