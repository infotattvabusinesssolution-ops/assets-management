import { logger } from '../config/logger.js';

export function errorHandler(err, req, res, next) {
  logger.error(err.stack || err.message || err);

  const statusCode = res.statusCode !== 200 ? res.statusCode : (err.status || 500);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    errors: err.errors || null,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}
