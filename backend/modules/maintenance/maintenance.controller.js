import prisma from '../../config/prisma.js';
import { randomUUID } from 'node:crypto';
import { resolveDbUserId } from '../assets/asset.controller.js';

// Status transition validation matrix according to FSD rules:
// Open -> Assigned -> In Progress -> On Hold -> Completed -> Verified/Closed
const ALLOWED_TRANSITIONS = {
  OPEN: ['ASSIGNED', 'IN_PROGRESS', 'CANCELLED'],
  ASSIGNED: ['IN_PROGRESS', 'OPEN', 'ON_HOLD', 'CANCELLED'],
  IN_PROGRESS: ['ON_HOLD', 'COMPLETED', 'ASSIGNED', 'CANCELLED'],
  ON_HOLD: ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
  COMPLETED: ['VERIFIED', 'CLOSED', 'IN_PROGRESS'],
  VERIFIED: ['CLOSED'],
  CLOSED: [],
  CANCELLED: ['OPEN']
};

export async function getMaintenanceSummary(req, res, next) {
  try {
    const [workOrders, schedules] = await Promise.all([
      prisma.maintenanceWorkOrder.findMany({ where: { asset: { is: req.dataScopeFilter || {} } } }),
      prisma.maintenanceSchedule.findMany({ where: { asset: { is: req.dataScopeFilter || {} } } })
    ]);

    const totalWorkOrders = workOrders.length;
    const openCount = workOrders.filter(w => w.status === 'OPEN').length;
    const assignedCount = workOrders.filter(w => w.status === 'ASSIGNED').length;
    const inProgressCount = workOrders.filter(w => w.status === 'IN_PROGRESS').length;
    const onHoldCount = workOrders.filter(w => w.status === 'ON_HOLD').length;
    const completedCount = workOrders.filter(w => w.status === 'COMPLETED' || w.status === 'VERIFIED' || w.status === 'CLOSED').length;

    const now = new Date();
    const overdueSchedulesCount = schedules.filter(s => s.active && s.nextDueDate && new Date(s.nextDueDate) < now).length;

    let totalMaintenanceCost = 0;
    let totalPartsCost = 0;
    let totalLaborHours = 0;
    let totalLaborCost = 0;
    const repairDurations = [];

    for (const w of workOrders) {
      if (w.cost) totalMaintenanceCost += parseFloat(w.cost.toString() || 0);
      if (w.partsCost) totalPartsCost += parseFloat(w.partsCost.toString() || 0);
      if (w.laborCost) totalLaborCost += parseFloat(w.laborCost.toString() || 0);
      if (w.laborHours) {
        const hours = parseFloat(w.laborHours.toString() || 0);
        totalLaborHours += hours;
      }
      if (['COMPLETED', 'VERIFIED', 'CLOSED'].includes(w.status) && w.startedDate && w.completedDate) {
        const elapsedHours = (new Date(w.completedDate) - new Date(w.startedDate)) / 3600000;
        if (Number.isFinite(elapsedHours) && elapsedHours >= 0) repairDurations.push(elapsedHours);
      }
    }

    const mttrHours = repairDurations.length ? Number((repairDurations.reduce((sum, hours) => sum + hours, 0) / repairDurations.length).toFixed(1)) : null;
    const activeSchedulesCount = schedules.filter(schedule => schedule.active).length;
    const pmComplianceRate = activeSchedulesCount > 0
      ? Math.round(((activeSchedulesCount - overdueSchedulesCount) / activeSchedulesCount) * 100)
      : 0;

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
        totalLaborCost,
        mtbfDays: null,
        mttrHours,
        pmComplianceRate
      }
    });
  } catch (err) { next(err); }
}

export async function getMaintenanceAssets(req, res, next) {
  try {
    const assets = await prisma.asset.findMany({
      where: { ...req.dataScopeFilter, active: true },
      select: {
        id: true, assetId: true, description: true, serialNumber: true, lifecycleStatus: true,
        categoryId: true, siteId: true, buildingId: true, floorId: true, roomId: true,
        category: { select: { id: true, name: true } },
        site: { select: { id: true, name: true } },
        building: { select: { id: true, name: true } },
        room: { select: { id: true, name: true } },
        manufacturer: { select: { name: true } },
        model: { select: { name: true } },
        custodian: { select: { id: true, fullName: true } }
      },
      orderBy: { assetId: 'asc' }
    });
    res.json({ success: true, assets });
  } catch (err) { next(err); }
}

