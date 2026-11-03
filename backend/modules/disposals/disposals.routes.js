import { Router } from 'express';
import {
  getDisposedAssets,
  getPendingDisposals,
  initiateDisposal,
  getDisposalSummary,
  getDisposalReasons,
  getDisposalCandidates
} from './disposals.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/', getDisposedAssets);
router.get('/history', getDisposedAssets);
router.get('/pending', getPendingDisposals);
router.get('/summary', getDisposalSummary);
router.get('/reasons', getDisposalReasons);
router.get('/candidates', getDisposalCandidates);
router.post('/initiate', initiateDisposal);
router.post('/', initiateDisposal);

export default router;
