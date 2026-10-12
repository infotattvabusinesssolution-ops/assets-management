import prisma from '../../config/prisma.js';
import { isDbConnected } from '../../config/db.js';

const fail = (message, statusCode = 400) => { const error = new Error(message); error.statusCode = statusCode; throw error; };
const dateText = value => value ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
const timeText = value => value ? new Date(value).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '';
const keyOf = value => String(value || '').trim().toLowerCase();
const statusName = status => ({ PENDING_APPROVAL: 'Pending', PENDING: 'Pending', REQUESTED: 'Pending',
  APPROVED: 'Approved', REJECTED: 'Rejected', CHANGES_REQUESTED: 'Changes Requested',
  IN_TRANSIT: 'In Transit', COMPLETED: 'Completed', DRAFT: 'Draft' })[status] || status;
const typeName = value => /assign/i.test(value || '') ? 'Assignment'
  : /custodian/i.test(value || '') ? 'Custodian Transfer' : 'Transfer';
const csvCell = value => `"${String(value ?? '').replaceAll('"', '""')}"`;

function payloadOf(event) {
  try { return JSON.parse(event.payload || '{}'); } catch { return {}; }
}

function sitePath(site, room) { return [site?.name, room?.name].filter(Boolean).join(' > ') || '-'; }

function formatTransfer(transfer, siteMap, roomMap, events, attachments) {
  const asset = transfer.asset;
  const ownEvents = events.filter(event => payloadOf(event).transferId === transfer.id);
  const requestEvent = ownEvents.find(event => event.transactionType === 'TRANSFER_REQUEST');
  const requestData = requestEvent ? payloadOf(requestEvent) : {};
  const fromLocation = sitePath(siteMap.get(transfer.fromSiteId), roomMap.get(transfer.fromRoomId));
  const toLocation = sitePath(siteMap.get(transfer.toSiteId), roomMap.get(transfer.toRoomId));
  const effectiveDate = requestData.effectiveDate ? new Date(requestData.effectiveDate) : null;
  const isOverdue = transfer.status === 'PENDING_APPROVAL' && effectiveDate && effectiveDate < new Date();
  const history = ownEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map(event => ({
    id: event.id,
    action: event.transactionType === 'TRANSFER_REQUEST' ? 'Request Submitted' :
      (payloadOf(event).decision || event.transactionType).replaceAll('_', ' '),
    performedBy: event.performedBy?.fullName || event.performedBy?.username || 'User',
    role: event.transactionType === 'TRANSFER_REQUEST' ? 'Requester' : 'Approver',
    timestamp: `${dateText(event.timestamp)} ${timeText(event.timestamp)}`,
    comments: event.notes || '', documents: []
  }));
  const status = statusName(transfer.status);
  const actionEvent = ownEvents.find(event => event.transactionType === 'TRANSFER_APPROVAL_DECISION');
  return {
    id: transfer.id, requestNumber: transfer.transferNumber,
    requestType: typeName(transfer.transferType), transferType: transfer.transferType,
    status, currentStage: status === 'Pending' ? 'Awaiting approval' : status,
    currentLevelNum: 1, totalLevels: 1,
    assetNo: asset?.assetId || transfer.assetId,
    assetName: asset?.description || '-', assetCategory: asset?.category?.name || '-',
    serialNumber: asset?.serialNumber || '-',
    fromLocation, fromLocationFull: fromLocation, toLocation, toLocationFull: toLocation,
    site: siteMap.get(transfer.fromSiteId)?.name || '-',
    department: asset?.department?.name || '-',
    requestedBy: transfer.requestedBy?.fullName || transfer.requestedBy?.username || '-',
    requestedByEmail: transfer.requestedBy?.email || '',
    newCustodian: transfer.toCustodian?.fullName || '-',
    requestDate: dateText(transfer.createdAt), requestTime: timeText(transfer.createdAt),
    requestDateIso: transfer.createdAt, lastActionAt: actionEvent?.timestamp || transfer.updatedAt,
    effectiveDate: effectiveDate ? dateText(effectiveDate) : '-',
    reason: transfer.reason || '-', remarks: requestData.remarks || '-',
    isOverdue: Boolean(isOverdue), slaDueDate: effectiveDate ? dateText(effectiveDate) : '-',
    supportingDocuments: attachments.filter(file => file.entityId === transfer.id).map(file => ({
      id: file.id, name: file.fileName, size: file.fileSize ? `${Math.ceil(file.fileSize / 1024)} KB` : '', url: file.url
    })),
    assets: [{ id: asset?.id || transfer.assetId, assetNo: asset?.assetId || transfer.assetId,
      name: asset?.description || '-', category: asset?.category?.name || '-',
      serialNumber: asset?.serialNumber || '-', model: asset?.model?.name || '-',
      manufacturer: asset?.manufacturer?.name || '-', condition: asset?.condition || '-',
      currentStatus: asset?.lifecycleStatus || '-', currentLocation: sitePath(asset?.site, asset?.room),
      currentCustodian: asset?.custodian?.fullName || '-' }],
    workflowStages: [{ level: 1, title: 'Movement approval',
      approverName: transfer.approvedBy?.fullName || 'Authorized approver',
      status: status === 'Pending' ? 'Pending' : status,
      actionDate: actionEvent ? `${dateText(actionEvent.timestamp)} ${timeText(actionEvent.timestamp)}` : null,
      comments: actionEvent?.notes || null, isCurrent: status === 'Pending' }],
    history
  };
}

