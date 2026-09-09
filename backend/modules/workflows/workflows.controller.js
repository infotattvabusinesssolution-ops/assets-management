import { WorkflowDefinition } from '../../models/WorkflowDefinition.js';
import { WorkflowInstance } from '../../models/WorkflowInstance.js';
import { ApprovalAction } from '../../models/ApprovalAction.js';
import { Asset } from '../../models/Asset.js';

export async function getDefinitions(req, res, next) {
  try {
    const definitions = await WorkflowDefinition.find().sort({ createdAt: -1 });
    res.json({ success: true, definitions });
  } catch (err) { next(err); }
}

export async function createDefinition(req, res, next) {
  try {
    const { name, transactionType, valueThreshold, steps, active } = req.body;
    
    // Upsert or create definition by transactionType
    let definition = await WorkflowDefinition.findOne({ transactionType });
    if (definition) {
      definition.name = name || definition.name;
      definition.valueThreshold = valueThreshold !== undefined ? valueThreshold : definition.valueThreshold;
      definition.steps = steps || definition.steps;
      if (active !== undefined) definition.active = active;
      await definition.save();
    } else {
      definition = await WorkflowDefinition.create({
        name,
        transactionType,
        valueThreshold: valueThreshold || 0,
        steps: steps || [],
        active: active !== undefined ? active : true
      });
    }

    res.status(201).json({ success: true, definition });
  } catch (err) { next(err); }
}

export async function toggleDefinitionStatus(req, res, next) {
  try {
    const { id } = req.params;
    const definition = await WorkflowDefinition.findById(id);
    if (!definition) return res.status(404).json({ success: false, message: 'Workflow definition not found.' });

    definition.active = !definition.active;
    await definition.save();

    res.json({ success: true, definition });
  } catch (err) { next(err); }
}

export async function getPendingApprovals(req, res, next) {
  try {
    const instances = await WorkflowInstance.find({ status: 'PENDING' })
      .populate('workflowDefinitionId')
      .populate('requestedBy', 'username firstName lastName email roleId')
      .sort({ createdAt: -1 });

    const enrichedInstances = await Promise.all(instances.map(async (inst) => {
      const instObj = inst.toObject();
      const actions = await ApprovalAction.find({ workflowInstanceId: inst._id })
        .populate('approverId', 'username firstName lastName email')
        .sort({ timestamp: 1 });

      instObj.actions = actions;

      if (instObj.entityId) {
        try {
          const asset = await Asset.findById(instObj.entityId)
            .populate('categoryId', 'name')
            .populate('siteId', 'name')
            .select('assetId description tagNumber categoryId siteId lifecycleStatus acquisitionValue');
          if (asset) instObj.entityDetails = asset;
        } catch (e) {}
      }

      return instObj;
    }));

    res.json({ success: true, instances: enrichedInstances });
  } catch (err) { next(err); }
}

export async function getWorkflowHistory(req, res, next) {
  try {
    const instances = await WorkflowInstance.find({ status: { $ne: 'PENDING' } })
      .populate('workflowDefinitionId')
      .populate('requestedBy', 'username firstName lastName email')
      .sort({ updatedAt: -1 })
      .limit(100);

    const enrichedInstances = await Promise.all(instances.map(async (inst) => {
      const instObj = inst.toObject();
      const actions = await ApprovalAction.find({ workflowInstanceId: inst._id })
        .populate('approverId', 'username firstName lastName email')
        .sort({ timestamp: 1 });

      instObj.actions = actions;

      if (instObj.entityId) {
        try {
          const asset = await Asset.findById(instObj.entityId)
            .populate('categoryId', 'name')
            .populate('siteId', 'name')
            .select('assetId description tagNumber categoryId siteId lifecycleStatus acquisitionValue');
          if (asset) instObj.entityDetails = asset;
        } catch (e) {}
      }

      return instObj;
    }));

    res.json({ success: true, instances: enrichedInstances });
  } catch (err) { next(err); }
}

export async function approveStep(req, res, next) {
  try {
    const { instanceId } = req.params;
    const { decision, comments } = req.body;

    const instance = await WorkflowInstance.findById(instanceId).populate('workflowDefinitionId');
    if (!instance || instance.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: 'This approval request has already been processed or completed by another approver.' });
    }

    // Protection: Prevent user from approving their own request
    if (instance.requestedBy && instance.requestedBy.toString() === req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Self-approval restriction: You cannot approve or reject a workflow request that you submitted.'
      });
    }

    const action = await ApprovalAction.create({
      workflowInstanceId: instance._id,
      stepNumber: instance.currentStepNumber,
      approverId: req.user._id,
      decision,
      comments: comments || ''
    });

    if (decision === 'REJECT') {
      instance.status = 'REJECTED';
    } else {
      const maxSteps = instance.workflowDefinitionId?.steps?.length || 1;
      if (instance.currentStepNumber >= maxSteps) {
        instance.status = 'APPROVED';
      } else {
        instance.currentStepNumber += 1;
      }
    }

    await instance.save();
    res.json({ success: true, instance, action });
  } catch (err) { next(err); }
}
