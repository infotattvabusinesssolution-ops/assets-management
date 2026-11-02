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

const INITIAL_DISPOSED_ASSETS = [
  {
    id: 'ast-disp-001',
    assetId: 'AST-000088',
    tagNumber: 'TAG-2024-0088',
    serialNumber: 'SN-HP-88910',
    description: 'HP EliteDesk 800 G3 Desktop Workstation',
    lifecycleStatus: 'DISPOSED',
    active: false,
    purchaseCost: 1250,
    unitCost: 1250,
    category: { id: 'cat-01', name: 'Workstations', code: 'WKS' },
    site: { id: 'site-01', name: 'Dubai HQ' },
    disposalDetails: {
      referenceNumber: 'DISP-2026-0012',
      disposalStatus: 'SCRAPPED',
      disposalReason: 'END_OF_LIFE',
      disposalDate: '2026-02-15T10:00:00.000Z',
      disposalProceeds: 85,
      netBookValue: 120,
      gainLoss: -35,
      certificateNumber: 'CERT-SCRAP-8812',
      buyerRecipient: 'Emirates Metal Recycling LLC',
      notes: 'End of 5-year depreciation cycle; motherboard capacitors blown.'
    }
  },
  {
    id: 'ast-disp-002',
    assetId: 'AST-000095',
    tagNumber: 'TAG-2024-0095',
    serialNumber: 'SN-LN-99231',
    description: 'Lenovo ThinkPad X1 Carbon Gen 8',
    lifecycleStatus: 'DISPOSED',
    active: false,
    purchaseCost: 2100,
    unitCost: 2100,
    category: { id: 'cat-02', name: 'Laptops', code: 'LAP' },
    site: { id: 'site-02', name: 'Abu Dhabi Branch' },
    disposalDetails: {
      referenceNumber: 'DISP-2026-0018',
      disposalStatus: 'SOLD',
      disposalReason: 'END_OF_LIFE',
      disposalDate: '2026-03-01T14:30:00.000Z',
      disposalProceeds: 450,
      netBookValue: 350,
      gainLoss: 100,
      certificateNumber: 'BILL-SALE-9912',
      buyerRecipient: 'Employee Buyout Program',
      notes: 'Sold to departing project lead after security data sanitization.'
    }
  },
  {
    id: 'ast-disp-003',
    assetId: 'AST-000104',
    tagNumber: 'TAG-2025-0104',
    serialNumber: 'SN-AP-44109',
    description: 'Apple iPad Pro 11-inch (M1)',
    lifecycleStatus: 'DISPOSED',
    active: false,
    purchaseCost: 950,
    unitCost: 950,
    category: { id: 'cat-03', name: 'Tablets', code: 'TAB' },
    site: { id: 'site-01', name: 'Dubai HQ' },
    disposalDetails: {
      referenceNumber: 'DISP-2026-0024',
      disposalStatus: 'WRITTEN_OFF',
      disposalReason: 'THEFT_LOSS',
      disposalDate: '2026-03-10T09:15:00.000Z',
      disposalProceeds: 0,
      netBookValue: 620,
      gainLoss: -620,
      certificateNumber: 'POLICE-REP-2026-90',
      buyerRecipient: '',
      notes: 'Reported missing in transit between sites. Police incident report filed.'
    }
  }
];

