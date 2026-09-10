import { Router } from 'express';
import { 
  getTags, 
  getTaggingStats,
  getTagHistory,
  generateTags, 
  associateTag 
} from './tagging.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/', getTags);
router.get('/stats', getTaggingStats);
router.get('/history', getTagHistory);
router.post('/generate', generateTags);
router.post('/associate', associateTag);

export default router;
