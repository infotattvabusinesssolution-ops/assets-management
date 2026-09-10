import prisma from '../../config/prisma.js';

export async function getMaintenanceSummary(req, res, next) {
  try {
    const [workOrders, schedules] = await Promise.all([
      prisma.maintenanceWorkOrder.findMany(),
      prisma.maintenanceSchedule.findMany()
    ]);

    const totalWorkOrders = workOrders.length;
    const openCount = workOrders.filter(w => w.status === 'OPEN').length;
    const assignedCount = workOrders.filter(w => w.status === 'ASSIGNED').length;
    const inProgressCount = workOrders.filter(w => w.status === 'IN_PROGRESS').length;
    const onHoldCount = workOrders.filter(w => w.status === 'ON_HOLD').length;
    const completedCount = workOrders.filter(w => w.status === 'COMPLETED' || w.status === 'VERIFIED').length;

    const now = new Date();
    const overdueSchedulesCount = schedules.filter(s => s.active && s.nextDueDate && new Date(s.nextDueDate) < now).length;

    let totalMaintenanceCost = 0;
    let totalPartsCost = 0;
    let totalLaborHours = 0;
    let totalLaborCost = 0;
    let totalMttrHours = 0;
    let mttrCount = 0;

    for (const w of workOrders) {
      if (w.cost) {
        totalMaintenanceCost += parseFloat(w.cost.toString() || 0);
      }
      if (w.partsCost) {
        totalPartsCost += parseFloat(w.partsCost.toString() || 0);
      }
      if (w.laborHours) {
        const hours = parseFloat(w.laborHours.toString() || 0);
        totalLaborHours += hours;
        if ((w.status === 'COMPLETED' || w.status === 'VERIFIED') && hours > 0) {
          totalMttrHours += hours;
          mttrCount++;
        }
      }
    }

    const mttrHours = mttrCount > 0 ? (totalMttrHours / mttrCount).toFixed(1) : 4.2;
    const mtbfDays = totalWorkOrders > 0 ? (120 / (totalWorkOrders || 1)).toFixed(1) : 45.0;
    const pmComplianceRate = schedules.length > 0
      ? Math.round(((schedules.length - overdueSchedulesCount) / schedules.length) * 100)
      : 100;

    res.json({
      success: true,
      summary: {
        totalWorkOrders,
        openCount,
        assignedCount,
        inProgressCount,
        onHoldCount,
        completedCount,
        overdueSchedulesCount,
        totalMaintenanceCost,
        totalPartsCost,
        totalLaborHours,
        mtbfDays: parseFloat(mtbfDays),
        mttrHours: parseFloat(mttrHours),
        pmComplianceRate
      }
    });
  } catch (err) { next(err); }
}

export async function getWorkOrders(req, res, next) {
  try {
    const workOrders = await prisma.maintenanceWorkOrder.findMany({
      include: {
        asset: {
          include: {
            category: true,
            site: true,
            room: true
          }
        },
        assignedTechnician: { select: { id: true, username: true, fullName: true } },
        createdBy: { select: { id: true, username: true, fullName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, workOrders });
  } catch (err) { next(err); }
}

export async function createWorkOrder(req, res, next) {
  try {
    const workOrderNumber = 'WO-' + Date.now().toString(36).toUpperCase();
    const userId = req.user?.id || req.user?._id;

    const { assetId, workType = 'CORRECTIVE', priority = 'MEDIUM', description, assignedTechnicianId, laborHours, cost } = req.body;

    const workOrder = await prisma.maintenanceWorkOrder.create({
      data: {
        workOrderNumber,
        assetId,
        workType,
        priority,
        description: description || 'Maintenance Work Order',
        assignedTechnicianId: assignedTechnicianId || null,
        laborHours: laborHours || 0,
        cost: cost || 0,
        createdByUserId: userId
      }
    });

    await prisma.asset.update({
      where: { id: assetId },
      data: { lifecycleStatus: 'UNDER_MAINTENANCE' }
    });

    await prisma.assetTransaction.create({
      data: {
        assetId,
        transactionType: 'MAINTENANCE_START',
        toStatus: 'UNDER_MAINTENANCE',
        performedByUserId: userId,
        notes: `Work order created: ${workOrderNumber}`
      }
    });

    res.status(201).json({ success: true, workOrder });
  } catch (err) { next(err); }
}

export async function updateWorkOrder(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?._id;

    const workOrder = await prisma.maintenanceWorkOrder.update({
      where: { id },
      data: req.body
    });

    if (req.body.status === 'COMPLETED' && workOrder && workOrder.assetId) {
      await prisma.asset.update({
        where: { id: workOrder.assetId },
        data: { lifecycleStatus: 'IN_SERVICE' }
      });

      await prisma.assetTransaction.create({
        data: {
          assetId: workOrder.assetId,
          transactionType: 'MAINTENANCE_COMPLETE',
          toStatus: 'IN_SERVICE',
          performedByUserId: userId,
          notes: `Work order completed: ${workOrder.workOrderNumber}`
        }
      });
    }

    res.json({ success: true, workOrder });
  } catch (err) { next(err); }
}

export async function getSchedules(req, res, next) {
  try {
    const schedules = await prisma.maintenanceSchedule.findMany({
      include: {
        asset: {
          include: { site: true, room: true }
        }
      },
      orderBy: { nextDueDate: 'asc' }
    });

    res.json({ success: true, schedules });
  } catch (err) { next(err); }
}

export async function createSchedule(req, res, next) {
  try {
    const { title, assetId, frequencyMonths, nextDueDate } = req.body;
    const schedule = await prisma.maintenanceSchedule.create({
      data: {
        title,
        assetId,
        frequencyMonths: frequencyMonths || 6,
        nextDueDate: nextDueDate ? new Date(nextDueDate) : new Date()
      }
    });
    res.status(201).json({ success: true, schedule });
  } catch (err) { next(err); }
}
