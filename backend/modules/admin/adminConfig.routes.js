import { Router } from 'express';
import {
  getSystemConfig,
  updateSystemConfigSection,
  getNumberingSchemes,
  updateNumberingScheme,
  getLookups,
  createLookup,
  toggleLookupStatus,
  getParametersList,
  createParameter,
  updateParameter,
  deleteParameter,
  getWorkflowsList,
  getWorkflowById,
  createWorkflow,
  updateWorkflow,
  toggleWorkflowStatus,
  testWorkflowSimulation
} from './adminConfig.controller.js';

const router = Router();

// =========================================================================
// 1. SYSTEM PARAMETERS REGISTER (Screenshot 1)
// =========================================================================
router.get('/', getParametersList);
router.get('/parameters', getParametersList);
router.get('/parameter-list', getParametersList);
router.post('/parameters', createParameter);
router.put('/parameters/:id', (req, res, next) => {
  const sections = ['general', 'asset', 'inventory', 'maintenance'];
  if (sections.includes(req.params.id.toLowerCase())) {
    return updateSystemConfigSection(req, res, next);
  }
  return updateParameter(req, res, next);
});
router.delete('/parameters/:id', deleteParameter);

// Legacy section config
router.get('/sections', getSystemConfig);
router.put('/:section', updateSystemConfigSection);

// =========================================================================
// 2. WORKFLOW & APPROVALS CONSOLE (Screenshot 2)
// =========================================================================
router.get('/workflows', getWorkflowsList);
router.get('/workflows/:id', getWorkflowById);
router.post('/workflows', createWorkflow);
router.put('/workflows/:id', updateWorkflow);
router.patch('/workflows/:id/toggle', toggleWorkflowStatus);
router.post('/workflows/:id/test', testWorkflowSimulation);

// =========================================================================
// 3. NUMBERING & CODES SCHEMES
// =========================================================================
router.get('/numbering', getNumberingSchemes);
router.put('/numbering/:id', updateNumberingScheme);

// =========================================================================
// 4. LOOKUPS & BUSINESS LISTS
// =========================================================================
router.get('/lookups', getLookups);
router.post('/lookups', createLookup);
router.patch('/lookups/:id/toggle', toggleLookupStatus);

export default router;
