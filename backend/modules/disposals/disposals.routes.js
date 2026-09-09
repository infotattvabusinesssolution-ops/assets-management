import { Router } from 'express';
import { getDisposedAssets, initiateDisposal, getDisposalSummary } from './disposals.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/', getDisposedAssets);
router.get('/summary', getDisposalSummary);
router.post('/initiate', initiateDisposal);

export default router;

