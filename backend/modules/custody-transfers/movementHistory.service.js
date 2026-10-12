import prisma from '../../config/prisma.js';
import { isDbConnected } from '../../config/db.js';

const displayDate = value => value ? new Date(value).toLocaleDateString('en-GB') : '-';
const displayTime = value => value ? new Date(value).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '';
const name = value => value?.fullName || value?.username || '-';
const path = (site, room) => [site?.name, room?.name].filter(Boolean).join(' > ') || '-';
const payloadOf = event => { try { return JSON.parse(event.payload || '{}'); } catch { return {}; } };
const statusOf = value => ({ COMPLETED: 'Completed', IN_TRANSIT: 'In Transit', APPROVED: 'Approved', PENDING_APPROVAL: 'Pending Approval', DRAFT: 'Draft', REJECTED: 'Rejected', CHANGES_REQUESTED: 'Changes Requested', CANCELLED: 'Cancelled' })[value] || value;
const eventLabel = event => ({ TRANSFER_REQUEST: 'Requested', TRANSFER_APPROVAL_DECISION: payloadOf(event).decision || 'Approval decision', TRANSFER_WORKFLOW: 'Dispatched', TRANSFER_RECEIPT: 'Received' })[event.transactionType] || event.transactionType.replaceAll('_', ' ');

