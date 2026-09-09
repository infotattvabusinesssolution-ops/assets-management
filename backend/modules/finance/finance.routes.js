import { Router } from 'express';
import {
  getFinancialSummary,
  getFiscalPeriods,
  createFiscalPeriod,
  toggleFiscalPeriodStatus,
  getDepreciationRuns,
  getRunDetails,
  runDepreciation,
  postDepreciationRun
} from './finance.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/summary', getFinancialSummary);

router.get('/periods', getFiscalPeriods);
router.post('/periods', createFiscalPeriod);
router.post('/periods/:id/toggle', toggleFiscalPeriodStatus);

router.get('/depreciation', getDepreciationRuns);
router.get('/depreciation/:id', getRunDetails);
router.post('/depreciation/run', runDepreciation);
router.post('/depreciation/:id/post', postDepreciationRun);

export default router;
