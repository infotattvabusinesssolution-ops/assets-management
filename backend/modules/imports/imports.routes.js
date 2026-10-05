import { Router } from 'express';
import multer from 'multer';
import {
  processImport,
  validateBulkImport,
  submitBulkImport,
  getUploadHistory,
  uploadAndValidateBulkFile
} from './imports.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const router = Router();
router.use(authenticateToken);

router.post('/validate', validateBulkImport);
router.post('/upload', upload.single('file'), uploadAndValidateBulkFile);
router.post('/submit', submitBulkImport);
router.get('/history', getUploadHistory);
router.post('/process', processImport);

export default router;
