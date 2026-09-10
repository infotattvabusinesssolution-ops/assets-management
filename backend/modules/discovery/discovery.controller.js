import prisma from '../../config/prisma.js';

export async function getObservations(req, res, next) {
  try {
    const observations = await prisma.discoveryObservation.findMany({
      orderBy: { lastSeen: 'desc' },
      take: 100
    });
    res.json({ success: true, observations });
  } catch (err) { next(err); }
}

export async function getMatches(req, res, next) {
  try {
    const matches = await prisma.discoveryMatch.findMany({
      include: {
        observation: true,
        matchedAsset: {
          select: {
            id: true,
            assetId: true,
            tagNumber: true,
            description: true,
            serialNumber: true,
            hostname: true,
            ipAddress: true,
            macAddress: true,
            siteId: true,
            buildingId: true,
            roomId: true,
            lifecycleStatus: true,
            categoryId: true
          }
        }
      },
      orderBy: { confidenceScore: 'desc' }
    });

    res.json({ success: true, matches });
  } catch (err) { next(err); }
}

export async function getDiscoverySummary(req, res, next) {
  try {
    const [observations, matches] = await Promise.all([
      prisma.discoveryObservation.findMany({ select: { createdAt: true } }),
      prisma.discoveryMatch.findMany({ select: { status: true } })
    ]);

    const totalObservations = observations.length;
    const totalMatches = matches.length;

    let matchedCount = 0;
    let suggestedCount = 0;
    let unknownCount = 0;
    let conflictCount = 0;
    let ignoredCount = 0;

    matches.forEach(m => {
      if (m.status === 'MATCHED') matchedCount++;
      else if (m.status === 'SUGGESTED') suggestedCount++;
      else if (m.status === 'UNKNOWN') unknownCount++;
      else if (m.status === 'CONFLICT') conflictCount++;
      else if (m.status === 'IGNORED') ignoredCount++;
    });

    let lastScanTime = null;
    if (observations.length > 0) {
      const sorted = [...observations].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      lastScanTime = sorted[0].createdAt;
    }

    res.json({
      success: true,
      summary: {
        totalObservations,
        totalMatches,
        matchedCount,
        suggestedCount,
        unknownCount,
        conflictCount,
        ignoredCount,
        lastScanTime
      }
    });
  } catch (err) { next(err); }
}

export async function triggerScan(req, res, next) {
  try {
    const existingAssets = await prisma.asset.findMany({ take: 10 });

    const mockDevices = [
      {
        ipAddress: '192.168.1.105',
        macAddress: '00:1A:2B:3C:4D:5E',
        hostname: 'DESKTOP-FIN01',
        serialNumber: existingAssets[0]?.serialNumber || 'SN-DELL-998811',
        manufacturer: 'Dell Inc.',
        modelName: 'Latitude 5530',
        osFamily: 'Windows 11 Enterprise',
        discoverySource: 'IP_SCANNER'
      },
      {
        ipAddress: '192.168.1.112',
        macAddress: '00:1A:2B:77:88:99',
        hostname: 'MBP-DESIGN-04',
        serialNumber: 'C02G89XXMD6R',
        manufacturer: 'Apple Inc.',
        modelName: 'MacBook Pro 16',
        osFamily: 'macOS Sequoia 15.0',
        discoverySource: 'SNMP'
      },
      {
        ipAddress: '10.0.4.55',
        macAddress: '70:81:05:AA:BB:CC',
        hostname: 'SRV-DB-PROD',
        serialNumber: 'SN-HP-SERVER-500',
        manufacturer: 'HPE',
        modelName: 'ProLiant DL380 Gen10',
        osFamily: 'Ubuntu Linux 22.04 LTS',
        discoverySource: 'SSH'
      },
      {
        ipAddress: '10.0.10.1',
        macAddress: '00:00:0C:07:AC:01',
        hostname: 'SW-CORE-BUILDING-A',
        serialNumber: 'SN-CISCO-CAT9300',
        manufacturer: 'Cisco Systems',
        modelName: 'Catalyst 9300 48-Port',
        osFamily: 'Cisco IOS-XE 17.6',
        discoverySource: 'SNMP'
      },
      {
        ipAddress: '172.16.8.99',
        macAddress: 'A4:83:E7:11:22:33',
        hostname: 'UNKNOWN-IOT-SENSOR-99',
        serialNumber: 'SN-UNMAPPED-99001',
        manufacturer: 'Raspberry Pi Foundation',
        modelName: 'Raspberry Pi 4 Model B',
        osFamily: 'Debian Bookworm',
        discoverySource: 'IP_SCANNER'
      }
    ];

    const createdMatches = [];
    for (const dev of mockDevices) {
      const observation = await prisma.discoveryObservation.create({
        data: {
          discoverySource: dev.discoverySource,
          ipAddress: dev.ipAddress,
          macAddress: dev.macAddress,
          hostname: dev.hostname,
          serialNumber: dev.serialNumber,
          manufacturer: dev.manufacturer,
          modelName: dev.modelName,
          osFamily: dev.osFamily,
          firstSeen: new Date(),
          lastSeen: new Date()
        }
      });

      let matchedAsset = await prisma.asset.findFirst({ where: { serialNumber: dev.serialNumber } });
      let rule = 'EXACT_SERIAL';
      let confidence = 95;
      let status = 'SUGGESTED';

      if (!matchedAsset) {
        matchedAsset = await prisma.asset.findFirst({ where: { hostname: dev.hostname } });
        if (matchedAsset) {
          rule = 'HOSTNAME';
          confidence = 75;
          status = 'SUGGESTED';
        }
      }

      if (!matchedAsset) {
        matchedAsset = await prisma.asset.findFirst({ where: { macAddress: dev.macAddress } });
        if (matchedAsset) {
          rule = 'MAC_ADDRESS';
          confidence = 90;
          status = 'SUGGESTED';
        }
      }

      if (matchedAsset && dev.hostname) {
        const hostnameConflictAsset = await prisma.asset.findFirst({ where: { hostname: dev.hostname } });
        if (hostnameConflictAsset && hostnameConflictAsset.id !== matchedAsset.id) {
          status = 'CONFLICT';
          confidence = 60;
          rule = 'FUZZY_AI';
        }
      }

      if (!matchedAsset) {
        rule = 'EXACT_SERIAL';
        confidence = 0;
        status = 'UNKNOWN';
      }

      const match = await prisma.discoveryMatch.create({
        data: {
          observationId: observation.id,
          matchedAssetId: matchedAsset ? matchedAsset.id : null,
          confidenceScore: confidence,
          matchRule: rule,
          status
        },
        include: {
          observation: true,
          matchedAsset: true
        }
      });

      createdMatches.push(match);
    }

    res.json({ success: true, count: mockDevices.length, matches: createdMatches });
  } catch (err) { next(err); }
}

