import mongoose from 'mongoose';

const workflowStepSchema = new mongoose.Schema({
  stepNumber: { type: Number, required: true },
  name: { type: String, required: true },
  approverRoleCode: { type: String, required: true },
  isParallel: { type: Boolean, default: false },
  slaHours: { type: Number, default: 48 }
});

const workflowDefinitionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  transactionType: {
    type: String,
    enum: ['ASSET_REQUEST', 'CAPITALIZATION', 'TRANSFER', 'INTER_COMPANY_TRANSFER', 'DISPOSAL', 'WRITE_OFF'],
    required: true,
    unique: true
  },
  valueThreshold: { type: Number, default: 0 },
  steps: [workflowStepSchema],
  active: { type: Boolean, default: true }
}, { timestamps: true });

export const WorkflowDefinition = mongoose.model('WorkflowDefinition', workflowDefinitionSchema);
