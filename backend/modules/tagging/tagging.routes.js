import { Router } from 'express';
import { getTags, generateTags, associateTag } from './tagging.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/', getTags);
router.post('/generate', generateTags);
router.post('/associate', associateTag);

export default router;
