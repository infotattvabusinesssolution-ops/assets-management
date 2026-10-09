import { randomUUID } from 'node:crypto';
import prisma from '../../config/prisma.js';
import { resolveDbUserId } from '../assets/asset.controller.js';

const include = {
  checklist: { orderBy: { sortOrder: 'asc' } },
  comments: { orderBy: { createdAt: 'desc' } },
  events: { orderBy: { createdAt: 'desc' } }
};
const actor = req => req.user?.fullName || req.user?.username || 'System User';
const scope = req => req.dataScopeFilter || {};
const planScope = req => scope(req).companyId ? { companyId: scope(req).companyId } : {};
const ids = plan => { try { return JSON.parse(plan.assetIdsJson || '[]'); } catch { return []; } };
const validTypes = ['PREVENTIVE', 'INSPECTION', 'CORRECTIVE'];
const validRules = ['CATEGORY', 'LOCATION', 'CUSTODIAN', 'SPECIFIC', 'FILTER'];

function assetWhere(plan, reqScope = {}) {
  const where = { ...reqScope, active: true, lifecycleStatus: { notIn: ['DISPOSED', 'RETIRED'] } };
  if (plan.companyId) where.companyId = plan.companyId;
  if (['CATEGORY', 'FILTER'].includes(plan.applyToRule) && plan.categoryId) where.categoryId = plan.categoryId;
  if (['LOCATION', 'FILTER'].includes(plan.applyToRule) && plan.siteId) where.siteId = plan.siteId;
  if (plan.applyToRule === 'CUSTODIAN') where.custodianId = plan.custodianId;
  if (plan.applyToRule === 'SPECIFIC') where.id = { in: ids(plan) };
  return where;
}

async function findPlan(req) {
  return prisma.maintenancePlan.findFirst({ where: { id: req.params.id, ...planScope(req) }, include });
}

function validate(body) {
  const name = String(body.name || '').trim();
  const workType = String(body.workType || 'PREVENTIVE').toUpperCase();
  const applyToRule = String(body.applyToRule || 'CATEGORY').toUpperCase();
  const frequencyMonths = Number(body.frequencyMonths);
  const advanceDays = Number(body.advanceDays ?? 7);
  const nextDueDate = new Date(body.nextDueDate);
  const assetIds = Array.isArray(body.assetIds) ? [...new Set(body.assetIds.map(String))] : [];
  if (!name) return { error: 'Enter a plan name.' };
  if (!validTypes.includes(workType) || !validRules.includes(applyToRule)) return { error: 'Choose a valid work type and asset rule.' };
  if (!Number.isInteger(frequencyMonths) || frequencyMonths < 1 || frequencyMonths > 120) return { error: 'Frequency must be 1 to 120 months.' };
  if (!Number.isInteger(advanceDays) || advanceDays < 0 || advanceDays > 90) return { error: 'Advance days must be 0 to 90.' };
  if (Number.isNaN(nextDueDate.getTime())) return { error: 'Enter a valid next due date.' };
  if (applyToRule === 'CATEGORY' && !body.categoryId) return { error: 'Select a category.' };
  if (applyToRule === 'LOCATION' && !body.siteId) return { error: 'Select a site.' };
  if (applyToRule === 'CUSTODIAN' && !body.custodianId) return { error: 'Select a custodian.' };
  if (applyToRule === 'FILTER' && !body.categoryId && !body.siteId) return { error: 'Select a category or site.' };
  if (applyToRule === 'SPECIFIC' && !assetIds.length) return { error: 'Select at least one asset.' };
  return { data: {
    name, description: String(body.description || '').trim() || null, workType, applyToRule,
    categoryId: ['CATEGORY', 'FILTER'].includes(applyToRule) ? body.categoryId || null : null,
    siteId: ['LOCATION', 'FILTER'].includes(applyToRule) ? body.siteId || null : null,
    custodianId: applyToRule === 'CUSTODIAN' ? body.custodianId : null,
    assetIdsJson: applyToRule === 'SPECIFIC' ? JSON.stringify(assetIds) : null,
    frequencyMonths, advanceDays, nextDueDate,
    active: body.active !== false, autoCreateWorkOrders: body.autoCreateWorkOrders === true
  } };
}

async function validateAssets(data, req) {
  const assets = await prisma.asset.findMany({ where: assetWhere(data, scope(req)), select: { companyId: true } });
  if (!assets.length) return 'No accessible registered assets match this plan.';
  if (data.applyToRule === 'SPECIFIC' && assets.length !== ids(data).length) return 'Some selected assets are unavailable or outside your access scope.';
  if (new Set(assets.map(asset => asset.companyId)).size > 1) return 'A plan can cover assets from one company. Narrow the category, site, or selected assets.';
  return null;
}

