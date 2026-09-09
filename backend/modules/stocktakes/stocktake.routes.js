import { Router } from 'express';
import {
  getCampaigns,
  createCampaign,
  getCampaignDetails,
  recordObservation,
  closeCampaign,
  resolveException
} from './stocktake.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/campaigns', getCampaigns);
router.post('/campaigns', createCampaign);
router.get('/campaigns/:id', getCampaignDetails);
router.post('/campaigns/:id/observe', recordObservation);
router.post('/campaigns/:id/close', closeCampaign);
router.post('/exceptions/:id/resolve', resolveException);

export default router;

