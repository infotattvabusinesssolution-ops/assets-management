import prisma from '../../config/prisma.js';

export async function getDefinitions(req, res, next) {
  try {
    const definitions = await prisma.workflowDefinition.findMany({
      include: { steps: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, definitions });
  } catch (err) { next(err); }
}

export async function createDefinition(req, res, next) {
  try {
    const { name, transactionType, valueThreshold, steps, active } = req.body;

    let definition = await prisma.workflowDefinition.findUnique({
      where: { transactionType }
    });

    if (definition) {
      definition = await prisma.workflowDefinition.update({
        where: { id: definition.id },
        data: {
          name: name || definition.name,
          valueThreshold: valueThreshold !== undefined ? valueThreshold : definition.valueThreshold,
          active: active !== undefined ? active : definition.active
        }
      });
    } else {
      definition = await prisma.workflowDefinition.create({
        data: {
          name,
          transactionType,
          valueThreshold: valueThreshold || 0,
          active: active !== undefined ? active : true
        }
      });
    }

    res.status(201).json({ success: true, definition });
  } catch (err) { next(err); }
}

export async function toggleDefinitionStatus(req, res, next) {
  try {
    const { id } = req.params;
    const definition = await prisma.workflowDefinition.findUnique({ where: { id } });
    if (!definition) return res.status(404).json({ success: false, message: 'Workflow definition not found.' });

    const updated = await prisma.workflowDefinition.update({
      where: { id },
      data: { active: !definition.active }
    });

    res.json({ success: true, definition: updated });
  } catch (err) { next(err); }
}

export async function getPendingApprovals(req, res, next) {
  try {
    const instances = await prisma.workflowInstance.findMany({
      where: { status: 'PENDING' },
      include: {
        workflowDefinition: { include: { steps: true } },
        approvalActions: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const enrichedInstances = await Promise.all(instances.map(async (inst) => {
      const instObj = { ...inst, actions: inst.approvalActions };
      if (instObj.entityId) {
        try {
          const asset = await prisma.asset.findUnique({
            where: { id: instObj.entityId },
            select: {
              id: true,
              assetId: true,
              description: true,
              tagNumber: true,
              lifecycleStatus: true,
              acquisitionValue: true,
              category: { select: { name: true } },
              site: { select: { name: true } }
            }
          });
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
    const instances = await prisma.workflowInstance.findMany({
      where: { status: { not: 'PENDING' } },
      include: {
        workflowDefinition: { include: { steps: true } },
        approvalActions: true
      },
      orderBy: { updatedAt: 'desc' },
      take: 100
    });

    const enrichedInstances = await Promise.all(instances.map(async (inst) => {
      const instObj = { ...inst, actions: inst.approvalActions };
      if (instObj.entityId) {
        try {
          const asset = await prisma.asset.findUnique({
            where: { id: instObj.entityId },
            select: {
              id: true,
              assetId: true,
              description: true,
              tagNumber: true,
              lifecycleStatus: true,
              acquisitionValue: true,
              category: { select: { name: true } },
              site: { select: { name: true } }
            }
          });
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
    const userId = req.user?.id || req.user?._id;

    const instance = await prisma.workflowInstance.findUnique({
      where: { id: instanceId },
      include: { workflowDefinition: { include: { steps: true } } }
    });

    if (!instance || instance.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: 'This approval request has already been processed or completed by another approver.' });
    }

    if (instance.requestedByUserId && instance.requestedByUserId === userId) {
      return res.status(403).json({
        success: false,
        message: 'Self-approval restriction: You cannot approve or reject a workflow request that you submitted.'
      });
    }

    const action = await prisma.approvalAction.create({
      data: {
        workflowInstanceId: instance.id,
        stepNumber: instance.currentStepNumber,
        approverUserId: userId,
        decision,
        comments: comments || ''
      }
    });

    let newStatus = instance.status;
    let nextStepNumber = instance.currentStepNumber;

    if (decision === 'REJECT') {
      newStatus = 'REJECTED';
    } else {
      const maxSteps = instance.workflowDefinition?.steps?.length || 1;
      if (instance.currentStepNumber >= maxSteps) {
        newStatus = 'APPROVED';
      } else {
        nextStepNumber += 1;
      }
    }

    const updatedInstance = await prisma.workflowInstance.update({
      where: { id: instance.id },
      data: {
        status: newStatus,
        currentStepNumber: nextStepNumber
      }
    });

    res.json({ success: true, instance: updatedInstance, action });
  } catch (err) { next(err); }
}
