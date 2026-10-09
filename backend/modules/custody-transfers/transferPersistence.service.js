import prisma from '../../config/prisma.js';
import { isDbConnected } from '../../config/db.js';

const fail = (message) => { throw new Error(message); };

function parseDate(value, label) {
  if (!value) return null;
  const date = new Date(`${value}T12:00:00.000Z`);
  if (Number.isNaN(date.getTime())) fail(`Enter a valid ${label}.`);
  return date;
}

async function resolveActor(user) {
  if (!user?.id) fail('Sign in to submit or approve a transfer.');
  const actor = await prisma.user.findUnique({ where: { id: user.id }, select: { id: true } });
  if (!actor) fail('A valid user is required for this transfer.');
  return actor.id;
}

async function resolveDestination(asset, payload) {
  const site = payload.toSiteId ? await prisma.site.findFirst({ where: {
    id: payload.toSiteId, companyId: asset.companyId, active: true
  } }) : null;
  if (!site) fail('Select an active destination site in this asset’s company.');

  const building = payload.toBuildingId ? await prisma.building.findFirst({ where: {
    id: payload.toBuildingId, siteId: site.id, active: true
  } }) : null;
  if (payload.toBuildingId && !building) fail('Select a building in the destination site.');

  const floor = payload.toFloorId ? await prisma.floor.findFirst({ where: {
    id: payload.toFloorId, buildingId: building?.id || '__none__', active: true
  } }) : null;
  if (payload.toFloorId && !floor) fail('Select a floor in the destination building.');

  const room = payload.toRoomId ? await prisma.room.findFirst({ where: {
    id: payload.toRoomId, floorId: floor?.id || '__none__', active: true
  } }) : null;
  if (payload.toRoomId && !room) fail('Select a room in the destination floor.');

  const department = payload.departmentId || payload.departmentName
    ? await prisma.department.findFirst({ where: {
        companyId: asset.companyId, active: true,
        OR: [
          ...(payload.departmentId ? [{ id: payload.departmentId }] : []),
          ...(payload.departmentName ? [{ name: payload.departmentName }] : [])
        ]
      } })
    : null;
  if ((payload.departmentId || payload.departmentName) && !department) fail('Select a department in this asset’s company.');

  const custodian = payload.toCustodianId || payload.toCustodianName
    ? await prisma.employee.findFirst({ where: {
        companyId: asset.companyId, active: true,
        OR: [
          ...(payload.toCustodianId ? [{ id: payload.toCustodianId }] : []),
          ...(payload.toCustodianName ? [{ fullName: payload.toCustodianName }] : [])
        ]
      } })
    : null;
  if ((payload.toCustodianId || payload.toCustodianName) && !custodian) fail('Select an active custodian in this asset’s company.');

  return { site, building, floor, room, department, custodian };
}

