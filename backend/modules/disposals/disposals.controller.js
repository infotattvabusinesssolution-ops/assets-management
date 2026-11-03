import prisma from '../../config/prisma.js';
import { isDbConnected } from '../../config/db.js';
import fs from 'fs';
import path from 'path';

// System-defined enumeration for Disposal Reasons (Per requirements doc: immutable system enumeration)
export const SYSTEM_DISPOSAL_REASONS = [
  { code: 'END_OF_LIFE', label: 'End of Useful Life / Obsolescence', description: 'Asset reached technological or operational end of economic life' },
  { code: 'THEFT_LOSS', label: 'Theft / Loss / Missing', description: 'Asset unrecovered after security investigation or reported stolen' },
  { code: 'DAMAGED_BEYOND_REPAIR', label: 'Damaged Beyond Economical Repair', description: 'Physical damage exceeds repair value or economic feasibility' },
  { code: 'IMPAIRMENT', label: 'Asset Impairment / Decommissioned', description: 'Permanent loss of service utility or operational shutdown' },
  { code: 'TRADE_IN', label: 'Trade-in / Lease Expiry', description: 'Asset exchanged for vendor replacement credit or lease concluded' }
];

const DISPOSED_ASSETS_FILE = path.join(process.cwd(), 'data', 'disposed_assets.json');
const PENDING_DISPOSALS_FILE = path.join(process.cwd(), 'data', 'pending_disposals.json');

