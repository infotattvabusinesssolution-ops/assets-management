import { Router } from 'express';
import multer from 'multer';
import {
  uploadSingleFile,
  uploadMultipleFiles,
  getUploadPolicyHandler,
  updateUploadPolicyHandler
} from './upload.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = Router();

// Memory storage for direct stream upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB multer safety limit; DB policies enforce exact dynamic limits
  }
});

router.use(authenticateToken);

// Upload policies (Dynamic DB-controlled size & format restrictions)
router.get('/policy/:policyKey', getUploadPolicyHandler);
router.get('/policy', getUploadPolicyHandler);
router.put('/policy/:policyKey', updateUploadPolicyHandler);
router.put('/policy', updateUploadPolicyHandler);

// Single file upload (document or image)
router.post('/file', upload.single('file'), uploadSingleFile);

// Multiple documents/images upload
router.post('/files', upload.array('files', 20), uploadMultipleFiles);

// Document specific alias
router.post('/document', upload.single('file'), uploadSingleFile);

// Image specific alias
router.post('/image', upload.single('file'), uploadSingleFile);

export default router;
