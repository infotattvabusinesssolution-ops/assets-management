import { Router } from 'express';
import { 
  getAssets,
  validateTag,
  associateTag,
  bulkAssociateTags,
  getRecentTagged,
  getTaggingStats,
  generateTags,
  printLabels,
  prepareLabels,
  getPrintHistory,
  getPrintTemplates,
  saveDraft,
  getDraft,
  completeTagging,
  addManualAsset,
  importAssets,
  getTaggingAudit,
  getTaggingSettings,
  updateTaggingSettings,
  getTags,
  getTagHistory,
  deleteTag
} from './tagging.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

// Tag Assets Screen Primary Endpoints
router.get('/assets', getAssets);
router.post('/validate', validateTag);
router.post('/associate', associateTag);
router.post('/bulk-associate', bulkAssociateTags);
router.get('/recent', getRecentTagged);
router.get('/stats', getTaggingStats);
router.post('/generate', generateTags);
router.post('/print', printLabels);
router.post('/prepare', prepareLabels);
router.post('/print-labels', printLabels);
router.get('/print-history', getPrintHistory);
router.get('/templates', getPrintTemplates);
router.post('/draft', saveDraft);
router.get('/draft', getDraft);
router.post('/complete', completeTagging);
router.post('/manual', addManualAsset);
router.post('/import', importAssets);
router.get('/audit', getTaggingAudit);
router.get('/settings', getTaggingSettings);
router.put('/settings', updateTaggingSettings);

// Legacy & DB Support Endpoints
router.get('/', getTags);
router.get('/history', getTagHistory);
router.delete('/:id', deleteTag);

export default router;
