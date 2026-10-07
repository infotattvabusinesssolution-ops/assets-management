import prisma from '../../config/prisma.js';
import { isDbConnected } from '../../config/db.js';

// Transient stores only track requests submitted in this process. Listing endpoints read SQL Server.
let assetsStore = [];
let pendingApprovalsStore = [];
let recentMovementsStore = [];
let movementHistoryStore = [];

export class CustodyTransfersService {
  /**
   * Get KPI Summary Cards data matching Screenshot 25
   */
  static async getKpis() {
    if (!isDbConnected()) throw new Error('Database is unavailable.');
    const [totalAssets, assignedAssets, pendingTransfers, transfersThisMonth] = await Promise.all([
      prisma.asset.count({ where: { active: true } }),
      prisma.asset.count({ where: { active: true, custodianId: { not: null } } }),
      prisma.assetTransfer.count({ where: { status: { in: ['PENDING', 'PENDING_APPROVAL', 'REQUESTED'] } } }),
      prisma.assetTransfer.count({ where: { createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } })
    ]);
    const unassignedAssets = totalAssets - assignedAssets;
    return {
      totalAssets, assignedAssets,
      assignedPercentage: totalAssets ? Math.round(assignedAssets / totalAssets * 100) : 0,
      unassignedAssets,
      unassignedPercentage: totalAssets ? Math.round(unassignedAssets / totalAssets * 100) : 0,
      pendingTransfers, transfersThisMonth
    };
  }

  /**
   * Get Assets list with comprehensive server-side filtering, searching & pagination
   */
  static async getAssets(params = {}) {
    const {
      search = '',
      site = 'All Sites',
      building = 'All Buildings',
      location = 'All Locations',
      assetType = 'All Types',
      department = 'All Departments',
      assignedTo = 'All Users',
      status = 'All Status',
      page = 1,
      limit = 10,
      sortBy = 'assetNumber',
      sortOrder = 'asc'
    } = params;

    if (!isDbConnected()) throw new Error('Database is unavailable.');
    let filtered = [];

    if (isDbConnected()) {
      try {
        const dbAssets = await prisma.asset.findMany({
          where: { active: true },
          include: {
            category: true,
            site: true,
            building: true,
            floor: true,
            room: true,
            department: true,
            custodian: true,
            model: true,
            manufacturer: true
          },
          orderBy: { createdAt: 'desc' },
        });

        if (dbAssets && dbAssets.length > 0) {
          filtered = dbAssets.map(a => {
            const locParts = [
              a.site?.name,
              a.building?.name,
              a.floor?.name,
              a.room?.name
            ].filter(Boolean);
            const fullLoc = locParts.length ? locParts.join(' > ') : (a.site?.name || 'Dubai HQ');

            return {
              id: a.id,
              assetNumber: a.assetId || a.tagNumber || `AST-${a.id.slice(0, 6)}`,
              assetName: a.description || a.assetId,
              assetType: a.category?.name || 'General',
              category: a.category?.name || 'General',
              currentLocation: fullLoc,
              fullLocation: fullLoc,
              site: a.site?.name || 'Dubai HQ',
              building: a.building?.name || 'Block A',
              floor: a.floor?.name || 'Ground Floor',
              room: a.room?.name || 'General',
              assignedTo: a.custodian ? (a.custodian.fullName || a.custodian.firstName) : 'Unassigned',
              assignedToId: a.custodianId || null,
              department: a.department?.name || 'General',
              status: a.custodian ? 'Assigned' : 'Unassigned',
              lastMoved: a.updatedAt ? new Date(a.updatedAt).toLocaleDateString('en-GB') : 'Recent',
              lastMovedDate: a.updatedAt ? new Date(a.updatedAt).toISOString() : new Date().toISOString(),
              serialNumber: a.serialNumber || 'N/A',
              tagEpc: a.tagNumber || a.rfidEpc || 'N/A',
              model: a.model?.name || 'Standard',
              manufacturer: a.manufacturer?.name || 'OEM',
              assignedDate: a.assignedDate ? new Date(a.assignedDate).toLocaleDateString('en-GB') : '-',
              warrantyExpiry: '-',
              remarks: a.description || '',
              image: a.imageUrl || null
            };
          });
        }
      } catch (err) {
        throw err;
      }
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(a =>
        a.assetNumber?.toLowerCase().includes(q) ||
        a.assetName?.toLowerCase().includes(q) ||
        a.serialNumber?.toLowerCase().includes(q) ||
        a.tagEpc?.toLowerCase().includes(q)
      );
    }

    if (site && site !== 'All Sites') {
      filtered = filtered.filter(a => a.site === site);
    }
    if (building && building !== 'All Buildings') {
      filtered = filtered.filter(a => a.building === building);
    }
    if (location && location !== 'All Locations') {
      filtered = filtered.filter(a => a.currentLocation?.includes(location));
    }
    if (assetType && assetType !== 'All Types') {
      filtered = filtered.filter(a => a.assetType === assetType);
    }
    if (department && department !== 'All Departments') {
      filtered = filtered.filter(a => a.department === department);
    }
    if (assignedTo && assignedTo !== 'All Users') {
      filtered = filtered.filter(a => a.assignedTo === assignedTo);
    }
    if (status && status !== 'All Status') {
      filtered = filtered.filter(a => a.status === status);
    }

    // Sort
    filtered.sort((a, b) => {
      const valA = a[sortBy] || '';
      const valB = b[sortBy] || '';
      if (sortOrder === 'desc') {
        return valB.localeCompare(valA);
      }
      return valA.localeCompare(valB);
    });

    const total = filtered.length;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const start = (pageNum - 1) * limitNum;
    const paginated = filtered.slice(start, start + limitNum);

    return {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      assets: paginated
    };
  }

