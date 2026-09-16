import { DiscoveryService } from './discovery.service.js';

export async function getDiscoveryKpis(req, res, next) {
  try {
    const kpis = await DiscoveryService.getKpis();
    res.json({ success: true, ...kpis });
  } catch (err) { next(err); }
}

export async function getDiscoveredDevices(req, res, next) {
  try {
    const result = await DiscoveryService.getDiscoveredDevices(req.query);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

export async function getDeviceDetails(req, res, next) {
  try {
    const device = await DiscoveryService.getDeviceById(req.params.id);
    if (!device) return res.status(404).json({ success: false, message: 'Device not found' });
    res.json({ success: true, device });
  } catch (err) { next(err); }
}

export async function confirmDeviceMatch(req, res, next) {
  try {
    const { id } = req.params;
    const { assetId } = req.body;
    const device = await DiscoveryService.confirmMatch({
      deviceId: id,
      assetId,
      user: req.user
    });
    res.json({ success: true, device, message: `Discovered device successfully matched to asset ${device.linkedAssetId}.` });
  } catch (err) { next(err); }
}

export async function rejectDeviceMatch(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const device = await DiscoveryService.rejectMatch({
      deviceId: id,
      reason,
      user: req.user
    });
    res.json({ success: true, device, message: 'Suggested match rejected.' });
  } catch (err) { next(err); }
}

export async function createAssetFromDiscovery(req, res, next) {
  try {
    const { id } = req.params;
    const result = await DiscoveryService.createAssetFromDevice({
      deviceId: id,
      assetData: req.body,
      user: req.user
    });
    res.status(201).json({ success: true, ...result, message: `New asset ${result.assetId} successfully created and linked!` });
  } catch (err) { next(err); }
}

export async function editDiscoveredDevice(req, res, next) {
  try {
    const { id } = req.params;
    const device = await DiscoveryService.editDevice(id, req.body, req.user);
    res.json({ success: true, device, message: 'Discovered device information updated.' });
  } catch (err) { next(err); }
}

export async function resolveDeviceException(req, res, next) {
  try {
    const { id } = req.params;
    const { resolutionType, remarks } = req.body;
    const device = await DiscoveryService.resolveException({
      deviceId: id,
      resolutionType,
      remarks,
      user: req.user
    });
    res.json({ success: true, device, message: 'Exception marked as resolved.' });
  } catch (err) { next(err); }
}

export async function deleteDiscoveredDevice(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await DiscoveryService.deleteDevice(id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Device not found' });
    res.json({ success: true, message: 'Discovered device record archived and suppressed.' });
  } catch (err) { next(err); }
}

export async function exportDiscoveredDevices(req, res, next) {
  try {
    const payload = await DiscoveryService.exportDataset(req.body);
    res.json({ success: true, ...payload });
  } catch (err) { next(err); }
}

export async function getDiscoveryJobStats(req, res, next) {
  try {
    const stats = await DiscoveryService.getJobStats();
    res.json({ success: true, ...stats });
  } catch (err) { next(err); }
}

export async function getDiscoveryJobs(req, res, next) {
  try {
    const jobs = await DiscoveryService.getJobs(req.query);
    res.json({ success: true, jobs });
  } catch (err) { next(err); }
}

export async function getJobDetails(req, res, next) {
  try {
    const { jobId } = req.params;
    const job = await DiscoveryService.getJobById(jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, job });
  } catch (err) { next(err); }
}

export async function createDiscoveryJob(req, res, next) {
  try {
    const job = await DiscoveryService.createJob(req.body, req.user);
    res.status(201).json({ success: true, job, message: 'Discovery job created successfully.' });
  } catch (err) { next(err); }
}

export async function cloneDiscoveryJob(req, res, next) {
  try {
    const { jobId } = req.params;
    const job = await DiscoveryService.cloneJob(jobId, req.user);
    res.status(201).json({ success: true, job, message: 'Discovery job cloned successfully.' });
  } catch (err) { next(err); }
}

export async function deleteDiscoveryJob(req, res, next) {
  try {
    const { jobId } = req.params;
    const deleted = await DiscoveryService.deleteJob(jobId);
    if (!deleted) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, message: 'Discovery job deleted.' });
  } catch (err) { next(err); }
}

export async function getJobDevices(req, res, next) {
  try {
    const { jobId } = req.params;
    const jobs = await DiscoveryService.getJobs();
    const job = jobs.find((j) => j.id === jobId || j.jobName.toLowerCase() === jobId.toLowerCase());
    const result = await DiscoveryService.getDiscoveredDevices({
      ...req.query,
      discoveryJob: job ? job.jobName : jobId
    });
    res.json({ success: true, job, ...result });
  } catch (err) { next(err); }
}

export async function rerunDiscoveryJob(req, res, next) {
  try {
    const { jobId } = req.params;
    const newExec = await DiscoveryService.rerunJob(jobId);
    res.json({ success: true, execution: newExec, message: `Execution of ${jobId} initiated.` });
  } catch (err) { next(err); }
}

export async function updateDiscoveryJob(req, res, next) {
  try {
    const { jobId } = req.params;
    const job = await DiscoveryService.updateJob(jobId, req.body);
    res.json({ success: true, job, message: 'Discovery job configuration updated.' });
  } catch (err) { next(err); }
}

// Backward compatibility handlers for legacy routes
export async function getDiscoverySummary(req, res, next) {
  try {
    const kpis = await DiscoveryService.getKpis();
    res.json({ success: true, summary: kpis });
  } catch (err) { next(err); }
}

export async function getObservations(req, res, next) {
  try {
    const result = await DiscoveryService.getDiscoveredDevices(req.query);
    res.json({ success: true, observations: result.devices });
  } catch (err) { next(err); }
}

export async function getMatches(req, res, next) {
  try {
    const result = await DiscoveryService.getDiscoveredDevices(req.query);
    res.json({ success: true, matches: result.devices });
  } catch (err) { next(err); }
}

export async function triggerScan(req, res, next) {
  try {
    res.json({ success: true, message: 'Network scan sweep initiated.' });
  } catch (err) { next(err); }
}

export async function confirmMatch(req, res, next) {
  return confirmDeviceMatch(req, res, next);
}

export async function ignoreMatch(req, res, next) {
  return rejectDeviceMatch(req, res, next);
}

export async function registerUnknownAsset(req, res, next) {
  return createAssetFromDiscovery(req, res, next);
}

// -------------------------------------------------------------
// Import to Asset 360 Controlled Workflow Controllers
// -------------------------------------------------------------

export async function getImportCandidates(req, res, next) {
  try {
    const data = await DiscoveryService.getImportCandidates(req.query);
    res.json({ success: true, ...data });
  } catch (err) { next(err); }
}

export async function validateImportBatch(req, res, next) {
  try {
    const result = await DiscoveryService.validateImportBatch(req.body);
    res.json(result);
  } catch (err) { next(err); }
}

export async function executeImportBatch(req, res, next) {
  try {
    const result = await DiscoveryService.executeImportBatch(req.body, req.user);
    res.status(201).json(result);
  } catch (err) { next(err); }
}

export async function getImportBatches(req, res, next) {
  try {
    const batches = await DiscoveryService.getImportBatches();
    res.json({ success: true, batches });
  } catch (err) { next(err); }
}

export async function getImportBatchDetails(req, res, next) {
  try {
    const { batchId } = req.params;
    const batch = await DiscoveryService.getImportBatchById(batchId);
    if (!batch) return res.status(404).json({ success: false, message: 'Import batch not found' });
    res.json({ success: true, batch });
  } catch (err) { next(err); }
}

