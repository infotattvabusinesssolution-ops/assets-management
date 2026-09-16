import { Router } from 'express';
import { 
  getReceipts, 
  getReceivingStats,
  getReceiptById,
  createReceipt,
  deleteReceipt,
  getPurchaseOrders,
  getPurchaseOrderByNumber,
  validateSerialNumber,
  validateTagNumber,
  scanLookup,
  submitReceiving,
  saveDraft,
  getDrafts,
  getDraftById,
  deleteDraft,
  getReceivingHistory,
  getReceivingHistoryById,
  getNonPoReasons,
  getSuppliers,
  validateReceivingBatch
} from './receiving.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

// Standard Goods Receipts
router.get('/', getReceipts);
router.get('/stats', getReceivingStats);

// Master Data for Receiving
router.get('/non-po-reasons', getNonPoReasons);
router.get('/suppliers', getSuppliers);

// Purchase Order Integration
router.get('/purchase-orders', getPurchaseOrders);
router.get('/purchase-orders/:poNumber', getPurchaseOrderByNumber);

// Verification & Scan Validation
router.post('/validate-serial', validateSerialNumber);
router.post('/validate-tag', validateTagNumber);
router.post('/validate-batch', validateReceivingBatch);
router.post('/scan-lookup', scanLookup);

// Drafts Session Management
router.post('/drafts', saveDraft);
router.get('/drafts', getDrafts);
router.get('/drafts/:id', getDraftById);
router.delete('/drafts/:id', deleteDraft);

// Final Receiving Submission
router.post('/submit', submitReceiving);
router.post('/', createReceipt);

// Receiving History
router.get('/history', getReceivingHistory);
router.get('/history/:id', getReceivingHistoryById);

router.get('/:id', getReceiptById);
router.delete('/:id', deleteReceipt);

export default router;
