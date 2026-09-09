import { Receipt } from '../../models/Receipt.js';
import { Asset } from '../../models/Asset.js';
import { withTransaction } from '../../config/db.js';

export async function getReceipts(req, res, next) {
  try {
    const receipts = await Receipt.find()
      .populate('companyId')
      .populate('siteId')
      .populate('receivedBy')
      .sort({ createdAt: -1 });

    res.json({ success: true, receipts });
  } catch (err) { next(err); }
}

export async function createReceipt(req, res, next) {
  try {
    const result = await withTransaction(async (session) => {
      const receiptNumber = 'REC-' + Date.now().toString(36).toUpperCase();
      const receiptData = {
        ...req.body,
        receiptNumber,
        receivedBy: req.user._id
      };

      const [receipt] = await Receipt.create([receiptData], { session });

      // Automatically generate staged asset records for serialized items
      const createdAssetIds = [];
      if (receipt.lineItems && receipt.lineItems.length > 0) {
        for (const item of receipt.lineItems) {
          if (item.serialNumbers && item.serialNumbers.length > 0) {
            for (const sn of item.serialNumbers) {
              const [asset] = await Asset.create([{
                assetId: 'AST-REC-' + Math.floor(Math.random() * 100000),
                description: item.description,
                serialNumber: sn,
                categoryId: item.categoryId,
                companyId: receipt.companyId,
                siteId: receipt.siteId,
                supplierName: receipt.vendorName,
                poNumber: receipt.poNumber,
                acquisitionValue: item.unitPrice || 0,
                lifecycleStatus: 'RECEIVED',
                condition: 'NEW',
                createdBy: req.user._id
              }], { session });

              createdAssetIds.push(asset._id);
            }
          }
        }
      }

      receipt.status = 'COMPLETED';
      await receipt.save({ session });

      return { receipt, createdAssetIds };
    });

    res.status(201).json({ success: true, ...result });
  } catch (err) { next(err); }
}
