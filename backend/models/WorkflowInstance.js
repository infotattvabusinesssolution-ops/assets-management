import mongoose from 'mongoose';

const workflowInstanceSchema = new mongoose.Schema({
  workflowDefinitionId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkflowDefinition', required: true, index: true },
  entityType: { type: String, required: true }, // ASSET, TRANSFER, DISPOSAL
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  currentStepNumber: { type: Number, default: 1 },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'], default: 'PENDING', index: true },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export const WorkflowInstance = mongoose.model('WorkflowInstance', workflowInstanceSchema);
