import prisma from '../../config/prisma.js';
import { CustodyTransfersService } from './custodyTransfers.service.js';

export async function getCustodyAssignments(req, res, next) {
  try {
    const assignments = await prisma.custodyAssignment.findMany({
      include: {
        asset: {
          include: {
            category: true,
            site: true,
            room: true
          }
        },
        custodian: {
          include: { department: true }
        },
        issuedBy: {
          select: { id: true, username: true, fullName: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, assignments });
  } catch (err) { next(err); }
}

export async function getCustodyStats(req, res, next) {
  try {
    const totalAssignments = await prisma.custodyAssignment.count();
    const activeAssignments = await prisma.custodyAssignment.count({ where: { active: true } });
    const totalTransfers = await prisma.assetTransfer.count();
    
    const now = new Date();
    const overdueAssignments = await prisma.custodyAssignment.count({
      where: {
        active: true,
        expectedReturnDate: { lt: now }
      }
    });

    res.json({
      success: true,
      stats: {
        totalAssignments,
        activeAssignments,
        totalTransfers,
        overdueAssignments
      }
    });
  } catch (err) { next(err); }
}

export async function assignCustody(req, res, next) {
  try {
    const { 
      assetId, 
      custodianId, 
      issuedDate,
      expectedReturnDate, 
      conditionAtIssue, 
      acknowledged, 
      custodyType, 
      gatePassNumber,
      accessories,
      notes 
    } = req.body;
    const userId = req.user?.id || req.user?._id;

    const result = await prisma.$transaction(async (tx) => {
      const asset = await tx.asset.findFirst({
        where: { OR: [{ id: assetId }, { assetId: assetId }] }
      });
      if (!asset) throw new Error('Asset not found');

      // Deactivate existing active assignments for this asset
      await tx.custodyAssignment.updateMany({
        where: { assetId: asset.id, active: true },
        data: { active: false }
      });

      const assignment = await tx.custodyAssignment.create({
        data: {
          assetId: asset.id,
          custodianId,
          issuedDate: issuedDate ? new Date(issuedDate) : new Date(),
          expectedReturnDate: expectedReturnDate ? new Date(expectedReturnDate) : null,
          conditionAtIssue: conditionAtIssue || 'GOOD',
          acknowledged: acknowledged !== undefined ? Boolean(acknowledged) : true,
          acknowledgementDate: acknowledged ? new Date() : null,
          issuedByUserId: userId,
          active: true
        }
      });

      await tx.asset.update({
        where: { id: asset.id },
        data: {
          custodianId,
          assignedDate: issuedDate ? new Date(issuedDate) : new Date(),
          condition: conditionAtIssue || asset.condition,
          lifecycleStatus: 'ASSIGNED'
        }
      });

      // Build structured accessories summary
      let accSummary = '';
      if (accessories && typeof accessories === 'object') {
        const activeAcc = Object.entries(accessories)
          .filter(([_, enabled]) => Boolean(enabled))
          .map(([key]) => key.replace(/([A-Z])/g, ' $1').toLowerCase());
        if (activeAcc.length > 0) accSummary = `Accessories: [${activeAcc.join(', ')}]`;
      }

      const noteParts = [
        `[Type: ${custodyType || 'PERMANENT'}]`,
        gatePassNumber ? `Gate Pass #${gatePassNumber}` : null,
        accSummary || null,
        notes || null
      ].filter(Boolean);

      await tx.assetTransaction.create({
        data: {
          assetId: asset.id,
          transactionType: 'ASSIGN',
          fromStatus: asset.lifecycleStatus,
          toStatus: 'ASSIGNED',
          performedByUserId: userId,
          notes: noteParts.join(' | ')
        }
      });

      return assignment;
    });

    res.status(201).json({ success: true, assignment: result });
  } catch (err) { next(err); }
}

export async function returnCustody(req, res, next) {
  try {
    const { id } = req.params;
    const { conditionAtReturn, notes } = req.body;
    const userId = req.user?.id || req.user?._id;

    const result = await prisma.$transaction(async (tx) => {
      const assignment = await tx.custodyAssignment.findUnique({ where: { id } });
      if (!assignment) throw new Error('Custody assignment not found');

      const updatedAssignment = await tx.custodyAssignment.update({
        where: { id },
        data: {
          active: false,
          actualReturnDate: new Date(),
          conditionAtReturn: conditionAtReturn || assignment.conditionAtReturn
        }
      });

      const asset = await tx.asset.findUnique({ where: { id: assignment.assetId } });
      if (asset) {
        await tx.asset.update({
          where: { id: asset.id },
          data: {
            custodianId: null,
            lifecycleStatus: 'IN_STORE'
          }
        });

        await tx.assetTransaction.create({
          data: {
            assetId: asset.id,
            transactionType: 'UNASSIGN',
            fromStatus: asset.lifecycleStatus,
            toStatus: 'IN_STORE',
            performedByUserId: userId,
            notes: notes || 'Custody returned to inventory'
          }
        });
      }

      return updatedAssignment;
    });

    res.json({ success: true, assignment: result });
  } catch (err) { next(err); }
}

export async function getTransfers(req, res, next) {
  try {
    const transfers = await prisma.assetTransfer.findMany({
      include: {
        asset: {
          include: {
            category: true,
            site: true,
            room: true
          }
        },
        fromCustodian: true,
        toCustodian: true,
        requestedBy: {
          select: { id: true, username: true, fullName: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, transfers });
  } catch (err) { next(err); }
}

export async function createTransfer(req, res, next) {
  try {
    const transferNumber = 'TRF-' + Date.now().toString(36).toUpperCase();
    const userId = req.user?.id || req.user?._id;

    const { 
      assetId, 
      transferType = 'INTER_SITE', 
      customTransferType,
      fromSiteId, 
      toSiteId, 
      fromRoomId, 
      toRoomId, 
      fromCustodianId, 
      toCustodianId, 
      reason 
    } = req.body;

    const asset = await prisma.asset.findFirst({
      where: { OR: [{ id: assetId }, { assetId: assetId }] }
    });

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    const validEnumTypes = ['INTRA_SITE', 'INTER_SITE', 'INTER_COMPANY', 'INTER_DEPARTMENT'];
    const rawType = (transferType || '').toUpperCase();
    const dbTransferType = validEnumTypes.includes(rawType) ? rawType : 'INTER_SITE';
    
    const displayType = (rawType === 'CUSTOM' || !validEnumTypes.includes(rawType))
      ? (customTransferType || transferType)
      : rawType;

    const combinedReason = (rawType === 'CUSTOM' || !validEnumTypes.includes(rawType))
      ? `[Custom Type: ${displayType}] ${reason || ''}`
      : reason;

    const transfer = await prisma.assetTransfer.create({
      data: {
        transferNumber,
        assetId: asset.id,
        transferType: dbTransferType,
        fromSiteId: fromSiteId || asset.siteId,
        toSiteId: toSiteId || asset.siteId,
        fromRoomId: fromRoomId || asset.roomId,
        toRoomId: toRoomId || asset.roomId,
        fromCustodianId: fromCustodianId || asset.custodianId,
        toCustodianId: toCustodianId || asset.custodianId,
        reason: combinedReason,
        requestedByUserId: userId,
        status: 'APPROVED'
      }
    });

    await prisma.asset.update({
      where: { id: asset.id },
      data: {
        siteId: toSiteId || asset.siteId,
        roomId: toRoomId || asset.roomId,
        custodianId: toCustodianId || asset.custodianId,
        lifecycleStatus: 'IN_SERVICE'
      }
    });

    await prisma.assetTransaction.create({
      data: {
        assetId: asset.id,
        transactionType: 'TRANSFER_LOCATION',
        fromStatus: asset.lifecycleStatus,
        toStatus: 'IN_SERVICE',
        performedByUserId: userId,
        notes: `Transfer completed: ${transferNumber}`
      }
    });

    res.status(201).json({ success: true, transfer });
  } catch (err) { next(err); }
}

export async function deleteTransfer(req, res, next) {
  try {
    const { id } = req.params;
    const transfer = await prisma.assetTransfer.findUnique({ where: { id } });
    if (!transfer) {
      return res.status(404).json({ success: false, message: 'Transfer record not found' });
    }

    await prisma.assetTransfer.delete({ where: { id } });
    res.json({ success: true, message: 'Transfer record deleted successfully' });
  } catch (err) { next(err); }
}

export async function updateTransfer(req, res, next) {
  try {
    const { id } = req.params;
    const { 
      transferType, 
      customTransferType, 
      toSiteId, 
      toRoomId, 
      reason 
    } = req.body;

    const existing = await prisma.assetTransfer.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Transfer record not found' });
    }

    const validEnumTypes = ['INTRA_SITE', 'INTER_SITE', 'INTER_COMPANY', 'INTER_DEPARTMENT'];
    const rawType = (transferType || existing.transferType || '').toUpperCase();
    const dbTransferType = validEnumTypes.includes(rawType) ? rawType : 'INTER_SITE';

    const displayType = (rawType === 'CUSTOM' || !validEnumTypes.includes(rawType))
      ? (customTransferType || transferType)
      : rawType;

    let cleanReason = reason !== undefined ? reason : (existing.reason || '');
    cleanReason = cleanReason.replace(/\[Custom Type:\s*[^\]]+\]/gi, '').trim();

    const combinedReason = (rawType === 'CUSTOM' || !validEnumTypes.includes(rawType))
      ? `[Custom Type: ${displayType}] ${cleanReason}`
      : cleanReason;

    const updated = await prisma.assetTransfer.update({
      where: { id },
      data: {
        transferType: dbTransferType,
        toSiteId: toSiteId || existing.toSiteId,
        toRoomId: toRoomId || existing.toRoomId,
        reason: combinedReason
      },
      include: {
        asset: true,
        fromCustodian: true,
        toCustodian: true
      }
    });

    res.json({ success: true, transfer: updated });
  } catch (err) { next(err); }
}

// -------------------------------------------------------------------
// Assignment & Movement Module Extended Controllers
// -------------------------------------------------------------------

export async function getMovementKpis(req, res, next) {
  try {
    const kpis = await CustodyTransfersService.getKpis();
    res.json({ success: true, ...kpis });
  } catch (err) { next(err); }
}

export async function getMovementsAssets(req, res, next) {
  try {
    const result = await CustodyTransfersService.getAssets(req.query);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

export async function getMovementsAssetDetails(req, res, next) {
  try {
    const asset = await CustodyTransfersService.getAssetById(req.params.id);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });
    res.json({ success: true, asset });
  } catch (err) { next(err); }
}

export async function submitAssignmentWorkflow(req, res, next) {
  try {
    const result = await CustodyTransfersService.submitAssignment(req.body, req.user);
    res.status(201).json(result);
  } catch (err) { next(err); }
}

export async function submitTransferWorkflow(req, res, next) {
  try {
    const result = await CustodyTransfersService.submitTransfer(req.body, req.user);
    res.status(201).json(result);
  } catch (err) { next(err); }
}

export async function confirmTransferReceipt(req, res, next) {
  try {
    const result = await CustodyTransfersService.confirmReceipt(req.params.id, req.body, req.user);
    res.json(result);
  } catch (err) { next(err); }
}

export async function getPendingApprovals(req, res, next) {
  try {
    const approvals = await CustodyTransfersService.getPendingApprovals();
    res.json({ success: true, approvals });
  } catch (err) { next(err); }
}

export async function processApproval(req, res, next) {
  try {
    const { id } = req.params;
    const { action, remarks } = req.body;
    const result = await CustodyTransfersService.processApproval(id, action, remarks, req.user);
    res.json(result);
  } catch (err) { next(err); }
}

export async function getRecentMovements(req, res, next) {
  try {
    const recent = await CustodyTransfersService.getRecentMovements();
    res.json({ success: true, recent });
  } catch (err) { next(err); }
}

export async function getMovementHistory(req, res, next) {
  try {
    const result = await CustodyTransfersService.getMovementHistory(req.query);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

export async function getMovementDetailsById(req, res, next) {
  try {
    const movement = await CustodyTransfersService.getMovementById(req.params.id);
    if (!movement) return res.status(404).json({ success: false, message: 'Movement record not found' });
    res.json({ success: true, movement });
  } catch (err) { next(err); }
}