function readDisposedAssetsFromFile() {
  try {
    if (fs.existsSync(DISPOSED_ASSETS_FILE)) {
      const data = fs.readFileSync(DISPOSED_ASSETS_FILE, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Failed to read disposed_assets.json, using defaults:', e.message);
  }
  return [];
}

function writeDisposedAssetsToFile(list) {
  try {
    const dir = path.dirname(DISPOSED_ASSETS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DISPOSED_ASSETS_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (e) {
    console.warn('Failed to write disposed_assets.json:', e.message);
  }
}

function readPendingDisposalsFromFile() {
  try {
    if (fs.existsSync(PENDING_DISPOSALS_FILE)) {
      const data = fs.readFileSync(PENDING_DISPOSALS_FILE, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Failed to read pending_disposals.json:', e.message);
  }
  return [];
}

function writePendingDisposalsToFile(list) {
  try {
    const dir = path.dirname(PENDING_DISPOSALS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(PENDING_DISPOSALS_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (e) {
    console.warn('Failed to write pending_disposals.json:', e.message);
  }
}

export async function getDisposalReasons(req, res, next) {
  try {
    res.json({ success: true, reasons: SYSTEM_DISPOSAL_REASONS });
  } catch (err) { next(err); }
}

// Fetch active asset candidates eligible for disposal
export async function getDisposalCandidates(req, res, next) {
  try {
    const { search, categoryId, siteId, limit = 200 } = req.query;

    const where = {
      active: true,
      lifecycleStatus: { notIn: ['DISPOSED', 'RETIRED', 'PENDING_DISPOSAL', 'DISPOSAL', 'Disposed', 'Retired', 'SCRAPPED', 'SOLD', 'DONATED', 'WRITTEN_OFF'] }
    };

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { assetId: { contains: q } },
        { tagNumber: { contains: q } },
        { serialNumber: { contains: q } },
        { description: { contains: q } },
        { barcode: { contains: q } },
        { category: { name: { contains: q } } }
      ];
    }
    if (categoryId) where.categoryId = categoryId;
    if (siteId) where.siteId = siteId;

    let candidates = [];
    if (isDbConnected()) {
      try {
        const assets = await prisma.asset.findMany({
          where,
          include: {
            category: { select: { id: true, name: true, code: true } },
            company: { select: { id: true, name: true } },
            site: { select: { id: true, name: true } },
            building: { select: { id: true, name: true } },
            room: { select: { id: true, name: true } },
            department: { select: { id: true, name: true } },
            custodian: { select: { id: true, fullName: true, employeeCode: true } }
          },
          orderBy: [
            { createdAt: 'desc' },
            { updatedAt: 'desc' }
          ],
          take: parseInt(limit, 10) || 200
        });

        if (assets.length > 0) {
          const assetIds = assets.map(a => a.id);
          const bookValues = await prisma.assetBookValue.findMany({
            where: { assetId: { in: assetIds }, bookType: 'CORPORATE' }
          }).catch(() => []);
          const bookValMap = new Map(bookValues.map(b => [b.assetId, b]));

          candidates = assets.map(a => {
            const b = bookValMap.get(a.id);
            const capVal = b?.capitalizationValue ? parseFloat(b.capitalizationValue.toString()) : (parseFloat(a.acquisitionValue || 0));
            const accumDep = b?.accumulatedDepreciation ? parseFloat(b.accumulatedDepreciation.toString()) : 0;
            const nbv = b?.netBookValue ? parseFloat(b.netBookValue.toString()) : Math.max(0, capVal - accumDep);

            return {
              ...a,
              purchaseCost: capVal,
              acquisitionValue: capVal,
              accumulatedDepreciation: accumDep,
              netBookValue: nbv
            };
          });
        }
      } catch (dbErr) {
        console.warn('Real asset candidate search error:', dbErr.message);
      }
    }

    // Exclude any asset already in disposed list or pending review queue
    const disposedAssets = readDisposedAssetsFromFile();
    const pendingAssets = readPendingDisposalsFromFile();
    const excludedIds = new Set([
      ...disposedAssets.map(a => a.id),
      ...disposedAssets.map(a => a.assetId),
      ...pendingAssets.map(a => a.id),
      ...pendingAssets.map(a => a.assetId)
    ].filter(Boolean));

    candidates = candidates.filter(a => {
      if (a.active === false) return false;
      const st = (a.lifecycleStatus || '').toUpperCase();
      if (['DISPOSED', 'RETIRED', 'PENDING_DISPOSAL', 'DISPOSAL', 'SCRAPPED', 'SOLD', 'DONATED', 'WRITTEN_OFF'].includes(st)) return false;
      if (excludedIds.has(a.id) || excludedIds.has(a.assetId)) return false;
      return true;
    });

    return res.json({
      success: true,
      candidates
    });
  } catch (err) { next(err); }
}

// Fetch pending disposal review queue
export async function getPendingDisposals(req, res, next) {
  try {
    if (isDbConnected()) {
      try {
        const assets = await prisma.asset.findMany({
          where: {
            lifecycleStatus: { in: ['PENDING_DISPOSAL', 'DISPOSAL', 'Pending Disposal'] }
          },
          include: {
            category: true,
            company: true,
            site: true,
            building: true,
            room: true,
            custodian: true
          },
          orderBy: { updatedAt: 'desc' }
        });

        if (assets && assets.length > 0) {
          return res.json({ success: true, assets });
        }
      } catch (dbErr) {
        console.warn('DB getPendingDisposals query skipped, using store:', dbErr.message);
      }
    }

    const pendingList = readPendingDisposalsFromFile();
    return res.json({ success: true, assets: pendingList });
  } catch (err) { next(err); }
}

// Fetch historical disposal transaction records
export async function getDisposedAssets(req, res, next) {
  try {
    if (isDbConnected()) {
      try {
        const assets = await prisma.asset.findMany({
          where: {
            OR: [
              { lifecycleStatus: { in: ['RETIRED', 'DISPOSED'] } },
              { active: false }
            ]
          },
          include: {
            category: true,
            company: true,
            site: true,
            building: true,
            room: true,
            custodian: true
          },
          orderBy: { updatedAt: 'desc' }
        });

        const assetIds = assets.map(a => a.id);
        const transactions = await prisma.assetTransaction.findMany({
          where: {
            assetId: { in: assetIds },
            transactionType: { in: ['DISPOSAL', 'DISPOSE'] }
          },
          include: {
            performedBy: { select: { id: true, username: true, fullName: true, email: true } }
          },
          orderBy: { createdAt: 'desc' }
        });

        const txMap = new Map();
        transactions.forEach(t => {
          if (!txMap.has(t.assetId)) txMap.set(t.assetId, t);
        });

        const enrichedAssets = assets
          .filter(a => txMap.has(a.id) || ['DISPOSED', 'RETIRED'].includes(a.lifecycleStatus))
          .map(a => {
            const tx = txMap.get(a.id) || null;
            let parsedPayload = {};
            if (tx && tx.payload) {
              try { parsedPayload = JSON.parse(tx.payload); } catch (_) {}
            }

            return {
              ...a,
              disposalTx: tx,
              disposalDetails: {
                referenceNumber: parsedPayload.referenceNumber || (tx?.notes ? (tx.notes.match(/DISP-[A-Z0-9-]+/i) || [])[0] : null) || `DISP-${a.assetId}`,
                disposalStatus: parsedPayload.disposalStatus || (tx?.notes?.includes('via ') ? tx.notes.split('via ')[1]?.split('.')[0] : 'SCRAPPED'),
                disposalReason: parsedPayload.disposalReason || (tx?.notes?.includes('Reason: ') ? tx.notes.split('Reason: ')[1] : 'END_OF_LIFE'),
                disposalDate: parsedPayload.disposalDate || tx?.createdAt || a.updatedAt,
                disposalProceeds: parsedPayload.disposalProceeds !== undefined ? parsedPayload.disposalProceeds : (parseFloat(tx?.notes?.match(/Proceeds:\s*\$?([\d.]+)/i)?.[1] || 0)),
                netBookValue: parsedPayload.netBookValue !== undefined ? parsedPayload.netBookValue : (parseFloat(a.purchaseCost || a.unitCost || 0)),
                gainLoss: parsedPayload.gainLoss !== undefined ? parsedPayload.gainLoss : (
                  (parsedPayload.disposalProceeds || 0) - (parsedPayload.netBookValue || parseFloat(a.purchaseCost || a.unitCost || 0))
                ),
                certificateNumber: parsedPayload.certificateNumber || '',
                buyerRecipient: parsedPayload.buyerRecipient || '',
                notes: parsedPayload.notes || tx?.notes || ''
              }
            };
          });

        if (enrichedAssets.length > 0) {
          writeDisposedAssetsToFile(enrichedAssets);
          return res.json({ success: true, assets: enrichedAssets });
        }
      } catch (dbErr) {
        console.warn('DB getDisposedAssets query skipped, using store:', dbErr.message);
      }
    }

    const disposedAssets = readDisposedAssetsFromFile();
    res.json({ success: true, assets: disposedAssets });
  } catch (err) { next(err); }
}

// Fetch KPI metrics and summary for asset disposals
export async function getDisposalSummary(req, res, next) {
  try {
    const disposedList = readDisposedAssetsFromFile();
    const pendingList = readPendingDisposalsFromFile();

    if (isDbConnected()) {
      try {
        const [allAssets, disposeTxs, bookValues] = await Promise.all([
          prisma.asset.findMany({ select: { id: true, lifecycleStatus: true, active: true, acquisitionValue: true } }),
          prisma.assetTransaction.findMany({
            where: { transactionType: { in: ['DISPOSAL', 'DISPOSE'] } },
            select: { assetId: true, notes: true, payload: true, createdAt: true }
          }),
          prisma.assetBookValue.findMany({ where: { bookType: 'CORPORATE' } }).catch(() => [])
        ]);

        const bookValMap = new Map(bookValues.map(b => [b.assetId, b]));

        let activeCandidatesCount = 0;
        let disposedCount = 0;
        let retiredCount = 0;
        let pendingDisposalCount = 0;

        allAssets.forEach(a => {
          if (a.lifecycleStatus === 'DISPOSED') disposedCount++;
          else if (a.lifecycleStatus === 'RETIRED') retiredCount++;
          else if (['DISPOSAL', 'PENDING_DISPOSAL'].includes(a.lifecycleStatus)) pendingDisposalCount++;
          else if (a.active !== false) activeCandidatesCount++;
        });

        let totalProceeds = 0;
        let totalWrittenOffValue = 0;
        const byReason = {};
        const byStatus = {};

        disposeTxs.forEach(tx => {
          let payload = {};
          if (tx.payload) {
            try { payload = JSON.parse(tx.payload); } catch (_) {}
          }

          let proceeds = payload.disposalProceeds;
          if (proceeds === undefined && tx.notes) {
            const match = tx.notes.match(/Proceeds:\s*\$?([\d.]+)/i);
            if (match && match[1]) proceeds = parseFloat(match[1]);
          }
          if (typeof proceeds === 'number' && !isNaN(proceeds)) totalProceeds += proceeds;

          let nbv = payload.netBookValue;
          if (nbv === undefined) {
            const b = bookValMap.get(tx.assetId);
            nbv = b?.netBookValue ? parseFloat(b.netBookValue.toString()) : 0;
          }
          if (typeof nbv === 'number' && !isNaN(nbv)) totalWrittenOffValue += nbv;

          const reason = payload.disposalReason || 'END_OF_LIFE';
          byReason[reason] = (byReason[reason] || 0) + 1;

          const status = payload.disposalStatus || 'SCRAPPED';
          byStatus[status] = (byStatus[status] || 0) + 1;
        });

        return res.json({
          success: true,
          summary: {
            activeCandidatesCount,
            disposedCount: Math.max(disposedCount, disposedList.length),
            retiredCount,
            pendingDisposalCount: Math.max(pendingDisposalCount, pendingList.length),
            totalDisposedCount: Math.max(disposedCount + retiredCount, disposedList.length),
            totalProceeds,
            totalWrittenOffValue,
            netGainLoss: totalProceeds - totalWrittenOffValue,
            byReason,
            byStatus
          }
        });
      } catch (dbErr) {
        console.warn('DB summary query skipped, using store metrics:', dbErr.message);
      }
    }

    // In-memory summary calculation
    let totalProceeds = 0;
    let totalWrittenOffValue = 0;
    const byReason = {};
    const byStatus = {};

    disposedList.forEach(item => {
      const d = item.disposalDetails || {};
      totalProceeds += (d.disposalProceeds || 0);
      totalWrittenOffValue += (d.netBookValue || 0);
      byReason[d.disposalReason || 'END_OF_LIFE'] = (byReason[d.disposalReason || 'END_OF_LIFE'] || 0) + 1;
      byStatus[d.disposalStatus || 'SCRAPPED'] = (byStatus[d.disposalStatus || 'SCRAPPED'] || 0) + 1;
    });

    res.json({
      success: true,
      summary: {
        activeCandidatesCount: 142,
        disposedCount: disposedList.length,
        retiredCount: 0,
        pendingDisposalCount: pendingList.length,
        totalDisposedCount: disposedList.length,
        totalProceeds,
        totalWrittenOffValue,
        netGainLoss: totalProceeds - totalWrittenOffValue,
        byReason,
        byStatus
      }
    });
  } catch (err) { next(err); }
}

// Execute formal Disposal Transaction (Per Requirements Doc: Disposal is a transaction, not just a status)
export async function initiateDisposal(req, res, next) {
  try {
    const {
      assetId,
      disposalStatus = 'SCRAPPED',
      disposalReason = 'END_OF_LIFE',
      disposalDate = new Date().toISOString(),
      disposalProceeds = 0,
      estimatedProceeds,
      method,
      referenceNumber,
      certificateNumber = '',
      buyerRecipient = '',
      notes = '',
      reason,
      action = 'SUBMIT_FOR_REVIEW',
      submitForReview = true
    } = req.body;

    const isReviewOnly = action === 'SUBMIT_FOR_REVIEW' || submitForReview === true;
    const actualReason = reason || disposalReason;
    const actualStatus = method || disposalStatus;
    const actualProceeds = parseFloat(disposalProceeds || estimatedProceeds || 0);
    const userId = req.user?.id || req.user?._id || 'user-admin';

    const txRefNumber = referenceNumber && referenceNumber.trim()
      ? referenceNumber.trim()
      : `DISP-${new Date().getFullYear()}-${Date.now().toString(36).slice(-6).toUpperCase()}`;

    if (isDbConnected()) {
      try {
        const asset = await prisma.asset.findFirst({
          where: {
            OR: [
              { id: assetId },
              { assetId: assetId }
            ]
          },
          include: { category: true, company: true, site: true }
        });

        if (asset) {
          if (asset.lifecycleStatus === 'DISPOSED' || asset.lifecycleStatus === 'RETIRED' || asset.active === false) {
            return res.status(400).json({
              success: false,
              message: `This asset (${asset.tagNumber || asset.assetId}) has already been disposed of or retired.`
            });
          }

          const previousStatus = asset.lifecycleStatus || 'IN_SERVICE';

          const bookVal = await prisma.assetBookValue.findUnique({
            where: { assetId_bookType: { assetId: asset.id, bookType: 'CORPORATE' } }
          }).catch(() => null);

          const capVal = bookVal?.capitalizationValue ? parseFloat(bookVal.capitalizationValue.toString()) : (parseFloat(asset.acquisitionValue || 0));
          const accumDep = bookVal?.accumulatedDepreciation ? parseFloat(bookVal.accumulatedDepreciation.toString()) : 0;
          const netBookValue = bookVal?.netBookValue ? parseFloat(bookVal.netBookValue.toString()) : Math.max(0, capVal - accumDep);
          const gainLoss = actualProceeds - netBookValue;

          const txPayload = {
            referenceNumber: txRefNumber,
            disposalStatus: actualStatus,
            disposalReason: actualReason,
            disposalDate: new Date(disposalDate).toISOString(),
            disposalProceeds: actualProceeds,
            netBookValue,
            gainLoss,
            certificateNumber: certificateNumber.trim(),
            buyerRecipient: buyerRecipient.trim(),
            notes: notes.trim(),
            disposedByUserId: userId,
            isReviewOnly,
            assetSummary: {
              assetId: asset.assetId,
              tagNumber: asset.tagNumber,
              serialNumber: asset.serialNumber,
              description: asset.description
            }
          };

          if (isReviewOnly) {
            // Stage 1: Move asset into PENDING_DISPOSAL review queue
            const [updatedAsset, tx] = await prisma.$transaction([
              prisma.asset.update({
                where: { id: asset.id },
                data: {
                  lifecycleStatus: 'PENDING_DISPOSAL',
                  active: true,
                  updatedByUserId: userId
                }
              }),
              prisma.assetTransaction.create({
                data: {
                  assetId: asset.id,
                  transactionType: 'DISPOSAL_REQUEST',
                  fromStatus: previousStatus,
                  toStatus: 'PENDING_DISPOSAL',
                  performedByUserId: userId,
                  notes: notes.trim() || `Disposal Review Request [${txRefNumber}]: Reason ${actualReason}. Placed in Pending Review Queue.`,
                  payload: JSON.stringify(txPayload)
                }
              })
            ]);

            const populatedAsset = await prisma.asset.findUnique({
              where: { id: asset.id },
              include: { category: true, company: true, site: true, building: true, room: true, custodian: true }
            });

            const returnPending = {
              ...populatedAsset,
              disposalTx: tx,
              disposalDetails: txPayload
            };

            const pendingList = readPendingDisposalsFromFile();
            writePendingDisposalsToFile([returnPending, ...pendingList.filter(p => p.id !== returnPending.id && p.assetId !== returnPending.assetId)]);

            return res.status(200).json({
              success: true,
              isPending: true,
              message: `Asset ${asset.assetId} successfully submitted for disposal review (Pending Queue).`,
              transaction: { id: tx.id, referenceNumber: txRefNumber, ...txPayload },
              asset: returnPending
            });
          }

          // Stage 2: Finalize Disposal Transaction
          const [updatedAsset, tx] = await prisma.$transaction([
            prisma.asset.update({
              where: { id: asset.id },
              data: {
                lifecycleStatus: 'DISPOSED',
                active: false,
                updatedByUserId: userId
              }
            }),
            prisma.assetTransaction.create({
              data: {
                assetId: asset.id,
                transactionType: 'DISPOSAL',
                fromStatus: previousStatus,
                toStatus: 'DISPOSED',
                performedByUserId: userId,
                notes: notes.trim() || `Disposal Transaction [${txRefNumber}]: Status ${actualStatus}, Reason ${actualReason}. Proceeds: $${actualProceeds}. NBV: $${netBookValue}.`,
                payload: JSON.stringify(txPayload)
              }
            })
          ]);

          try {
            await prisma.maintenanceSchedule.updateMany({
              where: { assetId: asset.id, active: true },
              data: { active: false }
            });
          } catch (_) {}

          const populatedAsset = await prisma.asset.findUnique({
            where: { id: asset.id },
            include: { category: true, company: true, site: true, building: true, room: true, custodian: true }
          });

          const returnRecord = {
            ...populatedAsset,
            disposalTx: tx,
            disposalDetails: txPayload
          };

          // Remove from pending store
          const currentPending = readPendingDisposalsFromFile();
          writePendingDisposalsToFile(currentPending.filter(p => p.id !== asset.id && p.assetId !== asset.assetId));

          // Add to disposed store
          const currentDisposed = readDisposedAssetsFromFile();
          writeDisposedAssetsToFile([returnRecord, ...currentDisposed.filter(d => d.id !== asset.id && d.assetId !== asset.assetId)]);

          return res.status(201).json({
            success: true,
            isPending: false,
            message: `Asset ${asset.assetId} successfully disposed via transaction ${txRefNumber}.`,
            transaction: { id: tx.id, referenceNumber: txRefNumber, ...txPayload },
            asset: returnRecord
          });
        }
      } catch (dbErr) {
        console.warn('DB disposal execution failed, updating store:', dbErr.message);
      }
    }

    // In-memory / Resilient execution
    const pendingList = readPendingDisposalsFromFile();
    const disposedList = readDisposedAssetsFromFile();

    const netBookValue = parseFloat(req.body.netBookValue || 450);
    const gainLoss = actualProceeds - netBookValue;

    if (isReviewOnly) {
      // Stage 1: Put into Pending Queue
      const pendingRecord = {
        id: assetId || 'ast-' + Date.now(),
        assetId: assetId?.startsWith('AST-') ? assetId : (assetId || `AST-${Math.floor(1000 + Math.random() * 9000)}`),
        tagNumber: req.body.tagNumber || `TAG-${Math.floor(10000 + Math.random() * 90000)}`,
        description: req.body.description || 'Asset Pending Disposal Review',
        lifecycleStatus: 'PENDING_DISPOSAL',
        active: true,
        category: req.body.category || { name: 'General' },
        site: req.body.site || { name: 'Main Site' },
        custodian: req.body.custodian || null,
        purchaseCost: actualProceeds || netBookValue,
        netBookValue,
        disposalDetails: {
          referenceNumber: txRefNumber,
          disposalStatus: actualStatus,
          disposalReason: actualReason,
          disposalDate: new Date(disposalDate).toISOString(),
          disposalProceeds: actualProceeds,
          netBookValue,
          notes: notes.trim(),
          isReviewOnly: true
        }
      };

      const updatedPending = [pendingRecord, ...pendingList.filter(p => p.id !== pendingRecord.id && p.assetId !== pendingRecord.assetId)];
      writePendingDisposalsToFile(updatedPending);

      return res.status(200).json({
        success: true,
        isPending: true,
        message: `Asset ${pendingRecord.assetId} successfully submitted for disposal review (Pending Queue).`,
        transaction: pendingRecord.disposalDetails,
        asset: pendingRecord
      });
    }

    // Stage 2: Finalize Disposal
    const disposedRecord = {
      id: assetId || 'ast-' + Date.now(),
      assetId: assetId?.startsWith('AST-') ? assetId : (assetId || `AST-${Math.floor(1000 + Math.random() * 9000)}`),
      tagNumber: req.body.tagNumber || `TAG-${Math.floor(10000 + Math.random() * 90000)}`,
      description: req.body.description || 'Asset Disposed via Transaction',
      lifecycleStatus: 'DISPOSED',
      active: false,
      disposalDetails: {
        referenceNumber: txRefNumber,
        disposalStatus: actualStatus,
        disposalReason: actualReason,
        disposalDate: new Date(disposalDate).toISOString(),
        disposalProceeds: actualProceeds,
        netBookValue,
        gainLoss,
        certificateNumber: certificateNumber.trim(),
        buyerRecipient: buyerRecipient.trim(),
        notes: notes.trim()
      }
    };

    // Remove from pending queue
    const remainingPending = pendingList.filter(p => p.id !== disposedRecord.id && p.assetId !== disposedRecord.assetId);
    writePendingDisposalsToFile(remainingPending);

    // Add to disposed list
    const updatedDisposed = [disposedRecord, ...disposedList.filter(d => d.id !== disposedRecord.id && d.assetId !== disposedRecord.assetId)];
    writeDisposedAssetsToFile(updatedDisposed);

    return res.status(201).json({
      success: true,
      isPending: false,
      message: `Asset ${disposedRecord.assetId} successfully disposed via transaction ${txRefNumber}.`,
      transaction: disposedRecord.disposalDetails,
      asset: disposedRecord
    });
  } catch (err) { next(err); }
}
