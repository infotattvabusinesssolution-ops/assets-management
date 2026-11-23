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
import { requireRole } from '../../middleware/rbac.js';

const router = Router();

// Enforce authentication globally across all admin configuration routes
router.use(authenticateToken);

// =========================================================================
// 1. SYSTEM PARAMETERS REGISTER (Screenshot 1)
// =========================================================================
router.get('/', getParametersList);
router.get('/parameters', getParametersList);
router.get('/parameter-list', getParametersList);
router.post('/parameters', requireRole('SYS_ADMIN'), createParameter);
router.put('/parameters/:id', requireRole('SYS_ADMIN'), (req, res, next) => {
  const sections = ['general', 'asset', 'inventory', 'maintenance'];
  if (sections.includes(req.params.id.toLowerCase())) {
    return updateSystemConfigSection(req, res, next);
  }
  return updateParameter(req, res, next);
});
router.delete('/parameters/:id', requireRole('SYS_ADMIN'), deleteParameter);

// Legacy section config
router.get('/sections', getSystemConfig);
router.put('/:section', requireRole('SYS_ADMIN'), updateSystemConfigSection);

// =========================================================================
// 2. WORKFLOW & APPROVALS CONSOLE (Screenshot 2)
// =========================================================================
router.get('/workflows', getWorkflowsList);
router.get('/workflows/:id', getWorkflowById);
router.post('/workflows', requireRole('SYS_ADMIN'), createWorkflow);
router.put('/workflows/:id', requireRole('SYS_ADMIN'), updateWorkflow);
router.patch('/workflows/:id/toggle', requireRole('SYS_ADMIN'), toggleWorkflowStatus);
router.post('/workflows/:id/test', testWorkflowSimulation);

// =========================================================================
// 3. NUMBERING & CODES SCHEMES
// =========================================================================
router.get('/numbering', getNumberingSchemes);
router.put('/numbering/:id', requireRole('SYS_ADMIN'), updateNumberingScheme);

// =========================================================================
// 4. LOOKUPS & BUSINESS LISTS
// =========================================================================
router.get('/lookups', getLookups);
router.post('/lookups', requireRole('SYS_ADMIN'), createLookup);
router.patch('/lookups/:id/toggle', requireRole('SYS_ADMIN'), toggleLookupStatus);

// =========================================================================
// 5. PASSWORD POLICY CONFIGURATION (Authenticated Admin Only)
// =========================================================================
router.get('/password-policy', getPasswordPolicy);
router.post('/password-policy', requireRole('SYS_ADMIN'), savePasswordPolicy);
router.get('/password-policies', getAllPasswordPolicies);
router.post('/password-policy/generate', generateCompliantPasswordEndpoint);
router.post('/password-policy/validate', testPasswordSimulation);

// =========================================================================
// 6. ENTERPRISE LICENSE & SUBSCRIPTION POLICY
// =========================================================================
router.get('/license', getLicense);
router.post('/license/apply', requireRole('SYS_ADMIN'), applyLicense);

// =========================================================================
// 7. LICENSED COMPANIES CONFIGURATION & READ-ONLY ENUMERATION
// =========================================================================
router.get('/companies', getConfiguredCompanies);
router.get('/companies/enum', getCompanyEnumeration);
router.post('/companies', requireRole('SYS_ADMIN'), createConfiguredCompany);

export default router;
