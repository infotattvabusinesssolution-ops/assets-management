import { Router } from 'express';
import {
  getCustodyAssignments,
  getCustodyStats,
  assignCustody,
  returnCustody,
  getTransfers,
  createTransfer,
  deleteTransfer,
  updateTransfer,
  getMovementKpis,
  getMovementsAssets,
  getMovementsAssetDetails,
  submitAssignmentWorkflow,
  submitTransferWorkflow,
  confirmTransferReceipt,
  getPendingApprovals,
  processApproval,
  getRecentMovements,
  getMovementHistory,
  getMovementDetailsById
} from './custodyTransfers.controller.js';
import * as movementController from './transferMovement.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

// Transfer & Movement Dedicated Enterprise Endpoints
router.get('/locations/hierarchy', movementController.getLocationHierarchy);
router.get('/master-references', movementController.getMasterReferences);
router.get('/assets/eligible', movementController.searchEligibleAssets);
router.post('/scan', movementController.scanAsset);
router.get('/movement-records', movementController.getTransfers);
router.get('/movement-records/:id', movementController.getTransferById);
router.post('/movement-records', movementController.createTransfer);
router.put('/movement-records/:id/status', movementController.updateTransferStatus);
router.get('/movement-history', movementController.getMovementHistory);


// KPI Summary
router.get('/kpis', getMovementKpis);
router.get('/stats', getMovementKpis);

// Assets Grid & Details
router.get('/assets', getMovementsAssets);
router.get('/assets/:id', getMovementsAssetDetails);

// Assignment & Transfer Workflows
router.post('/assign', submitAssignmentWorkflow);
router.post('/transfers/workflow', submitTransferWorkflow);
router.post('/transfers/:id/receipt', confirmTransferReceipt);

// Approvals, Activity & History
router.get('/approvals', getPendingApprovals);
router.post('/approvals/:id/action', processApproval);
router.get('/recent', getRecentMovements);
router.get('/history', getMovementHistory);
router.get('/history/:id', getMovementDetailsById);

// Legacy Endpoints for Existing Callers
router.get('/custody', getCustodyAssignments);
router.post('/custody', assignCustody);
router.post('/custody/:id/return', returnCustody);
router.get('/transfers', getTransfers);
router.post('/transfers', createTransfer);
router.put('/transfers/:id', updateTransfer);
router.delete('/transfers/:id', deleteTransfer);

export default router;
