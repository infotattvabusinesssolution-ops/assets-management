import mongoose from 'mongoose';

const siteSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  code: { type: String, required: true },
  name: { type: String, required: true },
  city: String,
  country: String,
  active: { type: Boolean, default: true }
}, { timestamps: true });
siteSchema.index({ companyId: 1, code: 1 }, { unique: true });

const buildingSchema = new mongoose.Schema({
  siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true },
  code: { type: String, required: true },
  name: { type: String, required: true },
  active: { type: Boolean, default: true }
}, { timestamps: true });

const floorSchema = new mongoose.Schema({
  buildingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Building', required: true },
  code: { type: String, required: true },
  name: { type: String, required: true },
  floorNumber: Number,
  active: { type: Boolean, default: true }
}, { timestamps: true });

const roomSchema = new mongoose.Schema({
  floorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Floor', required: true },
  code: { type: String, required: true },
  name: { type: String, required: true },
  roomType: { type: String, default: 'General' },
  active: { type: Boolean, default: true }
}, { timestamps: true });

const zoneSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  code: { type: String, required: true },
  name: { type: String, required: true },
  active: { type: Boolean, default: true }
}, { timestamps: true });

export const Site = mongoose.model('Site', siteSchema);
export const Building = mongoose.model('Building', buildingSchema);
export const Floor = mongoose.model('Floor', floorSchema);
export const Room = mongoose.model('Room', roomSchema);
export const Zone = mongoose.model('Zone', zoneSchema);
