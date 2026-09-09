import { Router } from 'express';
import {
  getAssets,
  getAsset360,
  createAsset,
  updateAsset,
  transitionLifecycle
} from './asset.controller.js';
import { authenticateToken } from '../../middleware/auth.js';
import { enforceDataScope, requirePermission } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticateToken);
router.use(enforceDataScope);

router.get('/', requirePermission('ASSETS_VIEW'), getAssets);
router.get('/:id/360', requirePermission('ASSETS_VIEW'), getAsset360);
router.post('/', requirePermission('ASSETS_CREATE'), createAsset);
router.put('/:id', requirePermission('ASSETS_EDIT'), updateAsset);
router.patch('/:id/lifecycle', requirePermission('ASSETS_TRANSITION'), transitionLifecycle);

export default router;
