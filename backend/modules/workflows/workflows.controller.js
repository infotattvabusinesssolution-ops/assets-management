import { randomUUID } from 'node:crypto';
import prisma from '../../config/prisma.js';
import { resolveDbUserId } from '../assets/asset.controller.js';

export async function getDefinitions(req, res, next) {
  try {
    const definitions = await prisma.workflowDefinition.findMany({
      include: { steps: { orderBy: { stepNumber: 'asc' } } },
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

      if (steps && Array.isArray(steps) && steps.length > 0) {
        for (let i = 0; i < steps.length; i++) {
          const s = steps[i];
          await prisma.workflowStep.create({
            data: {
              workflowDefinitionId: definition.id,
              stepNumber: s.stepNumber || i + 1,
              name: s.name || s.title || `Step ${i + 1}`,
              approverRoleCode: s.approverRoleCode || 'ASSET_ADMIN',
              slaHours: s.slaHours || 48
            }
          });
        }
      }
    }

    const fullDefinition = await prisma.workflowDefinition.findUnique({
      where: { id: definition.id },
      include: { steps: { orderBy: { stepNumber: 'asc' } } }
    });

    res.status(201).json({ success: true, definition: fullDefinition });
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

/**
 * Format a WorkflowInstance into the rich request shape expected by the frontend
 */
async function formatWorkflowInstance(inst) {
  const requestNo = inst.legacyMongoId || 'APR-' + new Date(inst.createdAt).getFullYear() + '-' + inst.id.slice(0, 6).toUpperCase();
  const transactionType = inst.workflowDefinition?.transactionType || inst.workflowDefinition?.name || 'Asset Approval';

  // Resolve Asset details
  let asset = null;
  if (inst.entityId) {
    asset = await prisma.asset.findFirst({
      where: { OR: [{ id: inst.entityId }, { assetId: inst.entityId }] },
      include: {
        category: true,
        site: true,
        building: true,
        room: true,
        custodian: true,
        manufacturer: true
      }
    });
  }

  // Resolve Requester
  let requesterName = '-';
  if (inst.requestedByUserId) {
    const user = await prisma.user.findFirst({
      where: { OR: [{ id: inst.requestedByUserId }, { username: inst.requestedByUserId }] }
    });
    if (user) requesterName = user.fullName || user.username;
  }

  const steps = inst.workflowDefinition?.steps || [];
  const actions = inst.approvalActions || [];

  const workflowSteps = steps.map((s) => {
    const matchingAction = actions.find((a) => a.stepNumber === s.stepNumber);
    let stepStatus = 'Pending';
    if (s.stepNumber < inst.currentStepNumber) {
      stepStatus = 'Approved';
    } else if (s.stepNumber === inst.currentStepNumber) {
      if (inst.status === 'APPROVED') stepStatus = 'Approved';
      else if (inst.status === 'REJECTED') stepStatus = 'Rejected';
      else if (inst.status === 'RETURNED') stepStatus = 'Returned';
      else stepStatus = 'Pending Approval';
    }

    return {
      step: s.stepNumber,
      title: s.name,
      status: stepStatus,
      approver: matchingAction?.approverUserId || s.approverRoleCode || '-',
      isCurrent: s.stepNumber === inst.currentStepNumber && inst.status === 'PENDING',
      date: matchingAction ? new Date(matchingAction.timestamp).toLocaleDateString('en-GB') : null,
      comments: matchingAction?.comments || null
    };
  });

  const currentStep = steps.find((s) => s.stepNumber === inst.currentStepNumber);
  const slaHours = currentStep?.slaHours || 48;
  const elapsedHours = (Date.now() - new Date(inst.createdAt).getTime()) / (1000 * 60 * 60);
  const isOverdue = elapsedHours > slaHours;

  const locParts = [asset?.site?.name, asset?.building?.name, asset?.room?.name].filter(Boolean);

  return {
    id: inst.id,
    requestNo,
    transactionType,
    assetId: asset?.assetId || inst.entityId,
    assetName: asset?.description || '-',
    requestedBy: requesterName,
    requestDate: new Date(inst.createdAt).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }),
    slaDueDate: new Date(new Date(inst.createdAt).getTime() + slaHours * 3600000).toLocaleDateString('en-GB'),
    slaStatus: isOverdue ? 'SLA Overdue' : 'Normal',
    currentLevel: currentStep?.name || '-',
    currentLevelNum: inst.currentStepNumber,
    status: inst.status ? inst.status.charAt(0) + inst.status.slice(1).toLowerCase() : '-',
    category: asset?.category?.name || '-',
    purchaseCost: asset?.acquisitionValue ? (asset.currency || '') + ' ' + Number(asset.acquisitionValue).toLocaleString() : '-',
    location: locParts.length > 0 ? locParts.join(', ') : '-',
    attachment: null,
    currentApprover: currentStep?.name || '-',
    image: null,
    createdAt: inst.createdAt,
    workflowSteps,
    rawInstance: inst
  };
}

export async function getPendingApprovals(req, res, next) {
  try {
    const instances = await prisma.workflowInstance.findMany({
      where: { status: 'PENDING' },
      include: {
        workflowDefinition: { include: { steps: { orderBy: { stepNumber: 'asc' } } } },
        approvalActions: { orderBy: { stepNumber: 'asc' } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const requests = await Promise.all(instances.map(formatWorkflowInstance));

    res.json({
      success: true,
      requests,
      instances: requests,
      totalCount: requests.length
    });
  } catch (err) { next(err); }
}

export async function getWorkflowHistory(req, res, next) {
  try {
    const instances = await prisma.workflowInstance.findMany({
      where: { status: { not: 'PENDING' } },
      include: {
        workflowDefinition: { include: { steps: { orderBy: { stepNumber: 'asc' } } } },
        approvalActions: { orderBy: { stepNumber: 'asc' } }
      },
      orderBy: { updatedAt: 'desc' },
      take: 100
    });

    const requests = await Promise.all(instances.map(formatWorkflowInstance));

    res.json({
      success: true,
      requests,
      instances: requests,
      totalCount: requests.length
    });
  } catch (err) { next(err); }
}

export async function getAllApprovals(req, res, next) {
  try {
    const { status } = req.query;
    const where = {};
    if (status && status !== 'All') {
      where.status = status.toUpperCase();
    }

    const instances = await prisma.workflowInstance.findMany({
      where,
      include: {
        workflowDefinition: { include: { steps: { orderBy: { stepNumber: 'asc' } } } },
        approvalActions: { orderBy: { stepNumber: 'asc' } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const requests = await Promise.all(instances.map(formatWorkflowInstance));

    res.json({
      success: true,
      requests,
      instances: requests,
      totalCount: requests.length
    });
  } catch (err) { next(err); }
}

export async function approveStep(req, res, next) {
  try {
    const { instanceId } = req.params;
    const { decision = 'APPROVE', comments } = req.body;
    const finalUserId = await resolveDbUserId(req.user);

    // Support finding by UUID id OR legacyMongoId (requestNo like APR-2026-001)
    const instance = await prisma.workflowInstance.findFirst({
      where: {
        OR: [
          { id: instanceId },
          { legacyMongoId: instanceId }
        ]
      },
      include: {
        workflowDefinition: { include: { steps: { orderBy: { stepNumber: 'asc' } } } },
        approvalActions: true
      }
    });

    if (!instance) {
      return res.status(404).json({ success: false, message: `Workflow approval request [${instanceId}] not found.` });
    }

    if (instance.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Approval request [${instanceId}] has already been processed with status [${instance.status}].`
      });
    }

    const normalizedDecision = decision.toUpperCase();
    if (!['APPROVE', 'REJECT', 'RETURN', 'RETURN_FOR_CORRECTION'].includes(normalizedDecision)) {
      return res.status(400).json({ success: false, message: 'Invalid approval decision.' });
    }

    // 1. Record Approval Action
    const action = await prisma.approvalAction.create({
      data: {
        workflowInstanceId: instance.id,
        stepNumber: instance.currentStepNumber,
        approverUserId: finalUserId,
        decision: normalizedDecision,
        comments: comments || ''
      }
    });

    let newStatus = instance.status;
    let nextStepNumber = instance.currentStepNumber;
    const steps = instance.workflowDefinition?.steps || [];
    const maxSteps = steps.length > 0 ? Math.max(...steps.map((s) => s.stepNumber)) : 1;

    // Resolve target asset if any
    let asset = null;
    if (instance.entityId) {
      asset = await prisma.asset.findFirst({
        where: { OR: [{ id: instance.entityId }, { assetId: instance.entityId }] }
      });
    }

    if (normalizedDecision === 'REJECT') {
      newStatus = 'REJECTED';
      if (asset) {
        await prisma.assetTransaction.create({
          data: {
            assetId: asset.id,
            transactionType: 'APPROVAL_REJECTED',
            fromStatus: asset.lifecycleStatus,
            toStatus: asset.lifecycleStatus,
            performedByUserId: finalUserId,
            notes: `Workflow approval request [${instance.legacyMongoId || instance.id}] REJECTED at Step ${instance.currentStepNumber}. Remarks: ${comments || 'No remarks'}`
          }
        });
      }
    } else if (normalizedDecision === 'RETURN' || normalizedDecision === 'RETURN_FOR_CORRECTION') {
      newStatus = 'RETURNED';
      if (asset) {
        await prisma.assetTransaction.create({
          data: {
            assetId: asset.id,
            transactionType: 'APPROVAL_RETURNED',
            fromStatus: asset.lifecycleStatus,
            toStatus: asset.lifecycleStatus,
            performedByUserId: finalUserId,
            notes: `Workflow approval request [${instance.legacyMongoId || instance.id}] RETURNED for correction. Remarks: ${comments || 'No remarks'}`
          }
        });
      }
    } else {
      // APPROVE
      if (instance.currentStepNumber >= maxSteps) {
        newStatus = 'APPROVED';

        // Apply final approval side-effects to asset
        if (asset) {
          let updatedLifecycle = asset.lifecycleStatus;
          const txType = (instance.workflowDefinition?.transactionType || '').toUpperCase();

          if (txType.includes('NEW') || txType.includes('REGISTRATION') || asset.lifecycleStatus === 'PENDING_APPROVAL') {
            updatedLifecycle = 'IN_SERVICE';
          } else if (txType.includes('DISPOSAL')) {
            updatedLifecycle = 'DISPOSED';
          }

          await prisma.asset.update({
            where: { id: asset.id },
            data: {
              lifecycleStatus: updatedLifecycle,
              updatedByUserId: finalUserId
            }
          });

          await prisma.assetTransaction.create({
            data: {
              assetId: asset.id,
              transactionType: 'APPROVAL_GRANTED',
              fromStatus: asset.lifecycleStatus,
              toStatus: updatedLifecycle,
              performedByUserId: finalUserId,
              notes: `Final approval granted for request [${instance.legacyMongoId || instance.id}]. Status set to ${updatedLifecycle}.`
            }
          });
        }
      } else {
        nextStepNumber += 1;
        if (asset) {
          await prisma.assetTransaction.create({
            data: {
              assetId: asset.id,
              transactionType: 'APPROVAL_STEP_PASSED',
              fromStatus: asset.lifecycleStatus,
              toStatus: asset.lifecycleStatus,
              performedByUserId: finalUserId,
              notes: `Approval step ${instance.currentStepNumber} approved. Advanced to step ${nextStepNumber}.`
            }
          });
        }
      }
    }

    const updatedInstance = await prisma.workflowInstance.update({
      where: { id: instance.id },
      data: {
        status: newStatus,
        currentStepNumber: nextStepNumber
      }
    });

    // Write Audit Log
    await prisma.auditEvent.create({
      data: {
        userId: finalUserId,
        action: `WORKFLOW_${normalizedDecision}`,
        entityType: 'WorkflowInstance',
        entityId: instance.id,
        beforeState: JSON.stringify({ status: instance.status, step: instance.currentStepNumber }),
        afterState: JSON.stringify({ status: newStatus, step: nextStepNumber, decision: normalizedDecision }).slice(0, 240)
      }
    });

    res.json({
      success: true,
      message: `Approval request [${instance.legacyMongoId || instance.id}] decision [${normalizedDecision}] processed successfully.`,
      instance: updatedInstance,
      action
    });
  } catch (err) { next(err); }
}

export async function createApprovalRequest(req, res, next) {
  try {
    const {
      transactionType = 'New Asset Registration',
      assetId,
      entityId,
      assetName,
      remarks,
      requestNo
    } = req.body;
    const finalUserId = await resolveDbUserId(req.user);

    // Resolve Asset before changing workflow data
    let targetAsset = null;
    const targetId = assetId || entityId;
    if (targetId) {
      targetAsset = await prisma.asset.findFirst({
        where: { OR: [{ id: targetId }, { assetId: targetId }] }
      });
    }

    if (!targetAsset) return res.status(404).json({ success: false, message: 'Asset not found.' });
    // 1. Resolve or auto-create Workflow Definition with 4 standard enterprise tiers
    let definition = await prisma.workflowDefinition.findFirst({
      where: {
        OR: [
          { transactionType },
          { name: transactionType }
        ]
      },
      include: { steps: { orderBy: { stepNumber: 'asc' } } }
    });

    if (!definition) {
      definition = await prisma.workflowDefinition.create({
        data: {
          name: `${transactionType} Approval Workflow`,
          transactionType,
          valueThreshold: 0,
          active: true
        }
      });

      // Create 4 standard approval tiers
      const standardSteps = [
        { stepNumber: 1, name: 'Asset Manager', approverRoleCode: 'ASSET_ADMIN', slaHours: 24 },
        { stepNumber: 2, name: 'Department Head', approverRoleCode: 'MANAGEMENT', slaHours: 48 },
        { stepNumber: 3, name: 'Finance', approverRoleCode: 'FINANCE', slaHours: 48 },
        { stepNumber: 4, name: 'Final Approval', approverRoleCode: 'SYS_ADMIN', slaHours: 72 }
      ];

      for (const s of standardSteps) {
        await prisma.workflowStep.create({
          data: {
            workflowDefinitionId: definition.id,
            stepNumber: s.stepNumber,
            name: s.name,
            approverRoleCode: s.approverRoleCode,
            slaHours: s.slaHours
          }
        });
      }
    }

    const finalRequestNo = requestNo || 'APR-' + new Date().getFullYear() + '-' + randomUUID().slice(0, 8).toUpperCase();

    // 3. Create Workflow Instance
    const instance = await prisma.workflowInstance.create({
      data: {
        legacyMongoId: finalRequestNo,
        workflowDefinitionId: definition.id,
        entityType: 'Asset',
        entityId: targetAsset.id,
        requestedByUserId: finalUserId,
        status: 'PENDING',
        currentStepNumber: 1
      },
      include: {
        workflowDefinition: { include: { steps: { orderBy: { stepNumber: 'asc' } } } }
      }
    });

    // If new registration, mark asset as PENDING_APPROVAL
    if (targetAsset && (transactionType.includes('New') || transactionType.includes('REGISTRATION'))) {
      await prisma.asset.update({
        where: { id: targetAsset.id },
        data: { lifecycleStatus: 'PENDING_APPROVAL' }
      });
    }

    // Write Audit Log
    await prisma.auditEvent.create({
      data: {
        userId: finalUserId,
        action: 'WORKFLOW_CREATE',
        entityType: 'WorkflowInstance',
        entityId: instance.id,
        afterState: JSON.stringify({ requestNo: finalRequestNo, transactionType, assetId: targetId }).slice(0, 240)
      }
    });

    res.status(201).json({
      success: true,
      requestNo: finalRequestNo,
      instance,
      message: `Workflow approval request [${finalRequestNo}] created successfully.`
    });
  } catch (err) { next(err); }
}