export async function getMaintenanceTechnicians(req, res, next) {
  try {
    const technicians = await prisma.user.findMany({
      where: { active: true, ...(req.dataScopeFilter?.companyId ? { companyId: req.dataScopeFilter.companyId } : {}) },
      select: { id: true, fullName: true, username: true, email: true, role: { select: { code: true, name: true } } },
      orderBy: { fullName: 'asc' }
    });
    res.json({ success: true, technicians });
  } catch (err) { next(err); }
}

export async function getWorkOrders(req, res, next) {
  try {
    const { 
      search, 
      status, 
      priority, 
      workType, 
      categoryId, 
      location, 
      assignedTechnicianId, 
      startDate, 
      endDate 
    } = req.query;

    const assetScope = { ...(req.dataScopeFilter || {}) };
    if (categoryId && categoryId !== 'ALL') assetScope.categoryId = String(categoryId);
    if (location && location !== 'ALL') assetScope.siteId = String(location);
    const where = { asset: { is: assetScope } };

    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (priority && priority !== 'ALL') {
      where.priority = priority;
    }
    if (workType && workType !== 'ALL') {
      where.workType = workType;
    }
    if (assignedTechnicianId) {
      where.assignedTechnicianId = assignedTechnicianId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        const from = new Date(`${startDate}T00:00:00.000Z`);
        if (Number.isNaN(from.getTime())) return res.status(400).json({ success: false, message: 'Invalid start date.' });
        where.createdAt.gte = from;
      }
      if (endDate) {
        const through = new Date(`${endDate}T00:00:00.000Z`);
        if (Number.isNaN(through.getTime())) return res.status(400).json({ success: false, message: 'Invalid end date.' });
        through.setUTCDate(through.getUTCDate() + 1);
        where.createdAt.lt = through;
      }
    }

    const searchText = String(search || '').trim();
    if (searchText) {
      where.OR = [
        { workOrderNumber: { contains: searchText } },
        { description: { contains: searchText } },
        { asset: { is: { ...assetScope, OR: [
          { assetId: { contains: searchText } },
          { description: { contains: searchText } },
          { serialNumber: { contains: searchText } }
        ] } } },
        { assignedTechnician: { is: { fullName: { contains: searchText } } } }
      ];
    }

    let includeConfig = {
      asset: {
        include: {
          category: true,
          site: true,
          building: true,
          floor: true,
          room: true,
          custodian: true,
          manufacturer: true,
          model: true,
          warranty: true,
          contractLinks: {
            include: { contract: true }
          }
        }
      },
      assignedTechnician: { select: { id: true, username: true, fullName: true, email: true } },
      createdBy: { select: { id: true, username: true, fullName: true } },
      partsUsed: true,
      checklist: true,
      timeLogs: true,
      statusHistory: { orderBy: { createdAt: 'desc' } }
    };

    const workOrders = await prisma.maintenanceWorkOrder.findMany({
      where,
      include: includeConfig,
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, workOrders });
  } catch (err) { next(err); }
}

export async function getWorkOrderById(req, res, next) {
  try {
    const workOrder = await prisma.maintenanceWorkOrder.findFirst({
      where: { id: req.params.id, asset: { is: req.dataScopeFilter || {} } },
      include: {
        asset: { include: { category: true, site: true, building: true, floor: true, room: true, custodian: true, manufacturer: true, model: true } },
        assignedTechnician: { select: { id: true, username: true, fullName: true, email: true } },
        createdBy: { select: { id: true, username: true, fullName: true } },
        partsUsed: true,
        checklist: true,
        timeLogs: { orderBy: { workDate: 'desc' } },
        statusHistory: { orderBy: { createdAt: 'desc' } }
      }
    });
    if (!workOrder) return res.status(404).json({ success: false, message: 'Work order not found.' });
    res.json({ success: true, workOrder });
  } catch (err) { next(err); }
}

