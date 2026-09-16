import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './modules/auth/auth.routes.js';
import masterDataRoutes from './modules/master-data/masterData.routes.js';
import assetRoutes from './modules/assets/asset.routes.js';
import receivingRoutes from './modules/receiving/receiving.routes.js';
import taggingRoutes from './modules/tagging/tagging.routes.js';
import custodyRoutes from './modules/custody-transfers/custodyTransfers.routes.js';
import stocktakeRoutes from './modules/stocktakes/stocktake.routes.js';
import financeRoutes from './modules/finance/finance.routes.js';
import maintenanceRoutes from './modules/maintenance/maintenance.routes.js';
import contractsRoutes from './modules/contracts/contracts.routes.js';
import discoveryRoutes from './modules/discovery/discovery.routes.js';
import mapsRoutes from './modules/maps/maps.routes.js';
import workflowRoutes from './modules/workflows/workflows.routes.js';
import disposalRoutes from './modules/disposals/disposals.routes.js';
import reportRoutes from './modules/reports/reports.routes.js';
import searchRoutes from './modules/search/search.routes.js';
import aiRoutes from './modules/ai/ai.routes.js';
import auditRoutes from './modules/audit/audit.routes.js';
import importRoutes from './modules/imports/imports.routes.js';
import rtlsRoutes from './modules/rtls/rtls.routes.js';
import movementApprovalRoutes from './modules/movement-approvals/movementApprovals.routes.js';
import adminOrgRoutes from './modules/admin/adminOrg.routes.js';
import adminConfigRoutes from './modules/admin/adminConfig.routes.js';
import adminGovernanceRoutes from './modules/admin/adminGovernance.routes.js';

import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', service: 'FAMS API', timestamp: new Date() });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/master-data', masterDataRoutes);
app.use('/api/v1/assets', assetRoutes);
app.use('/api/v1/receiving', receivingRoutes);
app.use('/api/v1/tagging', taggingRoutes);
app.use('/api/v1/custody-transfers', custodyRoutes);
app.use('/api/v1/movements', custodyRoutes);
app.use('/api/v1/stocktakes', stocktakeRoutes);
app.use('/api/v1/audit', stocktakeRoutes);
app.use('/api/v1/finance', financeRoutes);
app.use('/api/v1/maintenance', maintenanceRoutes);
app.use('/api/v1/contracts', contractsRoutes);
app.use('/api/v1/discovery', discoveryRoutes);
app.use('/api/v1/maps', mapsRoutes);
app.use('/api/v1/workflows', workflowRoutes);
app.use('/api/v1/disposals', disposalRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/audit', auditRoutes);
app.use('/api/v1/imports', importRoutes);
app.use('/api/v1/rtls', rtlsRoutes);
app.use('/api/v1/movement-approvals', movementApprovalRoutes);
app.use('/api/v1/admin/config', adminConfigRoutes);
app.use('/api/v1/admin', adminOrgRoutes);
app.use('/api/v1/admin', adminGovernanceRoutes);
app.use('/api/v1/audit-logs', adminGovernanceRoutes);

// Error Handling Middleware
app.use(errorHandler);

export default app;