  /**
   * Get Single Asset Details with sub-tabs
   */
  static async getAssetById(assetId) {
    if (isDbConnected()) {
      try {
        const a = await prisma.asset.findFirst({
          where: {
            OR: [
              { id: assetId },
              { assetId: assetId }
            ]
          },
          include: {
            category: true,
            site: true,
            building: true,
            floor: true,
            room: true,
            department: true,
            custodian: true,
            model: true,
            manufacturer: true
          }
        });
        if (a) {
          const locParts = [a.site?.name, a.building?.name, a.floor?.name, a.room?.name].filter(Boolean);
          const fullLoc = locParts.length ? locParts.join(' > ') : (a.site?.name || 'Dubai HQ');
          return {
            id: a.id,
            assetNumber: a.assetId || a.tagNumber,
            assetName: a.description || a.assetId,
            assetType: a.category?.name || 'General',
            category: a.category?.name || 'General',
            currentLocation: fullLoc,
            fullLocation: fullLoc,
            site: a.site?.name || 'Dubai HQ',
            building: a.building?.name || 'Block A',
            floor: a.floor?.name || 'Ground Floor',
            room: a.room?.name || 'General',
            assignedTo: a.custodian ? (a.custodian.fullName || a.custodian.firstName) : 'Unassigned',
            assignedToId: a.custodianId || null,
            department: a.department?.name || 'General',
            status: a.custodian ? 'Assigned' : 'Unassigned',
            serialNumber: a.serialNumber || 'N/A',
            tagEpc: a.tagNumber || a.rfidEpc || 'N/A',
            model: a.model?.name || 'Standard',
            manufacturer: a.manufacturer?.name || 'OEM'
          };
        }
      } catch (err) {
        throw err;
      }
    }
    return null;
  }

