import app from './app.js';
import { connectDB, isDbConnected } from './config/db.js';
import { config } from './config/index.js';
import { logger } from './config/logger.js';
import { ensureDefaultSeed } from './config/seedHelper.js';
import { runDueMaintenancePlans } from './modules/maintenance/maintenancePlans.controller.js';
import { runDuePreventiveSchedules } from './modules/maintenance/preventive.controller.js';

async function startServer() {
  const server = app.listen(config.port, () => {
    logger.info(`🚀 FAMS API Server running on port ${config.port} [env: ${config.env}]`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      logger.error(`❌ Port ${config.port} is already in use by another process.`);
      console.error(`\n============================================================`);
      console.error(`❌ ERROR: Port ${config.port} is already in use by another running instance.`);
      console.error(`👉 To free port ${config.port}, run this in PowerShell:`);
      console.error(`   Stop-Process -Id (Get-NetTCPConnection -LocalPort ${config.port} -ErrorAction SilentlyContinue).OwningProcess -Force`);
      console.error(`============================================================\n`);
      process.exit(1);
    } else {
      logger.error(`Server error: ${err.message}`);
      process.exit(1);
    }
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
