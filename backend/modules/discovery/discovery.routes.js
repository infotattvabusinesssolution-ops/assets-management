import { Router } from 'express';
import { 
  getObservations, 
  getMatches, 
  triggerScan, 
  confirmMatch, 
  ignoreMatch, 
  registerUnknownAsset, 
  getDiscoverySummary 
} from './discovery.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/summary', getDiscoverySummary);
router.get('/observations', getObservations);
router.get('/matches', getMatches);
router.post('/scan', triggerScan);
router.post('/matches/:matchId/confirm', confirmMatch);
router.post('/matches/:matchId/ignore', ignoreMatch);
router.post('/matches/:matchId/register-asset', registerUnknownAsset);

export default router;

