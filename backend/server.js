import app from './app.js';
import { connectDB } from './config/db.js';
import { config } from './config/index.js';
import { logger } from './config/logger.js';
import { ensureDefaultSeed } from './config/seedHelper.js';
import { runDueMaintenancePlans } from './modules/maintenance/maintenancePlans.controller.js';
import { runDuePreventiveSchedules } from './modules/maintenance/preventive.controller.js';

async function startServer() {
  await connectDB();
  await ensureDefaultSeed();

  app.listen(config.port, () => {
    logger.info(`🚀 FAMS API Server running on port ${config.port} [env: ${config.env}]`);
    runDueMaintenancePlans().catch(error => logger.error('Maintenance plan scheduler failed', error));
    setInterval(() => runDueMaintenancePlans().catch(error => logger.error('Maintenance plan scheduler failed', error)), 15 * 60 * 1000).unref();
    runDuePreventiveSchedules().catch(error => logger.error('Preventive schedule runner failed', error));
    setInterval(() => runDuePreventiveSchedules().catch(error => logger.error('Preventive schedule runner failed', error)), 15 * 60 * 1000).unref();
  });
}

startServer();