export async function listPlans(req, res, next) {
  try {
    const plans = await prisma.maintenancePlan.findMany({ where: planScope(req), orderBy: { updatedAt: 'desc' } });
    const counts = await Promise.all(plans.map(plan => prisma.asset.count({ where: assetWhere(plan, scope(req)) })));
    res.json({ success: true, plans: plans.map((plan, i) => ({ ...plan, assetIds: ids(plan), assetCount: counts[i] })) });
  } catch (error) { next(error); }
}

export async function getPlan(req, res, next) {
  try {
    const plan = await findPlan(req);
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found.' });
    const assets = await prisma.asset.findMany({ where: assetWhere(plan, scope(req)), select: { id: true, assetId: true, description: true, serialNumber: true, lifecycleStatus: true, category: { select: { name: true } }, site: { select: { name: true } }, custodian: { select: { fullName: true } } }, orderBy: { assetId: 'asc' } });
    const runs = await prisma.maintenancePlanRun.findMany({ where: { planId: plan.id }, orderBy: { createdAt: 'desc' } });
    const workOrders = await prisma.maintenanceWorkOrder.findMany({ where: { id: { in: runs.map(run => run.workOrderId) }, asset: { is: scope(req) } }, include: { asset: { select: { assetId: true, description: true } } } });
    const byId = new Map(workOrders.map(order => [order.id, order]));
    res.json({ success: true, plan: { ...plan, assetIds: ids(plan), assets, workOrders: runs.filter(run => byId.has(run.workOrderId)).map(run => ({ ...byId.get(run.workOrderId), planDueDate: run.dueDate })) } });
  } catch (error) { next(error); }
}

export async function createPlan(req, res, next) {
  try {
    const parsed = validate(req.body);
    if (parsed.error) return res.status(400).json({ success: false, message: parsed.error });
    const assetError = await validateAssets(parsed.data, req);
    if (assetError) return res.status(400).json({ success: false, message: assetError });
    const userId = await resolveDbUserId(req.user);
    const asset = await prisma.asset.findFirst({ where: assetWhere(parsed.data, scope(req)), select: { companyId: true } });
    const plan = await prisma.maintenancePlan.create({ data: {
      ...parsed.data, companyId: asset.companyId, createdByUserId: userId,
      planNumber: `MP-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`,
      events: { create: { action: 'CREATED', details: 'Plan created', actorName: actor(req) } }
    } });
    res.status(201).json({ success: true, plan });
  } catch (error) { next(error); }
}

export async function updatePlan(req, res, next) {
  try {
    const current = await findPlan(req);
    if (!current) return res.status(404).json({ success: false, message: 'Plan not found.' });
    const parsed = validate(req.body);
    if (parsed.error) return res.status(400).json({ success: false, message: parsed.error });
    const assetError = await validateAssets({ ...parsed.data, companyId: current.companyId }, req);
    if (assetError) return res.status(400).json({ success: false, message: assetError });
    const plan = await prisma.maintenancePlan.update({ where: { id: current.id }, data: { ...parsed.data, events: { create: { action: 'UPDATED', details: 'Plan settings updated', actorName: actor(req) } } } });
    res.json({ success: true, plan });
  } catch (error) { next(error); }
}

export async function addPlanTask(req, res, next) {
  try {
    const plan = await findPlan(req);
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found.' });
    const task = String(req.body.task || '').trim();
    if (!task) return res.status(400).json({ success: false, message: 'Enter a checklist task.' });
    const item = await prisma.$transaction(async tx => {
      const created = await tx.maintenancePlanChecklist.create({ data: { planId: plan.id, task, sortOrder: plan.checklist.length } });
      await tx.maintenancePlanEvent.create({ data: { planId: plan.id, action: 'CHECKLIST_UPDATED', details: `Added: ${task}`, actorName: actor(req) } });
      return created;
    });
    res.status(201).json({ success: true, item });
  } catch (error) { next(error); }
}

export async function deletePlanTask(req, res, next) {
  try {
    const plan = await findPlan(req);
    const task = plan?.checklist.find(item => item.id === req.params.taskId);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    await prisma.$transaction(async tx => {
      await tx.maintenancePlanChecklist.delete({ where: { id: task.id } });
      await tx.maintenancePlanEvent.create({ data: { planId: plan.id, action: 'CHECKLIST_UPDATED', details: `Removed: ${task.task}`, actorName: actor(req) } });
    });
    res.json({ success: true });
  } catch (error) { next(error); }
}