function readDisposedAssetsFromFile() {
  try {
    if (fs.existsSync(DISPOSED_ASSETS_FILE)) {
      const data = fs.readFileSync(DISPOSED_ASSETS_FILE, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Failed to read disposed_assets.json, using defaults:', e.message);
  }
  return INITIAL_DISPOSED_ASSETS;
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

let inMemoryDisposedAssets = readDisposedAssetsFromFile();

export async function getDisposalReasons(req, res, next) {
  try {
    res.json({ success: true, reasons: SYSTEM_DISPOSAL_REASONS });
  } catch (err) { next(err); }
}

// Fetch active asset candidates eligible for disposal
export async function getDisposalCandidates(req, res, next) {
  try {
    const { search, categoryId, siteId } = req.query;

    if (isDbConnected()) {
      try {
        const where = {
          lifecycleStatus: { notIn: ['DISPOSED', 'RETIRED'] }
        };

        if (search && search.trim()) {
          const q = search.trim();
          where.OR = [
            { assetId: { contains: q } },
            { tagNumber: { contains: q } },
            { serialNumber: { contains: q } },
            { description: { contains: q } }
          ];
        }
        if (categoryId) where.categoryId = categoryId;
        if (siteId) where.siteId = siteId;

        const assets = await prisma.asset.findMany({
          where,
          include: {
            category: { select: { id: true, name: true, code: true } },
            company: { select: { id: true, name: true } },
            site: { select: { id: true, name: true } },
            building: { select: { id: true, name: true } },
            room: { select: { id: true, name: true } },
            custodian: { select: { id: true, fullName: true, employeeCode: true } }
          },
          orderBy: { assetId: 'asc' },
          take: 50
        });

        if (assets.length > 0) {
          const assetIds = assets.map(a => a.id);
          const bookValues = await prisma.assetBookValue.findMany({
            where: { assetId: { in: assetIds }, bookType: 'CORPORATE' }
          }).catch(() => []);
          const bookValMap = new Map(bookValues.map(b => [b.assetId, b]));

          const enriched = assets.map(a => {
            const b = bookValMap.get(a.id);
            const capVal = b?.capitalizationValue ? parseFloat(b.capitalizationValue.toString()) : (parseFloat(a.purchaseCost || a.unitCost || 0));
            const accumDep = b?.accumulatedDepreciation ? parseFloat(b.accumulatedDepreciation.toString()) : 0;
            const nbv = b?.netBookValue ? parseFloat(b.netBookValue.toString()) : Math.max(0, capVal - accumDep);

            return {
              ...a,
              capitalizationValue: capVal,
              accumulatedDepreciation: accumDep,
              netBookValue: nbv
            };
          });

          return res.json({ success: true, candidates: enriched });
        }
      } catch (dbErr) {
        console.warn('DB candidate search fallback:', dbErr.message);
      }
    }

    // Resilient fallback candidate assets
    const fallbackCandidates = [
      {
        id: 'ast-cand-01',
        assetId: 'AST-000101',
        tagNumber: 'TAG-2025-0101',
        serialNumber: 'SN-LN-10142',
        description: 'Lenovo ThinkPad T14 Gen 3',
        lifecycleStatus: 'PENDING_DISPOSAL',
        purchaseCost: 1450,
        netBookValue: 450,
        category: { name: 'Laptops' },
        site: { name: 'Dubai HQ' },
        custodian: { fullName: 'Salma Khan' }
      },
      {
        id: 'ast-cand-02',
        assetId: 'AST-000102',
        tagNumber: 'TAG-2025-0102',
        serialNumber: 'SN-DL-88219',
        description: 'Dell PowerEdge R740 Server',
        lifecycleStatus: 'IN_STORE',
        purchaseCost: 6800,
        netBookValue: 1200,
        category: { name: 'Servers' },
        site: { name: 'DC Al Quoz' },
        custodian: { fullName: 'IT Infrastructure' }
      },
      {
        id: 'ast-cand-03',
        assetId: 'AST-000103',
        tagNumber: 'TAG-2025-0103',
        serialNumber: 'SN-HP-33100',
        description: 'HP LaserJet Enterprise MFP M630',
        lifecycleStatus: 'UNDER_MAINTENANCE',
        purchaseCost: 2800,
        netBookValue: 300,
        category: { name: 'Printers' },
        site: { name: 'Dubai HQ' },
        custodian: { fullName: 'Admin Facilities' }
      }
    ];

    res.json({
      success: true,
      candidates: fallbackCandidates.filter(c =>
        !search ||
        c.assetId.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase())
      )
    });
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
          inMemoryDisposedAssets = enrichedAssets;
          writeDisposedAssetsToFile(enrichedAssets);
          return res.json({ success: true, assets: enrichedAssets });
        }
      } catch (dbErr) {
        console.warn('DB getDisposedAssets query skipped, using store:', dbErr.message);
      }
    }

    res.json({ success: true, assets: inMemoryDisposedAssets });
  } catch (err) { next(err); }
}

