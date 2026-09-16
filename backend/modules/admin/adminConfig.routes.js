import { Router } from 'express';
import {
  getSystemConfig,
  updateSystemConfigSection,
  getNumberingSchemes,
  updateNumberingScheme,
  getLookups,
  createLookup,
  toggleLookupStatus
} from './adminConfig.controller.js';

const router = Router();

// =========================================================================
// 1. SYSTEM PARAMETERS (General, Asset, Inventory, Maintenance)
// =========================================================================
router.get('/', getSystemConfig);
router.get('/parameters', getSystemConfig);
router.put('/:section', updateSystemConfigSection);
router.put('/parameters/:section', updateSystemConfigSection);

// =========================================================================
// 2. NUMBERING & CODES SCHEMES
// =========================================================================
router.get('/numbering', getNumberingSchemes);
router.put('/numbering/:id', updateNumberingScheme);

// =========================================================================
// 3. LOOKUPS & BUSINESS LISTS
// =========================================================================
router.get('/lookups', getLookups);
router.post('/lookups', createLookup);
router.patch('/lookups/:id/toggle', toggleLookupStatus);

export default router;
