import { Contract } from '../../models/Contract.js';
import { Warranty } from '../../models/Warranty.js';

export async function getContracts(req, res, next) {
  try {
    const contracts = await Contract.find()
      .populate({
        path: 'coveredAssetIds',
        select: 'assetId tagNumber description serialNumber siteId buildingId roomId lifecycleStatus',
        populate: [
          { path: 'siteId', select: 'name' },
          { path: 'roomId', select: 'name' }
        ]
      })
      .sort({ endDate: 1 });
    res.json({ success: true, contracts });
  } catch (err) { next(err); }
}

export async function createContract(req, res, next) {
  try {
    const contractNumber = req.body.contractNumber || ('CTR-' + Date.now().toString(36).toUpperCase());
    const contract = await Contract.create({ ...req.body, contractNumber });
    const populated = await Contract.findById(contract._id).populate({
      path: 'coveredAssetIds',
      select: 'assetId tagNumber description serialNumber siteId buildingId roomId lifecycleStatus'
    });
    res.status(201).json({ success: true, contract: populated });
  } catch (err) { next(err); }
}

export async function getWarranties(req, res, next) {
  try {
    const warranties = await Warranty.find()
      .populate({
        path: 'assetId',
        select: 'assetId tagNumber description serialNumber siteId buildingId roomId lifecycleStatus',
        populate: [
          { path: 'siteId', select: 'name' },
          { path: 'roomId', select: 'name' }
        ]
      })
      .sort({ endDate: 1 });
    res.json({ success: true, warranties });
  } catch (err) { next(err); }
}

export async function createWarranty(req, res, next) {
  try {
    const { assetId, providerName, warrantyNumber, startDate, endDate, terms, coverageType } = req.body;
    let warranty = await Warranty.findOne({ assetId });
    if (warranty) {
      warranty.providerName = providerName || warranty.providerName;
      warranty.warrantyNumber = warrantyNumber || warranty.warrantyNumber;
      warranty.startDate = startDate || warranty.startDate;
      warranty.endDate = endDate || warranty.endDate;
      warranty.terms = terms !== undefined ? terms : warranty.terms;
      warranty.coverageType = coverageType || warranty.coverageType;
      await warranty.save();
    } else {
      warranty = await Warranty.create({ assetId, providerName, warrantyNumber, startDate, endDate, terms, coverageType });
    }
    const populated = await Warranty.findById(warranty._id).populate('assetId');
    res.status(201).json({ success: true, warranty: populated });
  } catch (err) { next(err); }
}

export async function getContractSummary(req, res, next) {
  try {
    const [contracts, warranties] = await Promise.all([
      Contract.find(),
      Warranty.find()
    ]);

    const now = new Date();
    const d30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const d90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    const totalContracts = contracts.length;
    let activeContracts = 0;
    let expiringWithin30Days = 0;
    let expiringWithin90Days = 0;
    let expiredContracts = 0;
    let totalContractValue = 0;

    contracts.forEach(c => {
      const end = new Date(c.endDate);
      const cost = c.cost ? parseFloat(c.cost.toString()) : 0;
      totalContractValue += isNaN(cost) ? 0 : cost;

      if (end < now) {
        expiredContracts++;
      } else {
        if (c.active !== false) activeContracts++;
        if (end <= d30) expiringWithin30Days++;
        if (end <= d90) expiringWithin90Days++;
      }
    });

    const totalWarranties = warranties.length;
    let expiringWarranties = 0;
    warranties.forEach(w => {
      const end = new Date(w.endDate);
      if (end <= d90) {
        expiringWarranties++;
      }
    });

    res.json({
      success: true,
      summary: {
        totalContracts,
        activeContracts,
        expiringWithin30Days,
        expiringWithin90Days,
        expiredContracts,
        totalWarranties,
        expiringWarranties,
        totalContractValue
      }
    });
  } catch (err) { next(err); }
}

