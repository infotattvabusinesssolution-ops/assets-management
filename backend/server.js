import app from './app.js';
import { connectDB, isDbConnected } from './config/db.js';
import { config } from './config/index.js';
import { logger } from './config/logger.js';
import { ensureDefaultSeed } from './config/seedHelper.js';
import { runDueMaintenancePlans } from './modules/maintenance/maintenancePlans.controller.js';
import { runDuePreventiveSchedules } from './modules/maintenance/preventive.controller.js';

async function startServer() {
  app.listen(config.port, () => {
    logger.info(`🚀 FAMS API Server running on port ${config.port} [env: ${config.env}]`);
  });

  try {
    const connected = await connectDB();
    if (connected) {
      await ensureDefaultSeed();
      runDueMaintenancePlans().catch(error => logger.error('Maintenance plan scheduler failed', error));
      runDuePreventiveSchedules().catch(error => logger.error('Preventive schedule runner failed', error));
    }
  } catch (err) {
    logger.warn(`Startup DB connect: ${err.message}`);
  }

  setInterval(() => {
    if (isDbConnected()) {
      runDueMaintenancePlans().catch(error => logger.error('Maintenance plan scheduler failed', error));
    }
  }, 15 * 60 * 1000).unref();
  setInterval(() => {
    if (isDbConnected()) {
      runDuePreventiveSchedules().catch(error => logger.error('Preventive schedule runner failed', error));
    }
  }, 15 * 60 * 1000).unref();
}

startServer();
