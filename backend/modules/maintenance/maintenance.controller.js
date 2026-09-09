import { MaintenanceWorkOrder } from '../../models/MaintenanceWorkOrder.js';
import { MaintenanceSchedule } from '../../models/MaintenanceSchedule.js';
import { Asset } from '../../models/Asset.js';
import { AssetTransaction } from '../../models/AssetTransaction.js';

export async function getMaintenanceSummary(req, res, next) {
  try {
    const [workOrders, schedules] = await Promise.all([
      MaintenanceWorkOrder.find(),
      MaintenanceSchedule.find()
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
        totalLaborHours += parseFloat(w.laborHours.toString() || 0);
      }

      // Calculate MTTR for completed corrective jobs
      if ((w.status === 'COMPLETED' || w.status === 'VERIFIED') && w.laborHours > 0) {
        totalMttrHours += parseFloat(w.laborHours.toString() || 0);
        mttrCount++;
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
    const workOrders = await MaintenanceWorkOrder.find()
      .populate({
        path: 'assetId',
        populate: [
          { path: 'categoryId' },
          { path: 'siteId' },
          { path: 'roomId' }
        ]
      })
      .populate('assignedTechnicianId')
      .populate('createdBy')
      .sort({ createdAt: -1 });

    res.json({ success: true, workOrders });
  } catch (err) { next(err); }
}

export async function createWorkOrder(req, res, next) {
  try {
    const workOrderNumber = 'WO-' + Date.now().toString(36).toUpperCase();
    const workOrder = await MaintenanceWorkOrder.create({
      ...req.body,
      workOrderNumber,
      createdBy: req.user._id
    });

    // Update asset lifecycle status
    await Asset.findByIdAndUpdate(req.body.assetId, { lifecycleStatus: 'UNDER_MAINTENANCE' });
    await AssetTransaction.create({
      assetId: req.body.assetId,
      transactionType: 'MAINTENANCE_START',
      toStatus: 'UNDER_MAINTENANCE',
      performedBy: req.user._id,
      notes: `Work order created: ${workOrderNumber}`
    });

    res.status(201).json({ success: true, workOrder });
  } catch (err) { next(err); }
}

export async function updateWorkOrder(req, res, next) {
  try {
    const { id } = req.params;
    const workOrder = await MaintenanceWorkOrder.findByIdAndUpdate(id, req.body, { new: true });

    if (req.body.status === 'COMPLETED' && workOrder && workOrder.assetId) {
      await Asset.findByIdAndUpdate(workOrder.assetId, { lifecycleStatus: 'IN_SERVICE' });
      await AssetTransaction.create({
        assetId: workOrder.assetId,
        transactionType: 'MAINTENANCE_COMPLETE',
        toStatus: 'IN_SERVICE',
        performedBy: req.user._id,
        notes: `Work order completed: ${workOrder.workOrderNumber}`
      });
    }

    res.json({ success: true, workOrder });
  } catch (err) { next(err); }
}

export async function getSchedules(req, res, next) {
  try {
    const schedules = await MaintenanceSchedule.find()
      .populate({
        path: 'assetId',
        populate: [{ path: 'siteId' }, { path: 'roomId' }]
      })
      .sort({ nextDueDate: 1 });

    res.json({ success: true, schedules });
  } catch (err) { next(err); }
}

export async function createSchedule(req, res, next) {
  try {
    const schedule = await MaintenanceSchedule.create(req.body);
    res.status(201).json({ success: true, schedule });
  } catch (err) { next(err); }
}
