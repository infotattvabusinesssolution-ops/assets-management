import { Router } from 'express';
import { processImport } from './imports.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.post('/process', processImport);

export default router;