export async function updateWorkOrder(req, res, next) {
  try {
    const current = await prisma.maintenanceWorkOrder.findFirst({
      where: { id: req.params.id, asset: { is: req.dataScopeFilter || {} } }
    });
    if (!current) return res.status(404).json({ success: false, message: 'Work order not found.' });
    if (['CLOSED', 'CANCELLED'].includes(current.status)) {
      return res.status(400).json({ success: false, message: 'This work order can no longer be edited.' });
    }

    const allowedTypes = ['CORRECTIVE', 'PREVENTIVE', 'INSPECTION', 'EMERGENCY'];
    const allowedPriorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const data = {};
    if ('description' in req.body) {
      const description = String(req.body.description || '').trim();
      if (!description) return res.status(400).json({ success: false, message: 'Description is required.' });
      data.description = description;
    }
    if ('workType' in req.body) {
      const workType = String(req.body.workType).toUpperCase();
      if (!allowedTypes.includes(workType)) return res.status(400).json({ success: false, message: 'Invalid maintenance type.' });
      data.workType = workType;
    }
    if ('priority' in req.body) {
      const priority = String(req.body.priority).toUpperCase();
      if (!allowedPriorities.includes(priority)) return res.status(400).json({ success: false, message: 'Invalid priority.' });
      data.priority = priority;
    }
    if ('scheduledDate' in req.body) {
      const date = req.body.scheduledDate ? new Date(req.body.scheduledDate) : null;
      if (date && Number.isNaN(date.getTime())) return res.status(400).json({ success: false, message: 'Invalid scheduled date.' });
      data.scheduledDate = date;
    }
    if ('dueTargetDate' in req.body) {
      const date = req.body.dueTargetDate ? new Date(req.body.dueTargetDate) : null;
      if (date && Number.isNaN(date.getTime())) return res.status(400).json({ success: false, message: 'Invalid due date.' });
      data.completionTargetDate = date;
    }
    if ('vendorName' in req.body) data.vendorName = String(req.body.vendorName || '').trim() || null;
    if ('notes' in req.body) data.notes = String(req.body.notes || '').trim() || null;
    if (Object.keys(data).length === 0) return res.status(400).json({ success: false, message: 'No work order changes were provided.' });

    const workOrder = await prisma.maintenanceWorkOrder.update({ where: { id: current.id }, data });
    res.json({ success: true, workOrder });
  } catch (err) { next(err); }
}