  /**
   * Submit Asset Assignment
   */
  static async submitAssignment(payload, user) {
    const {
      assetId,
      custodianId,
      assignmentType = 'Employee',
      assignedTo,
      department,
      location = 'Dubai HQ',
      building = 'Block A',
      floor = 'Ground Floor',
      room = 'IT-101',
      assignmentDate = new Date().toISOString().slice(0, 10),
      expectedReturnDate,
      assignmentPurpose = 'Regular Use',
      conditionAtIssue = 'Good',
      accessoriesIncluded,
      remarks,
      signatureData,
      photoEvidence,
      requireApproval = false,
      isDraft = false
    } = payload;

    let asset = assetsStore.find(a => a.id === assetId || a.assetNumber === assetId);
    if (!asset) {
      try {
        const dbAsset = await prisma.asset.findFirst({
          where: {
            OR: [
              { id: assetId },
              { assetId: assetId }
            ]
          },
          include: { site: true, building: true, room: true, custodian: true }
        });
        if (dbAsset) {
          asset = {
            id: dbAsset.id,
            assetNumber: dbAsset.assetId,
            assetName: dbAsset.description || dbAsset.assetId,
            currentLocation: `${dbAsset.site?.name || ''} ${dbAsset.building?.name || ''} ${dbAsset.room?.name || ''}`.trim() || 'Dubai HQ',
            assignedTo: dbAsset.custodian ? `${dbAsset.custodian.fullName || dbAsset.custodian.firstName || ''}`.trim() : 'Unassigned',
            status: dbAsset.lifecycleStatus || 'Available'
          };
          assetsStore.push(asset);
        }
      } catch (e) {
        console.warn('DB lookup warning in submitAssignment:', e.message);
      }
    }
    if (!asset) {
      asset = {
        id: assetId,
        assetNumber: assetId,
        assetName: 'Asset ' + assetId,
        currentLocation: 'Dubai HQ',
        assignedTo: 'Unassigned',
        status: 'Available'
      };
      assetsStore.push(asset);
    }

    const assignmentId = `ASN-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;
    const timestamp = new Date().toISOString();

    if (isDraft) {
      return {
        success: true,
        isDraft: true,
        assignmentId,
        message: 'Assignment saved as draft successfully.'
      };
    }

    if (requireApproval) {
      const requestId = `REQ-${String(Math.floor(10000 + Math.random() * 90000))}`;
      const approvalReq = {
        requestId,
        assetNo: asset.assetNumber,
        assetName: asset.assetName,
        requestType: 'Assignment',
        requestedBy: user?.name || assignedTo || 'Ahmed Khan',
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        status: 'Pending',
        fromLocation: asset.currentLocation,
        toLocation: `${location} > ${building} > ${floor}`,
        newCustodian: assignedTo
      };
      pendingApprovalsStore.unshift(approvalReq);

      return {
        success: true,
        requireApproval: true,
        requestId,
        message: 'Assignment submitted for workflow approval.'
      };
    }

    // Update Asset Master directly
    const previousCustodian = asset.assignedTo;
    const previousLocation = asset.currentLocation;
    const isUnassigning = !custodianId && (assignedTo === 'Unassigned' || !assignedTo || assignedTo === '__unassign__');

    asset.status = isUnassigning ? 'Available' : 'Assigned';
    asset.assignedTo = isUnassigning ? 'Unassigned' : assignedTo;
    asset.department = isUnassigning ? '' : (department || asset.department);
    asset.site = location;
    asset.building = building;
    asset.floor = floor;
    asset.room = room;
    asset.currentLocation = `${location} > ${building} > ${floor}`;
    asset.fullLocation = `${location} > ${building} > ${floor} > ${room}`;
    asset.assignedDate = isUnassigning ? null : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    asset.lastMoved = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    asset.lastMovedDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    // Record in Recent Activity
    recentMovementsStore.unshift({
      id: `REC-${Date.now().toString().slice(-4)}`,
      dateTime: asset.lastMoved,
      assetNo: asset.assetNumber,
      assetName: asset.assetName,
      action: isUnassigning ? 'Unassigned' : 'Assigned',
      from: previousLocation,
      to: asset.currentLocation,
      by: user?.name || assignedTo || 'Ahmed Khan',
      status: 'Completed'
    });

    // Record in Movement History
    movementHistoryStore.unshift({
      movementId: `MOV-${Date.now().toString().slice(-6)}`,
      assetNumber: asset.assetNumber,
      assetName: asset.assetName,
      movementType: isUnassigning ? 'Custody Return' : 'Custodian Assignment',
      fromLocation: previousLocation,
      toLocation: asset.fullLocation,
      previousCustodian,
      newCustodian: isUnassigning ? 'Unassigned' : assignedTo,
      movementDate: asset.lastMoved,
      requestedBy: user?.name || 'System Admin',
      approvedBy: 'Auto-Approved (Direct Issue)',
      receivedBy: isUnassigning ? 'Store Inventory' : assignedTo,
      reason: assignmentPurpose,
      condition: conditionAtIssue,
      status: 'Completed',
      remarks: remarks || accessoriesIncluded || (isUnassigning ? 'Unassigned to store' : 'Assigned')
    });

    // Persist to Prisma DB
    try {
      const dbAsset = await prisma.asset.findFirst({
        where: {
          OR: [
            { id: asset.id },
            { assetId: asset.assetNumber || asset.id }
          ]
        }
      });
      if (dbAsset) {
        let employeeId = isUnassigning ? null : (custodianId || null);
        if (!isUnassigning && !employeeId && assignedTo) {
          const emp = await prisma.employee.findFirst({
            where: {
              OR: [
                { id: assignedTo },
                { employeeCode: assignedTo },
                { fullName: assignedTo },
                { fullName: { contains: assignedTo } }
              ]
            }
          });
          if (emp) employeeId = emp.id;
        }

        let siteId = dbAsset.siteId;
        if (location) {
          const site = await prisma.site.findFirst({
            where: { OR: [{ id: location }, { name: { contains: location } }, { code: location }] }
          });
          if (site) siteId = site.id;
        }

        let buildingId = dbAsset.buildingId;
        if (building) {
          const bld = await prisma.building.findFirst({
            where: { OR: [{ id: building }, { name: { contains: building } }] }
          });
          if (bld) buildingId = bld.id;
        }

        let roomId = dbAsset.roomId;
        if (room) {
          const rm = await prisma.room.findFirst({
            where: { OR: [{ id: room }, { name: { contains: room } }] }
          });
          if (rm) roomId = rm.id;
        }

        // Resolve valid user in DB for foreign key constraint
        let validUserId = null;
        if (user?.id) {
          const u = await prisma.user.findUnique({ where: { id: user.id } }).catch(() => null);
          if (u) validUserId = u.id;
        }
        if (!validUserId) {
          const defaultUser = await prisma.user.findFirst().catch(() => null);
          if (defaultUser) validUserId = defaultUser.id;
        }

        if (isUnassigning || !employeeId) {
          // Close any active custody assignments
          await prisma.custodyAssignment.updateMany({
            where: { assetId: dbAsset.id, active: true },
            data: {
              active: false,
              actualReturnDate: new Date(),
              conditionAtReturn: conditionAtIssue || 'Good'
            }
          }).catch(e => console.warn('Could not close active custody records:', e.message));

          await prisma.asset.update({
            where: { id: dbAsset.id },
            data: {
              lifecycleStatus: 'AVAILABLE',
              custodianId: null,
              ...(siteId ? { siteId } : {}),
              ...(buildingId ? { buildingId } : {}),
              ...(roomId ? { roomId } : {}),
              condition: conditionAtIssue || dbAsset.condition || 'GOOD'
            }
          });

          if (validUserId) {
            await prisma.assetTransaction.create({
              data: {
                assetId: dbAsset.id,
                transactionType: 'UNASSIGN',
                fromStatus: dbAsset.lifecycleStatus || 'ASSIGNED',
                toStatus: 'AVAILABLE',
                performedByUserId: validUserId,
                notes: remarks || 'Custodian unassigned - returned to inventory store'
              }
            }).catch(e => console.warn('Could not record unassign transaction:', e.message));
          }
        } else {
          // Re-assignment: Close prior active custody assignments first
          await prisma.custodyAssignment.updateMany({
            where: { assetId: dbAsset.id, active: true },
            data: {
              active: false,
              actualReturnDate: new Date()
            }
          }).catch(e => console.warn('Could not close prior custody records:', e.message));

          await prisma.asset.update({
            where: { id: dbAsset.id },
            data: {
              lifecycleStatus: 'ASSIGNED',
              custodianId: employeeId,
              ...(siteId ? { siteId } : {}),
              ...(buildingId ? { buildingId } : {}),
              ...(roomId ? { roomId } : {}),
              assignedDate: new Date(),
              condition: conditionAtIssue || dbAsset.condition || 'GOOD'
            }
          });

          if (validUserId) {
            await prisma.custodyAssignment.create({
              data: {
                assetId: dbAsset.id,
                custodianId: employeeId,
                issuedDate: new Date(),
                conditionAtIssue: conditionAtIssue || 'Good',
                issuedByUserId: validUserId,
                acknowledged: true,
                acknowledgementDate: new Date(),
                active: true
              }
            }).catch(e => console.warn('Could not create custody record in DB:', e.message));

            await prisma.assetTransaction.create({
              data: {
                assetId: dbAsset.id,
                transactionType: 'ASSIGN',
                fromStatus: dbAsset.lifecycleStatus || 'AVAILABLE',
                toStatus: 'ASSIGNED',
                performedByUserId: validUserId,
                notes: remarks || `Assigned to custodian (${assignedTo || employeeId})`
              }
            }).catch(e => console.warn('Could not record asset transaction in DB:', e.message));
          }
        }
      }
    } catch (dbErr) {
      console.warn('Prisma DB update error in submitAssignment:', dbErr.message);
    }

    return {
      success: true,
      assignmentId,
      asset,
      message: 'Asset assigned successfully.'
    };
  }

  /**
   * Submit Asset Transfer / Movement
   */
  static async submitTransfer(payload, user) {
    const {
      assetIds = [],
      transferType = 'Location Transfer', // Location, Department, Custodian, Site-to-Site, Inter-Company, Bulk
      destinationSite = 'Dubai HQ',
      destinationBuilding = 'Block A',
      destinationFloor = '1st Floor',
      destinationRoom = 'Room 101',
      destinationDepartment,
      newCustodian,
      effectiveDate = new Date().toISOString().slice(0, 10),
      reason = 'Inter-department reallocation',
      condition = 'Good',
      requireDispatch = false,
      requireApproval = false
    } = payload;

    const movementId = `MOV-${String(Math.floor(1000 + Math.random() * 9000))}`;
    const timestamp = new Date().toISOString();

    const affectedAssets = [];

    for (const assetId of assetIds) {
      let asset = assetsStore.find(a => a.id === assetId || a.assetNumber === assetId);
      if (!asset) {
        try {
          const dbAsset = await prisma.asset.findFirst({
            where: {
              OR: [
                { id: assetId },
                { assetId: assetId }
              ]
            },
            include: { site: true, building: true, room: true, custodian: true }
          });
          if (dbAsset) {
            asset = {
              id: dbAsset.id,
              assetNumber: dbAsset.assetId,
              assetName: dbAsset.description || dbAsset.assetId,
              currentLocation: `${dbAsset.site?.name || ''} ${dbAsset.building?.name || ''} ${dbAsset.room?.name || ''}`.trim() || 'Dubai HQ',
              assignedTo: dbAsset.custodian ? `${dbAsset.custodian.fullName || dbAsset.custodian.firstName || ''}`.trim() : 'Unassigned',
              status: dbAsset.lifecycleStatus || 'Available'
            };
            assetsStore.push(asset);
          }
        } catch (e) {
          console.warn('DB lookup warning in submitTransfer:', e.message);
        }
      }
      if (!asset) {
        asset = {
          id: assetId,
          assetNumber: assetId,
          assetName: 'Asset ' + assetId,
          currentLocation: 'Dubai HQ',
          assignedTo: 'Unassigned',
          status: 'Available'
        };
        assetsStore.push(asset);
      }

      if (requireApproval) {
        pendingApprovalsStore.unshift({
          requestId: `REQ-${String(Math.floor(10000 + Math.random() * 90000))}`,
          assetNo: asset.assetNumber,
          assetName: asset.assetName,
          requestType: 'Transfer',
          requestedBy: user?.name || 'Authorized Requester',
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          status: 'Pending',
          fromLocation: asset.currentLocation,
          toLocation: `${destinationSite} > ${destinationBuilding} > ${destinationFloor}`,
          newCustodian: newCustodian || asset.assignedTo
        });
        continue;
      }

      const prevLocation = asset.currentLocation;
      const prevCustodian = asset.assignedTo;

      if (requireDispatch) {
        asset.status = 'In Transit';
        asset.remarks = `In transit to ${destinationSite} (${destinationRoom})`;
      } else {
        asset.currentLocation = `${destinationSite} > ${destinationBuilding} > ${destinationFloor}`;
        asset.fullLocation = `${destinationSite} > ${destinationBuilding} > ${destinationFloor} > ${destinationRoom}`;
        asset.site = destinationSite;
        asset.building = destinationBuilding;
        asset.floor = destinationFloor;
        asset.room = destinationRoom;
        if (destinationDepartment) asset.department = destinationDepartment;
        if (newCustodian) asset.assignedTo = newCustodian;
      }

      asset.lastMoved = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      asset.lastMovedDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

      recentMovementsStore.unshift({
        id: `REC-${Date.now().toString().slice(-4)}`,
        dateTime: asset.lastMoved,
        assetNo: asset.assetNumber,
        assetName: asset.assetName,
        action: 'Transferred',
        from: prevLocation,
        to: asset.currentLocation,
        by: user?.name || 'Operator',
        status: requireDispatch ? 'In Transit' : 'Completed'
      });

      movementHistoryStore.unshift({
        movementId,
        assetNumber: asset.assetNumber,
        assetName: asset.assetName,
        movementType: transferType,
        fromLocation: prevLocation,
        toLocation: asset.fullLocation,
        previousCustodian: prevCustodian,
        newCustodian: newCustodian || prevCustodian,
        movementDate: asset.lastMoved,
        requestedBy: user?.name || 'Operations',
        approvedBy: 'Standard Approval',
        receivedBy: requireDispatch ? 'Pending Receipt' : (newCustodian || prevCustodian),
        reason,
        condition,
        status: requireDispatch ? 'In Transit' : 'Completed',
        remarks: `Transfer ${transferType}`
      });

      // Persist to Prisma DB
      try {
        const dbAsset = await prisma.asset.findFirst({
          where: {
            OR: [
              { id: asset.id },
              { assetId: asset.assetNumber || asset.id }
            ]
          }
        });
        if (dbAsset) {
          let employeeId = dbAsset.custodianId;
          if (newCustodian) {
            const emp = await prisma.employee.findFirst({
              where: {
                OR: [
                  { id: newCustodian },
                  { employeeCode: newCustodian },
                  { fullName: { contains: newCustodian } }
                ]
              }
            });
            if (emp) employeeId = emp.id;
          }

          let siteId = dbAsset.siteId;
          if (destinationSite) {
            const site = await prisma.site.findFirst({
              where: { OR: [{ id: destinationSite }, { name: { contains: destinationSite } }, { code: destinationSite }] }
            });
            if (site) siteId = site.id;
          }

          let buildingId = dbAsset.buildingId;
          if (destinationBuilding) {
            const bld = await prisma.building.findFirst({
              where: { OR: [{ id: destinationBuilding }, { name: { contains: destinationBuilding } }] }
            });
            if (bld) buildingId = bld.id;
          }

          let roomId = dbAsset.roomId;
          if (destinationRoom) {
            const rm = await prisma.room.findFirst({
              where: { OR: [{ id: destinationRoom }, { name: { contains: destinationRoom } }] }
            });
            if (rm) roomId = rm.id;
          }

          await prisma.asset.update({
            where: { id: dbAsset.id },
            data: {
              lifecycleStatus: requireDispatch ? 'IN_TRANSIT' : (newCustodian ? 'ASSIGNED' : 'IN_SERVICE'),
              ...(employeeId ? { custodianId: employeeId } : {}),
              ...(siteId ? { siteId } : {}),
              ...(buildingId ? { buildingId } : {}),
              ...(roomId ? { roomId } : {}),
              condition: condition || dbAsset.condition || 'GOOD'
            }
          });

          const defaultUser = await prisma.user.findFirst();
          if (defaultUser) {
            await prisma.assetTransfer.create({
              data: {
                transferNumber: movementId,
                assetId: dbAsset.id,
                transferType: transferType || 'Location Transfer',
                fromSiteId: dbAsset.siteId,
                toSiteId: siteId,
                fromRoomId: dbAsset.roomId,
                toRoomId: roomId,
                fromCustodianId: dbAsset.custodianId,
                toCustodianId: employeeId,
                status: requireDispatch ? 'IN_TRANSIT' : 'COMPLETED',
                reason: reason || 'Transfer',
                requestedByUserId: user?.id || defaultUser.id,
                dispatchDate: new Date(),
                receiveDate: requireDispatch ? null : new Date()
              }
            }).catch(e => console.warn('Could not create assetTransfer record in Prisma:', e.message));
          }
        }
      } catch (err) {
        console.warn('Prisma DB update error in submitTransfer:', err.message);
      }

      affectedAssets.push(asset);
    }

    return {
      success: true,
      movementId,
      totalMoved: affectedAssets.length,
      assets: affectedAssets,
      message: requireApproval ? 'Transfer request submitted for approval.' : 'Transfer completed successfully.'
    };
  }

  /**
   * Confirm Receipt of In-Transit Asset
   */
  static async confirmReceipt(transferId, payload, user) {
    const { assetNumber, receivedCondition = 'Good', remarks } = payload;
    const asset = assetsStore.find(a => a.assetNumber === assetNumber);
    if (!asset) throw new Error('Asset not found');

    asset.status = 'Assigned';
    asset.lastMoved = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return {
      success: true,
      message: 'Receipt confirmed. Asset Master updated to active destination.',
      asset
    };
  }

  /**
   * Process Pending Approval Action (Approve / Reject)
   */
  static async processApproval(requestId, action, remarks, user) {
    const idx = pendingApprovalsStore.findIndex(p => p.requestId === requestId);
    if (idx === -1) throw new Error('Approval request not found');

    const req = pendingApprovalsStore[idx];
    pendingApprovalsStore.splice(idx, 1);

    const asset = assetsStore.find(a => a.assetNumber === req.assetNo);

    if (action === 'APPROVE' && asset) {
      asset.currentLocation = req.toLocation;
      if (req.newCustodian) asset.assignedTo = req.newCustodian;
      asset.status = 'Assigned';

      recentMovementsStore.unshift({
        id: `REC-${Date.now().toString().slice(-4)}`,
        dateTime: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' 12:00',
        assetNo: asset.assetNumber,
        assetName: asset.assetName,
        action: req.requestType === 'Assignment' ? 'Assigned' : 'Transferred',
        from: req.fromLocation,
        to: req.toLocation,
        by: req.requestedBy,
        status: 'Completed'
      });
    }

    return {
      success: true,
      requestId,
      action,
      message: `Request ${requestId} has been ${action === 'APPROVE' ? 'Approved' : 'Rejected'}.`
    };
  }

  /**
   * Get Pending Approvals list
   */
  static async getPendingApprovals() {
    if (!isDbConnected()) throw new Error('Database is unavailable.');
    const rows = await prisma.assetTransfer.findMany({
      where: { status: { in: ['PENDING', 'PENDING_APPROVAL', 'REQUESTED'] } },
      include: { asset: { include: { site: true } }, requestedBy: true, toCustodian: true },
      orderBy: { createdAt: 'desc' }
    });
    return rows.map(t => ({
      requestId: t.transferNumber, assetNo: t.asset?.assetId || '', assetName: t.asset?.description || '',
      requestType: t.transferType, requestedBy: t.requestedBy?.fullName || '',
      date: t.createdAt.toLocaleDateString('en-GB'), status: t.status,
      fromLocation: t.asset?.site?.name || '', toLocation: t.toSiteId || '',
      newCustodian: t.toCustodian?.fullName || ''
    }));
  }

  static async getRecentMovements() {
    if (!isDbConnected()) throw new Error('Database is unavailable.');
    const rows = await prisma.assetTransfer.findMany({
      include: { asset: { include: { site: true } }, requestedBy: true, toCustodian: true },
      orderBy: { createdAt: 'desc' }, take: 25
    });
    return rows.map(t => ({
      id: t.transferNumber, dateTime: t.createdAt.toLocaleString('en-GB'),
      assetNo: t.asset?.assetId || '', assetName: t.asset?.description || '',
      action: t.transferType || 'Transfer', from: t.asset?.site?.name || '',
      to: t.toSiteId || '', by: t.requestedBy?.fullName || '', status: t.status
    }));
  }

  /**
   * Get Movement History list with server-side filters, search, pagination & KPIs
   */
  static async getMovementHistory(params = {}) {
    const {
      search = '',
      assetNo = '',
      movementType = 'All',
      site = 'All Sites',
      department = 'All Departments',
      custodian = 'All',
      status = 'All',
      fromDate = '',
      toDate = '',
      page = 1,
      limit = 10
    } = params;

    let dbTransfers = [];
    try {
      dbTransfers = await prisma.assetTransfer.findMany({
        include: {
          asset: { include: { category: true, site: true } },
          fromCustodian: true,
          toCustodian: true,
          requestedBy: true
        },
        orderBy: { createdAt: 'desc' }
      });
    } catch (e) {
      console.warn('Prisma getMovementHistory failed:', e.message);
    }

    let records = [];
    if (dbTransfers && dbTransfers.length > 0) {
      records = dbTransfers.map(t => {
        const isCompleted = t.status === 'COMPLETED';
        const isInTransit = t.status === 'IN_TRANSIT';
        const isPending = t.status === 'PENDING_APPROVAL';
        const dispStatus = isCompleted ? 'Completed' : isInTransit ? 'In Transit' : isPending ? 'Pending' : 'Completed';

        return {
          movementId: t.transferNumber,
          assetNumber: t.asset?.assetId || 'AS-0001',
          assetName: t.asset?.description || 'Enterprise Asset',
          serialNumber: t.asset?.serialNumber || '',
          tagEpc: t.asset?.rfidEpc || '',
          movementType: t.transferType || 'Location Transfer',
          fromLocation: t.fromSite?.name || 'Dubai HQ',
          toLocation: t.toSite?.name || 'Abu Dhabi Hub',
          fromCustodian: t.fromCustodian?.fullName || '-',
          toCustodian: t.toCustodian?.fullName || '-',
          movementDate: new Date(t.createdAt).toLocaleDateString('en-GB'),
          movementTime: new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: dispStatus,
          requestedBy: t.requestedBy?.fullName || t.requestedBy?.username || 'Admin',
          approvedBy: 'System Administrator',
          dispatchedBy: 'Logistics Courier',
          receivedBy: t.toCustodian?.fullName || '-',
          reason: t.reason || 'Operational Relocation',
          condition: t.asset?.condition || 'Good',
          accessories: 'Standard accessories included',
          site: t.toSite?.name || 'Dubai HQ',
          department: 'Information Technology',
          sourceHierarchy: { site: t.fromSite?.name || 'Dubai HQ', building: 'Block A', floor: '1F', room: '101' },
          destHierarchy: { site: t.toSite?.name || 'Abu Dhabi Hub', building: 'Main Tower', floor: '2F', room: '205' },
          timeline: [
            { stage: 'Requested', time: new Date(t.createdAt).toLocaleDateString('en-GB'), user: t.requestedBy?.username || 'Admin', status: 'Completed', note: t.reason || 'Initiated' },
            { stage: 'Approved', time: new Date(t.createdAt).toLocaleDateString('en-GB'), user: 'System Admin', status: 'Completed', note: 'Approved' },
            { stage: isCompleted ? 'Completed' : 'In Transit', time: new Date(t.createdAt).toLocaleDateString('en-GB'), user: 'Courier', status: 'Completed', note: dispStatus }
          ],
          workflow: [
            { level: 'Asset Admin Approval', approver: 'System Admin', decision: 'Approved', timestamp: new Date(t.createdAt).toLocaleDateString('en-GB'), comments: 'Approved' }
          ],
          documents: [],
          bulkAssets: []
        };
      });
    }

    if (records.length === 0) {
      records = [...movementHistoryStore];
    }

    let filtered = records;
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(m =>
        m.movementId.toLowerCase().includes(q) ||
        m.assetNumber.toLowerCase().includes(q) ||
        m.assetName.toLowerCase().includes(q) ||
        (m.serialNumber && m.serialNumber.toLowerCase().includes(q))
      );
    }
    if (status && status !== 'All') {
      filtered = filtered.filter(m => m.status.toLowerCase() === status.toLowerCase());
    }

    const total = filtered.length;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const start = (pageNum - 1) * limitNum;
    const paginated = filtered.slice(start, start + limitNum);

    const kpis = {
      totalMovements: records.length,
      completed: records.filter(m => m.status === 'Completed').length,
      inTransit: records.filter(m => m.status === 'In Transit').length,
      pendingReceipt: records.filter(m => m.status === 'Pending').length,
      cancelledRejected: 0
    };

    return {
      history: paginated,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      kpis
    };
  }

  /**
   * Get Single Movement Record by ID with full timeline, workflow & documents
   */
  static async getMovementById(movementId) {
    const movement = movementHistoryStore.find(m => m.movementId === movementId);
    if (!movement) return null;

    const asset = assetsStore.find(a => a.assetNumber === movement.assetNumber);

    return {
      ...movement,
      assetDetails: asset || null
    };
  }
}

export default CustodyTransfersService;
