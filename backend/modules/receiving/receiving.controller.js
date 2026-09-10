import prisma from '../../config/prisma.js';

export async function getReceipts(req, res, next) {
  try {
    const receipts = await prisma.receipt.findMany({
      include: {
        company: true,
        site: true,
        lineItems: {
          include: { category: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, receipts });
  } catch (err) { next(err); }
}

export async function getReceivingStats(req, res, next) {
  try {
    const totalReceipts = await prisma.receipt.count();
    const receipts = await prisma.receipt.findMany({
      include: { lineItems: true }
    });

    let totalUnitsReceived = 0;
    let totalPoValuation = 0;

    for (const r of receipts) {
      for (const line of r.lineItems) {
        const qty = line.quantity || (line.serialNumbers ? line.serialNumbers.length : 1);
        const price = parseFloat(line.unitPrice) || 0;
        totalUnitsReceived += qty;
        totalPoValuation += qty * price;
      }
    }

    const stagedAssetsCount = await prisma.asset.count({
      where: { lifecycleStatus: 'RECEIVED' }
    });

    res.json({
      success: true,
      stats: {
        totalReceipts,
        totalUnitsReceived,
        totalPoValuation,
        stagedAssetsCount
      }
    });
  } catch (err) { next(err); }
}

export async function getReceiptById(req, res, next) {
  try {
    const { id } = req.params;
    const receipt = await prisma.receipt.findFirst({
      where: { OR: [{ id }, { receiptNumber: id }] },
      include: {
        company: true,
        site: true,
        lineItems: {
          include: { category: true }
        }
      }
    });

    if (!receipt) {
      return res.status(404).json({ success: false, message: 'Receipt not found' });
    }

    res.json({ success: true, receipt });
  } catch (err) { next(err); }
}

export async function createReceipt(req, res, next) {
  try {
    let { companyId, siteId, poNumber, vendorName, packingSlip, receivingDock, lineItems } = req.body;

    // Dynamic Company Resolution
    let company = null;
    if (companyId) {
      company = await prisma.company.findFirst({
        where: { OR: [{ id: companyId }, { code: companyId }] }
      });
    }
    if (!company) {
      company = await prisma.company.findFirst({ where: { active: true } });
    }
    if (!company) {
      return res.status(400).json({ success: false, message: 'Please create a Company Entity in Master Data first.' });
    }
    companyId = company.id;

    // Dynamic Site Resolution
    let site = null;
    if (siteId) {
      site = await prisma.site.findFirst({
        where: { OR: [{ id: siteId }, { code: siteId }] }
      });
    }
    if (!site) {
      site = await prisma.site.findFirst({ where: { active: true } });
    }
    if (!site) {
      return res.status(400).json({ success: false, message: 'Please create a Site Campus in Master Data first.' });
    }
    siteId = site.id;

    // Default Category fallback
    let defaultCategory = await prisma.category.findFirst({ where: { active: true } });

    const result = await prisma.$transaction(async (tx) => {
      const receiptNumber = 'REC-' + Date.now().toString(36).toUpperCase();

      const receipt = await tx.receipt.create({
        data: {
          receiptNumber,
          poNumber: poNumber || 'PO-2026-GEN',
          vendorName: vendorName || 'Generic Supplier',
          companyId,
          siteId,
          status: 'COMPLETED',
          receivedByUserId: req.user.id
        }
      });

      const allCreatedAssetIds = [];

      if (lineItems && lineItems.length > 0) {
        for (const item of lineItems) {
          // Resolve category for line item
          let itemCategoryId = null;
          if (item.categoryId) {
            const catObj = await tx.category.findFirst({
              where: { OR: [{ id: item.categoryId }, { code: item.categoryId }] }
            });
            if (catObj) itemCategoryId = catObj.id;
          }
          if (!itemCategoryId && defaultCategory) {
            itemCategoryId = defaultCategory.id;
          }

          const serials = (item.serialNumbers && item.serialNumbers.length > 0) 
            ? item.serialNumbers 
            : ['SN-AUTO-' + Math.floor(Math.random() * 89999 + 10000)];

          const unitVal = parseFloat(item.unitPrice) || 0;
          const lineAssetIds = [];

          for (const sn of serials) {
            const assetId = 'AST-2026-' + Math.floor(Math.random() * 8999 + 1000);
            const tagNumber = 'TAG-' + Math.floor(Math.random() * 8999 + 1000);

            const asset = await tx.asset.create({
              data: {
                assetId,
                description: item.description || 'Received Inventory Item',
                serialNumber: sn,
                tagNumber,
                barcode: tagNumber,
                categoryId: itemCategoryId,
                companyId,
                siteId,
                buildingId: receivingDock || null,
                supplierName: vendorName || 'Generic Supplier',
                poNumber: poNumber || null,
                acquisitionValue: unitVal,
                lifecycleStatus: 'RECEIVED',
                condition: item.condition || 'NEW',
                createdByUserId: req.user.id,
                updatedByUserId: req.user.id
              }
            });

            // Auto-create initial book value for depreciation tracking
            await tx.assetBookValue.create({
              data: {
                assetId: asset.id,
                bookType: 'CORPORATE',
                capitalizationDate: new Date(),
                capitalizationValue: unitVal,
                usefulLifeMonths: 60,
                depreciationMethod: 'STRAIGHT_LINE',
                residualValue: 0,
                accumulatedDepreciation: 0,
                netBookValue: unitVal
              }
            });

            // Record receiving transaction log
            await tx.assetTransaction.create({
              data: {
                assetId: asset.id,
                transactionType: 'RECEIVE',
                fromStatus: 'NONE',
                toStatus: 'RECEIVED',
                performedByUserId: req.user.id,
                notes: `Received via Goods Receipt ${receiptNumber} (PO: ${poNumber || 'N/A'})`
              }
            });

            lineAssetIds.push(asset.id);
            allCreatedAssetIds.push(asset.id);
          }

          // Create ReceiptLineItem record
          await tx.receiptLineItem.create({
            data: {
              receiptId: receipt.id,
              description: item.description || 'Received Inventory Item',
              quantity: serials.length,
              unitPrice: unitVal,
              categoryId: itemCategoryId,
              serialNumbers: serials,
              createdAssetIds: lineAssetIds
            }
          });
        }
      }

      return { receipt, createdAssetIds: allCreatedAssetIds };
    });

    res.status(201).json({ success: true, ...result });
  } catch (err) { next(err); }
}

export async function deleteReceipt(req, res, next) {
  try {
    const { id } = req.params;
    const receipt = await prisma.receipt.findFirst({
      where: { OR: [{ id }, { receiptNumber: id }] }
    });

    if (!receipt) {
      return res.status(404).json({ success: false, message: 'Receipt not found' });
    }

    await prisma.receipt.delete({
      where: { id: receipt.id }
    });

    res.json({ success: true, message: 'Goods receipt deleted successfully' });
  } catch (err) { next(err); }
}
