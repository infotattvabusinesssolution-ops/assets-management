import { Router } from 'express';
import {
  getCustodyAssignments,
  getCustodyStats,
  assignCustody,
  returnCustody,
  getTransfers,
  createTransfer,
  deleteTransfer,
  updateTransfer
} from './custodyTransfers.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/stats', getCustodyStats);
router.get('/custody', getCustodyAssignments);
router.post('/custody', assignCustody);
router.post('/custody/:id/return', returnCustody);

router.get('/transfers', getTransfers);
router.post('/transfers', createTransfer);
router.put('/transfers/:id', updateTransfer);
router.delete('/transfers/:id', deleteTransfer);

export default router;
