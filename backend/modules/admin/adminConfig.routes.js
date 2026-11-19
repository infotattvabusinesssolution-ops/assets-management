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
import {
  getPasswordPolicy,
  savePasswordPolicy,
  getAllPasswordPolicies,
  generateCompliantPasswordEndpoint,
  testPasswordSimulation
} from './passwordPolicy.controller.js';
import {
  getLicense,
  applyLicense,
  getConfiguredCompanies,
  getCompanyEnumeration,
  createConfiguredCompany
} from './license.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

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

// =========================================================================
// 5. PASSWORD POLICY CONFIGURATION (Authenticated Admin Only)
// =========================================================================
router.get('/password-policy', authenticateToken, getPasswordPolicy);
router.post('/password-policy', authenticateToken, savePasswordPolicy);
router.get('/password-policies', authenticateToken, getAllPasswordPolicies);
router.post('/password-policy/generate', authenticateToken, generateCompliantPasswordEndpoint);
router.post('/password-policy/validate', authenticateToken, testPasswordSimulation);

// =========================================================================
// 6. ENTERPRISE LICENSE & SUBSCRIPTION POLICY
// =========================================================================
router.get('/license', authenticateToken, getLicense);
router.post('/license/apply', authenticateToken, applyLicense);

// =========================================================================
// 7. LICENSED COMPANIES CONFIGURATION & READ-ONLY ENUMERATION
// =========================================================================
router.get('/companies', authenticateToken, getConfiguredCompanies);
router.get('/companies/enum', getCompanyEnumeration);
router.post('/companies', authenticateToken, createConfiguredCompany);

export default router;
