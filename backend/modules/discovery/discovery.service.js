import prisma from '../../config/prisma.js';
import { isSqlServerConnected } from '../../config/db.js';

const requireDb = () => {
  if (!isSqlServerConnected) throw new Error('Database is unavailable.');
};

const parse = (value) => {
  try { return JSON.parse(value || '{}'); } catch { return {}; }
};

const observationInclude = {
  matches: {
    orderBy: { updatedAt: 'desc' },
    include: { matchedAsset: { include: { site: true, department: true } } }
  }
};

const mapDevice = (observation) => {
  const metadata = parse(observation.rawCollectorPayload);
  const match = observation.matches?.[0];
  const asset = match?.matchedAsset;
  const status = match?.status === 'CONFIRMED' ? 'Matched'
    : match?.status === 'SUGGESTED' ? 'Review' : 'New';
  return {
    id: observation.id,
    ipAddress: observation.ipAddress || '',
    hostname: observation.hostname || '',
    macAddress: observation.macAddress || '',
    deviceType: metadata.deviceType || 'Device',
    manufacturer: observation.manufacturer || '',
    model: observation.modelName || '',
    serialNumber: observation.serialNumber || '',
    operatingSystem: [observation.osFamily, observation.osVersion].filter(Boolean).join(' '),
    domain: metadata.domain || '',
    discoverySource: observation.discoverySource || '',
    discoveryJob: metadata.jobName || '',
    firstDiscovered: observation.firstSeen?.toISOString() || '',
    firstSeen: observation.firstSeen?.toISOString() || '',
    lastSeen: observation.lastSeen?.toISOString() || '',
    location: [asset?.site?.name, asset?.department?.name].filter(Boolean).join(' - '),
    targetLocation: asset?.site?.name || '',
    assetStatus: status,
    status,
    linkedAssetId: asset?.assetId || null,
    matchedAssetId: asset?.assetId || null,
    matchedAssetName: asset?.description || null,
    matchScore: match?.confidenceScore || 0,
    matchConfidence: match?.confidenceScore || 0,
    assetAction: asset ? 'Match Existing' : 'Create New',
    hardware: {
      cpu: observation.cpuInfo || '',
      ram: observation.ramGb == null ? '' : `${observation.ramGb} GB`,
      storage: observation.storageGb == null ? '' : `${observation.storageGb} GB`,
      bios: metadata.bios || '',
      systemUuid: metadata.systemUuid || '',
      chassis: metadata.chassis || '',
      assetTagEtched: metadata.assetTagEtched || ''
    },
    network: metadata.network || {},
    software: Array.isArray(metadata.software) ? metadata.software : [],
    history: Array.isArray(metadata.history) ? metadata.history : []
  };
};

async function saveSnapshot(entityType, entityId, value, action = 'SAVE') {
  await prisma.auditEvent.create({ data: {
    entityType, entityId, action, afterState: JSON.stringify(value)
  } });
  return value;
}

async function readSnapshots(entityType) {
  const events = await prisma.auditEvent.findMany({
    where: { entityType }, orderBy: { timestamp: 'desc' }
  });
  const latest = new Map();
  for (const event of events) {
    if (!latest.has(event.entityId)) latest.set(event.entityId, event.action === 'DELETE' ? null : parse(event.afterState));
  }
  return [...latest.values()].filter(Boolean);
}

export class DiscoveryService {
  static async getKpis() {
    requireDb();
    const rows = await prisma.discoveryObservation.findMany({ include: observationInclude });
    const devices = rows.map(mapDevice);
    const totalDevices = devices.length;
    const matchedCount = devices.filter(d => d.assetStatus === 'Matched').length;
    const newCount = devices.filter(d => d.assetStatus === 'New').length;
    const reviewCount = devices.filter(d => d.assetStatus === 'Review').length;
    return {
      totalDevices, matchedCount, newCount, reviewCount, staleCount: 0, conflictCount: 0,
      matchedPercentage: totalDevices ? Math.round(matchedCount / totalDevices * 100) : 0,
      newPercentage: totalDevices ? Math.round(newCount / totalDevices * 100) : 0,
      reviewPercentage: totalDevices ? Math.round(reviewCount / totalDevices * 100) : 0
    };
  }