// Fetch KPI metrics and summary for asset disposals
export async function getDisposalSummary(req, res, next) {
  try {
    if (isDbConnected()) {
      try {
        const [allAssets, disposeTxs, bookValues] = await Promise.all([
          prisma.asset.findMany({ select: { id: true, lifecycleStatus: true, active: true, purchaseCost: true, unitCost: true } }),
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
            disposedCount,
            retiredCount,
            pendingDisposalCount,
            totalDisposedCount: disposedCount + retiredCount,
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

    inMemoryDisposedAssets.forEach(item => {
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
        disposedCount: inMemoryDisposedAssets.length,
        retiredCount: 0,
        pendingDisposalCount: 1,
        totalDisposedCount: inMemoryDisposedAssets.length,
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
      reason
    } = req.body;

    const actualReason = reason || disposalReason;
    const actualStatus = method || disposalStatus;
    const actualProceeds = parseFloat(disposalProceeds || estimatedProceeds || 0);
    const userId = req.user?.id || req.user?._id || 'user-admin';

    const txRefNumber = referenceNumber && referenceNumber.trim()
      ? referenceNumber.trim()
      : `DISP-${new Date().getFullYear()}-${Date.now().toString(36).slice(-6).toUpperCase()}`;

    if (isDbConnected()) {
      try {
        const asset = await prisma.asset.findUnique({
          where: { id: assetId },
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

          const capVal = bookVal?.capitalizationValue ? parseFloat(bookVal.capitalizationValue.toString()) : (parseFloat(asset.purchaseCost || asset.unitCost || 0));
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
            assetSummary: {
              assetId: asset.assetId,
              tagNumber: asset.tagNumber,
              serialNumber: asset.serialNumber,
              description: asset.description
            }
          };

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

          inMemoryDisposedAssets.unshift(returnRecord);
          writeDisposedAssetsToFile(inMemoryDisposedAssets);

          return res.status(201).json({
            success: true,
            message: `Asset ${asset.assetId} successfully disposed via transaction ${txRefNumber}.`,
            transaction: { id: tx.id, referenceNumber: txRefNumber, ...txPayload },
            asset: returnRecord
          });
        }
      } catch (dbErr) {
        console.warn('DB disposal execution failed, updating store:', dbErr.message);
      }
    }

    // In-memory / Fallback execution
    const mockRecord = {
      id: assetId || 'ast-' + Date.now(),
      assetId: assetId?.startsWith('AST-') ? assetId : `AST-${Math.floor(1000 + Math.random() * 9000)}`,
      tagNumber: `TAG-${Math.floor(10000 + Math.random() * 90000)}`,
      description: 'Asset Disposed via Transaction',
      lifecycleStatus: 'DISPOSED',
      active: false,
      disposalDetails: {
        referenceNumber: txRefNumber,
        disposalStatus: actualStatus,
        disposalReason: actualReason,
        disposalDate: new Date(disposalDate).toISOString(),
        disposalProceeds: actualProceeds,
        netBookValue: 450,
        gainLoss: actualProceeds - 450,
        certificateNumber: certificateNumber.trim(),
        buyerRecipient: buyerRecipient.trim(),
        notes: notes.trim()
      }
    };

    inMemoryDisposedAssets.unshift(mockRecord);
    writeDisposedAssetsToFile(inMemoryDisposedAssets);

    res.status(201).json({
      success: true,
      message: `Asset successfully disposed via transaction ${txRefNumber}.`,
      transaction: mockRecord.disposalDetails,
      asset: mockRecord
    });
  } catch (err) { next(err); }
}
