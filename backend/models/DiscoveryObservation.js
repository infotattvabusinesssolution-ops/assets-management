import mongoose from 'mongoose';

const discoveryObservationSchema = new mongoose.Schema({
  discoverySource: { type: String, enum: ['SNMP', 'WMI', 'SSH', 'MDM', 'EDR', 'IP_SCANNER'], default: 'IP_SCANNER' },
  ipAddress: { type: String, index: true },
  macAddress: { type: String, index: true },
  hostname: { type: String, index: true },
  serialNumber: { type: String, index: true },
  manufacturer: String,
  modelName: String,
  osFamily: String,
  osVersion: String,
  cpuInfo: String,
  ramGb: Number,
  storageGb: Number,
  loggedOnUser: String,
  firstSeen: { type: Date, default: Date.now },
  lastSeen: { type: Date, default: Date.now, index: true },
  rawCollectorPayload: mongoose.Schema.Types.Mixed
}, { timestamps: true });

export const DiscoveryObservation = mongoose.model('DiscoveryObservation', discoveryObservationSchema);