async function loadRecords() {
  if (!isDbConnected()) { const error = new Error('Database is unavailable. Movement history could not be loaded.'); error.statusCode = 503; throw error; }
  const [transfers, assignments] = await Promise.all([prisma.assetTransfer.findMany({
    include: { asset: { include: { category: true, assetClass: true, site: true, room: true, custodian: true, department: true } },
      fromCustodian: true, toCustodian: true, requestedBy: true, approvedBy: true, receivedBy: true },
    orderBy: { createdAt: 'desc' }
  }), prisma.custodyAssignment.findMany({
    include: { asset: { include: { category: true, assetClass: true, site: true, room: true, custodian: true, department: true } }, custodian: true, issuedBy: true },
    orderBy: { issuedDate: 'desc' }
  })]);
  if (!transfers.length && !assignments.length) return [];
  const ids = transfers.map(t => t.id);
  const assetIds = [...new Set(transfers.map(t => t.assetId))];
  const siteIds = [...new Set(transfers.flatMap(t => [t.fromSiteId, t.toSiteId]).filter(Boolean))];
  const roomIds = [...new Set(transfers.flatMap(t => [t.fromRoomId, t.toRoomId]).filter(Boolean))];
  const [sites, rooms, events, files] = await Promise.all([
    prisma.site.findMany({ where: { id: { in: siteIds } }, select: { id: true, name: true } }),
    prisma.room.findMany({ where: { id: { in: roomIds } }, select: { id: true, name: true } }),
    prisma.assetTransaction.findMany({ where: { assetId: { in: assetIds }, transactionType: { in: ['TRANSFER_REQUEST', 'TRANSFER_APPROVAL_DECISION', 'TRANSFER_WORKFLOW', 'TRANSFER_RECEIPT'] } }, include: { performedBy: { select: { fullName: true, username: true } } }, orderBy: { timestamp: 'asc' } }),
    prisma.attachment.findMany({ where: { entityType: 'AssetTransfer', entityId: { in: ids } } })
  ]);
  const siteMap = new Map(sites.map(x => [x.id, x]));
  const roomMap = new Map(rooms.map(x => [x.id, x]));
  const byTransfer = new Map(ids.map(id => [id, []]));
  for (const event of events) {
    const transferId = payloadOf(event).transferId;
    if (byTransfer.has(transferId)) byTransfer.get(transferId).push(event);
  }
  const transferRecords = transfers.map(t => {
    const asset = t.asset;
    const ownEvents = byTransfer.get(t.id) || [];
    const requestData = payloadOf(ownEvents.find(e => e.transactionType === 'TRANSFER_REQUEST') || {});
    const approval = ownEvents.find(e => e.transactionType === 'TRANSFER_APPROVAL_DECISION');
    const fromLocation = path(siteMap.get(t.fromSiteId), roomMap.get(t.fromRoomId));
    const toLocation = path(siteMap.get(t.toSiteId), roomMap.get(t.toRoomId));
    const timeline = ownEvents.map(e => ({ movementId: t.transferNumber, movementType: eventLabel(e), movementDate: displayDate(e.timestamp), movementTime: displayTime(e.timestamp), timestamp: e.timestamp, fromLocation, toLocation, fromCustodian: name(t.fromCustodian), toCustodian: name(t.toCustodian), reason: e.notes || '', performedBy: name(e.performedBy) }));
    const workflow = ownEvents.filter(e => e.transactionType === 'TRANSFER_APPROVAL_DECISION').map(e => ({ level: 'Movement approval', approver: name(e.performedBy), decision: eventLabel(e), timestamp: `${displayDate(e.timestamp)} ${displayTime(e.timestamp)}`, comments: e.notes || '' }));
    const documents = files.filter(file => file.entityId === t.id && file.url).map(file => ({ id: file.id, name: file.fileName, type: file.fileType || 'File', size: file.fileSize ? `${Math.ceil(file.fileSize / 1024)} KB` : '', url: file.url }));
    return {
      id: t.id, movementId: t.transferNumber, assetId: asset?.id || t.assetId,
      assetNumber: asset?.assetId || '-', assetName: asset?.description || '-',
      serialNumber: asset?.serialNumber || '-', tagEpc: asset?.rfidEpc || asset?.tagNumber || '-',
      assetType: asset?.assetClass?.name || asset?.category?.name || '-', assetCategory: asset?.category?.name || '-',
      assetStatus: asset?.lifecycleStatus || '-', currentLocation: path(asset?.site, asset?.room), currentCustodian: name(asset?.custodian),
      movementType: t.transferType, fromLocation, toLocation,
      fromCustodian: name(t.fromCustodian), toCustodian: name(t.toCustodian),
      movementDate: displayDate(t.createdAt), movementTime: displayTime(t.createdAt), movementDateIso: t.createdAt,
      status: statusOf(t.status), requestedBy: name(t.requestedBy), approvedBy: name(t.approvedBy),
      dispatchedBy: '-', receivedBy: name(t.receivedBy), reason: t.reason || '-',
      condition: requestData.conditionAtTransfer || asset?.condition || '-', accessories: requestData.accessoriesIncluded || '-',
      site: siteMap.get(t.toSiteId)?.name || '-', department: asset?.department?.name || '-',
      timeline, workflow, documents, approvalDate: approval?.timestamp || null
    };
  });
  const assignmentRecords = assignments.flatMap(assignment => {
    const asset = assignment.asset;
    const custodian = name(assignment.custodian);
    const issuedBy = name(assignment.issuedBy);
    const currentLocation = path(asset?.site, asset?.room);
    const common = { assetId: asset?.id || assignment.assetId, assetNumber: asset?.assetId || '-',
      assetName: asset?.description || '-', serialNumber: asset?.serialNumber || '-',
      tagEpc: asset?.rfidEpc || asset?.tagNumber || '-', assetType: asset?.assetClass?.name || asset?.category?.name || '-',
      assetCategory: asset?.category?.name || '-', assetStatus: asset?.lifecycleStatus || '-',
      currentLocation, currentCustodian: name(asset?.custodian),
      fromLocation: '-', toLocation: '-', site: asset?.site?.name || '-', department: asset?.department?.name || '-',
      requestedBy: issuedBy, approvedBy: '-', dispatchedBy: '-', receivedBy: '-',
      reason: '-', condition: assignment.conditionAtIssue || '-', accessories: '-', workflow: [], documents: [], approvalDate: null };
    const id = `ASN-${assignment.id}`;
    const assigned = { ...common, id, movementId: id, movementType: 'Assignment',
      fromCustodian: '-', toCustodian: custodian,
      movementDate: displayDate(assignment.issuedDate), movementTime: displayTime(assignment.issuedDate), movementDateIso: assignment.issuedDate,
      status: 'Completed', timeline: [{ movementId: id, movementType: 'Assignment', movementDate: displayDate(assignment.issuedDate),
        movementTime: displayTime(assignment.issuedDate), timestamp: assignment.issuedDate,
        fromLocation: '-', toLocation: '-', fromCustodian: '-', toCustodian: custodian,
        reason: `Assigned to ${custodian}`, performedBy: issuedBy }] };
    if (!assignment.actualReturnDate) return [assigned];
    const returnId = `${id}-RETURN`;
    const returned = { ...common, id: returnId, movementId: returnId, movementType: 'Return',
      fromCustodian: custodian, toCustodian: '-', condition: assignment.conditionAtReturn || '-',
      movementDate: displayDate(assignment.actualReturnDate), movementTime: displayTime(assignment.actualReturnDate), movementDateIso: assignment.actualReturnDate,
      status: 'Completed', timeline: [{ movementId: returnId, movementType: 'Return', movementDate: displayDate(assignment.actualReturnDate),
        movementTime: displayTime(assignment.actualReturnDate), timestamp: assignment.actualReturnDate,
        fromLocation: '-', toLocation: '-', fromCustodian: custodian, toCustodian: '-',
        reason: `Returned by ${custodian}`, performedBy: '-' }] };
    return [assigned, returned];
  });
  return [...transferRecords, ...assignmentRecords].sort((a, b) => new Date(b.movementDateIso) - new Date(a.movementDateIso));
}

