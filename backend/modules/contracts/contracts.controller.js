import prisma from '../../config/prisma.js';

export async function getContracts(req, res, next) {
  try {
    const contracts = await prisma.contract.findMany({
      include: {
        coveredAssets: {
          include: {
            asset: {
              select: {
                id: true,
                assetId: true,
                tagNumber: true,
                description: true,
                serialNumber: true,
                lifecycleStatus: true,
                site: { select: { name: true } },
                room: { select: { name: true } }
              }
            }
          }
        }
      },
      orderBy: { endDate: 'asc' }
    });
    res.json({ success: true, contracts });
  } catch (err) { next(err); }
}

export async function createContract(req, res, next) {
  try {
    const contractNumber = req.body.contractNumber || ('CTR-' + Date.now().toString(36).toUpperCase());
    const { title, contractType = 'AMC', providerName, startDate, endDate, cost, slaDetails } = req.body;

    const contract = await prisma.contract.create({
      data: {
        contractNumber,
        title: title || 'Contract',
        contractType,
        providerName: providerName || 'Vendor',
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        cost: cost || 0,
        slaDetails: slaDetails || null
      },
      include: {
        coveredAssets: {
          include: { asset: true }
        }
      }
    });

    res.status(201).json({ success: true, contract });
  } catch (err) { next(err); }
}

export async function getWarranties(req, res, next) {
  try {
    const warranties = await prisma.warranty.findMany({
      include: {
        asset: {
          select: {
            id: true,
            assetId: true,
            tagNumber: true,
            description: true,
            serialNumber: true,
            lifecycleStatus: true,
            site: { select: { name: true } },
            room: { select: { name: true } }
          }
        }
      },
      orderBy: { endDate: 'asc' }
    });
    res.json({ success: true, warranties });
  } catch (err) { next(err); }
}

export async function createWarranty(req, res, next) {
  try {
    const { assetId, providerName, warrantyNumber, startDate, endDate, terms, coverageType = 'FULL' } = req.body;

    let warranty = await prisma.warranty.findUnique({ where: { assetId } });
    if (warranty) {
      warranty = await prisma.warranty.update({
        where: { assetId },
        data: {
          providerName: providerName || warranty.providerName,
          warrantyNumber: warrantyNumber || warranty.warrantyNumber,
          startDate: startDate ? new Date(startDate) : warranty.startDate,
          endDate: endDate ? new Date(endDate) : warranty.endDate,
          terms: terms !== undefined ? terms : warranty.terms,
          coverageType: coverageType || warranty.coverageType
        },
        include: { asset: true }
      });
    } else {
      warranty = await prisma.warranty.create({
        data: {
          assetId,
          providerName,
          warrantyNumber,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          terms,
          coverageType
        },
        include: { asset: true }
      });
    }

    res.status(201).json({ success: true, warranty });
  } catch (err) { next(err); }
}

export async function getContractSummary(req, res, next) {
  try {
    const [contracts, warranties] = await Promise.all([
      prisma.contract.findMany(),
      prisma.warranty.findMany()
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
