import { Router } from 'express';
import { 
  getReceipts, 
  getReceivingStats,
  getReceiptById,
  createReceipt,
  deleteReceipt
} from './receiving.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/', getReceipts);
router.get('/stats', getReceivingStats);
router.get('/:id', getReceiptById);
router.post('/', createReceipt);
router.delete('/:id', deleteReceipt);

export default router;
