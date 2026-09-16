import { Router } from 'express';
import {
  processImport,
  validateBulkImport,
  submitBulkImport,
  getUploadHistory
} from './imports.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.post('/validate', validateBulkImport);
router.post('/submit', submitBulkImport);
router.get('/history', getUploadHistory);
router.post('/process', processImport);

export default router;

