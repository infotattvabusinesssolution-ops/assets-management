import { Router } from 'express';
import { globalSearch } from './search.controller.js';
import { authenticateToken } from '../../middleware/auth.js';
import { enforceDataScope } from '../../middleware/rbac.js';

const router = Router();
router.use(authenticateToken);
router.use(enforceDataScope);

router.get('/', globalSearch);

export default router;