export async function confirmMatch(req, res, next) {
  try {
    const { matchId } = req.params;
    const userId = req.user?.id || req.user?._id;

    const match = await prisma.discoveryMatch.findUnique({ where: { id: matchId } });
    if (!match || !match.matchedAssetId) {
      return res.status(400).json({ success: false, message: 'Invalid match record' });
    }

    const obs = await prisma.discoveryObservation.findUnique({ where: { id: match.observationId } });
    if (obs) {
      await prisma.asset.update({
        where: { id: match.matchedAssetId },
        data: {
          hostname: obs.hostname || undefined,
          macAddress: obs.macAddress || undefined,
          ipAddress: obs.ipAddress || undefined,
          discoveryId: obs.id
        }
      });
    }

    const updatedMatch = await prisma.discoveryMatch.update({
      where: { id: matchId },
      data: {
        status: 'MATCHED',
        reviewedByUserId: userId,
        reviewedAt: new Date()
      },
      include: {
        observation: true,
        matchedAsset: true
      }
    });

    res.json({ success: true, match: updatedMatch });
  } catch (err) { next(err); }
}

export async function ignoreMatch(req, res, next) {
  try {
    const { matchId } = req.params;
    const userId = req.user?.id || req.user?._id;

    const match = await prisma.discoveryMatch.findUnique({ where: { id: matchId } });
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match record not found' });
    }

    const updatedMatch = await prisma.discoveryMatch.update({
      where: { id: matchId },
      data: {
        status: 'IGNORED',
        reviewedByUserId: userId,
        reviewedAt: new Date()
      },
      include: {
        observation: true,
        matchedAsset: true
      }
    });

    res.json({ success: true, match: updatedMatch });
  } catch (err) { next(err); }
}

export async function registerUnknownAsset(req, res, next) {
  try {
    const { matchId } = req.params;
    const userId = req.user?.id || req.user?._id;

    const match = await prisma.discoveryMatch.findUnique({ where: { id: matchId } });
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match record not found' });
    }

    const obs = await prisma.discoveryObservation.findUnique({ where: { id: match.observationId } });
    if (!obs) {
      return res.status(400).json({ success: false, message: 'Discovered observation record missing' });
    }

    const defaultCompany = await prisma.company.findFirst({ where: { active: true } });
    const defaultSite = await prisma.site.findFirst({ where: { active: true } });
    const defaultCategory = await prisma.category.findFirst({ where: { active: true } });

    const assetId = 'AST-DISC-' + Date.now().toString(36).toUpperCase();
    const description = `${obs.manufacturer || 'Discovered'} ${obs.modelName || 'Device'} (${obs.hostname || obs.ipAddress})`;

    const newAsset = await prisma.asset.create({
      data: {
        assetId,
        description,
        hostname: obs.hostname,
        macAddress: obs.macAddress,
        ipAddress: obs.ipAddress,
        serialNumber: obs.serialNumber,
        discoveryId: obs.id,
        companyId: defaultCompany?.id,
        siteId: defaultSite?.id,
        categoryId: defaultCategory?.id,
        lifecycleStatus: 'RECEIVED',
        condition: 'GOOD'
      }
    });

    const updatedMatch = await prisma.discoveryMatch.update({
      where: { id: matchId },
      data: {
        matchedAssetId: newAsset.id,
        confidenceScore: 100,
        matchRule: 'EXACT_SERIAL',
        status: 'MATCHED',
        reviewedByUserId: userId,
        reviewedAt: new Date()
      },
      include: {
        observation: true,
        matchedAsset: true
      }
    });

    res.json({ success: true, asset: newAsset, match: updatedMatch });
  } catch (err) { next(err); }
}
