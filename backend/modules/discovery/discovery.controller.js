import { DiscoveryObservation } from '../../models/DiscoveryObservation.js';
import { DiscoveryMatch } from '../../models/DiscoveryMatch.js';
import { Asset } from '../../models/Asset.js';

export async function getObservations(req, res, next) {
  try {
    const observations = await DiscoveryObservation.find().sort({ lastSeen: -1 }).limit(100);
    res.json({ success: true, observations });
  } catch (err) { next(err); }
}

export async function getMatches(req, res, next) {
  try {
    const matches = await DiscoveryMatch.find()
      .populate('observationId')
      .populate({
        path: 'matchedAssetId',
        select: 'assetId tagNumber description serialNumber hostname ipAddress macAddress siteId buildingId roomId lifecycleStatus categoryId'
      })
      .populate('reviewedBy', 'name email')
      .sort({ confidenceScore: -1 });

    res.json({ success: true, matches });
  } catch (err) { next(err); }
}

export async function getDiscoverySummary(req, res, next) {
  try {
    const [observations, matches] = await Promise.all([
      DiscoveryObservation.find(),
      DiscoveryMatch.find()
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
    const existingAssets = await Asset.find().limit(10);
    
    // Build simulated network telemetry
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
      const observation = await DiscoveryObservation.create({
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
      });

      // Matching confidence & conflict detection logic
      let matchedAsset = await Asset.findOne({ serialNumber: dev.serialNumber });
      let rule = 'EXACT_SERIAL';
      let confidence = 95;
      let status = 'SUGGESTED';

      if (!matchedAsset) {
        matchedAsset = await Asset.findOne({ hostname: dev.hostname });
        if (matchedAsset) {
          rule = 'HOSTNAME';
          confidence = 75;
          status = 'SUGGESTED';
        }
      }

      if (!matchedAsset) {
        matchedAsset = await Asset.findOne({ macAddress: dev.macAddress });
        if (matchedAsset) {
          rule = 'MAC_ADDRESS';
          confidence = 90;
          status = 'SUGGESTED';
        }
      }

      // Check if hostname matches Asset A but serial matches Asset B (CONFLICT)
      if (matchedAsset && dev.hostname) {
        const hostnameConflictAsset = await Asset.findOne({ hostname: dev.hostname });
        if (hostnameConflictAsset && hostnameConflictAsset._id.toString() !== matchedAsset._id.toString()) {
          status = 'CONFLICT';
          confidence = 60;
          rule = 'FUZZY_AI';
        }
      }

      if (!matchedAsset) {
        rule = 'UNMATCHED';
        confidence = 0;
        status = 'UNKNOWN';
      }

      const match = await DiscoveryMatch.create({
        observationId: observation._id,
        matchedAssetId: matchedAsset ? matchedAsset._id : null,
        confidenceScore: confidence,
        matchRule: rule,
        status
      });

      const populated = await DiscoveryMatch.findById(match._id)
        .populate('observationId')
        .populate('matchedAssetId');

      createdMatches.push(populated);
    }

    res.json({ success: true, count: mockDevices.length, matches: createdMatches });
  } catch (err) { next(err); }
}

export async function confirmMatch(req, res, next) {
  try {
    const { matchId } = req.params;
    const match = await DiscoveryMatch.findById(matchId);

    if (!match || !match.matchedAssetId) {
      return res.status(400).json({ success: false, message: 'Invalid match record' });
    }

    const obs = await DiscoveryObservation.findById(match.observationId);
    if (obs) {
      await Asset.findByIdAndUpdate(match.matchedAssetId, {
        hostname: obs.hostname || undefined,
        macAddress: obs.macAddress || undefined,
        ipAddress: obs.ipAddress || undefined,
        discoveryId: obs._id.toString()
      });
    }

    match.status = 'MATCHED';
    match.reviewedBy = req.user._id;
    match.reviewedAt = new Date();
    await match.save();

    const populated = await DiscoveryMatch.findById(match._id)
      .populate('observationId')
      .populate('matchedAssetId')
      .populate('reviewedBy', 'name email');

    res.json({ success: true, match: populated });
  } catch (err) { next(err); }
}

export async function ignoreMatch(req, res, next) {
  try {
    const { matchId } = req.params;
    const match = await DiscoveryMatch.findById(matchId);

    if (!match) {
      return res.status(404).json({ success: false, message: 'Match record not found' });
    }

    match.status = 'IGNORED';
    match.reviewedBy = req.user._id;
    match.reviewedAt = new Date();
    await match.save();

    const populated = await DiscoveryMatch.findById(match._id)
      .populate('observationId')
      .populate('matchedAssetId')
      .populate('reviewedBy', 'name email');

    res.json({ success: true, match: populated });
  } catch (err) { next(err); }
}

export async function registerUnknownAsset(req, res, next) {
  try {
    const { matchId } = req.params;
    const match = await DiscoveryMatch.findById(matchId);

    if (!match) {
      return res.status(404).json({ success: false, message: 'Match record not found' });
    }

    const obs = await DiscoveryObservation.findById(match.observationId);
    if (!obs) {
      return res.status(400).json({ success: false, message: 'Discovered observation record missing' });
    }

    const assetId = 'AST-DISC-' + Date.now().toString(36).toUpperCase();
    const description = `${obs.manufacturer || 'Discovered'} ${obs.modelName || 'Device'} (${obs.hostname || obs.ipAddress})`;

    const newAsset = await Asset.create({
      assetId,
      description,
      hostname: obs.hostname,
      macAddress: obs.macAddress,
      ipAddress: obs.ipAddress,
      serialNumber: obs.serialNumber,
      discoveryId: obs._id.toString(),
      lifecycleStatus: 'ACTIVE',
      condition: 'OPERATIONAL'
    });

    match.matchedAssetId = newAsset._id;
    match.confidenceScore = 100;
    match.matchRule = 'EXACT_SERIAL';
    match.status = 'MATCHED';
    match.reviewedBy = req.user._id;
    match.reviewedAt = new Date();
    await match.save();

    const populated = await DiscoveryMatch.findById(match._id)
      .populate('observationId')
      .populate('matchedAssetId')
      .populate('reviewedBy', 'name email');

    res.json({ success: true, asset: newAsset, match: populated });
  } catch (err) { next(err); }
}