async function allRequests() {
  if (!isDbConnected()) fail('Database is unavailable. Movement approvals cannot be loaded.', 503);
  const transfers = await prisma.assetTransfer.findMany({
    include: { asset: { include: { category: true, manufacturer: true, model: true, site: true,
      room: true, department: true, custodian: true } }, fromCustodian: true, toCustodian: true,
      requestedBy: true, approvedBy: true }, orderBy: { createdAt: 'desc' }
  });
  if (!transfers.length) return [];
  const assetIds = [...new Set(transfers.map(transfer => transfer.assetId))];
  const siteIds = [...new Set(transfers.flatMap(transfer => [transfer.fromSiteId, transfer.toSiteId]).filter(Boolean))];
  const roomIds = [...new Set(transfers.flatMap(transfer => [transfer.fromRoomId, transfer.toRoomId]).filter(Boolean))];
  const transferIds = transfers.map(transfer => transfer.id);
  const [sites, rooms, events, attachments] = await Promise.all([
    prisma.site.findMany({ where: { id: { in: siteIds } }, select: { id: true, name: true } }),
    prisma.room.findMany({ where: { id: { in: roomIds } }, select: { id: true, name: true } }),
    prisma.assetTransaction.findMany({ where: { assetId: { in: assetIds },
      transactionType: { in: ['TRANSFER_REQUEST', 'TRANSFER_APPROVAL_DECISION', 'TRANSFER_WORKFLOW', 'TRANSFER_RECEIPT'] } },
      include: { performedBy: { select: { fullName: true, username: true } } } }),
    prisma.attachment.findMany({ where: { entityType: 'AssetTransfer', entityId: { in: transferIds } } })
  ]);
  const siteMap = new Map(sites.map(site => [site.id, site]));
  const roomMap = new Map(rooms.map(room => [room.id, room]));
  return transfers.map(transfer => formatTransfer(transfer, siteMap, roomMap,
    events.filter(event => event.assetId === transfer.assetId), attachments));
}

function filteredRequests(records, query = {}) {
  const requestType = keyOf(query.requestType);
  const status = keyOf(query.status);
  const site = keyOf(query.site);
  const department = keyOf(query.department);
  const requestedBy = keyOf(query.requestedBy);
  const search = keyOf(query.search);
  const from = query.dateFrom ? new Date(`${query.dateFrom}T00:00:00Z`) : null;
  const to = query.dateTo ? new Date(`${query.dateTo}T23:59:59Z`) : null;
  return records.filter(record => {
    const createdAt = new Date(record.requestDateIso);
    return (!requestType || requestType === 'all' || keyOf(record.requestType) === requestType) &&
      (!status || status === 'all' || keyOf(record.status) === status) &&
      (!site || site === 'all sites' || keyOf(record.site) === site) &&
      (!department || department === 'all departments' || keyOf(record.department) === department) &&
      (!requestedBy || requestedBy === 'all users' || keyOf(record.requestedBy) === requestedBy) &&
      (!from || createdAt >= from) && (!to || createdAt <= to) &&
      (!search || [record.requestNumber, record.assetNo, record.assetName,
        record.requestedBy, record.fromLocation, record.toLocation].some(value => keyOf(value).includes(search)));
  });
}

export class MovementApprovalsService {
  static async getKpis() {
    const records = await allRequests();
    const now = new Date();
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const decisions = await prisma.assetTransaction.findMany({ where: {
      transactionType: 'TRANSFER_APPROVAL_DECISION', timestamp: { gte: startOfMonth }
    }, select: { payload: true } });
    return {
      pendingApprovals: records.filter(record => record.status === 'Pending').length,
      approvedThisMonth: decisions.filter(event => payloadOf(event).decision === 'APPROVE').length,
      rejectedThisMonth: decisions.filter(event => payloadOf(event).decision === 'REJECT').length,
      overdueRequests: records.filter(record => record.isOverdue).length
    };
  }

  static async getApprovalRequests(query = {}) {
    const all = await allRequests();
    const filtered = filteredRequests(all, query);
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(1000, Math.max(1, Number(query.limit) || 10));
    const start = (page - 1) * limit;
    return { requests: filtered.slice(start, start + limit), pagination: {
      totalRecords: filtered.length, totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
      currentPage: page, limit, startIndex: filtered.length ? start + 1 : 0,
      endIndex: Math.min(start + limit, filtered.length)
    }, filters: {
      sites: [...new Set(all.map(record => record.site).filter(value => value && value !== '-'))].sort(),
      departments: [...new Set(all.map(record => record.department).filter(value => value && value !== '-'))].sort(),
      requestedBy: [...new Set(all.map(record => record.requestedBy).filter(value => value && value !== '-'))].sort(),
      requestTypes: [...new Set(all.map(record => record.requestType))].sort()
    } };
  }

