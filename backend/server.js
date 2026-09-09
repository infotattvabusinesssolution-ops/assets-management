import app from './app.js';
import { connectDB } from './config/db.js';
import { config } from './config/index.js';
import { logger } from './config/logger.js';
import { ensureDefaultSeed } from './config/seedHelper.js';

async function startServer() {
  await connectDB();
  await ensureDefaultSeed();

  app.listen(config.port, () => {
    logger.info(`🚀 FAMS API Server running on port ${config.port} [env: ${config.env}]`);
  });
}

startServer();
