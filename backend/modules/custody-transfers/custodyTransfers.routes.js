import { Router } from 'express';
import {
  getCustodyAssignments,
  assignCustody,
  returnCustody,
  getTransfers,
  createTransfer
} from './custodyTransfers.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/custody', getCustodyAssignments);
router.post('/custody', assignCustody);
router.post('/custody/:id/return', returnCustody);

router.get('/transfers', getTransfers);
router.post('/transfers', createTransfer);

export default router;