export async function createTransferRecord(payload, user) {
  if (!isDbConnected()) fail('Database is unavailable. Transfer was not saved.');
  const ids = [...new Set((payload.assetIds || []).filter(Boolean))];
  if (!ids.length) fail('Select at least one asset for transfer.');
  if (!payload.isDraft && !String(payload.reason || '').trim()) fail('Movement reason is required.');
  if (String(payload.transferType || '').includes('Custodian') && !payload.toCustodianId && !payload.toCustodianName) {
    fail('Select a destination custodian.');
  }
  const requestedByUserId = await resolveActor(user);
  const transferDate = parseDate(payload.transferDate, 'transfer date');
  const effectiveDate = parseDate(payload.effectiveDate, 'effective date');
  const assets = await prisma.asset.findMany({ where: { OR: [{ id: { in: ids } }, { assetId: { in: ids } }] } });
  if (assets.length !== ids.length) fail('One or more selected assets could not be found in the database.');

  const prepared = [];
  for (const asset of assets) {
    if (['DISPOSED', 'PENDING_DISPOSAL', 'IN_TRANSIT'].includes(asset.lifecycleStatus)) {
      fail(`Asset ${asset.assetId} cannot be transferred in its current status.`);
    }
    const destination = await resolveDestination(asset, payload);
    const openTransfer = await prisma.assetTransfer.findFirst({ where: {
      assetId: asset.id, status: { in: ['PENDING_APPROVAL', 'APPROVED', 'IN_TRANSIT'] }
    }, select: { id: true } });
    if (openTransfer) fail(`Asset ${asset.assetId} already has an active transfer.`);
    prepared.push({ asset, destination });
  }

  const status = payload.isDraft ? 'DRAFT' : payload.requiresApproval === false ? 'APPROVED' : 'PENDING_APPROVAL';
  const created = await prisma.$transaction(async tx => {
    const records = [];
    for (const { asset, destination } of prepared) {
      const transfer = await tx.assetTransfer.create({ data: {
        transferNumber: `TRF-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
        assetId: asset.id,
        transferType: payload.transferType || 'Location Transfer',
        status,
        reason: String(payload.reason || '').trim() || null,
        fromCompanyId: asset.companyId,
        fromSiteId: asset.siteId,
        fromRoomId: asset.roomId,
        fromCustodianId: asset.custodianId,
        toCompanyId: asset.companyId,
        toSiteId: destination.site.id,
        toRoomId: destination.room?.id || null,
        toCustodianId: destination.custodian?.id || asset.custodianId,
        requestedByUserId
      } });
      await tx.assetTransaction.create({ data: {
        assetId: asset.id,
        transactionType: 'TRANSFER_REQUEST',
        fromStatus: asset.lifecycleStatus,
        toStatus: asset.lifecycleStatus,
        performedByUserId: requestedByUserId,
        notes: transfer.reason || 'Transfer draft',
        payload: JSON.stringify({
          transferId: transfer.id,
          fromBuildingId: asset.buildingId, fromFloorId: asset.floorId,
          toBuildingId: destination.building?.id || null,
          toFloorId: destination.floor?.id || null,
          toRoomId: destination.room?.id || null,
          toDepartmentId: destination.department?.id || null,
          transferDate: transferDate?.toISOString() || null,
          effectiveDate: effectiveDate?.toISOString() || null,
          conditionAtTransfer: payload.conditionAtTransfer || null,
          accessoriesIncluded: payload.accessoriesIncluded || null,
          remarks: payload.remarks || null,
          referenceNo: payload.referenceNo || null,
          documentNames: (payload.documents || []).map(document => document.name).filter(Boolean)
        })
      } });
      records.push(transfer);
    }
    return records;
  }, { timeout: 20000 });
  return { ...created[0], assetCount: created.length, transferIds: created.map(item => item.id) };
}

export async function updateTransferRecordStatus(transferId, actionPayload, user) {
  if (!isDbConnected()) fail('Database is unavailable. Transfer was not updated.');
  const actorId = await resolveActor(user);
  const transfer = await prisma.assetTransfer.findFirst({ where: {
    OR: [{ id: transferId }, { transferNumber: transferId }]
  } });
  if (!transfer) fail('Transfer was not found in the database.');
  const action = actionPayload.action;
  const allowed = {
    APPROVE: ['PENDING_APPROVAL'],
    REJECT: ['PENDING_APPROVAL'],
    DISPATCH: ['APPROVED'],
    MARK_TRANSIT: ['APPROVED'],
    CONFIRM_RECEIPT: ['APPROVED', 'IN_TRANSIT']
  };
  if (!allowed[action]?.includes(transfer.status)) fail(`Cannot ${action || 'update'} a transfer in ${transfer.status} status.`);

  if (action !== 'CONFIRM_RECEIPT') {
    const status = action === 'APPROVE' ? 'APPROVED' : action === 'REJECT' ? 'REJECTED' : 'IN_TRANSIT';
    return prisma.assetTransfer.update({ where: { id: transfer.id }, data: {
      status,
      ...(action === 'APPROVE' ? { approvedByUserId: actorId } : {}),
      ...(action === 'DISPATCH' || action === 'MARK_TRANSIT' ? { dispatchDate: new Date() } : {})
    } });
  }

  const asset = await prisma.asset.findUnique({ where: { id: transfer.assetId } });
  if (!asset) fail('Transfer asset was not found.');
  if (!transfer.toSiteId) fail('Transfer has no saved destination site.');
  const requestEvents = await prisma.assetTransaction.findMany({ where: {
    assetId: asset.id, transactionType: 'TRANSFER_REQUEST'
  }, orderBy: { timestamp: 'desc' } });
  const request = requestEvents.map(event => {
    try { return JSON.parse(event.payload || '{}'); } catch { return {}; }
  }).find(data => data.transferId === transfer.id);
  if (!request) fail('Transfer destination details were not saved. Create a new transfer request.');

  return prisma.$transaction(async tx => {
    const changedCustodian = transfer.toCustodianId !== asset.custodianId;
    const updatedAsset = await tx.asset.update({ where: { id: asset.id }, data: {
      siteId: transfer.toSiteId,
      buildingId: request.toBuildingId || null,
      floorId: request.toFloorId || null,
      roomId: transfer.toRoomId || null,
      departmentId: request.toDepartmentId || asset.departmentId,
      custodianId: transfer.toCustodianId || null,
      ...(changedCustodian ? { assignedDate: transfer.toCustodianId ? new Date() : null } : {}),
      ...(actionPayload.receivedCondition ? { condition: ({ Good: 'GOOD', Excellent: 'EXCELLENT', Fair: 'FAIR' })[actionPayload.receivedCondition] || actionPayload.receivedCondition } : {}),
      updatedByUserId: actorId
    } });
    if (changedCustodian) {
      await tx.custodyAssignment.updateMany({ where: { assetId: asset.id, active: true }, data: {
        active: false, actualReturnDate: new Date()
      } });
      if (transfer.toCustodianId) await tx.custodyAssignment.create({ data: {
        assetId: asset.id, custodianId: transfer.toCustodianId,
        issuedByUserId: actorId, issuedDate: new Date(), active: true
      } });
    }
    await tx.assetTransaction.create({ data: {
      assetId: asset.id,
      transactionType: 'TRANSFER_RECEIPT',
      fromStatus: asset.lifecycleStatus,
      toStatus: updatedAsset.lifecycleStatus,
      performedByUserId: actorId,
      notes: actionPayload.comments || `Transfer ${transfer.transferNumber} received`,
      payload: JSON.stringify({ transferId: transfer.id,
        fromSiteId: asset.siteId, toSiteId: updatedAsset.siteId,
        fromRoomId: asset.roomId, toRoomId: updatedAsset.roomId,
        fromCustodianId: asset.custodianId, toCustodianId: updatedAsset.custodianId })
    } });
    return tx.assetTransfer.update({ where: { id: transfer.id }, data: {
      status: 'COMPLETED', receivedByUserId: actorId, receiveDate: new Date()
    } });
  }, { timeout: 20000 });
}

export async function getTransferLocationDetails(transfers) {
  if (!transfers.length) return new Map();
  const events = await prisma.assetTransaction.findMany({ where: {
    assetId: { in: [...new Set(transfers.map(transfer => transfer.assetId))] },
    transactionType: 'TRANSFER_REQUEST'
  }, select: { payload: true } });
  const metadata = new Map();
  for (const event of events) {
    try {
      const data = JSON.parse(event.payload || '{}');
      if (data.transferId) metadata.set(data.transferId, data);
    } catch { /* Older transaction without JSON metadata. */ }
  }
  const siteIds = [...new Set(transfers.flatMap(transfer => [transfer.fromSiteId, transfer.toSiteId]).filter(Boolean))];
  const buildingIds = [...new Set(transfers.flatMap(transfer => {
    const data = metadata.get(transfer.id) || {};
    return [data.fromBuildingId, data.toBuildingId];
  }).filter(Boolean))];
  const floorIds = [...new Set(transfers.flatMap(transfer => {
    const data = metadata.get(transfer.id) || {};
    return [data.fromFloorId, data.toFloorId];
  }).filter(Boolean))];
  const roomIds = [...new Set(transfers.flatMap(transfer => [transfer.fromRoomId, transfer.toRoomId]).filter(Boolean))];
  const [sites, buildings, floors, rooms] = await Promise.all([
    prisma.site.findMany({ where: { id: { in: siteIds } }, select: { id: true, name: true } }),
    prisma.building.findMany({ where: { id: { in: buildingIds } }, select: { id: true, name: true } }),
    prisma.floor.findMany({ where: { id: { in: floorIds } }, select: { id: true, name: true } }),
    prisma.room.findMany({ where: { id: { in: roomIds } }, select: { id: true, name: true } })
  ]);
  const names = new Map([...sites, ...buildings, ...floors, ...rooms].map(item => [item.id, item.name]));
  const format = ids => ids.map(id => names.get(id)).filter(Boolean).join(' > ');
  return new Map(transfers.map(transfer => {
    const data = metadata.get(transfer.id) || {};
    return [transfer.id, {
      from: format([transfer.fromSiteId, data.fromBuildingId, data.fromFloorId, transfer.fromRoomId]) || 'Unassigned',
      to: format([transfer.toSiteId, data.toBuildingId, data.toFloorId, transfer.toRoomId]) || 'Not selected'
    }];
  }));
}
