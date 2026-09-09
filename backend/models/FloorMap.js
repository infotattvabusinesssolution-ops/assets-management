import mongoose from 'mongoose';

const zonePolygonSchema = new mongoose.Schema({
  zoneId: { type: mongoose.Schema.Types.ObjectId, ref: 'Zone' },
  name: { type: String, required: true },
  points: [{
    x: { type: Number, required: true }, // Normalized 0.0 to 1.0
    y: { type: Number, required: true }  // Normalized 0.0 to 1.0
  }],
  color: { type: String, default: '#3B82F6' }
});

const floorMapSchema = new mongoose.Schema({
  title: { type: String, required: true },
  floorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Floor', required: true, unique: true, index: true },
  imageUrl: { type: String, required: true },
  widthMeters: { type: Number, default: 50 },
  heightMeters: { type: Number, default: 30 },
  zones: [zonePolygonSchema],
  active: { type: Boolean, default: true }
}, { timestamps: true });

export const FloorMap = mongoose.model('FloorMap', floorMapSchema);
