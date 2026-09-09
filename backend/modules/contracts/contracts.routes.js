import { Router } from 'express';
import { getContracts, createContract, getWarranties, createWarranty, getContractSummary } from './contracts.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/', getContracts);
router.post('/', createContract);
router.get('/summary', getContractSummary);
router.get('/warranties', getWarranties);
router.post('/warranties', createWarranty);

export default router;