  static async getDiscoveredDevices(query = {}) {
    requireDb();
    const observations = await prisma.discoveryObservation.findMany({
      include: observationInclude, orderBy: { lastSeen: 'desc' }
    });
    let devices = observations.map(mapDevice);
    const contains = (value, needle) => String(value || '').toLowerCase().includes(String(needle).toLowerCase());
    if (query.search) devices = devices.filter(d =>
      ['ipAddress', 'hostname', 'macAddress', 'serialNumber', 'manufacturer', 'model'].some(field => contains(d[field], query.search)));
    for (const [queryKey, field] of [['deviceType', 'deviceType'], ['status', 'assetStatus'], ['location', 'location'], ['discoveryJob', 'discoveryJob'], ['manufacturer', 'manufacturer'], ['model', 'model'], ['operatingSystem', 'operatingSystem'], ['discoverySource', 'discoverySource'], ['ipAddress', 'ipAddress'], ['hostname', 'hostname'], ['macAddress', 'macAddress'], ['serialNumber', 'serialNumber']]) {
      const value = query[queryKey];
      if (value && !String(value).startsWith('All')) devices = devices.filter(d => contains(d[field], value));
    }
    const totalRecords = devices.length;
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(2000, Number(query.limit) || 10));
    devices = devices.slice((page - 1) * limit, page * limit);
    return { devices, pagination: { totalRecords, totalPages: Math.ceil(totalRecords / limit), currentPage: page, limit, startIndex: totalRecords ? (page - 1) * limit + 1 : 0, endIndex: Math.min(page * limit, totalRecords) } };
  }

  static async getDeviceById(id) {
    requireDb();
    const row = await prisma.discoveryObservation.findFirst({
      where: { OR: [{ id }, { hostname: id }, { ipAddress: id }] }, include: observationInclude
    });
    return row ? mapDevice(row) : null;
  }

  static async confirmMatch({ deviceId, assetId, user }) {
    requireDb();
    if (!assetId) throw new Error('Select an asset from Asset Register.');
    const asset = await prisma.asset.findFirst({ where: { OR: [{ id: assetId }, { assetId }] } });
    if (!asset) throw new Error('Asset not found in Asset Register.');
    const observation = await prisma.discoveryObservation.findUnique({ where: { id: deviceId } });
    if (!observation) throw new Error('Discovered device not found.');
    const existing = await prisma.discoveryMatch.findFirst({ where: { observationId: deviceId } });
    const data = { matchedAssetId: asset.id, confidenceScore: 100, matchRule: 'USER_CONFIRMED', status: 'CONFIRMED', reviewedByUserId: user?.id || null, reviewedAt: new Date() };
    if (existing) await prisma.discoveryMatch.update({ where: { id: existing.id }, data });
    else await prisma.discoveryMatch.create({ data: { observationId: deviceId, ...data } });
    return this.getDeviceById(deviceId);
  }

  static async rejectMatch({ deviceId, user }) {
    requireDb();
    const existing = await prisma.discoveryMatch.findFirst({ where: { observationId: deviceId } });
    if (!existing) throw new Error('Suggested match not found.');
    await prisma.discoveryMatch.update({ where: { id: existing.id }, data: {
      matchedAssetId: null, confidenceScore: 0, status: 'REJECTED',
      reviewedByUserId: user?.id || null, reviewedAt: new Date()
    } });
    return this.getDeviceById(deviceId);
  }

  static async createAssetFromDevice({ deviceId, assetData = {}, user }) {
    requireDb();
    const observation = await prisma.discoveryObservation.findUnique({ where: { id: deviceId } });
    if (!observation) throw new Error('Discovered device not found.');
    const [company, site, category] = await Promise.all([
      prisma.company.findFirst({ where: { active: true } }),
      prisma.site.findFirst({ where: { active: true } }),
      prisma.category.findFirst({ where: { active: true } })
    ]);
    if (!company || !site || !category) throw new Error('Asset master data is incomplete.');
    const already = await prisma.asset.findFirst({ where: { discoveryId: deviceId } });
    if (already) return { device: await this.confirmMatch({ deviceId, assetId: already.id, user }), assetId: already.assetId };
    const dbUser = user?.id ? await prisma.user.findUnique({ where: { id: user.id } }) : null;
    const asset = await prisma.asset.create({ data: {
      assetId: `AST-DISC-${Date.now()}`,
      description: assetData.assetName || observation.hostname || observation.modelName || 'Discovered device',
      serialNumber: assetData.serialNumber || observation.serialNumber,
      hostname: observation.hostname, ipAddress: observation.ipAddress,
      macAddress: observation.macAddress, discoveryId: deviceId,
      companyId: company.id, siteId: site.id, categoryId: category.id,
      lifecycleStatus: 'RECEIVED', condition: 'NEW', createdByUserId: dbUser?.id || null
    } });
    const device = await this.confirmMatch({ deviceId, assetId: asset.id, user });
    return { device, assetId: asset.assetId };
  }

  static async editDevice(id, updates = {}) {
    requireDb();
    const row = await prisma.discoveryObservation.findUnique({ where: { id } });
    if (!row) throw new Error('Device not found.');
    const metadata = { ...parse(row.rawCollectorPayload), ...updates };
    await prisma.discoveryObservation.update({ where: { id }, data: {
      hostname: updates.hostname ?? row.hostname,
      ipAddress: updates.ipAddress ?? row.ipAddress,
      macAddress: updates.macAddress ?? row.macAddress,
      serialNumber: updates.serialNumber ?? row.serialNumber,
      rawCollectorPayload: JSON.stringify(metadata)
    } });
    return this.getDeviceById(id);
  }

  static async resolveException({ deviceId, remarks }) {
    requireDb();
    const row = await prisma.discoveryObservation.findUnique({ where: { id: deviceId } });
    if (!row) throw new Error('Device not found.');
    const metadata = { ...parse(row.rawCollectorPayload), resolutionRemarks: remarks || '' };
    await prisma.discoveryObservation.update({ where: { id: deviceId }, data: { rawCollectorPayload: JSON.stringify(metadata) } });
    return this.getDeviceById(deviceId);
  }

  static async deleteDevice(id) {
    requireDb();
    const row = await prisma.discoveryObservation.findUnique({ where: { id } });
    if (!row) return false;
    await prisma.$transaction(async tx => {
      await tx.discoveryMatch.deleteMany({ where: { observationId: id } });
      await tx.discoveryObservation.delete({ where: { id } });
    });
    return true;
  }

  static async getJobs(query = {}) {
    requireDb();
    let jobs = await readSnapshots('DISCOVERY_JOB');
    if (query.search) jobs = jobs.filter(j => `${j.id} ${j.jobName} ${j.ipRange}`.toLowerCase().includes(query.search.toLowerCase()));
    if (query.status && !String(query.status).startsWith('All')) jobs = jobs.filter(j => j.status === query.status);
    return jobs;
  }

  static async getJobStats() {
    const jobs = await this.getJobs();
    return { total: jobs.length, completed: jobs.filter(j => j.status === 'Completed').length,
      running: jobs.filter(j => j.status === 'Running').length, failed: jobs.filter(j => j.status === 'Failed').length,
      scheduled: jobs.filter(j => j.status === 'Scheduled').length };
  }

  static async getJobById(id) {
    return (await this.getJobs()).find(j => j.id === id || j.jobName === id) || null;
  }

  static async createJob(data = {}, user) {
    requireDb();
    if (!data.jobName?.trim()) throw new Error('Job name is required.');
    const job = {
      id: `JOB-${Date.now()}`, jobName: data.jobName.trim(),
      discoveryType: data.discoveryType || '', ipRange: data.ipRange || '',
      profile: data.profile || '', schedule: data.schedule || 'Manual',
      status: data.runImmediately ? 'Queued' : 'Scheduled',
      createdBy: user?.fullName || user?.username || '', createdOn: new Date().toISOString(),
      startedOn: null, completedOn: null, duration: '', devicesFound: 0,
      newAssets: 0, matchedAssets: 0, requiresReview: 0, stages: []
    };
    return saveSnapshot('DISCOVERY_JOB', job.id, job);
  }

  static async updateJob(id, updates = {}) {
    const job = await this.getJobById(id);
    if (!job) throw new Error('Job not found.');
    return saveSnapshot('DISCOVERY_JOB', job.id, { ...job, ...updates, id: job.id });
  }

  static async rerunJob(id) {
    return this.updateJob(id, { status: 'Queued', startedOn: null, completedOn: null });
  }

  static async cloneJob(id, user) {
    const source = await this.getJobById(id);
    if (!source) throw new Error('Job not found.');
    return this.createJob({ ...source, jobName: `${source.jobName} (Copy)`, runImmediately: false }, user);
  }

  static async deleteJob(id) {
    const job = await this.getJobById(id);
    if (!job) return false;
    await saveSnapshot('DISCOVERY_JOB', job.id, job, 'DELETE');
    return true;
  }

  static async exportDataset({ exportType = 'CURRENT', format = 'csv', columns = [], filters = {} } = {}) {
    const result = await this.getDiscoveredDevices({ ...(exportType === 'CURRENT' ? filters : {}), limit: 2000 });
    const activeColumns = columns.length ? columns : ['ipAddress', 'hostname', 'macAddress', 'manufacturer', 'model', 'serialNumber', 'assetStatus'];
    return { fileName: `discovery-devices.${format}`, recordCount: result.pagination.totalRecords,
      format, columns: activeColumns, records: result.devices };
  }

  static async getImportCandidates(params = {}) {
    const result = await this.getDiscoveredDevices({ limit: 2000 });
    let candidates = result.devices.map(d => ({ ...d,
      assetAction: d.linkedAssetId ? 'Match Existing' : 'Create New',
      assetStatus: d.linkedAssetId ? 'Matched' : 'New / Unregistered',
      matchedAssetId: d.linkedAssetId,
      remarks: d.linkedAssetId ? `Matches ${d.linkedAssetId}` : ''
    }));
    if (params.status === 'New / Unregistered') candidates = candidates.filter(d => !d.linkedAssetId);
    if (params.search) candidates = candidates.filter(d => `${d.hostname} ${d.ipAddress} ${d.serialNumber}`.toLowerCase().includes(params.search.toLowerCase()));
    return { totalSelected: candidates.length, newAssetsCount: candidates.filter(d => !d.linkedAssetId).length,
      matchedCount: candidates.filter(d => d.linkedAssetId).length, reviewCount: 0, candidates };
  }

  static async validateImportBatch({ devices = [] } = {}) {
    const validationDetails = devices.map(device => {
      const issues = [];
      if (!device.id) issues.push({ field: 'Device', message: 'A stored discovery observation is required.' });
      if (!device.hostname && !device.serialNumber) issues.push({ field: 'Identity', message: 'Hostname or serial number is required.' });
      return { deviceId: device.id, hostname: device.hostname, status: issues.length ? 'Failed' : 'Passed', issues };
    });
    const errorCount = validationDetails.filter(detail => detail.issues.length).length;
    return { success: true, totalDevices: devices.length, validCount: devices.length - errorCount,
      warningCount: 0, errorCount, allValid: errorCount === 0, validationDetails };
  }

  static async executeImportBatch({ devices = [], options = {} } = {}, user) {
    requireDb();
    const batchId = `IMP-${Date.now()}`;
    const createdAssets = [], linkedAssets = [], skippedRecords = [], failedRecords = [];
    for (const device of devices) {
      try {
        if (device.assetAction === 'Match Existing' && options.linkExisting !== false) {
          const linked = await this.confirmMatch({ deviceId: device.id, assetId: device.matchedAssetId, user });
          linkedAssets.push({ deviceId: device.id, linkedAssetId: linked.linkedAssetId });
        } else if (device.assetAction === 'Create New' && options.createNew !== false) {
          const result = await this.createAssetFromDevice({ deviceId: device.id, assetData: device, user });
          createdAssets.push({ deviceId: device.id, assetId: result.assetId });
        } else skippedRecords.push({ deviceId: device.id });
      } catch (error) { failedRecords.push({ deviceId: device.id, message: error.message }); }
    }
    const batch = { batchId, timestamp: new Date().toISOString(), initiatedBy: user?.fullName || '',
      totalProcessed: devices.length, assetsCreatedCount: createdAssets.length, existingLinkedCount: linkedAssets.length,
      skippedCount: skippedRecords.length, failedCount: failedRecords.length,
      createdAssets, linkedAssets, skippedRecords, failedRecords, options,
      status: failedRecords.length ? 'Partial' : 'Completed' };
    await saveSnapshot('DISCOVERY_IMPORT_BATCH', batchId, batch);
    return { success: failedRecords.length === 0, ...batch };
  }

  static async getImportBatches() {
    requireDb();
    return readSnapshots('DISCOVERY_IMPORT_BATCH');
  }

  static async getImportBatchById(id) {
    return (await this.getImportBatches()).find(batch => batch.batchId === id) || null;
  }
}

export default DiscoveryService;
