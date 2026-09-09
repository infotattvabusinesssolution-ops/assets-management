import mongoose from 'mongoose';

const approvalActionSchema = new mongoose.Schema({
  workflowInstanceId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkflowInstance', required: true, index: true },
  stepNumber: { type: Number, required: true },
  approverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  decision: { type: String, enum: ['APPROVE', 'REJECT', 'DELEGATE'], required: true },
  comments: String,
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

export const ApprovalAction = mongoose.model('ApprovalAction', approvalActionSchema);
