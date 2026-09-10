import prisma from '../../config/prisma.js';

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

export async function assignCustody(req, res, next) {
  try {
    const { assetId, custodianId, expectedReturnDate, notes } = req.body;
    const userId = req.user?.id || req.user?._id;

    const result = await prisma.$transaction(async (tx) => {
      const asset = await tx.asset.findUnique({ where: { id: assetId } });
      if (!asset) throw new Error('Asset not found');

      // Deactivate active assignments
      await tx.custodyAssignment.updateMany({
        where: { assetId: asset.id, active: true },
        data: { active: false }
      });

      const assignment = await tx.custodyAssignment.create({
        data: {
          assetId: asset.id,
          custodianId,
          issuedDate: new Date(),
          expectedReturnDate: expectedReturnDate ? new Date(expectedReturnDate) : null,
          issuedByUserId: userId,
          active: true
        }
      });

      await tx.asset.update({
        where: { id: asset.id },
        data: {
          custodianId,
          assignedDate: new Date(),
          lifecycleStatus: 'ASSIGNED'
        }
      });

      await tx.assetTransaction.create({
        data: {
          assetId: asset.id,
          transactionType: 'ASSIGN',
          fromStatus: asset.lifecycleStatus,
          toStatus: 'ASSIGNED',
          performedByUserId: userId,
          notes: notes || 'Assigned custodian'
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
      if (!assignment.active) throw new Error('Custody assignment is already inactive');

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

    const { assetId, transferType = 'INTER_SITE', fromSiteId, toSiteId, fromRoomId, toRoomId, fromCustodianId, toCustodianId, reason } = req.body;

    const transfer = await prisma.assetTransfer.create({
      data: {
        transferNumber,
        assetId,
        transferType,
        fromSiteId,
        toSiteId,
        fromRoomId,
        toRoomId,
        fromCustodianId,
        toCustodianId,
        reason,
        requestedByUserId: userId,
        status: 'APPROVED'
      }
    });

    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (asset) {
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
    }

    res.status(201).json({ success: true, transfer });
  } catch (err) { next(err); }
}
