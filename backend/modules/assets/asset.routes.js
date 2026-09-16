import { Router } from 'express';
import {
  getAssets,
  getMyAssets,
  getAsset360,
  createAsset,
  updateAsset,
  transitionLifecycle,
  deleteAsset,
  acknowledgeAsset,
  requestAssetTransfer,
  requestAssetReturn,
  reportAssetIssue,
  requestNewAsset,
  getAssetDocuments,
  getAssetHierarchyTree,
  assignParentAsset,
  addChildAsset,
  removeParentRelationship,
  getHierarchyAuditHistory
} from './asset.controller.js';
import { authenticateToken } from '../../middleware/auth.js';
import { enforceDataScope, requirePermission } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticateToken);
router.use(enforceDataScope);

router.get('/', requirePermission('ASSETS_VIEW'), getAssets);
router.get('/my-assets', requirePermission('ASSETS_VIEW'), getMyAssets);
router.get('/hierarchy/tree', requirePermission('ASSETS_VIEW'), getAssetHierarchyTree);
router.get('/hierarchy/history', requirePermission('ASSETS_VIEW'), getHierarchyAuditHistory);
router.post('/hierarchy/assign-parent', requirePermission('ASSETS_EDIT'), assignParentAsset);
router.post('/hierarchy/add-child', requirePermission('ASSETS_EDIT'), addChildAsset);
router.delete('/hierarchy/:id/remove-parent', requirePermission('ASSETS_EDIT'), removeParentRelationship);

router.post('/request-asset', requirePermission('ASSETS_VIEW'), requestNewAsset);
router.get('/:id/360', requirePermission('ASSETS_VIEW'), getAsset360);
router.get('/:id/documents', requirePermission('ASSETS_VIEW'), getAssetDocuments);

router.post('/:id/acknowledge', requirePermission('ASSETS_VIEW'), acknowledgeAsset);
router.post('/:id/transfer-request', requirePermission('ASSETS_VIEW'), requestAssetTransfer);
router.post('/:id/return-request', requirePermission('ASSETS_VIEW'), requestAssetReturn);
router.post('/:id/report-issue', requirePermission('ASSETS_VIEW'), reportAssetIssue);

router.post('/', requirePermission('ASSETS_CREATE'), createAsset);
router.put('/:id', requirePermission('ASSETS_EDIT'), updateAsset);
router.patch('/:id/lifecycle', requirePermission('ASSETS_TRANSITION'), transitionLifecycle);
router.delete('/:id', requirePermission('ASSETS_DELETE'), deleteAsset);

export default router;