export async function createWorkOrder(req, res, next) {
  try {
    const { assetId, workType = 'CORRECTIVE', priority = 'MEDIUM', description, assignedTechnicianId, scheduledDate, dueTargetDate, failureCode, rootCause, vendorName, notes } = req.body;
    const allowedTypes = ['CORRECTIVE', 'PREVENTIVE', 'INSPECTION', 'EMERGENCY'];
    const allowedPriorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    if (!assetId || !String(description || '').trim()) return res.status(400).json({ success: false, message: 'Select a database asset and enter a problem description.' });
    if (!allowedTypes.includes(String(workType).toUpperCase())) return res.status(400).json({ success: false, message: 'Choose a valid maintenance type.' });
    if (!allowedPriorities.includes(String(priority).toUpperCase())) return res.status(400).json({ success: false, message: 'Choose a valid priority.' });

    const asset = await prisma.asset.findFirst({ where: { id: assetId, ...req.dataScopeFilter }, select: { id: true, assetId: true, lifecycleStatus: true } });
    if (!asset) return res.status(404).json({ success: false, message: 'The selected asset was not found or is outside your access scope.' });
    if (['DISPOSED', 'RETIRED'].includes(String(asset.lifecycleStatus).toUpperCase())) return res.status(400).json({ success: false, message: 'A disposed or retired asset cannot receive a work order.' });
    if (assignedTechnicianId) {
      const technician = await prisma.user.findFirst({ where: { id: assignedTechnicianId, active: true, ...(req.dataScopeFilter?.companyId ? { companyId: req.dataScopeFilter.companyId } : {}) }, select: { id: true } });
      if (!technician) return res.status(400).json({ success: false, message: 'Choose an active maintenance technician.' });
    }
    const activeOrder = await prisma.maintenanceWorkOrder.findFirst({ where: { assetId: asset.id, status: { in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD'] } }, select: { workOrderNumber: true } });
    if (activeOrder) return res.status(409).json({ success: false, message: `Asset ${asset.assetId} already has open work order ${activeOrder.workOrderNumber}.` });

    const userId = await resolveDbUserId(req.user);
    const scheduled = scheduledDate ? new Date(scheduledDate) : new Date();
    const due = dueTargetDate ? new Date(dueTargetDate) : null;
    if (Number.isNaN(scheduled.getTime()) || (due && Number.isNaN(due.getTime()))) return res.status(400).json({ success: false, message: 'Enter valid scheduled and due dates.' });
    const workOrderNumber = `WO-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;
    const status = assignedTechnicianId ? 'ASSIGNED' : 'OPEN';
    const workOrder = await prisma.$transaction(async (tx) => {
      const created = await tx.maintenanceWorkOrder.create({
        data: {
          workOrderNumber, assetId: asset.id, workType: String(workType).toUpperCase(), priority: String(priority).toUpperCase(),
          status, description: String(description).trim(), assignedTechnicianId: assignedTechnicianId || null,
          vendorName: vendorName?.trim() || null, scheduledDate: scheduled, completionTargetDate: due,
          failureCode: failureCode || null, rootCause: rootCause || null, notes: notes?.trim() || null, createdByUserId: userId
        }
      });
      await tx.asset.update({ where: { id: asset.id }, data: { lifecycleStatus: 'UNDER_MAINTENANCE' } });
      await tx.assetTransaction.create({
        data: { assetId: asset.id, transactionType: 'MAINTENANCE_START', fromStatus: asset.lifecycleStatus, toStatus: 'UNDER_MAINTENANCE', performedByUserId: userId, notes: `Work order created: ${workOrderNumber} (${workType})` }
      });
      await tx.workOrderStatusHistory.create({ data: { workOrderId: created.id, fromStatus: null, toStatus: status, changedBy: req.user?.fullName || req.user?.username || 'System User', comments: 'Work order created' } });
      return tx.maintenanceWorkOrder.findUnique({ where: { id: created.id }, include: { asset: { include: { category: true, site: true } }, assignedTechnician: { select: { id: true, fullName: true, username: true } }, partsUsed: true, timeLogs: true, statusHistory: true } });
    });
    res.status(201).json({ success: true, workOrder });
  } catch (err) { next(err); }
}

export async function updateWorkOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, comments, assignedTechnicianId } = req.body;
    const userId = await resolveDbUserId(req.user);
    const username = req.user?.username || req.user?.fullName || 'System User';

    const currentWO = await prisma.maintenanceWorkOrder.findFirst({ where: { id, asset: { is: req.dataScopeFilter || {} } } });
    if (!currentWO) {
      return res.status(404).json({ success: false, message: 'Work order not found' });
    }

    const currentStatus = currentWO.status || 'OPEN';
    if (['COMPLETED', 'VERIFIED', 'CLOSED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Use the Close Work Order form to record completion details.' });
    }
    if (assignedTechnicianId) {
      const technician = await prisma.user.findFirst({ where: { id: assignedTechnicianId, active: true, ...(req.dataScopeFilter?.companyId ? { companyId: req.dataScopeFilter.companyId } : {}) }, select: { id: true } });
      if (!technician) return res.status(400).json({ success: false, message: 'Choose an active technician.' });
    }
    if (status === 'ASSIGNED' && !(assignedTechnicianId || currentWO.assignedTechnicianId)) {
      return res.status(400).json({ success: false, message: 'Select a technician before assigning the work order.' });
    }
    if (status === currentStatus && !assignedTechnicianId && !String(comments || '').trim()) {
      return res.status(400).json({ success: false, message: 'Choose a new status, technician, or enter a comment.' });
    }
    if (currentStatus === 'CANCELLED' && status === 'OPEN') {
      const anotherActive = await prisma.maintenanceWorkOrder.findFirst({ where: { assetId: currentWO.assetId, id: { not: id }, status: { in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD'] } }, select: { workOrderNumber: true } });
      if (anotherActive) return res.status(409).json({ success: false, message: `Asset already has open work order ${anotherActive.workOrderNumber}.` });
    }

    // Validate status transition rule if status is changing
    if (status && status !== currentStatus) {
      const validNextStatuses = ALLOWED_TRANSITIONS[currentStatus] || [];
      if (!validNextStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status transition from ${currentStatus} to ${status}. Allowed next states: ${validNextStatuses.join(', ') || 'None'}`
        });
      }
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (assignedTechnicianId) updateData.assignedTechnicianId = assignedTechnicianId;

    if (status === 'IN_PROGRESS' && !currentWO.startedDate) {
      updateData.startedDate = new Date();
    }
    const updatedWO = await prisma.$transaction(async (tx) => {
      const updated = await tx.maintenanceWorkOrder.update({ where: { id }, data: updateData });
      if ((status && status !== currentStatus) || String(comments || '').trim()) {
        await tx.workOrderStatusHistory.create({
          data: { workOrderId: id, fromStatus: currentStatus, toStatus: status || currentStatus, changedBy: username, comments: comments || `Status changed from ${currentStatus} to ${status}` }
        });
      }
      if ((status === 'CANCELLED' || (currentStatus === 'CANCELLED' && status === 'OPEN')) && currentWO.assetId) {
        const toStatus = status === 'CANCELLED' ? 'IN_SERVICE' : 'UNDER_MAINTENANCE';
        const asset = await tx.asset.findUnique({ where: { id: currentWO.assetId }, select: { lifecycleStatus: true } });
        await tx.asset.update({ where: { id: currentWO.assetId }, data: { lifecycleStatus: toStatus } });
        await tx.assetTransaction.create({
          data: { assetId: currentWO.assetId, transactionType: status === 'CANCELLED' ? 'MAINTENANCE_CANCEL' : 'MAINTENANCE_START', fromStatus: asset?.lifecycleStatus, toStatus, performedByUserId: userId, notes: `Work Order ${currentWO.workOrderNumber} marked as ${status}` }
        });
      }
      if (status === 'CANCELLED') {
        await tx.maintenanceScheduleRun.deleteMany({ where: { workOrderId: id } });
      }
      return updated;
    });

    res.json({ success: true, workOrder: updatedWO });
  } catch (err) { next(err); }
}

export async function addTimeLog(req, res, next) {
  try {
    const { id } = req.params;
    const { technician, workDate, startTime, endTime, hoursWorked, activity, remarks, hourlyRate = 0 } = req.body;
    const hours = Number(hoursWorked);
    const rate = Number(hourlyRate);
    const date = workDate ? new Date(workDate) : new Date();
    if (!Number.isFinite(hours) || hours <= 0 || hours > 24) return res.status(400).json({ success: false, message: 'Hours worked must be greater than 0 and no more than 24.' });
    if (!Number.isFinite(rate) || rate < 0) return res.status(400).json({ success: false, message: 'Hourly rate must be zero or greater.' });
    if (Number.isNaN(date.getTime())) return res.status(400).json({ success: false, message: 'Enter a valid work date.' });
    if (!String(activity || '').trim()) return res.status(400).json({ success: false, message: 'Enter the activity performed.' });
    const result = await prisma.$transaction(async (tx) => {
      const wo = await tx.maintenanceWorkOrder.findFirst({ where: { id, asset: { is: req.dataScopeFilter || {} } } });
      if (!wo) return null;
      const addedLaborCost = hours * rate;
      const currentHours = Number(wo.laborHours || 0);
      const currentLaborCost = Number(wo.laborCost || 0);
      const currentPartsCost = Number(wo.partsCost || 0);
      const timeLog = await tx.workOrderTimeLog.create({
        data: {
          workOrderId: id, technician: String(technician || req.user?.fullName || req.user?.username || 'Technician').trim(),
          workDate: date, startTime: startTime || null, endTime: endTime || null,
          hoursWorked: hours, activity: String(activity).trim(), remarks: remarks?.trim() || null
        }
      });
      const workOrder = await tx.maintenanceWorkOrder.update({
        where: { id },
        data: { laborHours: currentHours + hours, laborCost: currentLaborCost + addedLaborCost, cost: currentLaborCost + addedLaborCost + currentPartsCost }
      });
      return { timeLog, workOrder };
    });
    if (!result) return res.status(404).json({ success: false, message: 'Work order not found.' });
    res.status(201).json({ success: true, ...result });
  } catch (err) { next(err); }
}

export async function addPartsUsed(req, res, next) {
  try {
    const { id } = req.params;
    const { partName, partNumber, quantity = 1, unitCost = 0 } = req.body;

    if (!partName) {
      return res.status(400).json({ success: false, message: 'Part name is required' });
    }

    const qty = Number(quantity);
    const price = Number(unitCost);
    if (!Number.isInteger(qty) || qty < 1) return res.status(400).json({ success: false, message: 'Quantity must be a positive whole number.' });
    if (!Number.isFinite(price) || price < 0) return res.status(400).json({ success: false, message: 'Unit cost must be zero or greater.' });
    const totalCost = qty * price;
    const result = await prisma.$transaction(async (tx) => {
      const wo = await tx.maintenanceWorkOrder.findFirst({ where: { id, asset: { is: req.dataScopeFilter || {} } } });
      if (!wo) return null;
      const part = await tx.workOrderPart.create({ data: { workOrderId: id, partName: String(partName).trim(), partNumber: partNumber?.trim() || null, quantity: qty, unitCost: price, totalCost } });
      const currentLaborCost = Number(wo.laborCost || 0);
      const newPartsCost = Number(wo.partsCost || 0) + totalCost;
      const workOrder = await tx.maintenanceWorkOrder.update({ where: { id }, data: { partsCost: newPartsCost, cost: currentLaborCost + newPartsCost } });
      return { part, workOrder };
    });
    if (!result) return res.status(404).json({ success: false, message: 'Work order not found.' });
    res.status(201).json({ success: true, ...result });
  } catch (err) { next(err); }
}

export async function closeWorkOrder(req, res, next) {
  try {
    const { id } = req.params;
    const { 
      workPerformed, 
      failureCode, 
      rootCause, 
      downtimeHours, 
      completionComments,
      supervisorVerification 
    } = req.body;

    const userId = await resolveDbUserId(req.user);
    const username = req.user?.fullName || req.user?.username || 'Supervisor';

    const wo = await prisma.maintenanceWorkOrder.findFirst({
      where: { id, asset: { is: req.dataScopeFilter || {} } },
      include: { partsUsed: true, checklist: true }
    });

    if (!wo) {
      return res.status(404).json({ success: false, message: 'Work order not found' });
    }
    if (['CLOSED', 'CANCELLED', 'VERIFIED'].includes(wo.status)) {
      return res.status(400).json({ success: false, message: `A ${wo.status.toLowerCase()} work order cannot be closed again.` });
    }
    if (wo.status === 'COMPLETED' && !supervisorVerification) {
      return res.status(400).json({ success: false, message: 'Select supervisor verification to verify an already completed work order.' });
    }

    // FSD Validation checks for mandatory completion information:
    const finalFailureCode = failureCode || wo.failureCode;
    const finalRootCause = rootCause || wo.rootCause;

    if (!String(workPerformed || '').trim()) {
      return res.status(400).json({ success: false, message: 'Work performed details must be specified before closure.' });
    }
    const downtime = Number(downtimeHours || 0);
    if (!Number.isFinite(downtime) || downtime < 0) return res.status(400).json({ success: false, message: 'Downtime hours must be zero or greater.' });

    const targetStatus = supervisorVerification ? 'VERIFIED' : 'COMPLETED';

    const updatedWO = await prisma.$transaction(async (tx) => {
      const completedAt = new Date();
      const updated = await tx.maintenanceWorkOrder.update({
        where: { id },
        data: {
          status: targetStatus, startedDate: wo.startedDate || completedAt, completedDate: completedAt, failureCode: finalFailureCode || null,
          rootCause: finalRootCause || null,
          notes: [wo.notes, `Work performed: ${String(workPerformed).trim()}`, `Downtime hours: ${downtime}`, completionComments ? `Closure note: ${String(completionComments).trim()}` : null].filter(Boolean).join('\n')
        }
      });
      await tx.workOrderStatusHistory.create({ data: { workOrderId: id, fromStatus: wo.status, toStatus: targetStatus, changedBy: username, comments: completionComments?.trim() || 'Work order completed' } });
      if (wo.status !== 'COMPLETED') {
        const scheduleRun = await tx.maintenanceScheduleRun.findFirst({ where: { workOrderId: id } });
        if (scheduleRun) {
          const schedule = await tx.maintenanceSchedule.findUnique({ where: { id: scheduleRun.scheduleId } });
          if (schedule) {
            const nextDueDate = new Date(completedAt);
            nextDueDate.setUTCMonth(nextDueDate.getUTCMonth() + schedule.frequencyMonths);
            await tx.maintenanceSchedule.update({ where: { id: schedule.id }, data: { lastPerformedDate: completedAt, nextDueDate } });
          }
        }
      }
      if (wo.assetId) {
        const asset = await tx.asset.findUnique({ where: { id: wo.assetId }, select: { lifecycleStatus: true } });
        await tx.asset.update({ where: { id: wo.assetId }, data: { lifecycleStatus: 'IN_SERVICE' } });
        await tx.assetTransaction.create({ data: { assetId: wo.assetId, transactionType: 'MAINTENANCE_CLOSE', fromStatus: asset?.lifecycleStatus, toStatus: 'IN_SERVICE', performedByUserId: userId, notes: `Work order ${wo.workOrderNumber} closed by ${username}` } });
      }
      return updated;
    });

    res.json({ 
      success: true, 
      message: `Work Order ${wo.workOrderNumber} ${targetStatus === 'VERIFIED' ? 'verified' : 'completed'}.`,
      workOrder: updatedWO 
    });
  } catch (err) { next(err); }
}

export async function getAssetMaintenanceHistory(req, res, next) {
  try {
    const { assetId } = req.params;
    const scopedAsset = await prisma.asset.findFirst({ where: { id: assetId, ...req.dataScopeFilter }, select: { id: true } });
    if (!scopedAsset) return res.status(404).json({ success: false, message: 'Asset not found.' });

    const workOrders = await prisma.maintenanceWorkOrder.findMany({
      where: { assetId: scopedAsset.id },
      include: {
        assignedTechnician: { select: { id: true, fullName: true, username: true } },
        partsUsed: true,
        checklist: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, history: workOrders });
  } catch (err) { next(err); }
}

export async function getSchedules(req, res, next) {
  try {
    const schedules = await prisma.maintenanceSchedule.findMany({
      where: { asset: { is: req.dataScopeFilter || {} } },
      include: {
        asset: {
          include: { site: true, room: true, category: true }
        }
      },
      orderBy: { nextDueDate: 'asc' }
    });

    res.json({ success: true, schedules });
  } catch (err) { next(err); }
}

export async function createSchedule(req, res, next) {
  try {
    const { title, assetId, frequencyMonths, nextDueDate, description, workType = 'PREVENTIVE', active = true, autoGenerateWorkOrders = false, advanceDays = 7, checklist = [] } = req.body;

    const months = Number(frequencyMonths);
    const due = new Date(nextDueDate);
    if (!String(title || '').trim() || !assetId || !nextDueDate) {
      return res.status(400).json({ success: false, message: 'Title, asset, and next due date are required.' });
    }
    if (!Number.isInteger(months) || months < 1 || months > 120 || Number.isNaN(due.getTime())) return res.status(400).json({ success: false, message: 'Enter a valid frequency (1 to 120 months) and due date.' });
    if (!['PREVENTIVE', 'INSPECTION'].includes(workType)) return res.status(400).json({ success: false, message: 'Choose a valid schedule type.' });
    if (!Number.isInteger(Number(advanceDays)) || Number(advanceDays) < 0 || Number(advanceDays) > 90) return res.status(400).json({ success: false, message: 'Advance days must be 0 to 90.' });
    if (!Array.isArray(checklist) || checklist.length > 30 || checklist.some(task => !String(task).trim() || String(task).length > 200)) return res.status(400).json({ success: false, message: 'Checklist must contain up to 30 nonempty tasks.' });
    const asset = await prisma.asset.findFirst({ where: { id: assetId, ...req.dataScopeFilter }, select: { id: true } });
    if (!asset) return res.status(404).json({ success: false, message: 'The selected asset was not found or is outside your access scope.' });

    const schedule = await prisma.maintenanceSchedule.create({
      data: {
        title: String(title).trim(),
        description: String(description || '').trim() || null,
        workType,
        assetId,
        frequencyMonths: months,
        nextDueDate: due,
        active: Boolean(active),
        autoGenerateWorkOrders: Boolean(autoGenerateWorkOrders),
        advanceDays: Number(advanceDays),
        checklistJson: JSON.stringify(checklist.map(task => String(task).trim()))
      }
    });
    res.status(201).json({ success: true, schedule });
  } catch (err) { next(err); }
}


export async function updateSchedule(req, res, next) {
  try {
    const current = await prisma.maintenanceSchedule.findFirst({ where: { id: req.params.id, asset: { is: req.dataScopeFilter || {} } } });
    if (!current) return res.status(404).json({ success: false, message: 'Schedule not found.' });
    const { title, assetId, frequencyMonths, nextDueDate, active, description, workType, autoGenerateWorkOrders, advanceDays, checklist } = req.body;
    const months = frequencyMonths === undefined ? current.frequencyMonths : Number(frequencyMonths);
    if (!Number.isInteger(months) || months < 1 || months > 120) return res.status(400).json({ success: false, message: 'Frequency must be 1 to 120 months.' });
    const due = nextDueDate === undefined ? current.nextDueDate : new Date(nextDueDate);
    if (Number.isNaN(due.getTime())) return res.status(400).json({ success: false, message: 'A valid due date is required.' });
    if (title !== undefined && !String(title).trim()) return res.status(400).json({ success: false, message: 'Schedule title is required.' });
    if (workType !== undefined && !['PREVENTIVE', 'INSPECTION'].includes(workType)) return res.status(400).json({ success: false, message: 'Choose a valid schedule type.' });
    if (advanceDays !== undefined && (!Number.isInteger(Number(advanceDays)) || Number(advanceDays) < 0 || Number(advanceDays) > 90)) return res.status(400).json({ success: false, message: 'Advance days must be 0 to 90.' });
    if (checklist !== undefined && (!Array.isArray(checklist) || checklist.length > 30 || checklist.some(task => !String(task).trim() || String(task).length > 200))) return res.status(400).json({ success: false, message: 'Checklist must contain up to 30 nonempty tasks.' });
    if (assetId) {
      const asset = await prisma.asset.findFirst({ where: { id: assetId, ...req.dataScopeFilter }, select: { id: true } });
      if (!asset) return res.status(404).json({ success: false, message: 'Asset not found.' });
      if (assetId !== current.assetId && await prisma.maintenanceScheduleRun.count({ where: { scheduleId: current.id } })) return res.status(409).json({ success: false, message: 'This schedule already generated work orders; create a new schedule for another asset.' });
    }
    const schedule = await prisma.maintenanceSchedule.update({
      where: { id: req.params.id },
      data: {
        title: title === undefined ? current.title : String(title).trim(),
        description: description === undefined ? current.description : String(description || '').trim() || null,
        workType: workType === undefined ? current.workType : workType,
        assetId: assetId === undefined ? current.assetId : assetId,
        frequencyMonths: months,
        nextDueDate: due,
        active: active === undefined ? current.active : Boolean(active),
        autoGenerateWorkOrders: autoGenerateWorkOrders === undefined ? current.autoGenerateWorkOrders : Boolean(autoGenerateWorkOrders),
        advanceDays: advanceDays === undefined ? current.advanceDays : Number(advanceDays),
        checklistJson: checklist === undefined ? current.checklistJson : JSON.stringify(checklist.map(task => String(task).trim()))
      },
      include: { asset: { include: { site: true, room: true, category: true } } }
    });
    res.json({ success: true, schedule });
  } catch (err) { next(err); }
}
