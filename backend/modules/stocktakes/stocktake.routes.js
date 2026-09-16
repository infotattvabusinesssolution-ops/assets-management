import { Router } from 'express';
import {
  getCampaigns,
  createCampaign,
  getCampaignDetails,
  getCampaignAssets,
  resolveAssetByIdentifier,
  verifyAssetAction,
  recordObservation,
  getCampaignDiscrepancies,
  reconcileDiscrepancy,
  getCampaignAuditTrail,
  getCampaignAttachments,
  completeCampaign,
  closeCampaign,
  resolveException,
  bulkRfidScanAction,
  getAuditNotesAction,
  addAuditNoteAction,
  getNotFoundAssetsAction,
  getSummaryAction
} from './stocktake.controller.js';
import * as auditMgmtController from './auditManagement.controller.js';
import * as auditReportController from './auditReport.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

// Audit Management & Guided Campaign Creation
router.get('/audits', auditMgmtController.getAudits);
router.get('/audits/:id', auditMgmtController.getAuditById);
router.post('/audits', auditMgmtController.createAudit);
router.put('/audits/:id/status', auditMgmtController.updateAuditStatus);
router.post('/audits/estimate-scope', auditMgmtController.estimateScope);
router.get('/audits/:id/reconciliation-report', auditMgmtController.getReconciliationReport);

// Audit Report & Analytics
router.get('/reports/summary', auditReportController.getReportSummary);
router.get('/reports/assets', auditReportController.getReportAssets);
router.get('/reports/export', auditReportController.exportReport);
router.get('/audit-reports/summary', auditReportController.getReportSummary);
router.get('/audit-reports/assets', auditReportController.getReportAssets);
router.get('/audit-reports/export', auditReportController.exportReport);

// Campaigns
router.get('/campaigns', getCampaigns);
router.post('/campaigns', createCampaign);
router.get('/campaigns/:id', getCampaignDetails);
router.post('/campaigns/:id/close', closeCampaign);
router.post('/campaigns/:id/complete', completeCampaign);

// Asset Verification in Campaign
router.get('/campaigns/:id/assets', getCampaignAssets);
router.get('/assets/resolve/:identifier', resolveAssetByIdentifier);
router.post('/campaigns/:id/observe', recordObservation);
router.post('/verify-asset', verifyAssetAction);
router.post('/campaigns/:id/bulk-rfid-scan', bulkRfidScanAction);

// Discrepancies, Exceptions & Not Found
router.get('/campaigns/:id/discrepancies', getCampaignDiscrepancies);
router.get('/campaigns/:id/not-found', getNotFoundAssetsAction);
router.post('/exceptions/:id/reconcile', reconcileDiscrepancy);
router.post('/exceptions/:id/resolve', resolveException);

// Notes, Summary & Audit Trail
router.get('/campaigns/:id/notes', getAuditNotesAction);
router.post('/campaigns/:id/notes', addAuditNoteAction);
router.get('/campaigns/:id/summary', getSummaryAction);
router.get('/campaigns/:id/audit-trail', getCampaignAuditTrail);
router.get('/campaigns/:id/attachments', getCampaignAttachments);

export default router;
