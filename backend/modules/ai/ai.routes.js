import { Router } from 'express';
import { extractDocument, checkDuplicates, getHealthInsights, askAssistant } from './ai.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.post('/extract', extractDocument);
router.get('/duplicates', checkDuplicates);
router.get('/health/:assetId', getHealthInsights);
router.post('/assistant', askAssistant);

export default router;
