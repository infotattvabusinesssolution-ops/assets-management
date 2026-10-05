import { Router } from 'express';
import multer from 'multer';
import { uploadSingleFile, uploadMultipleFiles } from './upload.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = Router();

// Memory storage for direct stream upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max file size
  }
});

router.use(authenticateToken);

// Single file upload (document or image)
router.post('/file', upload.single('file'), uploadSingleFile);

// Multiple documents upload
router.post('/files', upload.array('files', 10), uploadMultipleFiles);

// Document specific alias
router.post('/document', upload.single('file'), uploadSingleFile);

// Image specific alias
router.post('/image', upload.single('file'), uploadSingleFile);

export default router;