export async function addPlanComment(req, res, next) {
  try {
    const plan = await findPlan(req);
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found.' });
    const message = String(req.body.text || '').trim();
    if (!message) return res.status(400).json({ success: false, message: 'Enter a comment.' });
    const comment = await prisma.$transaction(async tx => {
      const created = await tx.maintenancePlanComment.create({ data: { planId: plan.id, text: message, authorName: actor(req) } });
      await tx.maintenancePlanEvent.create({ data: { planId: plan.id, action: 'COMMENTED', details: message, actorName: actor(req) } });
      return created;
    });
    res.status(201).json({ success: true, comment });
  } catch (error) { next(error); }
}

export async function generatePlanWorkOrders(planId, reqScope = {}, who = 'System Scheduler') {
  const plan = await prisma.maintenancePlan.findUnique({ where: { id: planId }, include: { checklist: true } });
  if (!plan?.active) return { created: 0, skipped: 0, message: 'Plan is inactive or missing.' };
  const today = new Date();
  const windowEnd = new Date(today.getTime() + plan.advanceDays * 86400000);
  if (plan.nextDueDate > windowEnd) return { created: 0, skipped: 0, message: 'Next due date is outside the advance window.' };
  const assets = await prisma.asset.findMany({ where: assetWhere(plan, reqScope), select: { id: true, assetId: true, lifecycleStatus: true } });
  let created = 0;
  let skipped = 0;
  for (const asset of assets) {
    const existingRun = await prisma.maintenancePlanRun.findUnique({ where: { planId_assetId_dueDate: { planId, assetId: asset.id, dueDate: plan.nextDueDate } } });
    if (existingRun) { skipped++; continue; }
    const open = await prisma.maintenanceWorkOrder.findFirst({ where: { assetId: asset.id, status: { in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD'] } } });
    if (open) { skipped++; continue; }
    const number = `WO-${today.getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;
    await prisma.$transaction(async tx => {
      const order = await tx.maintenanceWorkOrder.create({ data: {
        workOrderNumber: number, assetId: asset.id, workType: plan.workType, priority: 'MEDIUM', status: 'OPEN',
        description: `${plan.name}${plan.description ? ` — ${plan.description}` : ''}`,
        scheduledDate: plan.nextDueDate, completionTargetDate: plan.nextDueDate,
        notes: `Generated by maintenance plan ${plan.planNumber}`, createdByUserId: plan.createdByUserId,
        checklist: { create: plan.checklist.map(item => ({ task: item.task })) },
        statusHistory: { create: { fromStatus: null, toStatus: 'OPEN', changedBy: who, comments: `Generated by ${plan.planNumber}` } }
      } });
      await tx.maintenancePlanRun.create({ data: { planId, assetId: asset.id, workOrderId: order.id, dueDate: plan.nextDueDate } });
      await tx.asset.update({ where: { id: asset.id }, data: { lifecycleStatus: 'UNDER_MAINTENANCE' } });
      await tx.assetTransaction.create({ data: { assetId: asset.id, transactionType: 'MAINTENANCE_START', fromStatus: asset.lifecycleStatus, toStatus: 'UNDER_MAINTENANCE', performedByUserId: plan.createdByUserId, notes: `Work order created: ${number} (${plan.workType})` } });
      await tx.maintenancePlanEvent.create({ data: { planId, action: 'WORK_ORDER_GENERATED', details: `${number} for ${asset.assetId}`, actorName: who } });
    });
    created++;
  }
  if (created || (assets.length && (await prisma.maintenancePlanRun.count({ where: { planId, dueDate: plan.nextDueDate } })) === assets.length)) {
    const nextDueDate = new Date(plan.nextDueDate);
    do { nextDueDate.setUTCMonth(nextDueDate.getUTCMonth() + plan.frequencyMonths); } while (nextDueDate <= windowEnd);
    await prisma.maintenancePlan.update({ where: { id: planId }, data: { nextDueDate } });
  }
  return { created, skipped, message: created ? `${created} work order(s) generated.` : 'No new work orders were needed.' };
}

export async function generatePlan(req, res, next) {
  try {
    const plan = await findPlan(req);
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found.' });
    res.json({ success: true, result: await generatePlanWorkOrders(plan.id, scope(req), actor(req)) });
  } catch (error) { next(error); }
}

export async function runDueMaintenancePlans() {
  const plans = await prisma.maintenancePlan.findMany({ where: { active: true, autoCreateWorkOrders: true } });
  for (const plan of plans) {
    try { await generatePlanWorkOrders(plan.id); }
    catch (error) { console.error(`Maintenance plan ${plan.planNumber} failed:`, error); }
  }
}
