import { Router } from 'express';
import { 
  getDiscoveryKpis,
  getDiscoveredDevices,
  getDeviceDetails,
  confirmDeviceMatch,
  rejectDeviceMatch,
  createAssetFromDiscovery,
  editDiscoveredDevice,
  resolveDeviceException,
  deleteDiscoveredDevice,
  exportDiscoveredDevices,
  getDiscoveryJobs,
  getDiscoveryJobStats,
  getJobDetails,
  createDiscoveryJob,
  cloneDiscoveryJob,
  deleteDiscoveryJob,
  getJobDevices,
  rerunDiscoveryJob,
  updateDiscoveryJob,
  getDiscoverySummary,
  getObservations,
  getMatches,
  triggerScan,
  confirmMatch,
  ignoreMatch,
  registerUnknownAsset,
  getImportCandidates,
  validateImportBatch,
  executeImportBatch,
  getImportBatches,
  getImportBatchDetails
} from './discovery.controller.js';
import {
  getSettingsOverview,
  getDiscoveryProfiles,
  getDiscoveryProfileById,
  saveDiscoveryProfile,
  cloneDiscoveryProfile,
  deleteDiscoveryProfile,
  getCredentials,
  saveCredential,
  deleteCredential,
  testCredential,
  getConnectors,
  saveConnector,
  deleteConnector,
  testConnector,
  syncConnector,
  getMatchingRules,
  updateMatchingRules,
  resetMatchingRules,
  getClassificationRules,
  saveClassificationRule,
  deleteClassificationRule,
  getSchedules,
  saveSchedule,
  toggleSchedule,
  deleteSchedule,
  getGlobalSettings,
  updateGlobalSettings,
  getDiscoveryAuditLogs
} from './discoverySettings.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

// Discovered Devices Primary Endpoints
router.get('/kpis', getDiscoveryKpis);
router.get('/devices', getDiscoveredDevices);
router.post('/devices/export', exportDiscoveredDevices);
router.get('/devices/:id', getDeviceDetails);
router.put('/devices/:id', editDiscoveredDevice);
router.delete('/devices/:id', deleteDiscoveredDevice);

// Reconciliation & Asset Linking
router.post('/devices/:id/confirm-match', confirmDeviceMatch);
router.post('/devices/:id/reject-match', rejectDeviceMatch);
router.post('/devices/:id/create-asset', createAssetFromDiscovery);
router.post('/devices/:id/resolve', resolveDeviceException);

// Discovery Jobs
router.get('/jobs/stats', getDiscoveryJobStats);
router.get('/jobs', getDiscoveryJobs);
router.post('/jobs', createDiscoveryJob);
router.get('/jobs/:jobId', getJobDetails);
router.post('/jobs/:jobId/clone', cloneDiscoveryJob);
router.delete('/jobs/:jobId', deleteDiscoveryJob);
router.get('/jobs/:jobId/devices', getJobDevices);
router.post('/jobs/:jobId/rerun', rerunDiscoveryJob);
router.put('/jobs/:jobId', updateDiscoveryJob);

// Import to Asset 360 Controlled Workflow Endpoints
router.get('/import/candidates', getImportCandidates);
router.post('/import/validate', validateImportBatch);
router.post('/import/execute', executeImportBatch);
router.get('/import/batches', getImportBatches);
router.get('/import/batches/:batchId', getImportBatchDetails);

// Discovery Settings & Governance Endpoints
router.get('/settings/overview', getSettingsOverview);
router.get('/settings/profiles', getDiscoveryProfiles);
router.get('/settings/profiles/:id', getDiscoveryProfileById);
router.post('/settings/profiles', saveDiscoveryProfile);
router.post('/settings/profiles/:id/clone', cloneDiscoveryProfile);
router.delete('/settings/profiles/:id', deleteDiscoveryProfile);

router.get('/settings/credentials', getCredentials);
router.post('/settings/credentials', saveCredential);
router.delete('/settings/credentials/:id', deleteCredential);
router.post('/settings/credentials/:id/test', testCredential);

router.get('/settings/connectors', getConnectors);
router.post('/settings/connectors', saveConnector);
router.delete('/settings/connectors/:id', deleteConnector);
router.post('/settings/connectors/:id/test', testConnector);
router.post('/settings/connectors/:id/sync', syncConnector);

router.get('/settings/matching-rules', getMatchingRules);
router.put('/settings/matching-rules', updateMatchingRules);
router.post('/settings/matching-rules/reset', resetMatchingRules);

router.get('/settings/classifications', getClassificationRules);
router.post('/settings/classifications', saveClassificationRule);
router.delete('/settings/classifications/:id', deleteClassificationRule);

router.get('/settings/schedules', getSchedules);
router.post('/settings/schedules', saveSchedule);
router.post('/settings/schedules/:id/toggle', toggleSchedule);
router.delete('/settings/schedules/:id', deleteSchedule);

router.get('/settings/global', getGlobalSettings);
router.put('/settings/global', updateGlobalSettings);
router.post('/settings/global', updateGlobalSettings);

router.get('/settings/audit-logs', getDiscoveryAuditLogs);

// Backward Compatibility / Legacy Endpoints
router.get('/summary', getDiscoverySummary);
router.get('/observations', getObservations);
router.get('/matches', getMatches);
router.post('/scan', triggerScan);
router.post('/matches/:id/confirm', confirmMatch);
router.post('/matches/:id/ignore', ignoreMatch);
router.post('/matches/:id/register-asset', registerUnknownAsset);

export default router;
