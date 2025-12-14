const logger = require('../Utils/logger');

/**
 * Request logging middleware
 * Logs all HTTP requests with method, path, status code, and response time
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log request
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function (chunk, encoding) {
    const duration = Date.now() - startTime;
    
    logger.info('Request completed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    });

    originalEnd.call(this, chunk, encoding);
  };

  next();
};

/**
 * Error logging middleware
 * Logs errors with stack trace
 */
const errorLogger = (err, req, res, next) => {
  logger.error('Request error', {
    method: req.method,
    path: req.path,
    error: err.message,
    stack: err.stack,
    statusCode: err.statusCode || 500,
  });

  next(err);
};

module.exports = {
  requestLogger,
  errorLogger,
};

