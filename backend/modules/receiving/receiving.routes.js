import { Router } from 'express';
import { getReceipts, createReceipt } from './receiving.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/', getReceipts);
router.post('/', createReceipt);

export default router;