  static async getApprovalRequestById(id) {
    return (await allRequests()).find(record => record.id === id || record.requestNumber === id) || null;
  }

  static async processDecision({ requestId, decision, comments = '', attachments = [], notifyRequester = true, user }) {
    const normalized = String(decision || '').toUpperCase();
    if (!['APPROVE', 'REJECT', 'REQUEST_CHANGES'].includes(normalized)) fail('Choose a valid approval decision.');
    if (normalized !== 'APPROVE' && !String(comments).trim()) fail('Comments are required for rejection or change requests.', 422);
    if (String(comments).length > 500) fail('Comments must be 500 characters or fewer.', 422);
    const actor = user?.id ? await prisma.user.findUnique({ where: { id: user.id } }) : null;
    if (!actor) fail('Sign in with a valid user to approve movements.', 401);
    const transfer = await prisma.assetTransfer.findFirst({ where: { OR: [{ id: requestId }, { transferNumber: requestId }] } });
    if (!transfer) fail('Movement approval request not found.', 404);
    if (transfer.status !== 'PENDING_APPROVAL') fail(`Transfer is already ${statusName(transfer.status)}.`, 409);
    if (!Array.isArray(attachments) || attachments.some(file => !file?.url || !file?.name)) {
      fail('Upload supporting files before submitting a decision.', 422);
    }
    const nextStatus = ({ APPROVE: 'APPROVED', REJECT: 'REJECTED', REQUEST_CHANGES: 'CHANGES_REQUESTED' })[normalized];
    await prisma.$transaction(async tx => {
      const changed = await tx.assetTransfer.updateMany({ where: { id: transfer.id, status: 'PENDING_APPROVAL' },
        data: { status: nextStatus, ...(normalized === 'APPROVE' ? { approvedByUserId: actor.id } : {}) } });
      if (changed.count !== 1) fail('This request was already processed. Refresh the page.', 409);
      await tx.assetTransaction.create({ data: {
        assetId: transfer.assetId, transactionType: 'TRANSFER_APPROVAL_DECISION',
        performedByUserId: actor.id, fromStatus: transfer.status, toStatus: nextStatus,
        notes: String(comments || '').trim() || `${normalized.replaceAll('_', ' ')} by ${actor.fullName}`,
        payload: JSON.stringify({ transferId: transfer.id, decision: normalized })
      } });
      for (const file of attachments) await tx.attachment.create({ data: {
        entityType: 'AssetTransfer', entityId: transfer.id,
        fileName: file.name, fileType: file.type || null,
        fileSize: Number.isFinite(Number(file.size)) ? Number(file.size) : null,
        storageKey: file.publicId || file.url, url: file.url, uploadedByUserId: actor.id
      } });
      if (notifyRequester && transfer.requestedByUserId !== actor.id) await tx.notification.create({ data: {
        userId: transfer.requestedByUserId, title: `Transfer ${statusName(nextStatus)}`,
        message: `Transfer ${transfer.transferNumber} was ${statusName(nextStatus).toLowerCase()}.${comments ? ` ${String(comments).trim()}` : ''}`,
        type: 'MOVEMENT', link: `/movements/transfer?tab=approvals`
      } });
    }, { timeout: 20000 });
    return { success: true, request: await this.getApprovalRequestById(transfer.id),
      decisionResult: { status: statusName(nextStatus), isFinal: true } };
  }

  static async bulkProcessDecisions({ requestIds = [], decision, comments = '', user }) {
    if (!Array.isArray(requestIds) || !requestIds.length || requestIds.length > 100) fail('Select 1 to 100 requests.');
    if (!['APPROVE', 'REJECT'].includes(String(decision || '').toUpperCase())) fail('Choose Approve or Reject.');
    const results = [];
    for (const id of [...new Set(requestIds)]) {
      try {
        const result = await this.processDecision({ requestId: id, decision, comments, user });
        results.push({ id, success: true, status: result.request.status });
      } catch (error) { results.push({ id, success: false, error: error.message }); }
    }
    return { total: results.length, processed: results.filter(result => result.success).length,
      failed: results.filter(result => !result.success).length, results };
  }

  static async exportApprovals(query = {}) {
    const rows = filteredRequests(await allRequests(), query);
    const headers = ['Request ID', 'Type', 'Asset ID', 'Asset Name', 'From', 'To',
      'Requested By', 'Request Date', 'Status', 'Stage'];
    const content = '\uFEFF' + [headers, ...rows.map(row => [row.requestNumber, row.requestType,
      row.assetNo, row.assetName, row.fromLocation, row.toLocation, row.requestedBy,
      row.requestDate, row.status, row.currentStage])].map(row => row.map(csvCell).join(',')).join('\r\n');
    return { fileName: `Movement_Approvals_${new Date().toISOString().slice(0, 10)}.csv`,
      content, totalRecords: rows.length };
  }
}

export default MovementApprovalsService;