function filterRecords(records, query) {
  const match = (actual, selected) => !selected || selected === 'All' || selected === 'All Sites' || selected === 'All Departments' || String(actual || '').toLowerCase() === String(selected).toLowerCase();
  const search = String(query.search || '').trim().toLowerCase();
  const assetId = String(query.assetId || '').trim();
  const from = query.fromDate ? new Date(`${query.fromDate}T00:00:00Z`) : null;
  const to = query.toDate ? new Date(`${query.toDate}T23:59:59Z`) : null;
  return records.filter(record => {
    const date = new Date(record.movementDateIso);
    return (!assetId || record.assetId === assetId || record.assetNumber === assetId)
      && (!search || [record.movementId, record.assetNumber, record.assetName, record.serialNumber].some(value => String(value || '').toLowerCase().includes(search)))
      && match(record.assetType, query.assetType) && match(record.movementType, query.movementType)
      && match(record.site, query.site) && match(record.department, query.department)
      && (!query.custodian || query.custodian === 'All' || [record.fromCustodian, record.toCustodian].some(value => match(value, query.custodian)))
      && (!query.status || query.status === 'All' || (query.status === 'Cancelled / Rejected' ? ['Cancelled', 'Rejected'].includes(record.status) : query.status === 'Pending Receipt' ? record.status === 'In Transit' : match(record.status, query.status)))
      && (!from || date >= from) && (!to || date <= to);
  });
}

export async function getMovementHistory(query = {}) {
  const records = await loadRecords();
  const filtered = filterRecords(records, query);
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(5000, Math.max(1, Number.parseInt(query.limit, 10) || 10));
  const unique = field => [...new Set(records.map(record => record[field]).filter(value => value && value !== '-'))].sort();
  return { history: filtered.slice((page - 1) * limit, page * limit), total: filtered.length,
    totalPages: Math.ceil(filtered.length / limit),
    kpis: { totalMovements: records.length, completed: records.filter(x => x.status === 'Completed').length,
      inTransit: records.filter(x => x.status === 'In Transit').length,
      pendingReceipt: records.filter(x => x.status === 'In Transit').length,
      cancelledRejected: records.filter(x => ['Cancelled', 'Rejected'].includes(x.status)).length },
    filters: { assetTypes: unique('assetType'), movementTypes: unique('movementType'), sites: unique('site'), departments: unique('department'), custodians: [...new Set(records.flatMap(x => [x.fromCustodian, x.toCustodian]).filter(x => x && x !== '-'))].sort(), statuses: unique('status') } };
}

export async function getMovementById(id) {
  return (await loadRecords()).find(record => record.id === id || record.movementId === id) || null;
}
