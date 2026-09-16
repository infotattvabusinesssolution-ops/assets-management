import { Router } from 'express';
import {
  getSystemConfig,
  updateSystemConfigSection,
  getNumberingSchemes,
  updateNumberingScheme,
  getLookups,
  createLookup,
  toggleLookupStatus
} from './adminConfig.controller.js';

import {
  getMasterDataHierarchy,
  getMasterDataGroups,
  createMasterDataGroup,
  updateMasterDataGroup,
  deleteMasterDataGroup,
  getMasterDataClasses,
  getMasterDataSuppliers,
  getMasterDataManufacturers,
  getMasterDataUOM,
  validateMasterDataImport,
  commitBulkMasterDataImport,
  getIntegrationsList,
  testIntegrationConnection,
  runIntegrationSync,
  toggleIntegrationStatus,
  getAuditLogsList,
  getEmailTemplates,
  updateEmailTemplate,
  getEmailSettings,
  updateEmailSettings,
  sendTestEmail,
  getEmailDeliveryLogs,
  getBackupHealthAndList,
  createManualBackup,
  getScheduledJobs,
  toggleJobStatus,
  triggerJobRunNow
} from './adminGovernance.controller.js';

const router = Router();

// Configuration Endpoints
router.get('/config', getSystemConfig);
router.put('/config/:section', updateSystemConfigSection);
router.get('/numbering', getNumberingSchemes);
router.put('/numbering/:id', updateNumberingScheme);
router.get('/lookups', getLookups);
router.post('/lookups', createLookup);
router.patch('/lookups/:id/toggle', toggleLookupStatus);

// Master Data Endpoints
router.get('/master-data/hierarchy', getMasterDataHierarchy);
router.get('/master-data/groups', getMasterDataGroups);
router.post('/master-data/groups', createMasterDataGroup);
router.put('/master-data/groups/:id', updateMasterDataGroup);
router.delete('/master-data/groups/:id', deleteMasterDataGroup);
router.get('/master-data/classes', getMasterDataClasses);
router.get('/master-data/suppliers', getMasterDataSuppliers);
router.get('/master-data/manufacturers', getMasterDataManufacturers);
router.get('/master-data/uom', getMasterDataUOM);
router.post('/master-data/import/validate', validateMasterDataImport);
router.post('/master-data/import/commit', commitBulkMasterDataImport);

// Integrations Endpoints
router.get('/integrations', getIntegrationsList);
router.post('/integrations/:id/test', testIntegrationConnection);
router.post('/integrations/:id/sync', runIntegrationSync);
router.patch('/integrations/:id/toggle', toggleIntegrationStatus);

// Audit Logs Endpoints
router.get('/audit-logs', getAuditLogsList);

// Email Notifications Endpoints
router.get('/notifications/templates', getEmailTemplates);
router.put('/notifications/templates/:id', updateEmailTemplate);
router.get('/notifications/settings', getEmailSettings);
router.put('/notifications/settings', updateEmailSettings);
router.post('/notifications/test-email', sendTestEmail);
router.get('/notifications/logs', getEmailDeliveryLogs);

// Backup & Scheduler Endpoints
router.get('/backup/health', getBackupHealthAndList);
router.get('/backup-scheduler/overview', getBackupHealthAndList);
router.post('/backup/create', createManualBackup);
router.post('/backup-scheduler/create-backup', createManualBackup);
router.get('/backup/jobs', getScheduledJobs);
router.get('/backup-scheduler/jobs', getScheduledJobs);
router.patch('/backup/jobs/:id/toggle', toggleJobStatus);
router.patch('/backup-scheduler/jobs/:id/toggle', toggleJobStatus);
router.post('/backup/jobs/:id/run-now', triggerJobRunNow);
router.post('/backup-scheduler/jobs/:id/run', triggerJobRunNow);

export default router;

